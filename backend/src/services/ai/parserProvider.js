const aiProvider = require('./aiProvider')
const { systemInstructions, templates } = require('./promptTemplates')

class ParserProvider {
  /**
   * Structure raw OCR text into assignment schema JSON.
   */
  async extractAssignmentData(text) {
    const prompt = templates.assignmentExtraction(text)
    const system = systemInstructions.assignmentExtraction
    
    return aiProvider.generateCompletion(
      prompt,
      system,
      true, // Return parsed JSON
      'assignment'
    )
  }

  /**
   * Structure raw OCR text into campus notice schema JSON.
   */
  async extractNoticeData(text) {
    const prompt = templates.noticeExtraction(text)
    const system = systemInstructions.noticeExtraction
    
    return aiProvider.generateCompletion(
      prompt,
      system,
      true, // Return parsed JSON
      'notice'
    )
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

    return aiProvider.generateCompletion(
      prompt,
      system,
      true, // Return parsed JSON
      'assignment'
    )
  }
}

module.exports = new ParserProvider()
