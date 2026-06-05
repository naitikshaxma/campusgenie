/**
 * CampusGenie — Axios API Instance
 * Central HTTP client for all service modules.
 * Attach JWT, auto-logout on 401, base URL from env.
 */
import axios from 'axios'

// Strip trailing slash to prevent double-slash URLs
// VITE_API_URL from env → production hardcoded fallback → dev localhost
const rawUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://campusgenie.onrender.com/api'   // ← production Render backend
    : 'http://localhost:8000/api')              // ← local dev
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

/* ── Demo Mock Data Resolver ─────────────────────────── */
const getDemoMockData = (url, method, requestBody) => {
  const path = url.split('?')[0].replace(/\/+$/, '')
  let body = {}
  try {
    if (requestBody) body = typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody
  } catch (e) {}

  if (path.endsWith('/auth/me')) {
    return {
      user: {
        id: 'demo_user',
        name: 'Demo Student',
        email: 'demo@campusgenie.io',
        major: 'Computer Science',
        avatar: ''
      }
    }
  }

  if (path.endsWith('/auth/login') || path.endsWith('/auth/signup')) {
    return {
      user: {
        id: 'demo_user',
        name: 'Demo Student',
        email: 'demo@campusgenie.io',
        major: 'Computer Science',
        avatar: ''
      },
      accessToken: 'demo_token_123'
    }
  }

  if (path.endsWith('/chat/sessions')) {
    if (method === 'post') {
      return {
        id: `session_${Date.now()}`,
        title: 'New Conversation',
        updatedAt: new Date().toISOString()
      }
    }
    return [
      { id: 'session_1', title: 'DBMS Exam Prep', updatedAt: new Date().toISOString() },
      { id: 'session_2', title: 'React Performance Tips', updatedAt: new Date().toISOString() }
    ]
  }

  if (path.includes('/chat/sessions/') && path.endsWith('/messages')) {
    if (method === 'post') {
      const answers = [
        "That is an excellent question! Spaced repetition suggests reviewing this concept tomorrow, then in 3 days, then in 7 days.",
        "To optimize this workload, prioritize B-Tree indexing concepts first, then move on to profiling operations.",
        "Here are key points to review for your syllabus: \n- **Core Index Definitions**\n- **B-Trees vs Hash Indexes**\n- **Query Optimization Profiling**",
        "CampusGenie AI is ready to help you schedule these tasks. Let me know if you would like me to push this to your calendar!"
      ]
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)]
      return {
        id: `msg_${Date.now()}`,
        role: 'ai',
        content: randomAnswer,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      }
    }
    return [
      { id: 'm1', role: 'user', content: 'Explain index optimization', timestamp: '09:30 AM' },
      { id: 'm2', role: 'ai', content: 'Database index optimization involves creating indexes to speed up query times. **B-Trees** are commonly used to locate records quickly without scanning the whole table.', timestamp: '09:31 AM' }
    ]
  }

  if (path.endsWith('/assignments')) {
    if (method === 'post') {
      return {
        id: `assign_${Date.now()}`,
        title: body.title || 'Cloned Assignment',
        subject: body.subject || 'CS',
        description: body.description || '',
        dueDate: body.dueDate || new Date().toISOString(),
        priority: body.priority || 'medium',
        status: body.status || 'todo',
        estimatedStudyHours: body.estimatedStudyHours || 2.5,
        aiGenerated: body.aiGenerated || false
      }
    }
    return [
      { id: 'assign_1', title: 'DBMS Assignment 3', subject: 'CS', description: 'Complete SQL queries for index profiling.', dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), priority: 'high', status: 'todo', estimatedStudyHours: 3, aiGenerated: true, aiInsight: 'Focus on indexing profiling tools.' },
      { id: 'assign_2', title: 'Physics Lab Report', subject: 'Physics', description: 'Pendulum oscillation data calculations.', dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), priority: 'medium', status: 'inprogress', estimatedStudyHours: 2, aiGenerated: false }
    ]
  }

  if (path.includes('/assignments/')) {
    if (method === 'put') {
      return {
        id: path.split('/').pop(),
        ...body
      }
    }
    if (method === 'delete') {
      return { success: true }
    }
  }

  if (path.endsWith('/planner/sessions')) {
    if (method === 'post') {
      return {
        id: `plan_${Date.now()}`,
        subject: body.subject || 'CS',
        topic: body.topic || 'Review session',
        duration: body.duration || 1.5,
        date: body.date || new Date().toISOString(),
        startTime: body.startTime || '18:00',
        endTime: body.endTime || '19:30',
        notes: body.notes || '',
        status: body.status || 'pending'
      }
    }
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    return [
      { id: 'plan_1', subject: 'CS', topic: 'Review index structures', duration: 1.5, date: tomorrow, startTime: '18:00', endTime: '19:30', notes: 'Spaced repetition block.', status: 'pending' }
    ]
  }

  if (path.endsWith('/planner/generate')) {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    return {
      sessions: [
        { subject: body.subject || 'CS', topic: 'Review index structures', duration: 1.5, date: tomorrow, startTime: '18:00', endTime: '19:30', notes: 'Spaced repetition block.' }
      ],
      reasoning: 'This plan distributes topics to minimize fatigue and maximize peak energy hours.'
    }
  }

  if (path.endsWith('/ocr/assignment')) {
    return {
      title: 'DBMS Homework 4',
      subject: 'CS',
      description: 'Create and analyze indexes on table files.',
      dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      priority: 'high',
      estimatedStudyHours: 3,
      confidence: 0.95,
      aiGenerated: true
    }
  }

  if (path.endsWith('/ocr/notice')) {
    return {
      event: 'Coding Hackathon 2026',
      date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      venue: 'iQOO Auditorium',
      registrationDeadline: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
      description: 'Campus hackathon contest.'
    }
  }

  if (path.endsWith('/notes')) {
    if (method === 'post') {
      return {
        id: `note_${Date.now()}`,
        title: body.title || 'Untitled Note',
        content: body.content || '',
        updatedAt: new Date().toISOString()
      }
    }
    return [
      { id: 'note_1', title: 'Index Optimization Notes', content: 'Indexes speed up lookup operations by keeping a sorted map.', updatedAt: new Date().toISOString() }
    ]
  }

  return {}
}

/* ── Request Interceptor ─────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cg_token')
    if (token) config.headers.Authorization = `Bearer ${token}`

    // Intercept with high-fidelity mock adapter if in Demo Mode
    if (localStorage.getItem('CAMPUSGENIE_DEMO_MODE') === 'true') {
      config.adapter = async (cfg) => {
        const url = cfg.url || ''
        const method = cfg.method?.toLowerCase() || 'get'
        const mockResponse = getDemoMockData(url, method, cfg.data)
        
        return {
          data: {
            success: true,
            data: mockResponse
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: cfg
        }
      }
    }

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
