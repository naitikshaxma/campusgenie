const mongoose = require('mongoose')

module.exports = async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set')
  }

  try {
    mongoose.set('strictQuery', true)
    console.log('Connecting to MongoDB Atlas...')
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    })
    console.log('MongoDB connected to Atlas successfully')
  } catch (err) {
    console.error('MongoDB Atlas connection failed:', err.message)
  }
}
