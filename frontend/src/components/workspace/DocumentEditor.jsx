import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Bold, Italic, List, Link2, Image, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * DocumentEditor — the primary deep-work writing surface in LaptopWorkspace.
 * Handles rich text with simple formatting controls.
 */
export default function DocumentEditor({ document, onSave, isSaving, className }) {
  const [title,   setTitle]   = useState(document?.title || '')
  const [content, setContent] = useState(document?.content || '')
  const [wordCount, setWordCount] = useState(0)
  const textareaRef = useRef(null)

  const handleContentChange = (e) => {
    const val = e.target.value
    setContent(val)
    setWordCount(val.trim().split(/\s+/).filter(Boolean).length)
  }

  const insertFormat = (before, after = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const sel   = content.slice(start, end)
    setContent(content.slice(0, start) + before + sel + after + content.slice(end))
  }

  const handleSave = () => {
    onSave?.({ title, content })
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border/60 bg-card/50 shrink-0">
        <ToolBtn onClick={() => insertFormat('**', '**')} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => insertFormat('*', '*')} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => insertFormat('\n- ')} title="List">
          <List className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => insertFormat('[', '](url)')} title="Link">
          <Link2 className="h-3.5 w-3.5" />
        </ToolBtn>
        <div className="h-4 w-px bg-border mx-1" />
        <span className="text-[10px] text-muted-foreground ml-auto">
          {wordCount} words
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isSaving}
          className="ml-2 h-7 text-xs"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document title…"
        className="px-8 pt-8 pb-2 text-3xl font-display font-black bg-transparent outline-none placeholder:text-muted-foreground/30 text-foreground border-none"
      />

      {/* Content */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing… Use **bold**, *italic*, or - for bullets"
        className={cn(
          'flex-1 resize-none bg-transparent px-8 py-4 text-[15px] leading-relaxed outline-none',
          'font-mono placeholder:text-muted-foreground/30 text-foreground/90',
          'overflow-y-auto',
        )}
      />
    </div>
  )
}

function ToolBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {children}
    </button>
  )
}
