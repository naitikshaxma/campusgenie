const geminiProvider = require('./geminiProvider')
const { systemInstructions, templates } = require('./promptTemplates')

/**
 * AI Service Orchestrator
 * High-level AI operations interface for controllers.
 * Enforces structured schema validation, error handling, and formatting fallbacks.
 */
class AiService {
  /**
   * Generates a conversational response from CampusGenie AI.
   * @param {string} message - Current user query message
   * @param {Array} history - Array of previous chat messages [{ role: 'user'|'ai', content: '...' }]
   */
  async generateChatResponse(message, history = []) {
    try {
      const formattedPrompt = templates.chat(message, history)
      const response = await geminiProvider.generateText(
        formattedPrompt,
        systemInstructions.chat
      )
      return response
    } catch (err) {
      console.error('[AiService] generateChatResponse error:', err.message)
      throw new Error('Could not generate AI chat response: ' + err.message)
    }
  }

  /**
   * Extracts assignment details from OCR scanned text using Gemini.
   * @param {string} text - Raw OCR text
   */
  async extractAssignmentData(text) {
    try {
      const prompt = templates.assignmentExtraction(text)
      const data = await geminiProvider.generateJson(
        prompt,
        systemInstructions.assignmentExtraction
      )

      // Validate schema compliance and provide defaults if missing
      const stabilized = {
        title: data.title || 'Untitled Assignment',
        subject: data.subject || 'General',
        dueDate: this._isValidDate(data.dueDate) 
          ? data.dueDate 
          : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // Default 7 days
        priority: ['low', 'medium', 'high'].includes(String(data.priority).toLowerCase())
          ? String(data.priority).toLowerCase()
          : 'medium',
        description: data.description || ''
      }

      return stabilized
    } catch (err) {
      console.error('[AiService] extractAssignmentData error:', err.message)
      throw new Error('Failed to extract assignment details: ' + err.message)
    }
  }

  /**
   * Generates study planner sessions dynamically.
   * @param {Object} params - Planner inputs { title, subject, deadline, difficulty, availableHours }
   */
  async generateStudyPlan(params) {
    try {
      const prompt = templates.studyPlan(params)
      const sessions = await geminiProvider.generateJson(
        prompt,
        systemInstructions.studyPlan
      )

      if (!Array.isArray(sessions)) {
        throw new Error('Model did not return a valid list of sessions.')
      }

      // Validate each session item in the plan
      const stabilized = sessions.map((session, index) => {
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

      return stabilized
    } catch (err) {
      console.error('[AiService] generateStudyPlan error:', err.message)
      throw new Error('Failed to build AI study planner sessions: ' + err.message)
    }
  }

  /**
   * Extracts campus event flyer announcement details.
   * @param {string} text - Raw OCR notice board text
   */
  async extractNoticeData(text) {
    try {
      const prompt = templates.noticeExtraction(text)
      const data = await geminiProvider.generateJson(
        prompt,
        systemInstructions.noticeExtraction
      )

      const stabilized = {
        event: data.event || 'Campus Event',
        date: this._isValidDate(data.date) 
          ? data.date 
          : new Date().toISOString().split('T')[0], // Default today
        venue: data.venue || 'Campus Main Grounds',
        organizer: data.organizer || 'Student Affairs',
        description: data.description || ''
      }

      return stabilized
    } catch (err) {
      console.error('[AiService] extractNoticeData error:', err.message)
      throw new Error('Failed to parse campus notice flyer details: ' + err.message)
    }
  }

  /**
   * Extract assignment details directly from an image (WhatsApp screenshot, etc.).
   */
  async extractAssignmentFromImage(buffer, mimeType) {
    try {
      const prompt = templates.assignmentExtractionImage()
      const data = await geminiProvider.generateMultimodalJson(
        prompt,
        mimeType,
        buffer,
        systemInstructions.assignmentExtraction
      )

      const stabilized = {
        title: data.title || 'Untitled Assignment',
        subject: data.subject || 'General',
        description: data.description || '',
        dueDate: this._isValidDate(data.dueDate)
          ? data.dueDate
          : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        priority: ['low', 'medium', 'high'].includes(String(data.priority).toLowerCase())
          ? String(data.priority).toLowerCase()
          : 'medium'
      }

      return stabilized
    } catch (err) {
      console.error('[AiService] extractAssignmentFromImage error:', err.message)
      throw new Error('Failed to extract assignment from image: ' + err.message)
    }
  }

  /**
   * Extract campus notice event details directly from a poster/flyer image.
   */
  async extractNoticeFromImage(buffer, mimeType) {
    try {
      const prompt = templates.noticeExtractionImage()
      const data = await geminiProvider.generateMultimodalJson(
        prompt,
        mimeType,
        buffer,
        systemInstructions.noticeExtraction
      )

      const stabilized = {
        event: data.event || 'Campus Event',
        venue: data.venue || 'Campus Main Grounds',
        date: this._isValidDate(data.date)
          ? data.date
          : new Date().toISOString().split('T')[0],
        registrationDeadline: this._isValidDate(data.registrationDeadline)
          ? data.registrationDeadline
          : null,
        description: data.description || ''
      }

      return stabilized
    } catch (err) {
      console.error('[AiService] extractNoticeFromImage error:', err.message)
      throw new Error('Failed to extract notice details from flyer: ' + err.message)
    }
  }

  /**
   * Transcribes all text from an image.
   */
  async extractTextFromImage(buffer, mimeType) {
    try {
      const prompt = templates.textExtractionImage()
      const data = await geminiProvider.generateMultimodalJson(
        prompt,
        mimeType,
        buffer,
        systemInstructions.textExtraction
      )

      return {
        rawText: data.rawText || ''
      }
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
