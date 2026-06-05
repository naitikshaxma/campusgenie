import { motion } from 'framer-motion'
import { FileText, Clock, Tag } from 'lucide-react'
import { cn, truncate, timeAgo, getSubjectColor } from '@/lib/utils'

function highlightText(text, search) {
  if (!search || !text) return text
  const parts = text.split(new RegExp(`(${search})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <mark key={i} className="bg-brand-500/35 text-brand-200 rounded px-0.5 font-semibold decoration-none">{part}</mark>
    ) : (
      part
    )
  )
}

function renderMarkdownPreview(content, search) {
  if (!content) return ''
  
  // Truncate content for card preview
  let text = content.slice(0, 140)
  if (content.length > 140) text += '...'

  const lines = text.split('\n')
  return (
    <div className="space-y-1 mt-2 text-xs text-muted-foreground leading-relaxed">
      {lines.slice(0, 3).map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return null

        // Lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-center gap-1.5 ml-1 my-0.5">
              <span className="h-1 w-1 rounded-full bg-brand-400 shrink-0" />
              <span className="truncate">{highlightText(trimmed.substring(2), search)}</span>
            </div>
          )
        }

        // Headers
        if (trimmed.startsWith('#')) {
          const cleanH = trimmed.replace(/^#+\s*/, '')
          return (
            <span key={idx} className="block font-bold text-foreground mt-1.5 mb-0.5">
              {highlightText(cleanH, search)}
            </span>
          )
        }

        // Handle inline bold formatting
        let element = trimmed
        if (element.includes('**')) {
          const boldParts = element.split(/\*\*(.*?)\*\*/g)
          return (
            <span key={idx} className="block">
              {boldParts.map((part, i) => 
                i % 2 === 1 ? (
                  <strong key={i} className="font-bold text-foreground/90">{highlightText(part, search)}</strong>
                ) : (
                  highlightText(part, search)
                )
              )}
            </span>
          )
        }

        return (
          <span key={idx} className="block truncate">
            {highlightText(trimmed, search)}
          </span>
        )
      })}
    </div>
  )
}

export default function NoteCard({ note, onClick, search = '', view = 'grid' }) {
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
            {highlightText(note.title, search)}
          </h3>

          {/* Preview Markdown & Highlights */}
          {renderMarkdownPreview(note.content, search)}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4">
            <span className={cn(
              'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border',
              subjectColor.bg, subjectColor.text, subjectColor.border,
            )}>
              <Tag className="h-2.5 w-2.5" />
              {note.subject}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
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
          <div className="flex-1 min-w-0 text-left">
            <h3 className="text-sm font-semibold truncate group-hover:text-brand-400 transition-colors">
              {highlightText(note.title, search)}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {truncate(note.content, 80)}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', subjectColor.bg, subjectColor.text, subjectColor.border)}>
              {note.subject}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium hidden sm:block">{timeAgo(note.updatedAt)}</span>
          </div>
        </>
      )}
    </motion.div>
  )
}
