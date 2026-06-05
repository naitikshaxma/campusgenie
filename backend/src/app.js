const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const mongoose = require('mongoose')

const authRoutes = require('./routes/authRoutes')
const assignmentRoutes = require('./routes/assignmentRoutes')
const noteRoutes = require('./routes/noteRoutes')
const plannerRoutes = require('./routes/plannerRoutes')
const chatRoutes = require('./routes/chatRoutes')
const ocrRoutes = require('./routes/ocrRoutes')
const timingMiddleware = require('./middleware/timingMiddleware')

const app = express()

// ── Production-grade Security & Performance Middleware ──
app.use(timingMiddleware)
app.use(helmet())
app.use(mongoSanitize())
app.use(compression())
app.use(morgan('dev'))

// ── CORS Safety Enforcement ──
const buildAllowedOrigins = () => {
  const raw = process.env.CORS_ORIGIN || 'http://localhost:5173'
  // Support comma-separated list of allowed origins
  return raw.split(',').map((o) => o.trim().replace(/\/$/, ''))
}
const allowedOrigins = buildAllowedOrigins()
console.log('[CORS] Allowed origins:', allowedOrigins)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Render health checks, etc.)
    if (!origin) return callback(null, true)
    const normalized = origin.replace(/\/$/, '')
    
    // Dynamically match any vercel.app domain/subdomain
    const isVercel = /^https?:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(normalized)

    if (allowedOrigins.includes(normalized) || isVercel) {
      return callback(null, true)
    }
    console.warn('[CORS] Blocked origin:', origin)
    return callback(new Error(`CORS: Origin '${origin}' not allowed.`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))

// Handle CORS preflight for all routes
app.options('*', cors())

app.use(express.json({ limit: '2mb' }))

// ── Rate Limiting Configurations ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 30, // Limit auth attempts to 30 per IP
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' }
})

const ocrLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 15, // Limit image scans to 15 per IP
  message: { success: false, message: 'Too many image scanning requests. Please try again after 10 minutes.' }
})

const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 mins
  max: 50, // Limit AI questions to 50 per IP
  message: { success: false, message: 'Too many AI questions. Please wait a few minutes before asking again.' }
})

// ── Root Endpoint (Render health pings) ──
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'CampusGenie API Running',
    version: '1.0.0'
  })
})

// ── Health Endpoint ──
app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      uptime: Math.round(process.uptime()),
      dbState: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  })
})

// ── Route Mounts ──
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/planner', plannerRoutes)
app.use('/api/chat', chatLimiter, chatRoutes)
app.use('/api/ocr', ocrLimiter, ocrRoutes)

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found.',
  })
})

// ── Improved Global Error Middleware ──
app.use((err, req, res, next) => {
  let status = err.statusCode || 500
  let message = err.message || 'Server error.'

  // Mongoose Cast Error (Invalid ObjectID)
  if (err.name === 'CastError') {
    status = 400
    message = `Invalid reference format for: ${err.path}`
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors).map(val => val.message).join(', ')
  }

  // JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    status = 401
    message = 'Authentication token is malformed or invalid.'
  }
  if (err.name === 'TokenExpiredError') {
    status = 401
    message = 'Authentication token has expired. Please log in again.'
  }

  // Multer Upload Errors
  if (err.code && err.code.startsWith('LIMIT_')) {
    status = 400
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Uploaded image file exceeds the size limit (5MB).'
    } else {
      message = `File upload constraint error: ${err.code}`
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('[GlobalErrorHandler]', err)
  }

  return res.status(status).json({
    success: false,
    message,
  })
})

module.exports = app
