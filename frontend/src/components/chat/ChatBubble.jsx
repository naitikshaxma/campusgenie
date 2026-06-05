import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

function parseInlineStyles(text, isUser) {
  if (!text) return ''
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-foreground">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className={cn(
          'font-mono text-xs px-1.5 py-0.5 rounded border border-border/40 font-semibold',
          isUser ? 'bg-white/20 text-white' : 'bg-secondary text-brand-300'
        )}>
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

function MarkdownRenderer({ content, isUser }) {
  if (!content) return null
  
  const lines = content.split('\n')
  let inCodeBlock = false
  let codeBlockLines = []
  
  const elements = []
  
  lines.forEach((line, idx) => {
    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false
        const codeContent = codeBlockLines.join('\n')
        codeBlockLines = []
        elements.push(
          <pre key={`code-${idx}`} className="bg-secondary/50 border border-border/60 p-3 rounded-lg overflow-x-auto text-[11px] font-mono my-2 text-brand-300">
            <code>{codeContent}</code>
          </pre>
        )
      } else {
        inCodeBlock = true
      }
      return
    }

    if (inCodeBlock) {
      codeBlockLines.push(line)
      return
    }

    // Headings
    if (line.trim().startsWith('###')) {
      elements.push(
        <h4 key={idx} className="text-xs font-bold text-foreground mt-3 mb-1 uppercase tracking-wider">
          {parseInlineStyles(line.replace('###', '').trim(), isUser)}
        </h4>
      )
      return
    }
    if (line.trim().startsWith('##')) {
      elements.push(
        <h3 key={idx} className="text-sm font-extrabold text-foreground mt-4 mb-1.5 border-b border-border/30 pb-0.5">
          {parseInlineStyles(line.replace('##', '').trim(), isUser)}
        </h3>
      )
      return
    }
    if (line.trim().startsWith('#')) {
      elements.push(
        <h2 key={idx} className="text-base font-black text-foreground mt-5 mb-2">
          {parseInlineStyles(line.replace('#', '').trim(), isUser)}
        </h2>
      )
      return
    }

    // List Items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <div key={idx} className="flex items-start gap-2 ml-2 my-1 text-sm leading-relaxed">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0 mt-2" />
          <span>{parseInlineStyles(line.trim().substring(2), isUser)}</span>
        </div>
      )
      return
    }

    // Paragraph
    elements.push(
      <p key={idx} className="text-sm leading-relaxed min-h-[1rem]">
        {parseInlineStyles(line, isUser)}
      </p>
    )
  })

  return <div className="space-y-1.5 text-left">{elements}</div>
}

function StreamText({ text, isUser, onComplete }) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    const words = text.split(' ')
    let currentIdx = 0
    let currentText = ''
    
    // Quick burst interval
    const timer = setInterval(() => {
      if (currentIdx < words.length) {
        currentText += (currentIdx === 0 ? '' : ' ') + words[currentIdx]
        setDisplayedText(currentText)
        currentIdx++
      } else {
        clearInterval(timer)
        if (onComplete) onComplete()
      }
    }, 35)

    return () => clearInterval(timer)
  }, [text])

  return <MarkdownRenderer content={displayedText} isUser={isUser} />
}

export default function ChatBubble({ role, content, timestamp }) {
  const isUser = role === 'user'
  const [isDoneStreaming, setIsDoneStreaming] = useState(isUser)

  // Trigger streaming animation for AI messages when they mount and are brand new
  const shouldStream = !isUser && !isDoneStreaming

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow-sm',
        isUser
          ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
          : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white',
      )}>
        {isUser ? 'You' : <GraduationCap className="h-4 w-4" />}
      </div>

      {/* Bubble wrapper */}
      <div className={cn('flex flex-col max-w-[80%] gap-1', isUser && 'items-end')}>
        <div className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed border',
          isUser
            ? 'bg-brand-600 text-white rounded-tr-none border-brand-500'
            : 'bg-card border-border/60 text-foreground rounded-tl-none shadow-sm',
        )}>
          {shouldStream ? (
            <StreamText text={content} isUser={isUser} onComplete={() => setIsDoneStreaming(true)} />
          ) : (
            <MarkdownRenderer content={content} isUser={isUser} />
          )}
        </div>
        <span className="text-[9px] font-semibold text-muted-foreground px-1">{timestamp}</span>
      </div>
    </motion.div>
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-sm">
        <GraduationCap className="h-4 w-4 text-white" />
      </div>
      <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-2xl rounded-tl-none px-4.5 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-brand-400"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  )
}
