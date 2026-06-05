const User = require('../models/User')

async function createUser({ name, email, password, avatar, branch, year }) {
  const existing = await User.findOne({ email })
  if (existing) {
    const err = new Error('Email already in use.')
    err.statusCode = 409
    throw err
  }
  const user = await User.create({ name, email, password, avatar, branch, year })
  return user
}

async function authenticateUser(email, password) {
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    const err = new Error('Invalid email or password.')
    err.statusCode = 401
    throw err
  }
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    const err = new Error('Invalid email or password.')
    err.statusCode = 401
    throw err
  }
  return user
}

async function getUserById(userId) {
  const user = await User.findById(userId)
  if (!user) {
    const err = new Error('User not found.')
    err.statusCode = 401
    throw err
  }
  return user
}

module.exports = {
  createUser,
  authenticateUser,
  getUserById,
}
