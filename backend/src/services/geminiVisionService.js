const { GoogleGenerativeAI } = require('@google/generative-ai')

class GeminiVisionService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY
    this.modelName = 'gemini-2.0-flash'
    this.genAI = null
    this.model = null

    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey)
      this.model = this.genAI.getGenerativeModel({ model: this.modelName })
    }
  }

  /**
   * Lazily initialize AI client if key changes or was defined post-constructor
   */
  initClient() {
    const key = process.env.GEMINI_API_KEY
    const modelEnv = 'gemini-2.0-flash'
    if (key && (!this.genAI || this.apiKey !== key || this.modelName !== modelEnv)) {
      this.apiKey = key
      this.modelName = modelEnv
      this.genAI = new GoogleGenerativeAI(key)
      this.model = this.genAI.getGenerativeModel({ model: this.modelName })
    }
  }

  /**
   * Main scan entry point.
   * Transcribes and parses image buffers into structured JSON objects using Gemini 2.0 Flash Vision.
   */
  async scanImage(buffer, mimeType, type = 'assignment') {
    this.initClient()
    if (!this.model) {
      console.error('[GeminiVisionService] Client not initialized. GEMINI_API_KEY is missing.')
      return { success: false, error: 'AI scanner configuration missing: GEMINI_API_KEY is not defined.' }
    }

    if (!buffer || buffer.length === 0) {
      return { success: false, error: 'Empty file buffer uploaded.' }
    }

    console.log('Gemini OCR started')
    console.log('Model:', this.modelName)
    console.log('MimeType:', mimeType)

    // Convert file buffer to base64 inline format
    const base64Image = buffer.toString('base64')
    const inlineImage = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType || 'image/png'
      }
    }

    const promptText = this.getPromptText(type)

    // Execute with retries and timeout protection
    let attempts = 0
    const maxAttempts = 3
    while (attempts < maxAttempts) {
      attempts++
      try {
        console.log(`[GeminiVisionService] Querying Gemini Vision (${this.modelName}), Attempt ${attempts}/${maxAttempts}...`)
        
        // Wrap Gemini execution in a 20s timeout promise
        const apiPromise = (async () => {
          const result = await this.model.generateContent([
            {
              text: promptText
            },
            inlineImage
          ])
          const response = await result.response
          return response.text()
        })()

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini Vision API execution timed out (20s).')), 20000)
        )

        const rawText = await Promise.race([apiPromise, timeoutPromise])
        console.log('Gemini raw response:', rawText)

        const parsed = this.safeParseGeminiJSON(rawText, type)
        
        return {
          success: true,
          data: parsed
        }
      } catch (err) {
        console.warn(`[GeminiVisionService] Attempt ${attempts} failed:`, err.message)
        if (attempts >= maxAttempts) {
          console.error('[GeminiVisionService] All retry attempts exhausted.')
          return {
            success: false,
            error: `Could not analyze assignment image: ${err.message}`
          }
        }
        // Small delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  /**
   * Prompts demanding strict JSON outputs
   */
  getPromptText(type) {
    if (type === 'notice') {
      return `Analyze this notice board poster, flyer, or event announcement image carefully.

Extract:

* event
* venue
* date
* registrationDeadline
* description

Return ONLY valid JSON.

No markdown.
No explanations.
No code fences.

Schema:
{
  "event": "",
  "venue": "",
  "date": "",
  "registrationDeadline": "",
  "description": ""
}`
    }

    return `Analyze this assignment image carefully.

Extract:

* title
* subject
* dueDate
* description
* priority
* estimatedHours
* tasks

Return ONLY valid JSON.

No markdown.
No explanations.
No code fences.

Schema:
{
  "title": "",
  "subject": "",
  "dueDate": "",
  "description": "",
  "priority": "medium",
  "estimatedHours": 1,
  "tasks": []
}`
  }

  /**
   * Clean, normalize, repair and parse JSON
   */
  safeParseGeminiJSON(text, type = 'assignment') {
    if (!text) return this.generateFallback(type)

    let cleaned = text.trim()
    // Strip markdown JSON wrappers
    cleaned = cleaned.replace(/^```json\s*/i, '')
    cleaned = cleaned.replace(/^```\s*/i, '')
    cleaned = cleaned.replace(/\s*```$/, '')
    cleaned = cleaned.trim()

    // Locate boundary braces to isolate JSON
    const firstBrace = cleaned.search(/[\{\[]/)
    const lastBrace = cleaned.match(/[\}\]][^]*$/)
    if (firstBrace !== -1 && lastBrace) {
      cleaned = cleaned.substring(firstBrace, cleaned.length - (lastBrace[0].length - 1))
    }

    // Comma repairs
    cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1')

    try {
      const parsed = JSON.parse(cleaned)
      return this.normalizeParsedData(parsed, type, text)
    } catch (err) {
      console.warn('[GeminiVisionService] JSON parsing failed. Attempting regex repair...', err.message)
      try {
        const relaxed = cleaned
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
          .replace(/:\s*['"]([^'"]*)['"]/g, ':"$1"')
        const parsed = JSON.parse(relaxed)
        return this.normalizeParsedData(parsed, type, text)
      } catch (relaxErr) {
        console.error('[GeminiVisionService] JSON repair failed. Extracting via regex fallbacks.')
        return this.regexExtractFallback(cleaned, type, text)
      }
    }
  }

  /**
   * Standardize properties and types to match the frontend expectations
   */
  normalizeParsedData(parsed, type, rawText = '') {
    if (type === 'notice') {
      return {
        event: parsed?.event || parsed?.title || 'Campus Event',
        venue: parsed?.venue || 'Campus grounds',
        date: this._isValidDate(parsed?.date) ? parsed.date : new Date().toISOString().split('T')[0],
        registrationDeadline: this._isValidDate(parsed?.registrationDeadline) ? parsed.registrationDeadline : '',
        description: parsed?.description || rawText.slice(0, 500) || 'Scanned flyer details.'
      }
    }

    // Assignment Normalization
    const priority = ['low', 'medium', 'high'].includes(String(parsed?.priority).toLowerCase())
      ? String(parsed.priority).toLowerCase()
      : 'medium'

    const hours = Number(parsed?.estimatedHours || parsed?.estimatedStudyHours) || 1

    let desc = parsed?.description || rawText.slice(0, 500) || 'Scanned assignment document details.'
    const tasks = Array.isArray(parsed?.tasks) ? parsed.tasks.filter(Boolean) : []
    if (tasks.length > 0) {
      desc += '\n\n**Extracted Tasks Checklist:**\n' + tasks.map(t => `- [ ] ${t}`).join('\n')
    }

    return {
      title: parsed?.title || 'Untitled Assignment',
      subject: parsed?.subject || 'CS',
      description: desc,
      dueDate: this._isValidDate(parsed?.dueDate) ? parsed.dueDate : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority,
      estimatedStudyHours: hours,
      estimatedHours: hours,
      tasks,
      studySuggestions: parsed?.studySuggestions || parsed?.studyRecommendation || 'Review related class handouts.',
      difficulty: priority,
      confidence: 0.95,
      rawText: rawText || JSON.stringify(parsed),
      fieldSources: {
        title: parsed?.title ? 'regex' : 'fallback',
        subject: parsed?.subject ? 'regex' : 'fallback',
        dueDate: parsed?.dueDate ? 'regex' : 'fallback',
        priority: 'deterministic'
      },
      fieldErrors: null,
      aiGenerated: true
    }
  }

  /**
   * Generate simple default fallback models
   */
  generateFallback(type = 'assignment', rawText = '') {
    if (type === 'notice') {
      return {
        event: 'Campus Event',
        venue: 'Campus Main Grounds',
        date: new Date().toISOString().split('T')[0],
        registrationDeadline: '',
        description: rawText ? rawText.slice(0, 500) : 'Uploaded Flyer.'
      }
    }

    return {
      title: 'Untitled Assignment',
      subject: 'CS',
      description: rawText ? rawText.slice(0, 500) : 'Scanned worksheet image.',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: 'medium',
      estimatedStudyHours: 1,
      estimatedHours: 1,
      tasks: [],
      studySuggestions: 'Focus on textbook concepts.',
      difficulty: 'medium',
      confidence: 0.5,
      rawText,
      fieldSources: { title: 'fallback', subject: 'fallback', dueDate: 'fallback', priority: 'deterministic' },
      fieldErrors: { title: 'Failed to auto-extract title.', dueDate: 'Failed to auto-extract date.' },
      aiGenerated: true
    }
  }

  /**
   * Parse keys directly from text blocks if JSON is corrupted beyond repair
   */
  regexExtractFallback(text, type, rawText = '') {
    const fallback = this.generateFallback(type, rawText)
    try {
      if (type === 'notice') {
        const eventMatch = text.match(/"(?:event|title)"\s*:\s*"([^"]+)"/)
        if (eventMatch) fallback.event = eventMatch[1]

        const venueMatch = text.match(/"venue"\s*:\s*"([^"]+)"/)
        if (venueMatch) fallback.venue = venueMatch[1]

        const dateMatch = text.match(/"date"\s*:\s*"([^"]+)"/)
        if (dateMatch && this._isValidDate(dateMatch[1])) fallback.date = dateMatch[1]

        const deadlineMatch = text.match(/"registrationDeadline"\s*:\s*"([^"]+)"/)
        if (deadlineMatch && this._isValidDate(deadlineMatch[1])) fallback.registrationDeadline = deadlineMatch[1]

        const descMatch = text.match(/"description"\s*:\s*"([^"]+)"/)
        if (descMatch) fallback.description = descMatch[1]

        return fallback
      }

      // Assignment regex
      const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/)
      if (titleMatch) fallback.title = titleMatch[1]

      const subjectMatch = text.match(/"subject"\s*:\s*"([^"]+)"/)
      if (subjectMatch) fallback.subject = subjectMatch[1]

      const descMatch = text.match(/"description"\s*:\s*"([^"]+)"/)
      if (descMatch) fallback.description = descMatch[1]

      const dateMatch = text.match(/"dueDate"\s*:\s*"([^"]+)"/)
      if (dateMatch && this._isValidDate(dateMatch[1])) fallback.dueDate = dateMatch[1]

      const priorityMatch = text.match(/"priority"\s*:\s*"([^"]+)"/)
      if (priorityMatch) {
        const p = priorityMatch[1].toLowerCase()
        if (['low', 'medium', 'high'].includes(p)) {
          fallback.priority = p
          fallback.difficulty = p
        }
      }

      const hoursMatch = text.match(/"(?:estimatedHours|estimatedStudyHours)"\s*:\s*(\d+(?:\.\d+)?)/)
      if (hoursMatch) {
        const hrs = Number(hoursMatch[1])
        fallback.estimatedHours = hrs
        fallback.estimatedStudyHours = hrs
      }

      const suggestionsMatch = text.match(/"(?:studySuggestions|studyRecommendation)"\s*:\s*"([^"]+)"/)
      if (suggestionsMatch) fallback.studySuggestions = suggestionsMatch[1]

      // Extract tasks array elements if any
      const tasksBlock = text.match(/"tasks"\s*:\s*\[([^\]]*)\]/)
      if (tasksBlock && tasksBlock[1]) {
        const items = tasksBlock[1].split(',').map(i => i.trim().replace(/^"|"$/g, ''))
        fallback.tasks = items.filter(Boolean)
      }
    } catch (e) {
      console.warn('[GeminiVisionService] Regex fallback parsing exception:', e.message)
    }

    return fallback
  }

  /**
   * Helper date validation
   */
  _isValidDate(dateString) {
    if (!dateString) return false
    const regEx = /^\d{4}-\d{2}-\d{2}$/
    if (!dateString.match(regEx)) return false
    const d = new Date(dateString)
    const dNum = d.getTime()
    if (!dNum && dNum !== 0) return false // NaN
    return d.toISOString().slice(0, 10) === dateString
  }
}

module.exports = new GeminiVisionService()
