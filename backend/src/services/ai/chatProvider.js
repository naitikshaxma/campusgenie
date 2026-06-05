const aiProvider = require('./aiProvider')
const { systemInstructions, templates } = require('./promptTemplates')

class ChatProvider {
  async generateChatResponse(message, history = []) {
    const prompt = templates.chat(message, history)
    const system = systemInstructions.chat
    
    return aiProvider.generateCompletion(
      prompt,
      system,
      false, // Return raw text, not JSON
      'chat'
    )
  }
}

module.exports = new ChatProvider()
