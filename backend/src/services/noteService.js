const Note = require('../models/Note')

async function createNote(userId, payload) {
  const note = await Note.create({
    title: payload.title,
    content: payload.content,
    subject: payload.subject,
    tags: payload.tags,
    color: payload.color,
    aiGenerated: payload.aiGenerated,
    createdBy: userId,
  })
  return note
}

async function getNotes(userId, filters = {}) {
  const query = { createdBy: userId }
  if (filters.subject && filters.subject !== 'All') {
    query.subject = filters.subject
  }
  return Note.find(query).sort({ updatedAt: -1 })
}

async function updateNote(userId, noteId, payload) {
  const note = await Note.findOneAndUpdate(
    { _id: noteId, createdBy: userId },
    {
      title: payload.title,
      content: payload.content,
      subject: payload.subject,
      tags: payload.tags,
      color: payload.color,
      aiGenerated: payload.aiGenerated,
    },
    { new: true, runValidators: true }
  )

  if (!note) {
    const err = new Error('Note not found.')
    err.statusCode = 404
    throw err
  }

  return note
}

async function deleteNote(userId, noteId) {
  const deleted = await Note.findOneAndDelete({ _id: noteId, createdBy: userId })
  if (!deleted) {
    const err = new Error('Note not found.')
    err.statusCode = 404
    throw err
  }
  return deleted
}

async function searchNotes(userId, queryText) {
  if (!queryText) return []
  const regex = new RegExp(queryText, 'i')
  return Note.find({
    createdBy: userId,
    $or: [
      { title: { $regex: regex } },
      { content: { $regex: regex } },
      { subject: { $regex: regex } },
    ],
  }).sort({ updatedAt: -1 })
}

async function countNotes(userId) {
  return Note.countDocuments({ createdBy: userId })
}

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  searchNotes,
  countNotes,
}
