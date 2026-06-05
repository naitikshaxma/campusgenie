const mongoose = require('mongoose')

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'inprogress', 'done'],
      default: 'todo',
    },
    source: {
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

assignmentSchema.set('toJSON', { transform: stripPrivate })
assignmentSchema.set('toObject', { transform: stripPrivate })

// Compound index for optimal dashboard deadlines and listing queries
assignmentSchema.index({ createdBy: 1, dueDate: 1 })
// Compound index for optimal Kanban board status filters
assignmentSchema.index({ createdBy: 1, status: 1 })
// Compound index for priority-deadline ordering
assignmentSchema.index({ createdBy: 1, dueDate: 1, priority: 1 })

module.exports = mongoose.model('Assignment', assignmentSchema)
