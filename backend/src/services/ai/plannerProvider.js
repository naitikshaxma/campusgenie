const aiProvider = require('./aiProvider')
const { systemInstructions, templates } = require('./promptTemplates')

class PlannerProvider {
  async generateStudyPlan(params) {
    const prompt = templates.studyPlan(params)
    const system = systemInstructions.studyPlan
    
    // Expecting JSON output format
    const parsedData = await aiProvider.generateCompletion(
      prompt,
      system,
      true, // Return parsed JSON
      'planner'
    )

    // Normalize result
    if (!parsedData || !Array.isArray(parsedData)) {
      console.warn('[PlannerProvider] Unexpected non-array study plan format. Falling back to default list.')
      return []
    }
    return parsedData
  }
}

module.exports = new PlannerProvider()
