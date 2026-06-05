const chatProvider = require('./chatProvider')
const plannerProvider = require('./plannerProvider')

/**
 * AI Service Orchestrator
 * High-level AI operations interface for Chat and Planner.
 * Vision OCR tasks are now delegated directly to geminiVisionService.
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
