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

const app = express()

// ── Production-grade Security & Performance Middleware ──
app.use(helmet())
app.use(mongoSanitize())
app.use(compression())
app.use(morgan('dev'))

// ── CORS Safety Enforcement ──
const corsOrigin = process.env.CORS_ORIGIN
if (process.env.NODE_ENV === 'production') {
  if (!corsOrigin) {
    throw new Error('CORS_ORIGIN environment variable is required in production.')
  }
}
app.use(cors({
  origin: corsOrigin || 'http://localhost:5173',
  credentials: true,
}))

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
