const plannerService = require('../services/plannerService')

exports.createSession = async (req, res, next) => {
  try {
    const { subject, duration, date } = req.body || {}

    if (!subject || !duration || !date) {
      return res.status(400).json({
        success: false,
        message: 'Subject, duration, and date are required.',
      })
    }

    const session = await plannerService.createSession(req.user.id, req.body)
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
    const sessions = await plannerService.getSessions(req.user.id)
    return res.status(200).json({
      success: true,
      data: sessions.map((s) => s.toJSON()),
    })
  } catch (err) {
    return next(err)
  }
}

exports.updateSession = async (req, res, next) => {
  try {
    const session = await plannerService.updateSession(req.user.id, req.params.id, req.body)
    return res.status(200).json({
      success: true,
      data: session.toJSON(),
    })
  } catch (err) {
    return next(err)
  }
}

exports.deleteSession = async (req, res, next) => {
  try {
    const deleted = await plannerService.deleteSession(req.user.id, req.params.id)
    return res.status(200).json({
      success: true,
      data: { id: deleted.id },
    })
  } catch (err) {
    return next(err)
  }
}

exports.getStreak = async (req, res, next) => {
  try {
    const streak = await plannerService.getStreak(req.user.id)
    return res.status(200).json({
      success: true,
      data: streak,
    })
  } catch (err) {
    return next(err)
  }
}

exports.generateStudyPlan = async (req, res, next) => {
  try {
    const { assignmentTitle, subject, deadline, availableHours, topic } = req.body || {}

    if (!topic && (!assignmentTitle || !subject || !deadline || !availableHours)) {
      return res.status(400).json({
        success: false,
        message: 'A study topic or assignment title, subject, deadline, and availableHours are required.',
      })
    }

    const { sessions, reasoning } = await plannerService.generateStudyPlan(req.user.id, req.body)
    return res.status(200).json({
      success: true,
      data: {
        sessions: sessions.map((s) => s.toJSON()),
        reasoning
      }
    })
  } catch (err) {
    return next(err)
  }
}
