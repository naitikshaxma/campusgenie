import api from './api'

export const fetchSessions       = () => api.get('/planner/sessions')
export const createSession       = (data) => api.post('/planner/sessions', data)
export const updateSession       = (id, data) => api.patch(`/planner/sessions/${id}`, data)
export const deleteSession       = (id) => api.delete(`/planner/sessions/${id}`)
export const fetchStreakData      = () => api.get('/planner/streak')

/**
 * Ask AI to generate a weekly study plan.
 * @param {Object} params - { subjects, examDates, availableHours }
 */
export const generateAiPlan = (params) => api.post('/planner/generate', params)
