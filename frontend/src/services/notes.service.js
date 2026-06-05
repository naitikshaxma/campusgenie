import api from './api'

export const fetchNotes      = (params = {}) => api.get('/notes', { params })
export const fetchNote       = (id) => api.get(`/notes/${id}`)
export const createNote      = (data) => api.post('/notes', data)
export const updateNote      = (id, data) => api.patch(`/notes/${id}`, data)
export const deleteNote      = (id) => api.delete(`/notes/${id}`)
export const searchNotes     = (query) => api.get('/notes/search', { params: { q: query } })
