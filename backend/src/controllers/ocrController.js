const geminiVisionService = require('../services/geminiVisionService')

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

exports.extractAssignment = async (req, res) => {
  try {
    const errorMsg = validateUpload(req)
    if (errorMsg) {
      return res.status(400).json({
        success: false,
        error: errorMsg
      })
    }

    const ocrResult = await geminiVisionService.scanImage(req.file.buffer, req.file.mimetype, 'assignment')
    if (!ocrResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Could not extract assignment'
      })
    }

    return res.status(200).json({
      success: true,
      data: ocrResult.data,
      message: 'Assignment parsed successfully'
    })
  } catch (err) {
    console.error('[ocrController] extractAssignment error:', err)
    return res.status(500).json({
      success: false,
      error: 'Could not extract assignment'
    })
  }
}

exports.extractNotice = async (req, res) => {
  try {
    const errorMsg = validateUpload(req)
    if (errorMsg) {
      return res.status(400).json({
        success: false,
        error: errorMsg
      })
    }

    const ocrResult = await geminiVisionService.scanImage(req.file.buffer, req.file.mimetype, 'notice')
    if (!ocrResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Could not extract assignment'
      })
    }

    return res.status(200).json({
      success: true,
      data: ocrResult.data,
      message: 'Notice parsed successfully'
    })
  } catch (err) {
    console.error('[ocrController] extractNotice error:', err)
    return res.status(500).json({
      success: false,
      error: 'Could not extract assignment'
    })
  }
}

exports.extractText = async (req, res) => {
  try {
    const errorMsg = validateUpload(req)
    if (errorMsg) {
      return res.status(400).json({
        success: false,
        error: errorMsg
      })
    }

    const ocrResult = await geminiVisionService.scanImage(req.file.buffer, req.file.mimetype, 'assignment')
    if (!ocrResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Could not extract assignment'
      })
    }

    return res.status(200).json({
      success: true,
      data: ocrResult.data,
      message: 'Text extracted successfully'
    })
  } catch (err) {
    console.error('[ocrController] extractText error:', err)
    return res.status(500).json({
      success: false,
      error: 'Could not extract assignment'
    })
  }
}
