const express = require('express')
const chatController = require('../controllers/chatController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// All chat routes are protected
router.use(protect)

router.get('/stats', chatController.getStats)

router.post('/sessions', chatController.createSession)
router.get('/sessions', chatController.getSessions)
router.patch('/sessions/:id', chatController.renameSession)
router.delete('/sessions/:id', chatController.deleteSession)

router.get('/sessions/:id/messages', chatController.getMessages)
router.post('/sessions/:id/messages', chatController.sendMessage)

module.exports = router
