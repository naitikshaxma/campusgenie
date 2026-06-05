const express = require('express')
const noteController = require('../controllers/noteController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(protect)

router.post('/', noteController.createNote)
router.get('/', noteController.getNotes)
router.get('/search', noteController.searchNotes)
router.get('/count', noteController.countNotes)
router.patch('/:id', noteController.updateNote)
router.delete('/:id', noteController.deleteNote)

module.exports = router
