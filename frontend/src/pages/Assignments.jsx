import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners, useDroppable
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { Plus, Filter, LayoutGrid, Camera, ClipboardList, ArrowUpDown, CalendarClock, AlertCircle, Clock, Sparkles, CheckCircle2, X } from 'lucide-react'
import { useAssignments } from '@/hooks/useAssignments'
import AssignmentCard from '@/components/assignments/AssignmentCard'
import AssignmentModal from '@/components/assignments/AssignmentModal'
import { KanbanSkeleton } from '@/components/common/Skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const COLUMNS = [
  { id: 'todo',       label: 'To Do',       color: 'border-t-slate-400/80 shadow-[0_0_15px_rgba(148,163,184,0.03)]',   dot: 'bg-slate-400 border-slate-500/30' },
  { id: 'inprogress', label: 'In Progress',  color: 'border-t-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.03)]',   dot: 'bg-amber-400 border-amber-500/30' },
  { id: 'done',       label: 'Done',         color: 'border-t-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.03)]', dot: 'bg-emerald-400 border-emerald-500/30' },
]

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

function DroppableColumn({ 
  id, 
  label, 
  color, 
  dot, 
  colItems, 
  onAdd, 
  onClickCard, 
  onEditCard, 
  onDeleteCard, 
  onCompleteCard, 
  onDuplicateCard, 
  activeId 
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl border border-border/40 border-t-4 bg-card/25 dark:bg-surface-200/10 overflow-hidden transition-all duration-300 relative',
        color,
        isOver && 'border-brand-500/50 bg-brand-500/5 shadow-[0_0_25px_rgba(139,92,246,0.08)] scale-[1.005]',
        activeId && !isOver && 'border-dashed border-border/80'
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-card/85 dark:bg-surface-200/30 border-b border-border/30 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className={cn('h-2.5 w-2.5 rounded-full border', dot)} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80">{label}</h3>
          <span className="text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full border border-border/40 font-mono font-bold">
            {colItems.length}
          </span>
        </div>
        <button
          onClick={onAdd}
          className="text-muted-foreground hover:text-foreground hover:bg-secondary p-1 rounded-md transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[250px]">
        <SortableContext items={colItems.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {colItems.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onClick={() => onClickCard(assignment)}
                  onEdit={onEditCard}
                  onDelete={onDeleteCard}
                  onComplete={onCompleteCard}
                  onDuplicate={onDuplicateCard}
                />
              ))}
            </AnimatePresence>
          </motion.div>
          {colItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 border border-dashed border-border/20 rounded-xl bg-secondary/5 transition-all">
              <LayoutGrid className="h-8 w-8 text-muted-foreground/15 mb-2 animate-pulse" />
              <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider">Drop assignments here</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}

export default function Assignments() {
  const navigate = useNavigate()
  const { assignments, isLoading, refetch, add, update, remove, move } = useAssignments()

  const [modalOpen, setModalOpen]     = useState(false)
  const [editItem,  setEditItem]      = useState(null)
  const [activeId,  setActiveId]      = useState(null)
  const [search,    setSearch]        = useState('')
  const [sortBy,    setSortBy]        = useState('dueDate') // 'dueDate' | 'priority'
  const [filterType, setFilterType]   = useState('all')     // 'all' | 'today' | 'overdue' | 'high' | 'aiGenerated' | 'completed'

  // Confirm delete and Toast states
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toasts, setToasts] = useState([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }

  const filtered = useMemo(() => {
    let list = assignments.filter(
      (a) =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.subject?.toLowerCase().includes(search.toLowerCase())
    )

    // Quick filters
    if (filterType === 'today') {
      const todayStr = new Date().toDateString()
      list = list.filter(a => new Date(a.dueDate).toDateString() === todayStr)
    } else if (filterType === 'overdue') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      list = list.filter(a => new Date(a.dueDate) < today && a.status !== 'done')
    } else if (filterType === 'high') {
      list = list.filter(a => a.priority === 'high')
    } else if (filterType === 'aiGenerated') {
      list = list.filter(a => a.aiGenerated)
    } else if (filterType === 'completed') {
      list = list.filter(a => a.status === 'done')
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate)
      } else if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 }
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
      }
      return 0
    })

    return list
  }, [assignments, search, filterType, sortBy])

  const getColumn = (status) => filtered.filter((a) => a.status === status)

  const handleDragStart = ({ active }) => setActiveId(active.id)
  const handleDragEnd   = ({ active, over }) => {
    setActiveId(null)
    if (!over) return
    const activeAssign = assignments.find((a) => a.id === active.id)
    if (!activeAssign) return

    // If dropped over a column id
    const overColumn = COLUMNS.find((c) => c.id === over.id)
    if (overColumn) {
      if (activeAssign.status !== overColumn.id) {
        move(active.id, overColumn.id)
        addToast(`Moved to ${overColumn.label}`)
      }
      return
    }

    // If dropped over another assignment card
    const overAssign = assignments.find((a) => a.id === over.id)
    if (overAssign && activeAssign.status !== overAssign.status) {
      move(active.id, overAssign.status)
      const colLabel = COLUMNS.find(c => c.id === overAssign.status)?.label || overAssign.status
      addToast(`Moved to ${colLabel}`)
    }
  }

  const handleSave = async (data) => {
    try {
      if (editItem?.id && !editItem.id.startsWith('new_')) {
        await update(editItem.id, data)
        addToast('Assignment updated successfully!')
      } else {
        await add({ ...data, status: editItem?.status || 'todo' })
        addToast('Assignment created successfully!')
      }
    } catch (err) {
      addToast('Failed to save assignment details.', 'error')
    }
    setEditItem(null)
    setModalOpen(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const targetId = deleteTarget.id
    const targetTitle = deleteTarget.title
    setDeleteTarget(null)
    try {
      addToast(`Deleting "${targetTitle}"...`, 'info')
      await remove(targetId)
      addToast('Assignment deleted', 'success')
    } catch (err) {
      addToast('Failed to delete assignment.', 'error')
    }
  }

  const handleDuplicate = async (assignment) => {
    try {
      addToast('Duplicating assignment...', 'info')
      const cloned = {
        title: `${assignment.title} (Copy)`,
        subject: assignment.subject,
        description: assignment.description,
        dueDate: assignment.dueDate,
        priority: assignment.priority,
        status: assignment.status,
        aiGenerated: assignment.aiGenerated,
        estimatedStudyHours: assignment.estimatedStudyHours
      }
      await add(cloned)
      addToast('Assignment duplicated successfully!')
    } catch (err) {
      addToast('Failed to duplicate assignment.', 'error')
    }
  }

  const draggedItem = assignments.find((a) => a.id === activeId)

  return (
    <div className="space-y-5 h-full flex flex-col relative">
      {/* ── Toast notifications overlay ─────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={cn(
                'pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl border backdrop-blur-xl',
                t.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-emerald-500/5' 
                  : t.type === 'info'
                  ? 'bg-brand-500/10 border-brand-500/35 text-brand-400 shadow-brand-500/5'
                  : 'bg-rose-500/10 border-rose-500/35 text-rose-400 shadow-rose-500/5'
              )}
            >
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Toolbar / Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card/25 p-4 rounded-xl border border-border/40 backdrop-blur-md shrink-0">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/20 border-border/50 focus:border-brand-500/50"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-1 bg-secondary/20 p-1 rounded-lg border border-border/40">
            {[
              { id: 'all', label: 'All' },
              { id: 'today', label: 'Today', icon: CalendarClock },
              { id: 'overdue', label: 'Overdue', icon: AlertCircle },
              { id: 'high', label: 'High', icon: Clock },
              { id: 'aiGenerated', label: 'AI Scans', icon: Sparkles },
              { id: 'completed', label: 'Completed', icon: CheckCircle2 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setFilterType(id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200',
                  filterType === id
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort & Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort selector */}
          <div className="flex items-center gap-2 bg-secondary/20 p-1 rounded-lg border border-border/40 text-xs">
            <span className="text-muted-foreground pl-2 font-medium flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" /> Sort by:
            </span>
            <button
              onClick={() => setSortBy('dueDate')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors font-semibold',
                sortBy === 'dueDate' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Due Date
            </button>
            <button
              onClick={() => setSortBy('priority')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors font-semibold',
                sortBy === 'priority' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Priority
            </button>
          </div>

          {/* Navigation/Create actions */}
          <Button
            variant="outline"
            onClick={() => navigate('/agent')}
            className="border-brand-500/30 text-brand-400 hover:bg-brand-500/10 h-9 shrink-0 font-semibold"
          >
            <Camera className="h-4 w-4 mr-1.5 animate-pulse" />
            AI Scanner
          </Button>
          <Button
            variant="gradient"
            onClick={() => { setEditItem({ id: `new_${Date.now()}` }); setModalOpen(true) }}
            className="h-9 shadow-lg shadow-brand-500/15 shrink-0 font-semibold"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add Assignment
          </Button>
        </div>
      </div>

      {/* Column Stats Summary Row */}
      {!isLoading && (
        <div className="flex flex-wrap gap-4 px-1 shrink-0">
          {COLUMNS.map(({ id, label, dot }) => {
            const count = assignments.filter((a) => a.status === id).length
            return (
              <div key={id} className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground bg-card/20 px-3 py-1.5 rounded-full border border-border/40">
                <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
                <span className="uppercase tracking-wider">{label}</span>
                <span className="font-mono bg-secondary/80 px-1.5 py-0.5 rounded-full text-foreground/85">{count}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Kanban Board Grid */}
      {isLoading ? (
        <KanbanSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <EmptyState
            icon={Camera}
            title={search || filterType !== 'all' ? 'No assignments match your filters' : 'No assignments yet'}
            description={search || filterType !== 'all' ? "Try resetting your filters or searching for something else." : "💡 AI Advice: Scan a syllabus or assignment sheet and let AI extract all the details."}
            action={
              search || filterType !== 'all' 
                ? { label: 'Reset Filters', onClick: () => { setSearch(''); setFilterType('all') }, variant: 'outline' }
                : { label: 'Scan your first assignment', onClick: () => navigate('/agent'), icon: Camera }
            }
          />
        </div>
      ) : (
        <>
          {/* DESKTOP KANBAN */}
          <div className="hidden md:block flex-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex-1 grid grid-cols-3 gap-5 overflow-hidden">
                {COLUMNS.map(({ id, label, color, dot }) => {
                  const colItems = getColumn(id)
                  return (
                    <DroppableColumn
                      key={id}
                      id={id}
                      label={label}
                      color={color}
                      dot={dot}
                      colItems={colItems}
                      onAdd={() => { setEditItem({ id: `new_${Date.now()}`, status: id }); setModalOpen(true) }}
                      onClickCard={(assignment) => { setEditItem(assignment); setModalOpen(true) }}
                      onEditCard={(assignment) => { setEditItem(assignment); setModalOpen(true) }}
                      onDeleteCard={(assignment) => setDeleteTarget(assignment)}
                      onCompleteCard={(id) => {
                        move(id, 'done')
                        addToast('Assignment marked as complete!')
                      }}
                      onDuplicateCard={handleDuplicate}
                      activeId={activeId}
                    />
                  )
                })}
              </div>

              <DragOverlay>
                {draggedItem && (
                  <div className="opacity-90 rotate-2 scale-[1.02] shadow-2xl">
                    <AssignmentCard assignment={draggedItem} onClick={() => {}} />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>

          {/* MOBILE SMART LIST */}
          <div className="md:hidden flex-1 overflow-y-auto space-y-3 pb-20">
            <AnimatePresence mode="popLayout">
              {filtered.map(assignment => (
                <motion.div
                  key={assignment.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -50 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.5}
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 100) {
                      move(assignment.id, 'done')
                      addToast('Marked as complete!')
                    } else if (info.offset.x < -100) {
                      setDeleteTarget(assignment)
                    }
                  }}
                  className="relative touch-pan-y"
                >
                  <AssignmentCard 
                    assignment={assignment} 
                    onClick={() => { setEditItem(assignment); setModalOpen(true) }}
                    onEdit={(a) => { setEditItem(a); setModalOpen(true) }}
                    onDelete={(a) => setDeleteTarget(a)}
                    onComplete={(id) => move(id, 'done')}
                    onDuplicate={handleDuplicate}
                  />
                  {/* Swipe hint background */}
                  <div className="absolute inset-0 -z-10 flex items-center justify-between px-6 rounded-xl bg-secondary/30">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 opacity-50" />
                    <X className="h-6 w-6 text-rose-500 opacity-50" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* ── Edit/Add Assignment Modal ───────────────────────────── */}
      <AssignmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        initial={editItem}
      />

      {/* ── Delete Confirmation Dialog ──────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm border-rose-500/25 bg-card">
          <DialogHeader className="text-left">
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              Delete Assignment?
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-muted-foreground leading-relaxed text-left">
            Are you sure you want to permanently delete <strong className="text-foreground">"{deleteTarget?.title}"</strong>? This will remove it from your Kanban task board.
          </div>
          <DialogFooter className="gap-2 justify-end">
            <Button variant="ghost" className="h-8 text-xs font-semibold" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" className="h-8 text-xs font-semibold" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
