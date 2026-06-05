import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

/* ─── Request Interceptor ─────────────────────────────────── */
// Attach JWT token from localStorage on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cg_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

/* ─── Response Interceptor ────────────────────────────────── */
// Auto-logout on 401, surface errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear credentials and redirect to login
      localStorage.removeItem('cg_token')
      localStorage.removeItem('cg_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
