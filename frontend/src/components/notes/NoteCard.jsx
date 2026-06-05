import { motion } from 'framer-motion'
import { FileText, Clock, Tag } from 'lucide-react'
import { cn, truncate, timeAgo, getSubjectColor } from '@/lib/utils'

export default function NoteCard({ note, onClick, view = 'grid' }) {
  const subjectColor = getSubjectColor(note.subject)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: view === 'grid' ? -4 : -1, transition: { duration: 0.2 } }}
      className={cn(
        'group relative rounded-xl border border-border bg-card cursor-pointer',
        'hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5',
        'transition-all duration-300',
        view === 'grid' ? 'p-5' : 'p-4 flex items-center gap-4',
      )}
      onClick={onClick}
    >
      {/* Color accent stripe */}
      <div className={cn('absolute top-0 left-0 w-full h-0.5 rounded-t-xl', subjectColor.dot)} />

      {view === 'grid' ? (
        <>
          {/* Icon */}
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg mb-3',
            subjectColor.bg,
          )}>
            <FileText className={cn('h-4 w-4', subjectColor.text)} />
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold leading-snug group-hover:text-brand-400 transition-colors line-clamp-2">
            {note.title}
          </h3>

          {/* Preview */}
          <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
            {truncate(note.content, 120)}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4">
            <span className={cn(
              'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border',
              subjectColor.bg, subjectColor.text, subjectColor.border,
            )}>
              <Tag className="h-2.5 w-2.5" />
              {note.subject}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              {timeAgo(note.updatedAt)}
            </span>
          </div>
        </>
      ) : (
        /* List view */
        <>
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', subjectColor.bg)}>
            <FileText className={cn('h-4 w-4', subjectColor.text)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate group-hover:text-brand-400 transition-colors">
              {note.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{truncate(note.content, 80)}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', subjectColor.bg, subjectColor.text, subjectColor.border)}>
              {note.subject}
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:block">{timeAgo(note.updatedAt)}</span>
          </div>
        </>
      )}
    </motion.div>
  )
}
