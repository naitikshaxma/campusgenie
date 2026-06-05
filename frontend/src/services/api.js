/**
 * CampusGenie — Hardened Axios API Instance
 * Central HTTP client for all service modules with auto-retry and timeout protection.
 */
import axios from 'axios'

// Determine base API URL
const rawUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://campusgenie-backend.onrender.com/api' // Render backend URL
    : 'http://localhost:8000/api')

const BASE_URL = rawUrl.replace(/\/+$/, '')

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30s timeout to accommodate cold starts
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

/* ── Request Interceptor (JWT injection) ── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cg_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/* ── Standardized error parsing ── */
const getFriendlyError = (error) => {
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'The connection timed out. The server might be booting up — please wait a few seconds and try again.'
    }
    return 'Cannot establish connection to CampusGenie servers. Please check your internet connection.'
  }

  const status = error.response.status
  const serverMsg = error.response?.data?.message

  if (status === 400) return serverMsg || 'Invalid request parameters.'
  if (status === 401) return serverMsg || 'Incorrect credentials or session expired.'
  if (status === 403) return 'Access denied. You do not have permission to view this.'
  if (status === 404) return serverMsg || 'The requested page or asset was not found.'
  if (status === 409) return serverMsg || 'This resource conflict error (e.g. email already exists).'
  if (status === 429) return 'Too many requests. Please slow down and try again.'
  if (status === 502 || status === 503 || status === 504) {
    return 'The server is currently unavailable or recovering from a cold start. Retrying...'
  }
  if (status >= 500) return 'Internal server error. Please try again later.'

  return serverMsg || error.message || 'An unexpected error occurred.'
}

/* ── Response Interceptor (Auto-Retry + Normalized Return) ── */
api.interceptors.response.use(
  (response) => {
    // Standard response normalization
    if (response.data?.success) {
      return response.data.data
    }
    return response.data
  },
  async (error) => {
    const { config, response } = error

    // Retry configuration on network errors or 502/503/504 errors (Render boots)
    const isNetworkError = !response
    const isServerTransient = response && (response.status === 502 || response.status === 503 || response.status === 504)

    if ((isNetworkError || isServerTransient) && config && !config._isRetry) {
      config._retryCount = config._retryCount || 0
      if (config._retryCount < 2) {
        config._isRetry = true
        config._retryCount += 1
        console.warn(`[API] Transient failure encountered. Retrying request ${config.url} (Attempt ${config._retryCount}/2)...`)
        
        // Wait 2 seconds before retry (essential to let Render spin up)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return api(config)
      }
    }

    // Auto log out on unauthorized
    if (response?.status === 401) {
      localStorage.removeItem('cg_token')
      localStorage.removeItem('cg_user')
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login'
      }
    }

    const friendlyMsg = getFriendlyError(error)
    return Promise.reject(new Error(friendlyMsg))
  }
)

export default api
