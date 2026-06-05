const multer = require('multer')

// Configure memory storage to prevent filesystem leaks
const storage = multer.memoryStorage()

// File validation filter: Images only
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    const err = new Error('Invalid file type. Only JPEG, PNG, and WEBP images are allowed.')
    err.statusCode = 400
    cb(err, false)
  }
}

// 5MB file size limit
const uploadLimit = Number(process.env.UPLOAD_SIZE_LIMIT) || 5 * 1024 * 1024

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadLimit,
  },
})

module.exports = upload
