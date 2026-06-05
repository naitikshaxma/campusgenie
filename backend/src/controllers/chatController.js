const chatService = require('../services/chatService')

exports.createSession = async (req, res, next) => {
  try {
    const { title } = req.body || {}
    const session = await chatService.createSession(req.user.id, title)
    return res.status(201).json({
      success: true,
      data: session.toJSON(),
    })
  } catch (err) {
    return next(err)
  }
}

exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await chatService.getSessions(req.user.id)
    return res.status(200).json({
      success: true,
      data: sessions.map((s) => s.toJSON()),
    })
  } catch (err) {
    return next(err)
  }
}

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await chatService.getMessages(req.user.id, req.params.id)
    return res.status(200).json({
      success: true,
      data: messages.map((m) => m.toJSON()),
    })
  } catch (err) {
    return next(err)
  }
}

exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body || {}
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.',
      })
    }

    const message = await chatService.sendMessage(req.user.id, req.params.id, content)
    return res.status(200).json({
      success: true,
      data: message.toJSON(),
    })
  } catch (err) {
    return next(err)
  }
}

exports.deleteSession = async (req, res, next) => {
  try {
    await chatService.deleteSession(req.user.id, req.params.id)
    return res.status(200).json({
      success: true,
      data: { id: req.params.id },
    })
  } catch (err) {
    return next(err)
  }
}

exports.renameSession = async (req, res, next) => {
  try {
    const { title } = req.body || {}
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required.',
      })
    }

    const session = await chatService.renameSession(req.user.id, req.params.id, title)
    return res.status(200).json({
      success: true,
      data: session.toJSON(),
    })
  } catch (err) {
    return next(err)
  }
}

exports.getStats = async (req, res, next) => {
  try {
    const stats = await chatService.getStats(req.user.id)
    return res.status(200).json({
      success: true,
      data: stats,
    })
  } catch (err) {
    return next(err)
  }
}
