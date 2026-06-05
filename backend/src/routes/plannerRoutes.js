const express = require('express')
const plannerController = require('../controllers/plannerController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(protect)

router.post('/sessions', plannerController.createSession)
router.get('/sessions', plannerController.getSessions)
router.patch('/sessions/:id', plannerController.updateSession)
router.delete('/sessions/:id', plannerController.deleteSession)
router.get('/streak', plannerController.getStreak)
router.post('/generate', plannerController.generateStudyPlan)

module.exports = router
