const express = require('express')
const ocrController = require('../controllers/ocrController')
const { protect } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

const router = express.Router()

// All OCR routes are protected
router.use(protect)

// Accept multipart form data with single file upload field named 'image'
router.post('/assignment', upload.single('image'), ocrController.extractAssignment)
router.post('/notice', upload.single('image'), ocrController.extractNotice)
router.post('/text', upload.single('image'), ocrController.extractText)

module.exports = router
