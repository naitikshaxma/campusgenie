/**
 * CampusGenie — Axios API Instance
 * Central HTTP client for all service modules.
 * Attach JWT, auto-logout on 401, base URL from env.
 */
import axios from 'axios'

// Strip trailing slash to prevent double-slash URLs
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const BASE_URL = rawUrl.replace(/\/+$/, '')

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30s — accounts for Render cold start (~15-20s)
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

/* ── Human-readable error messages ──────────────────── */
const getFriendlyError = (error) => {
  // No response at all = backend not reachable
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'The server is taking too long to respond. It may be starting up — please wait 30 seconds and try again.'
    }
    return 'Cannot reach the server. Please check your internet connection and try again.'
  }

  const status = error.response.status
  const serverMsg = error.response?.data?.message

  if (status === 400) return serverMsg || 'Invalid request. Please check your details.'
  if (status === 401) return serverMsg || 'Incorrect email or password.'
  if (status === 403) return 'You do not have permission to do this.'
  if (status === 404) return serverMsg || 'The requested resource was not found.'
  if (status === 409) return serverMsg || 'An account with this email already exists.'
  if (status === 429) return 'Too many requests. Please wait a moment and try again.'
  if (status >= 500) return 'The server encountered an error. Please try again in a moment.'

  return serverMsg || error.message || 'Something went wrong.'
}

/* ── Response Interceptor ────────────────────────────── */
api.interceptors.response.use(
  (response) => response.data?.success ? response.data.data : response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cg_token')
      localStorage.removeItem('cg_user')
      // Only redirect if we're not already on an auth page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login'
      }
    }
    const friendlyMessage = getFriendlyError(error)
    return Promise.reject(new Error(friendlyMessage))
  },
)

export default api
