const ocrService = require('../services/ocrService')

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
const maxFileSize = Number(process.env.UPLOAD_SIZE_LIMIT) || 5 * 1024 * 1024

function validateUpload(req) {
  if (!req.file) {
    return 'No image file uploaded.'
  }
  
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return 'Invalid file type. Only JPG, JPEG, PNG, and WEBP images are supported.'
  }

  if (req.file.size > maxFileSize) {
    return 'Uploaded image file exceeds the size limit (5MB).'
  }

  return null
}

async function runWithTimeout(promise, ms = 25000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('The request timed out. Please try uploading a clearer or smaller image.')), ms)
  )
  return Promise.race([promise, timeout])
}

exports.extractAssignment = async (req, res) => {
  try {
    const errorMsg = validateUpload(req)
    if (errorMsg) {
      return res.status(400).json({
        success: false,
        message: errorMsg
      })
    }

    const parsePromise = ocrService.extractAssignment(req.file.buffer, req.file.mimetype)
    const data = await runWithTimeout(parsePromise, 25000)

    return res.status(200).json({
      success: true,
      data,
      message: 'Assignment parsed successfully'
    })
  } catch (err) {
    console.error('[ocrController] extractAssignment error:', err)
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Server error occurred during OCR extraction.'
    })
  }
}

exports.extractNotice = async (req, res) => {
  try {
    const errorMsg = validateUpload(req)
    if (errorMsg) {
      return res.status(400).json({
        success: false,
        message: errorMsg
      })
    }

    const parsePromise = ocrService.extractNotice(req.file.buffer, req.file.mimetype)
    const data = await runWithTimeout(parsePromise, 25000)

    return res.status(200).json({
      success: true,
      data,
      message: 'Notice parsed successfully'
    })
  } catch (err) {
    console.error('[ocrController] extractNotice error:', err)
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Server error occurred during notice extraction.'
    })
  }
}

exports.extractText = async (req, res) => {
  try {
    const errorMsg = validateUpload(req)
    if (errorMsg) {
      return res.status(400).json({
        success: false,
        message: errorMsg
      })
    }

    const parsePromise = ocrService.extractText(req.file.buffer, req.file.mimetype)
    const data = await runWithTimeout(parsePromise, 25000)

    return res.status(200).json({
      success: true,
      data,
      message: 'Text extracted successfully'
    })
  } catch (err) {
    console.error('[ocrController] extractText error:', err)
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Server error occurred during text extraction.'
    })
  }
}
