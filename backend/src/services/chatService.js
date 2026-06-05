const ChatSession = require('../models/ChatSession')
const ChatMessage = require('../models/ChatMessage')
const aiService = require('./ai/aiService')

/**
 * Create a new chat session for a user.
 */
async function createSession(userId, title = 'New conversation') {
  const session = await ChatSession.create({
    title,
    createdBy: userId,
  })
  return session
}

/**
 * Get all chat sessions for a user, sorted by last updated.
 */
async function getSessions(userId) {
  return ChatSession.find({ createdBy: userId }).sort({ updatedAt: -1 })
}

/**
 * Get all messages for a session.
 */
async function getMessages(userId, sessionId) {
  // Verify ownership
  const session = await ChatSession.findOne({ _id: sessionId, createdBy: userId })
  if (!session) {
    const err = new Error('Chat session not found.')
    err.statusCode = 404
    throw err
  }
  return ChatMessage.find({ sessionId, createdBy: userId }).sort({ createdAt: 1 })
}

/**
 * Send a user message and trigger the Gemini AI response.
 */
async function sendMessage(userId, sessionId, content) {
  // 1. Verify session ownership
  const session = await ChatSession.findOne({ _id: sessionId, createdBy: userId })
  if (!session) {
    const err = new Error('Chat session not found.')
    err.statusCode = 404
    throw err
  }

  // 2. Save user message
  const userMsg = await ChatMessage.create({
    sessionId,
    role: 'user',
    content,
    createdBy: userId,
  })

  // 3. Load all previous messages to construct conversational history
  const allMsgs = await ChatMessage.find({ sessionId, createdBy: userId }).sort({ createdAt: 1 })
  
  // Format history before the current message for Gemini
  const history = allMsgs
    .slice(0, -1) // exclude the message we just added
    .map((m) => ({
      role: m.role,
      content: m.content,
    }))

  // 4. Request response from Gemini AI service
  const aiResponse = await aiService.generateChatResponse(content, history)

  // 5. Save assistant response
  const assistantMsg = await ChatMessage.create({
    sessionId,
    role: 'assistant',
    content: aiResponse,
    createdBy: userId,
  })

  // 6. Update session metadata
  session.lastMessage = aiResponse.length > 60 ? aiResponse.substring(0, 57) + '...' : aiResponse
  
  // Auto-generate title if it's the first message
  if (allMsgs.length === 1 && session.title === 'New conversation') {
    const cleanText = content.trim().replace(/[\r\n\t]/g, ' ')
    session.title = cleanText.length > 40 ? cleanText.substring(0, 37) + '...' : cleanText
  }
  
  await session.save()

  return assistantMsg
}

/**
 * Delete a session and cascadingly delete its messages.
 */
async function deleteSession(userId, sessionId) {
  const session = await ChatSession.findOneAndDelete({ _id: sessionId, createdBy: userId })
  if (!session) {
    const err = new Error('Chat session not found.')
    err.statusCode = 404
    throw err
  }

  // Delete all messages in the session
  await ChatMessage.deleteMany({ sessionId })
  return session
}

/**
 * Rename a chat session.
 */
async function renameSession(userId, sessionId, title) {
  const session = await ChatSession.findOneAndUpdate(
    { _id: sessionId, createdBy: userId },
    { title },
    { new: true, runValidators: true }
  )
  if (!session) {
    const err = new Error('Chat session not found.')
    err.statusCode = 404
    throw err
  }
  return session
}

/**
 * Get aggregate chat stats for the user.
 */
async function getStats(userId) {
  const totalSessions = await ChatSession.countDocuments({ createdBy: userId })
  const totalMessages = await ChatMessage.countDocuments({ createdBy: userId })
  return { totalSessions, totalMessages }
}

module.exports = {
  createSession,
  getSessions,
  getMessages,
  sendMessage,
  deleteSession,
  renameSession,
  getStats,
}
