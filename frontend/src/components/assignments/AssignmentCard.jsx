import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar, Tag, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate, PRIORITY_COLORS, getSubjectColor } from '@/lib/utils'

export default function AssignmentCard({ assignment, onClick }) {
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
  const isOverdue = diffDays < 0
  const isDueSoon = diffDays >= 0 && diffDays <= 2

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: isDragging ? 1.02 : 1 }}
      className={cn(
        'group rounded-xl border border-border bg-card p-4 cursor-pointer',
        'hover:border-brand-500/30 hover:shadow-md hover:shadow-brand-500/5',
        'transition-all duration-200',
        isDragging && 'shadow-xl shadow-brand-500/20 rotate-2',
      )}
      onClick={onClick}
      whileHover={{ y: -2 }}
    >
      {/* Drag handle + header */}
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold leading-snug truncate group-hover:text-brand-400 transition-colors">
            {assignment.title}
          </h3>
          {assignment.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {assignment.description}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {/* Subject */}
        <span className={cn(
          'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border',
          subjectColor.bg, subjectColor.text, subjectColor.border,
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full', subjectColor.dot)} />
          {assignment.subject}
        </span>

        {/* Priority */}
        <span className={cn(
          'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border',
          priorityClass,
        )}>
          <AlertCircle className="h-2.5 w-2.5" />
          {assignment.priority}
        </span>
      </div>

      {/* Due date */}
      <div className={cn(
        'flex items-center gap-1.5 mt-3 text-[10px] font-medium',
        isOverdue  ? 'text-rose-400'   :
        isDueSoon  ? 'text-amber-400'  :
                     'text-muted-foreground',
      )}>
        <Calendar className="h-3 w-3" />
        {isOverdue
          ? `Overdue · ${formatDate(assignment.dueDate)}`
          : isDueSoon
          ? `Due in ${diffDays}d · ${formatDate(assignment.dueDate)}`
          : formatDate(assignment.dueDate)}
      </div>
    </motion.div>
  )
}
