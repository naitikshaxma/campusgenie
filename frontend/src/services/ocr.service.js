import api from './api'

/**
 * Extract assignment details from an image (WhatsApp screenshot, photo, etc.)
 * Returns: { title, subject, dueDate, priority, description, confidence }
 */
export const extractAssignment = (file) => {
  const formData = new FormData()
  formData.append('image', file)
  return api.post('/ocr/assignment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * Extract campus notice details from an image.
 * Returns: { event, date, venue, description, organizer }
 */
export const extractNotice = (file) => {
  const formData = new FormData()
  formData.append('image', file)
  return api.post('/ocr/notice', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * Extract text from a generic document/screenshot.
 */
export const extractText = (file) => {
  const formData = new FormData()
  formData.append('image', file)
  return api.post('/ocr/text', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
