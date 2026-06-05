import api from './api'

/** Fetch all assignments for the current user */
export const fetchAssignments = () => api.get('/assignments')

/** Fetch a single assignment by ID */
export const fetchAssignment = (id) => api.get(`/assignments/${id}`)

/** Create a new assignment */
export const createAssignment = (data) => api.post('/assignments', data)

/** Update an existing assignment */
export const updateAssignment = (id, data) => api.patch(`/assignments/${id}`, data)

/** Delete an assignment */
export const deleteAssignment = (id) => api.delete(`/assignments/${id}`)

/** Move assignment to a different Kanban column */
export const moveAssignment = (id, status) => api.patch(`/assignments/${id}`, { status })

/** Fetch dashboard stats (counts per status) */
export const fetchAssignmentStats = () => api.get('/assignments/stats')

/**
 * Upload an image for OCR-based assignment extraction.
 * Returns extracted fields: title, subject, dueDate, priority, description
 */
export const extractAssignmentFromImage = (file) => {
  const formData = new FormData()
  formData.append('image', file)
  return api.post('/assignments/ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** Generate a study plan for a given assignment */
export const generateStudyPlan = (assignmentId) =>
  api.post(`/assignments/${assignmentId}/study-plan`)
