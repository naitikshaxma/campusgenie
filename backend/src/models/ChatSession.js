const mongoose = require('mongoose')

const chatSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'New conversation',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastMessage: {
      type: String,
      default: '',
      trim: true,
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

chatSessionSchema.set('toJSON', { transform: stripPrivate })
chatSessionSchema.set('toObject', { transform: stripPrivate })

module.exports = mongoose.model('ChatSession', chatSessionSchema)
