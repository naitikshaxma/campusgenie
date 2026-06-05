const authService = require('../services/authService')
const generateToken = require('../utils/generateToken')

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, avatar, branch, year } = req.body || {}

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      })
    }

    const user = await authService.createUser({
      name,
      email,
      password,
      avatar,
      branch,
      year,
    })

    const accessToken = generateToken(user.id)

    return res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        accessToken,
      },
    })
  } catch (err) {
    return next(err)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {}

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    const user = await authService.authenticateUser(email, password)
    const accessToken = generateToken(user.id)

    return res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        accessToken,
      },
    })
  } catch (err) {
    return next(err)
  }
}

exports.getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user?.toJSON ? req.user.toJSON() : req.user,
    },
  })
}
