const aiProvider = require('./aiProvider')
const { systemInstructions, templates } = require('./promptTemplates')

class ParserProvider {
  /**
   * Safe JSON parser and repair utility
   */
  safeParseAIJSON(text, rawText = '') {
    if (!text) {
      return this.generateFallback(rawText)
    }
    
    let cleaned = text.trim()
    
    // 1. Remove markdown JSON code fences
    cleaned = cleaned.replace(/^```json\s*/i, '')
    cleaned = cleaned.replace(/^```\s*/i, '')
    cleaned = cleaned.replace(/\s*```$/, '')
    cleaned = cleaned.trim()

    // 2. Isolate JSON block by looking for braces/brackets
    const firstBrace = cleaned.search(/[\{\[]/)
    const lastBrace = cleaned.match(/[\}\]][^]*$/)
    
    if (firstBrace !== -1 && lastBrace) {
      cleaned = cleaned.substring(firstBrace, cleaned.length - (lastBrace[0].length - 1))
    }

    // 3. Repair trailing commas before closing braces/brackets
    cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1')

    try {
      return JSON.parse(cleaned)
    } catch (err) {
      console.warn('[parserProvider] safeParseAIJSON parse failed. Attempting regex repair...', err.message)
      
      // Attempt key/string quotes repair
      try {
        const relaxed = cleaned
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
          .replace(/:\s*['"]([^'"]*)['"]/g, ':"$1"')
        return JSON.parse(relaxed)
      } catch (relaxErr) {
        console.error('[parserProvider] JSON repair failed, falling back to regex field extraction.')
        return this.regexExtractFallback(cleaned, rawText)
      }
    }
  }

  /**
   * Safe fallback constructor
   */
  generateFallback(rawText = '') {
    return {
      title: 'Untitled Assignment',
      subject: 'General',
      description: rawText ? rawText.slice(0, 500) : 'Scanned assignment document details.',
      dueDate: null,
      priority: 'medium',
      estimatedHours: 2,
      estimatedStudyHours: 2
    }
  }

  /**
   * Extraction of JSON fields using regex when JSON parsing is impossible
   */
  regexExtractFallback(text, rawText = '') {
    const fallback = this.generateFallback(rawText)
    try {
      const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/)
      if (titleMatch) fallback.title = titleMatch[1]

      const subjectMatch = text.match(/"subject"\s*:\s*"([^"]+)"/)
      if (subjectMatch) fallback.subject = subjectMatch[1]

      const descMatch = text.match(/"description"\s*:\s*"([^"]+)"/)
      if (descMatch) fallback.description = descMatch[1]

      const dateMatch = text.match(/"dueDate"\s*:\s*"([^"]+)"/)
      if (dateMatch) fallback.dueDate = dateMatch[1]

      const priorityMatch = text.match(/"priority"\s*:\s*"([^"]+)"/)
      if (priorityMatch) {
        const p = priorityMatch[1].toLowerCase()
        if (['low', 'medium', 'high'].includes(p)) fallback.priority = p
      }

      const hoursMatch = text.match(/"(?:estimatedHours|estimatedStudyHours)"\s*:\s*(\d+(?:\.\d+)?)/)
      if (hoursMatch) {
        const hrs = Number(hoursMatch[1])
        fallback.estimatedHours = hrs
        fallback.estimatedStudyHours = hrs
      }
    } catch (e) {
      console.warn('[parserProvider] Regex fallback extraction exception:', e.message)
    }
    return fallback
  }

  /**
   * Structure raw OCR text into assignment schema JSON.
   */
  async extractAssignmentData(text) {
    const prompt = templates.assignmentExtraction(text)
    const system = systemInstructions.assignmentExtraction
    
    try {
      const rawResponse = await aiProvider.generateCompletion(
        prompt,
        system,
        false, // get raw text to run safeParseAIJSON
        'assignment'
      )
      return this.safeParseAIJSON(rawResponse, text)
    } catch (err) {
      console.warn('[parserProvider] extractAssignmentData failed, serving fallback:', err.message)
      return this.generateFallback(text)
    }
  }

  /**
   * Structure raw OCR text into campus notice schema JSON.
   */
  async extractNoticeData(text) {
    const prompt = templates.noticeExtraction(text)
    const system = systemInstructions.noticeExtraction
    
    try {
      const rawResponse = await aiProvider.generateCompletion(
        prompt,
        system,
        false,
        'notice'
      )
      return this.safeParseAIJSON(rawResponse, text)
    } catch (err) {
      console.warn('[parserProvider] extractNoticeData failed, serving notice fallback:', err.message)
      return {
        event: 'Campus Event',
        date: new Date().toISOString().split('T')[0],
        venue: 'Campus Main Grounds',
        organizer: 'Student Affairs',
        description: text ? text.slice(0, 500) : ''
      }
    }
  }

  /**
   * Enrich already-parsed fields with AI estimated workloads and recommendations.
   */
  async enrichAssignmentWithAi(rawText, parsedFields = {}) {
    const prompt = templates.aiEnrichment({
      rawText,
      parsedTitle: parsedFields.title,
      parsedSubject: parsedFields.subject,
      parsedDueDate: parsedFields.dueDate
    })
    const system = systemInstructions.aiEnrichment

    try {
      const rawResponse = await aiProvider.generateCompletion(
        prompt,
        system,
        false,
        'assignment'
      )
      return this.safeParseAIJSON(rawResponse, rawText)
    } catch (err) {
      console.warn('[parserProvider] enrichAssignmentWithAi failed, serving enrichment fallback:', err.message)
      return {
        estimatedStudyHours: 2.5,
        estimatedHours: 2.5,
        studyRecommendation: 'Review textbook concepts and outline key goals before starting.',
        difficulty: 'medium',
        summary: ''
      }
    }
  }
}

module.exports = new ParserProvider()
