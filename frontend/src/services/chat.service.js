import api from './api'

/** Fetch all chat sessions for the current user */
export const fetchSessions = () => api.get('/chat/sessions')

/** Create a new chat session */
export const createSession = (title = 'New conversation') =>
  api.post('/chat/sessions', { title })

/** Delete a chat session */
export const deleteSession = (sessionId) =>
  api.delete(`/chat/sessions/${sessionId}`)

/** Fetch all messages in a session */
export const fetchMessages = (sessionId) =>
  api.get(`/chat/sessions/${sessionId}/messages`)

/**
 * Send a message and get an AI response.
 * The backend should stream or return { role, content, timestamp }.
 */
export const sendMessage = (sessionId, content, attachments = []) =>
  api.post(`/chat/sessions/${sessionId}/messages`, { content, attachments })

/** Rename a chat session */
export const renameSession = (sessionId, title) =>
  api.patch(`/chat/sessions/${sessionId}`, { title })
