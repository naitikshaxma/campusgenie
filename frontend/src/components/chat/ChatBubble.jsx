import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ChatBubble renders a single message in the chat UI.
 * @param {Object} props
 * @param {'user'|'ai'} props.role
 * @param {string} props.content
 * @param {string} props.timestamp
 */
export default function ChatBubble({ role, content, timestamp }) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
        isUser
          ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
          : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white',
      )}>
        {isUser ? 'You' : <GraduationCap className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div className={cn('flex flex-col max-w-[80%] gap-1', isUser && 'items-end')}>
        <div className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-brand-600 text-white rounded-tr-sm'
            : 'bg-card border border-border text-foreground rounded-tl-sm',
        )}>
          {/* Render content with basic markdown-like formatting */}
          <MessageContent content={content} isUser={isUser} />
        </div>
        <span className="text-[10px] text-muted-foreground px-1">{timestamp}</span>
      </div>
    </motion.div>
  )
}

function MessageContent({ content, isUser }) {
  // Simple inline code rendering
  const parts = content.split(/(`[^`]+`)/g)
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('`') && part.endsWith('`') ? (
          <code key={i} className={cn(
            'font-mono text-xs px-1.5 py-0.5 rounded',
            isUser ? 'bg-white/20' : 'bg-muted',
          )}>
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  )
}

/* ─── Typing indicator ───────────────────────────────────── */
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex gap-3"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
        <GraduationCap className="h-4 w-4 text-white" />
      </div>
      <div className="flex items-center gap-1 bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-brand-400"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  )
}
