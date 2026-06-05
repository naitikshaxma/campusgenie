const assignmentService = require('../services/assignmentService')

exports.createAssignment = async (req, res, next) => {
  try {
    const { title, subject, dueDate } = req.body || {}

    if (!title || !subject || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, and dueDate are required.',
      })
    }

    const assignment = await assignmentService.createAssignment(req.user.id, req.body)

    return res.status(201).json({
      success: true,
      data: assignment.toJSON(),
    })
  } catch (err) {
    return next(err)
  }
}

exports.getAssignments = async (req, res, next) => {
  try {
    const assignments = await assignmentService.getAssignments(req.user.id)
    return res.status(200).json({
      success: true,
      data: assignments.map((a) => a.toJSON()),
    })
  } catch (err) {
    return next(err)
  }
}

exports.updateAssignment = async (req, res, next) => {
  try {
    if (req.body?.status && Object.keys(req.body).length === 1) {
      const assignment = await assignmentService.updateAssignmentStatus(
        req.user.id,
        req.params.id,
        req.body.status
      )
      return res.status(200).json({
        success: true,
        data: assignment.toJSON(),
      })
    }

    const assignment = await assignmentService.updateAssignment(
      req.user.id,
      req.params.id,
      req.body
    )

    return res.status(200).json({
      success: true,
      data: assignment.toJSON(),
    })
  } catch (err) {
    return next(err)
  }
}

exports.deleteAssignment = async (req, res, next) => {
  try {
    await assignmentService.deleteAssignment(req.user.id, req.params.id)
    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
}

exports.getAssignmentStats = async (req, res, next) => {
  try {
    const stats = await assignmentService.getAssignmentStats(req.user.id)
    return res.status(200).json({
      success: true,
      data: stats,
    })
  } catch (err) {
    return next(err)
  }
}
