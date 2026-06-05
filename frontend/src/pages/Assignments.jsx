import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { Plus, Filter, LayoutGrid, Camera, ClipboardList } from 'lucide-react'
import { useAssignments } from '@/hooks/useAssignments'
import AssignmentCard from '@/components/assignments/AssignmentCard'
import AssignmentModal from '@/components/assignments/AssignmentModal'
import { KanbanSkeleton } from '@/components/common/Skeleton'
import EmptyState from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const COLUMNS = [
  { id: 'todo',       label: 'To Do',       color: 'border-t-slate-400',   dot: 'bg-slate-400' },
  { id: 'inprogress', label: 'In Progress',  color: 'border-t-amber-400',   dot: 'bg-amber-400' },
  { id: 'done',       label: 'Done',         color: 'border-t-emerald-400', dot: 'bg-emerald-400' },
]

export default function Assignments() {
  const navigate = useNavigate()
  const { assignments, isLoading, add, update, remove, move } = useAssignments()

  const [modalOpen, setModalOpen]   = useState(false)
  const [editItem,  setEditItem]    = useState(null)
  const [activeId,  setActiveId]    = useState(null)
  const [search,    setSearch]      = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const filtered = useMemo(() => {
    return assignments.filter(
      (a) =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.subject?.toLowerCase().includes(search.toLowerCase())
    )
  }, [assignments, search])
  const getColumn = (status) => filtered.filter((a) => a.status === status)

  const handleDragStart = ({ active }) => setActiveId(active.id)
  const handleDragEnd   = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return
    const activeAssign = assignments.find((a) => a.id === active.id)
    const overColumn   = COLUMNS.find((c) => c.id === over.id)
    const overAssign   = assignments.find((a) => a.id === over.id)
    if (!activeAssign) return
    if (overColumn)  { move(active.id, overColumn.id); return }
    if (overAssign)  { move(active.id, overAssign.status) }
  }

  const handleSave = (data) => {
    if (editItem?.id && !editItem.id.startsWith('new_')) {
      update(editItem.id, data)
    } else {
      add({ ...data, status: editItem?.status || 'todo' })
    }
    setEditItem(null)
    setModalOpen(false)
  }

  const draggedItem = assignments.find((a) => a.id === activeId)

  return (
    <div className="space-y-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filter assignments…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" onClick={() => navigate('/agent')} className="border-brand-500/30 text-brand-400 hover:bg-brand-500/10">
          <Camera className="h-4 w-4" />
          Capture
        </Button>
        <Button variant="gradient" onClick={() => { setEditItem({ id: `new_${Date.now()}` }); setModalOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Assignment
        </Button>
      </div>

      {/* Column stats */}
      {!isLoading && (
        <div className="flex gap-4 shrink-0">
          {COLUMNS.map(({ id, label, dot }) => {
            const count = assignments.filter((a) => a.status === id).length
            return (
              <div key={id} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={cn('h-2 w-2 rounded-full', dot)} />
                <span className="font-medium">{label}</span>
                <span className="text-xs bg-secondary px-1.5 py-0.5 rounded-full">{count}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Board */}
      {isLoading ? (
        <KanbanSkeleton />
      ) : assignments.length === 0 && !search ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Capture a WhatsApp screenshot or add manually to get started."
          action={{ label: 'Capture with AI', onClick: () => navigate('/agent'), icon: Camera }}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
            {COLUMNS.map(({ id, label, color, dot }) => {
              const colItems = getColumn(id)
              return (
                <div key={id} className={cn('flex flex-col rounded-xl border-t-2 bg-surface-100/50 dark:bg-surface-200/30 overflow-hidden', color)}>
                  <div className="flex items-center justify-between px-4 py-3 bg-surface-100/80 dark:bg-surface-200/50 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full', dot)} />
                      <h3 className="text-sm font-semibold">{label}</h3>
                      <span className="text-xs text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded-full border border-border/40">
                        {colItems.length}
                      </span>
                    </div>
                    <button
                      onClick={() => { setEditItem({ id: `new_${Date.now()}`, status: id }); setModalOpen(true) }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    <SortableContext items={colItems.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                      <AnimatePresence>
                        {colItems.map((assignment) => (
                          <AssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            onClick={() => { setEditItem(assignment); setModalOpen(true) }}
                          />
                        ))}
                      </AnimatePresence>
                      {colItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-20 text-center">
                          <LayoutGrid className="h-6 w-6 text-muted-foreground/20 mb-1" />
                          <p className="text-xs text-muted-foreground/50">Drop here</p>
                        </div>
                      )}
                    </SortableContext>
                  </div>
                </div>
              )
            })}
          </div>

          <DragOverlay>
            {draggedItem && (
              <div className="opacity-80 rotate-1 scale-105">
                <AssignmentCard assignment={draggedItem} onClick={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <AssignmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        initial={editItem}
      />
    </div>
  )
}
