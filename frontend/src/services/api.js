/**
 * CampusGenie — Axios API Instance
 * Central HTTP client for all service modules.
 * Attach JWT, auto-logout on 401, base URL from env.
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/* ── Deduplicate simultaneous in-flight GET requests ── */
const inflightRequests = new Map()
const originalGet = api.get.bind(api)
api.get = (url, config) => {
  const cacheKey = url + (config ? JSON.stringify(config) : '')
  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey)
  }
  const promise = originalGet(url, config).finally(() => {
    inflightRequests.delete(cacheKey)
  })
  inflightRequests.set(cacheKey, promise)
  return promise
}

/* ── Request Interceptor ─────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cg_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

/* ── Response Interceptor ────────────────────────────── */
api.interceptors.response.use(
  (response) => response.data?.success ? response.data.data : response.data,          // unwrap .data.data automatically if successful
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cg_token')
      localStorage.removeItem('cg_user')
      window.location.href = '/login'
    }
    return Promise.reject(
      error.response?.data?.message || error.message || 'Something went wrong',
    )
  },
)

export default api
