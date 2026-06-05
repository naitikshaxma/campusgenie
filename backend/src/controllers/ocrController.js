const ocrService = require('../services/ocrService')

exports.extractAssignment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded.',
      })
    }

    const data = await ocrService.extractAssignment(req.file.buffer, req.file.mimetype)
    return res.status(200).json({
      success: true,
      data,
    })
  } catch (err) {
    return next(err)
  }
}

exports.extractNotice = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded.',
      })
    }

    const data = await ocrService.extractNotice(req.file.buffer, req.file.mimetype)
    return res.status(200).json({
      success: true,
      data,
    })
  } catch (err) {
    return next(err)
  }
}

exports.extractText = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded.',
      })
    }

    const data = await ocrService.extractText(req.file.buffer, req.file.mimetype)
    return res.status(200).json({
      success: true,
      data,
    })
  } catch (err) {
    return next(err)
  }
}
