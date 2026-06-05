import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar, AlertCircle, Clock, Sparkles, CheckSquare, Copy, Edit2, Trash2, CheckCircle2 } from 'lucide-react'
import { cn, formatDate, PRIORITY_COLORS, getSubjectColor } from '@/lib/utils'

export default function AssignmentCard({ 
  assignment, 
  onClick, 
  onEdit, 
  onDelete, 
  onComplete, 
  onDuplicate 
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: assignment.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const subjectColor = getSubjectColor(assignment.subject)
  const priorityClass = PRIORITY_COLORS[assignment.priority] || PRIORITY_COLORS.medium

  const dueDate = new Date(assignment.dueDate)
  const now = new Date()
  const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
  const isOverdue = diffDays < 0 && assignment.status !== 'done'
  const isDueSoon = diffDays >= 0 && diffDays <= 2 && assignment.status !== 'done'

  // Derive estimated study time
  const estHours = assignment.estimatedStudyHours 
    ? `${assignment.estimatedStudyHours} hrs`
    : assignment.priority === 'high' ? '4.5 hrs' : assignment.priority === 'medium' ? '2.5 hrs' : '1.0 hr'

  // Progress percentage based on status
  const progressPercent = 
    assignment.status === 'done' ? 100 :
    assignment.status === 'inprogress' ? 60 : 15

  const progressColor = 
    assignment.status === 'done' ? 'bg-emerald-500' :
    assignment.status === 'inprogress' ? 'bg-amber-500' : 'bg-slate-500'

  // Left status indicator tag class
  const statusBorderClass = 
    assignment.status === 'done' ? 'border-l-4 border-l-emerald-500' :
    assignment.status === 'inprogress' ? 'border-l-4 border-l-amber-500' :
    'border-l-4 border-l-slate-400'

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.97, y: 10 }}
      animate={{ opacity: isDragging ? 0.4 : 1, scale: isDragging ? 1.02 : 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'group rounded-xl border border-border bg-card/40 backdrop-blur-md p-4 cursor-pointer relative',
        statusBorderClass,
        'hover:border-brand-500/35 hover:shadow-xl hover:shadow-brand-500/5 hover:shadow-[0_0_20px_rgba(139,92,246,0.08)]',
        'transition-all duration-300',
        isDragging && 'shadow-2xl shadow-brand-500/25 rotate-1',
      )}
      onClick={onClick}
      whileHover={{ y: -2 }}
    >
      {/* Absolute action overlay on card hover */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 bg-card/80 backdrop-blur-sm p-1 rounded-lg border border-border/60">
        {assignment.status !== 'done' && onComplete && (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(assignment.id) }}
            className="p-1 rounded text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            title="Mark Complete"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
        )}
        {onDuplicate && (
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(assignment) }}
            className="p-1 rounded text-muted-foreground hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(assignment) }}
            className="p-1 rounded text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            title="Edit Details"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(assignment) }}
            className="p-1 rounded text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Header Info */}
      <div className="flex items-start gap-2.5">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-colors shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0 pr-6"> {/* Leave room for absolute overlay buttons */}
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold leading-snug truncate text-foreground group-hover:text-brand-400 transition-colors">
              {assignment.title}
            </h3>
            {assignment.aiGenerated && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-extrabold bg-brand-500/15 text-brand-400 rounded-full border border-brand-500/20 uppercase tracking-wider shrink-0">
                <Sparkles className="h-2 w-2" /> AI
              </span>
            )}
          </div>
          {assignment.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {assignment.description}
            </p>
          )}
          {assignment.aiInsight && (
            <div className="mt-2.5 p-2 rounded-md bg-brand-500/10 border border-brand-500/20 text-[10px] text-brand-300 font-medium leading-tight flex items-start gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.05)]">
              <Sparkles className="h-3 w-3 shrink-0 mt-0.5 text-brand-400" />
              <span>{assignment.aiInsight}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subject and tags row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-border/40">
        <div className="flex flex-wrap gap-1.5">
          {/* Subject */}
          <span className={cn(
            'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
            subjectColor.bg, subjectColor.text, subjectColor.border,
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', subjectColor.dot)} />
            {assignment.subject}
          </span>

          {/* Priority */}
          <span className={cn(
            'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
            priorityClass,
          )}>
            <AlertCircle className="h-2.5 w-2.5" />
            {assignment.priority}
          </span>
        </div>

        {/* Study Time Estimate */}
        <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-semibold">
          <Clock className="h-3 w-3" />
          <span>{estHours}</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>Task Progress</span>
          <span className="font-mono">{progressPercent}%</span>
        </div>
        <div className="w-full bg-secondary/35 h-1.5 rounded-full overflow-hidden">
          <div className={cn('h-full transition-all duration-500 rounded-full', progressColor)} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Due Date Indicator */}
      <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-border/20">
        <div className={cn(
          'flex items-center gap-1.5 text-[10px] font-bold',
          isOverdue ? 'text-rose-400' :
          isDueSoon ? 'text-amber-400' :
          'text-muted-foreground',
        )}>
          <Calendar className="h-3 w-3" />
          <span>
            {isOverdue
              ? `Overdue · ${formatDate(assignment.dueDate)}`
              : isDueSoon
              ? `Due Soon · ${formatDate(assignment.dueDate)}`
              : formatDate(assignment.dueDate)}
          </span>
        </div>
        {isOverdue && (
          <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-wider">
            Overdue
          </span>
        )}
      </div>
    </motion.div>
  )
}
