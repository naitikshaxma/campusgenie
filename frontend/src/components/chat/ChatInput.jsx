import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, Paperclip, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUGGESTED_PROMPTS = [
  'Summarize my notes on Quantum Mechanics',
  'Create a study schedule for finals week',
  'Explain the concept of derivatives simply',
  'Help me outline my research paper',
]

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e)
    }
  }

  const handleInput = (e) => {
    setValue(e.target.value)
    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  return (
    <div className="space-y-3">
      {/* Suggested prompts */}
      <div className="flex gap-2 flex-wrap">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => setValue(prompt)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border/60 bg-card hover:border-brand-500/40 hover:bg-brand-500/5 text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <Sparkles className="h-3 w-3 text-brand-400" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit}>
        <div className={cn(
          'flex items-end gap-2 rounded-2xl border border-border/60 bg-card p-2',
          'focus-within:border-brand-500/40 focus-within:ring-1 focus-within:ring-brand-500/20',
          'transition-all duration-200 shadow-sm',
        )}>
          {/* Attachment */}
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask CampusGenie anything… (⏎ to send)"
            disabled={disabled}
            className={cn(
              'flex-1 resize-none bg-transparent text-sm outline-none',
              'placeholder:text-muted-foreground/70',
              'min-h-[36px] max-h-[160px] py-2 leading-relaxed',
              'disabled:opacity-50',
            )}
          />

          {/* Voice */}
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Mic className="h-4 w-4" />
          </button>

          {/* Send */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.9 }}
            disabled={!value.trim() || disabled}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
              value.trim() && !disabled
                ? 'gradient-bg-primary text-white shadow-md hover:opacity-90'
                : 'bg-secondary text-muted-foreground',
            )}
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </form>
      <p className="text-center text-[10px] text-muted-foreground/60">
        CampusGenie may produce inaccurate info. Double-check important facts.
      </p>
    </div>
  )
}
