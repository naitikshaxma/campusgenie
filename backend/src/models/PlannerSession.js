const mongoose = require('mongoose')

const plannerSessionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0.25,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      default: '',
      trim: true,
    },
    endTime: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'skipped'],
      default: 'pending',
    },
    generatedByAI: {
      type: Boolean,
      default: false,
    },
    linkedAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      default: null,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
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
  if (ret.linkedAssignment) {
    ret.linkedAssignment = ret.linkedAssignment.toString()
  }
  if (typeof ret.note === 'undefined') {
    ret.note = ret.notes
  }
  return ret
}

plannerSessionSchema.set('toJSON', { transform: stripPrivate })
plannerSessionSchema.set('toObject', { transform: stripPrivate })

// Compound index for optimal calendar queries and dashboard listings
plannerSessionSchema.index({ createdBy: 1, date: 1 })

module.exports = mongoose.model('PlannerSession', plannerSessionSchema)
