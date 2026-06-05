import { motion } from 'framer-motion'
import { Clock, Trash2, Check } from 'lucide-react'
import { cn, getSubjectColor } from '@/lib/utils'

/**
 * TaskItem — displays a study session in a checklist.
 * Supports completion toggles and delete hooks.
 */
export default function TaskItem({ session, onDelete, onToggle }) {
  if (!session) return null

  const sc = getSubjectColor(session.subject || 'CS')
  const isCompleted = session.status === 'completed'
  const sessionId = session._id || session.id

  // Safe date parsing
  const rawDate = session.date
  const sessionDate = rawDate ? new Date(rawDate) : null
  const isValidDate = sessionDate && !isNaN(sessionDate)

  const timeStr = isValidDate
    ? sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '—'

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'group flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-200',
        isCompleted
          ? 'bg-muted/5 border-muted-foreground/10 text-muted-foreground/60'
          : `bg-card ${sc.border} hover:border-brand-500/35 hover:shadow-sm`
      )}
    >
      {/* Interactive Checkbox */}
      <button
        type="button"
        onClick={() => sessionId && onToggle?.(sessionId, isCompleted ? 'pending' : 'completed')}
        className={cn(
          "h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500",
          isCompleted
            ? "bg-emerald-500 border-transparent text-white"
            : "border-muted-foreground/30 hover:border-brand-500 text-transparent"
        )}
      >
        <Check className={cn("h-3 w-3 stroke-[3]", isCompleted ? "opacity-100" : "opacity-0")} />
      </button>

      {/* Info Column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs font-bold uppercase tracking-wider',
            isCompleted ? 'text-muted-foreground/50 line-through' : sc.text
          )}>
            {session.subject || 'Study Block'}
          </span>
          <span className={cn(
            'text-[9px] px-1.5 py-0.5 rounded-full font-bold',
            isCompleted ? 'bg-muted/10 text-muted-foreground/50' : `${sc.bg} ${sc.text}`
          )}>
            {session.duration || 0}h
          </span>
        </div>
        
        <p className={cn(
          "text-[12px] font-semibold mt-0.5 truncate text-foreground/90",
          isCompleted && "text-muted-foreground/50 line-through"
        )}>
          {session.topic || session.note || 'Study Session'}
        </p>

        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground/80 font-medium">
          <Clock className="h-3 w-3" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Delete Trigger */}
      <button
        type="button"
        onClick={() => sessionId && onDelete(sessionId)}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground/60 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
        title="Delete Session"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}
