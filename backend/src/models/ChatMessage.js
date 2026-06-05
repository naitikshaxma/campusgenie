const mongoose = require('mongoose')

const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    tokensUsed: {
      type: Number,
      default: 0,
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
  if (ret.sessionId) {
    ret.sessionId = ret.sessionId.toString()
  }
  if (ret.createdBy) {
    ret.createdBy = ret.createdBy.toString()
  }
  return ret
}

chatMessageSchema.set('toJSON', { transform: stripPrivate })
chatMessageSchema.set('toObject', { transform: stripPrivate })

// Compound index for optimal chat log queries
chatMessageSchema.index({ sessionId: 1, createdAt: 1 })

module.exports = mongoose.model('ChatMessage', chatMessageSchema)
