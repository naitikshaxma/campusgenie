const noteService = require('../services/noteService')

exports.createNote = async (req, res, next) => {
  try {
    const { title } = req.body || {}

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required.',
      })
    }

    const note = await noteService.createNote(req.user.id, req.body)
    return res.status(201).json({
      success: true,
      data: note.toJSON(),
    })
  } catch (err) {
    return next(err)
  }
}

exports.getNotes = async (req, res, next) => {
  try {
    const notes = await noteService.getNotes(req.user.id, req.query)
    return res.status(200).json({
      success: true,
      data: notes.map((note) => note.toJSON()),
    })
  } catch (err) {
    return next(err)
  }
}

exports.updateNote = async (req, res, next) => {
  try {
    const note = await noteService.updateNote(req.user.id, req.params.id, req.body)
    return res.status(200).json({
      success: true,
      data: note.toJSON(),
    })
  } catch (err) {
    return next(err)
  }
}

exports.deleteNote = async (req, res, next) => {
  try {
    const deleted = await noteService.deleteNote(req.user.id, req.params.id)
    return res.status(200).json({
      success: true,
      data: { id: deleted.id },
    })
  } catch (err) {
    return next(err)
  }
}

exports.searchNotes = async (req, res, next) => {
  try {
    const queryText = req.query.q || ''
    const notes = await noteService.searchNotes(req.user.id, queryText)
    return res.status(200).json({
      success: true,
      data: notes.map((note) => note.toJSON()),
    })
  } catch (err) {
    return next(err)
  }
}

exports.countNotes = async (req, res, next) => {
  try {
    const count = await noteService.countNotes(req.user.id)
    return res.status(200).json({
      success: true,
      data: { count },
    })
  } catch (err) {
    return next(err)
  }
}
