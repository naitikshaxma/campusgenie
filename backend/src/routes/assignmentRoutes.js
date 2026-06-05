const express = require('express')
const assignmentController = require('../controllers/assignmentController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(protect)

router.post('/', assignmentController.createAssignment)
router.get('/', assignmentController.getAssignments)
router.get('/stats', assignmentController.getAssignmentStats)
router.patch('/:id', assignmentController.updateAssignment)
router.delete('/:id', assignmentController.deleteAssignment)

module.exports = router
