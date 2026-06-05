import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Bold, Italic, List, Tag, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, getSubjectColor } from '@/lib/utils'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'CS', 'Biology']

export default function NoteEditor({ note, onSave, onClose }) {
  const [title,   setTitle]   = useState(note?.title   || '')
  const [content, setContent] = useState(note?.content || '')
  const [subject, setSubject] = useState(note?.subject || 'CS')
  const [saved,   setSaved]   = useState(false)

  const subjectColor = getSubjectColor(subject)

  // Auto-save indicator
  useEffect(() => {
    if (!title && !content) return
    const timer = setTimeout(() => {
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }, 1000)
    return () => clearTimeout(timer)
  }, [title, content])

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      id:        note?.id || String(Date.now()),
      title:     title.trim(),
      content,
      subject,
      updatedAt: new Date().toISOString(),
    })
    onClose()
  }

  const insertFormat = (before, after = '') => {
    const ta = document.getElementById('note-textarea')
    if (!ta) return
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const selected = content.slice(start, end)
    const newContent =
      content.slice(0, start) + before + selected + after + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      ta.focus()
      ta.selectionStart = start + before.length
      ta.selectionEnd   = start + before.length + selected.length
    }, 0)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1,    y: 0  }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className={cn('h-3 w-3 rounded-full', subjectColor.dot)} />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title…"
            className="flex-1 border-none bg-transparent text-base font-semibold shadow-none focus-visible:ring-0 px-0"
          />
          {saved && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-emerald-400 flex items-center gap-1"
            >
              <Save className="h-3 w-3" /> Saved
            </motion.span>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-border bg-muted/30">
          <ToolbarBtn onClick={() => insertFormat('**', '**')} title="Bold">
            <Bold className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => insertFormat('*', '*')} title="Italic">
            <Italic className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => insertFormat('\n- ')} title="Bullet list">
            <List className="h-3.5 w-3.5" />
          </ToolbarBtn>

          {/* Divider */}
          <div className="w-px h-4 bg-border mx-1" />

          {/* Subject selector */}
          <div className="flex items-center gap-1.5 ml-1">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs bg-transparent border-none outline-none text-muted-foreground cursor-pointer"
            >
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Content area */}
        <textarea
          id="note-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your notes… Use **bold**, *italic*, or - for bullets"
          className="flex-1 resize-none bg-transparent px-6 py-4 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 font-mono overflow-y-auto"
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {content.split(' ').filter(Boolean).length} words
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleSave} disabled={!title.trim()}>
              <Save className="h-3.5 w-3.5 mr-1" />
              Save note
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ToolbarBtn({ onClick, children, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {children}
    </button>
  )
}
