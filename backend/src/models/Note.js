const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      default: '',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      default: '',
      trim: true,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

const stripPrivate = (doc, ret) => {
  ret.id = ret._id.toString()
  delete ret._id
  delete ret.__v
  if (ret.createdBy) {
    ret.createdBy = ret.createdBy.toString()
  }
  return ret
}

noteSchema.set('toJSON', { transform: stripPrivate })
noteSchema.set('toObject', { transform: stripPrivate })

// Index for optimal notes query filters
noteSchema.index({ createdBy: 1, subject: 1 })
// Index for sorting notes by last modified date
noteSchema.index({ createdBy: 1, updatedAt: -1 })

module.exports = mongoose.model('Note', noteSchema)
