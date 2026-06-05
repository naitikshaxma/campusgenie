import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, LayoutGrid, List, FileText } from 'lucide-react'
import NoteCard from '@/components/notes/NoteCard'
import NoteEditor from '@/components/notes/NoteEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useNotes } from '@/hooks/useNotes'
import { CardGridSkeleton } from '@/components/common/Skeleton'
import EmptyState from '@/components/common/EmptyState'

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'CS', 'Biology']

export default function Notes() {
  const [search, setSearch] = useState('')
  const [activeSubj, setActiveSubj] = useState('All')
  const [view, setView] = useState('grid')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editNote, setEditNote] = useState(null)

  const { notes, isLoading, add, update, remove } = useNotes(activeSubj)

  /* Filtered notes by search query */
  const filtered = useMemo(() => {
    return notes.filter((n) => {
      return (
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [notes, search])

  const handleSave = async (noteData) => {
    if (editNote) {
      await update(editNote.id, {
        title: noteData.title,
        content: noteData.content,
        subject: noteData.subject,
      })
    } else {
      await add({
        title: noteData.title,
        content: noteData.content,
        subject: noteData.subject,
      })
    }
    setEditorOpen(false)
    setEditNote(null)
  }

  const openNew = () => {
    setEditNote(null)
    setEditorOpen(true)
  }

  const openEdit = (note) => {
    setEditNote(note)
    setEditorOpen(true)
  }

  return (
    <div className="space-y-5 pb-8">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-lg border border-border p-1 gap-1">
          <button
            onClick={() => setView('grid')}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
              view === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
              view === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>

        <Button variant="gradient" onClick={openNew}>
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* ── Subject filter tabs ──────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {SUBJECTS.map((subj) => (
          <button
            key={subj}
            onClick={() => setActiveSubj(subj)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-all duration-200 font-medium',
              activeSubj === subj
                ? 'gradient-bg-primary text-white border-transparent shadow-md'
                : 'border-border text-muted-foreground hover:border-brand-500/40 hover:text-foreground'
            )}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* ── Notes count / loading indicator ──────────────────── */}
      {!isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>
            {filtered.length} note{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* ── Notes content ───────────────────────────────────── */}
      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search ? 'No notes found' : 'No notes created'}
          description={
            search
              ? 'Try searching for something else.'
              : 'Create your first smart note to kickstart your deep focus study sessions!'
          }
          action={{
            label: 'Create note',
            icon: Plus,
            onClick: openNew,
          }}
        />
      ) : (
        <motion.div
          layout
          className={cn(
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          )}
        >
          <AnimatePresence>
            {filtered.map((note, i) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <NoteCard note={note} view={view} onClick={() => openEdit(note)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Note editor ─────────────────────────────────────── */}
      <AnimatePresence>
        {editorOpen && (
          <NoteEditor
            note={editNote}
            onSave={handleSave}
            onClose={() => {
              setEditorOpen(false)
              setEditNote(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

