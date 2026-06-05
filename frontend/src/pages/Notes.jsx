import { useState, useMemo, useEffect } from 'react'
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
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeSubj, setActiveSubj] = useState('All')
  const [view, setView] = useState('grid')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editNote, setEditNote] = useState(null)

  const { notes, isLoading, add, update, remove } = useNotes(activeSubj)

  // Debouncing Notes Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 250)
    return () => clearTimeout(timer)
  }, [search])

  /* Filtered notes by search query */
  const filtered = useMemo(() => {
    return notes.filter((n) => {
      return (
        n.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        n.content.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    })
  }, [notes, debouncedSearch])

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
            className="pl-9 bg-secondary/20 border-border/50 focus:border-brand-500/50"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-lg border border-border/60 p-1 gap-1 bg-card/45 backdrop-blur-sm">
          <button
            onClick={() => setView('grid')}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
              view === 'grid'
                ? 'bg-brand-500 text-white shadow-sm'
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
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>

        <Button variant="gradient" onClick={openNew} className="hidden md:flex">
          <Plus className="h-4 w-4 mr-1.5" />
          New Note
        </Button>
      </div>

      {/* ── Subject filter tabs ──────────────────────────────── */}
      <div className="flex gap-2 flex-wrap bg-card/45 p-2 rounded-xl border border-border/50 backdrop-blur-md">
        {SUBJECTS.map((subj) => (
          <button
            key={subj}
            onClick={() => setActiveSubj(subj)}
            className={cn(
              'text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 font-semibold',
              activeSubj === subj
                ? 'gradient-bg-primary text-white border-transparent shadow-md'
                : 'border-border/60 text-muted-foreground hover:border-brand-500/40 hover:text-foreground hover:bg-secondary/35'
            )}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* ── Notes count / loading indicator ──────────────────── */}
      {!isLoading && (
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground px-1">
          <FileText className="h-4 w-4" />
          <span>
            {filtered.length} note{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}

      {/* ── Notes content ───────────────────────────────────── */}
      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search ? 'No notes found' : 'No notes yet'}
          description={
            search
              ? 'Try searching for something else.'
              : 'Create a note or scan a lecture to kickstart your deep focus study sessions.'
          }
          action={{
            label: search ? 'Clear Search' : 'Create note',
            icon: search ? null : Plus,
            onClick: search ? () => setSearch('') : openNew,
            variant: search ? 'outline' : 'default'
          }}
        />
      ) : (
        <motion.div
          layout
          className={cn(
            view === 'grid'
              ? 'columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 [column-fill:_balance]'
              : 'flex flex-col gap-3'
          )}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((note, i) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className={cn(view === 'grid' && 'break-inside-avoid mb-4')}
              >
                <NoteCard note={note} search={search} view={view} onClick={() => openEdit(note)} />
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

      {/* ── Mobile Floating Action Button (FAB) ── */}
      <button
        onClick={openNew}
        className="md:hidden fixed bottom-24 right-6 h-14 w-14 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(139,92,246,0.5)] z-40 active:scale-95 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}

