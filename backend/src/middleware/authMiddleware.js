const jwt = require('jsonwebtoken')
const authService = require('../services/authService')

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization token.',
      })
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'JWT secret not configured.',
      })
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await authService.getUserById(payload.id)
    req.user = user
    return next()
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    })
  }
}
