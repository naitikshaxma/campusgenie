import { motion } from 'framer-motion'
import { Clock, BookOpen, Trash2 } from 'lucide-react'
import { cn, getSubjectColor } from '@/lib/utils'

/**
 * TaskItem — displays a study session in a list.
 */
export default function TaskItem({ session, onDelete }) {
  const sc = getSubjectColor(session.subject)
  const sessionDate = new Date(session.date)

  const timeStr = sessionDate.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className={cn(
        'group flex items-center gap-3 rounded-xl border p-3',
        'bg-card hover:border-brand-500/30 hover:shadow-sm',
        'transition-all duration-200',
        sc.border,
      )}
    >
      {/* Color dot */}
      <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', sc.dot)} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-semibold', sc.text)}>{session.subject}</span>
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', sc.bg, sc.text)}>
            {session.duration}h
          </span>
        </div>
        {session.note && (
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{session.note}</p>
        )}
        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
          <Clock className="h-2.5 w-2.5" />
          {timeStr}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(session.id)}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}
