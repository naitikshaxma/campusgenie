const Assignment = require('../models/Assignment')

async function createAssignment(userId, payload) {
  const assignment = await Assignment.create({
    title: payload.title,
    subject: payload.subject,
    description: payload.description,
    dueDate: payload.dueDate,
    priority: payload.priority,
    status: payload.status,
    source: payload.source,
    aiGenerated: payload.aiGenerated,
    createdBy: userId,
  })
  return assignment
}

async function getAssignments(userId) {
  return Assignment.find({ createdBy: userId }).sort({ createdAt: -1 })
}

async function updateAssignment(userId, assignmentId, payload) {
  const assignment = await Assignment.findOneAndUpdate(
    { _id: assignmentId, createdBy: userId },
    {
      title: payload.title,
      subject: payload.subject,
      description: payload.description,
      dueDate: payload.dueDate,
      priority: payload.priority,
      status: payload.status,
      source: payload.source,
      aiGenerated: payload.aiGenerated,
    },
    { new: true, runValidators: true }
  )

  if (!assignment) {
    const err = new Error('Assignment not found.')
    err.statusCode = 404
    throw err
  }

  return assignment
}

async function deleteAssignment(userId, assignmentId) {
  const deleted = await Assignment.findOneAndDelete({
    _id: assignmentId,
    createdBy: userId,
  })

  if (!deleted) {
    const err = new Error('Assignment not found.')
    err.statusCode = 404
    throw err
  }

  return deleted
}

async function updateAssignmentStatus(userId, assignmentId, status) {
  const assignment = await Assignment.findOneAndUpdate(
    { _id: assignmentId, createdBy: userId },
    { status },
    { new: true, runValidators: true }
  )

  if (!assignment) {
    const err = new Error('Assignment not found.')
    err.statusCode = 404
    throw err
  }

  return assignment
}

async function getAssignmentStats(userId) {
  const stats = await Assignment.aggregate([
    { $match: { createdBy: userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  const result = { pending: 0, inprogress: 0, done: 0 }
  stats.forEach((row) => {
    if (row._id === 'todo') result.pending = row.count
    if (row._id === 'inprogress') result.inprogress = row.count
    if (row._id === 'done') result.done = row.count
  })

  return result
}

module.exports = {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
  getAssignmentStats,
}
