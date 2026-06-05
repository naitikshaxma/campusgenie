process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err.message, err.stack)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason)
})

require('dotenv').config()

// Enforce environment validation on boot
const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY']
requiredEnv.forEach((key) => {
  const val = process.env[key]
  if (!val || val.startsWith('your_') || val.includes('replace_with_') || val === '') {
    console.error(`[FATAL] Environment variable ${key} is missing, empty, or set to placeholder value!`)
    process.exit(1)
  }
})

const app = require('./src/app')
const connectDB = require('./src/config/db')

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`CampusGenie auth server running on port ${PORT}`)
})

connectDB()
  .then(() => {
    console.log('MongoDB connection sequence completed.')
  })
  .catch((err) => {
    console.error('Failed to initialize MongoDB connection:', err.message)
  })
