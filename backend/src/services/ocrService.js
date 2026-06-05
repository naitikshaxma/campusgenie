const aiService = require('./ai/aiService')

/**
 * OCR & Gemini Vision Service
 * High-level orchestration for calling the Gemini multimodal parser with memory file buffers.
 */

/**
 * Extract assignment details from an image file buffer.
 */
async function extractAssignment(buffer, mimeType) {
  return aiService.extractAssignmentFromImage(buffer, mimeType)
}

/**
 * Extract campus notice details from a flyer image file buffer.
 */
async function extractNotice(buffer, mimeType) {
  return aiService.extractNoticeFromImage(buffer, mimeType)
}

/**
 * Transcribe text from an image file buffer (general OCR).
 */
async function extractText(buffer, mimeType) {
  return aiService.extractTextFromImage(buffer, mimeType)
}

module.exports = {
  extractAssignment,
  extractNotice,
  extractText,
}
