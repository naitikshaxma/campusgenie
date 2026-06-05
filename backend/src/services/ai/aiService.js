const chatProvider = require('./chatProvider')
const plannerProvider = require('./plannerProvider')
const parserProvider = require('./parserProvider')
const ocrProvider = require('./ocrProvider')

/**
 * AI Service Orchestrator
 * High-level AI operations interface for controllers.
 * Enforces structured schema validation, error handling, and formatting fallbacks.
 * Uses new provider abstractions to support OpenRouter, Groq, Ollama, and OCR.space/Tesseract.
 */
class AiService {
  /**
   * Generates a conversational response from CampusGenie AI.
   */
  async generateChatResponse(message, history = []) {
    try {
      return await chatProvider.generateChatResponse(message, history)
    } catch (err) {
      console.error('[AiService] generateChatResponse error:', err.message)
      throw new Error('Could not generate AI chat response: ' + err.message)
    }
  }

  /**
   * Extracts assignment details from OCR scanned text.
   */
  async extractAssignmentData(text) {
    try {
      const data = await parserProvider.extractAssignmentData(text)
      
      // Validate schema compliance and provide defaults if missing
      return {
        title: data?.title || 'Untitled Assignment',
        subject: data?.subject || 'General',
        dueDate: this._isValidDate(data?.dueDate) 
          ? data.dueDate 
          : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // Default 7 days
        priority: ['low', 'medium', 'high'].includes(String(data?.priority).toLowerCase())
          ? String(data.priority).toLowerCase()
          : 'medium',
        description: data?.description || '',
        estimatedStudyHours: Number(data?.estimatedStudyHours) || (data?.priority === 'high' ? 4.5 : data?.priority === 'medium' ? 2.5 : 1.0),
        confidence: Number(data?.confidence) || 0.88,
        aiGenerated: true
      }
    } catch (err) {
      console.error('[AiService] extractAssignmentData error:', err.message)
      throw new Error('Failed to extract assignment details: ' + err.message)
    }
  }

  /**
   * Generates study planner sessions dynamically.
   */
  async generateStudyPlan(params) {
    try {
      const sessions = await plannerProvider.generateStudyPlan(params)

      if (!Array.isArray(sessions)) {
        throw new Error('Model did not return a valid list of sessions.')
      }

      // Validate each session item in the plan
      return sessions.map((session, index) => {
        const durationValue = Number(session.duration)
        const duration = isNaN(durationValue) || durationValue <= 0 ? 1 : durationValue
        
        return {
          subject: session.subject || params.subject || 'Study Block',
          topic: session.topic || params.title || 'Review session',
          duration: Math.min(Math.max(duration, 0.5), 4), // Clamp duration between 30m and 4h
          date: this._isValidDate(session.date) 
            ? session.date 
            : new Date(Date.now() + (index + 1) * 86400000).toISOString().split('T')[0],
          startTime: session.startTime || '18:00',
          endTime: session.endTime || '19:30',
          notes: session.notes || session.note || 'Focus on main concept review.'
        }
      })
    } catch (err) {
      console.error('[AiService] generateStudyPlan error:', err.message)
      throw new Error('Failed to build AI study planner sessions: ' + err.message)
    }
  }

  /**
   * Extracts campus event flyer announcement details from text.
   */
  async extractNoticeData(text) {
    try {
      const data = await parserProvider.extractNoticeData(text)

      return {
        event: data?.event || 'Campus Event',
        date: this._isValidDate(data?.date) 
          ? data.date 
          : new Date().toISOString().split('T')[0], // Default today
        venue: data?.venue || 'Campus Main Grounds',
        organizer: data?.organizer || 'Student Affairs',
        description: data?.description || ''
      }
    } catch (err) {
      console.error('[AiService] extractNoticeData error:', err.message)
      throw new Error('Failed to parse campus notice flyer details: ' + err.message)
    }
  }

  /**
   * Extract assignment details directly from an image.
   */
  async extractAssignmentFromImage(buffer, mimeType) {
    try {
      console.log('[AiService] Running image-to-assignment OCR parser...')
      const rawText = await ocrProvider.extractText(buffer, mimeType)
      return await this.extractAssignmentData(rawText)
    } catch (err) {
      console.error('[AiService] extractAssignmentFromImage error:', err.message)
      throw new Error('Failed to extract assignment from image: ' + err.message)
    }
  }

  /**
   * Extract campus notice event details directly from a flyer image.
   */
  async extractNoticeFromImage(buffer, mimeType) {
    try {
      console.log('[AiService] Running image-to-notice OCR parser...')
      const rawText = await ocrProvider.extractText(buffer, mimeType)
      return await this.extractNoticeData(rawText)
    } catch (err) {
      console.error('[AiService] extractNoticeFromImage error:', err.message)
      throw new Error('Failed to extract notice details from flyer: ' + err.message)
    }
  }

  /**
   * AI Enrichment — called AFTER regex parsing.
   */
  async enrichAssignmentWithAi(rawText, parsedFields = {}) {
    try {
      const data = await parserProvider.enrichAssignmentWithAi(rawText, parsedFields)

      return {
        estimatedStudyHours: Number(data?.estimatedStudyHours) || 2.5,
        studySuggestions: data?.studyRecommendation || data?.studySuggestions || 'Review class notes and practice past problems.',
        difficulty: ['easy', 'medium', 'hard'].includes(String(data?.difficulty).toLowerCase())
          ? String(data.difficulty).toLowerCase()
          : 'medium',
        summary: data?.summary || '',
      }
    } catch (err) {
      console.warn('[AiService] AI enrichment failed, using fallbacks:', err.message)
      return {
        estimatedStudyHours: 2.5,
        studySuggestions: 'Review textbook concepts and outline key goals before starting.',
        difficulty: 'medium',
        summary: '',
      }
    }
  }

  /**
   * Transcribes all text from an image.
   */
  async extractTextFromImage(buffer, mimeType) {
    try {
      const rawText = await ocrProvider.extractText(buffer, mimeType)
      return { rawText }
    } catch (err) {
      console.error('[AiService] extractTextFromImage error:', err.message)
      throw new Error('Failed to extract raw text from image: ' + err.message)
    }
  }

  /**
   * Date validator helper
   * @private
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

module.exports = new AiService()
