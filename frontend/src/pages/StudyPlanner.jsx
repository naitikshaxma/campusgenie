import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Plus, Flame, Clock, BookOpen, X, Sparkles, Loader2
} from 'lucide-react'
import WeekView from '@/components/planner/WeekView'
import TaskItem from '@/components/planner/TaskItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn, getSubjectColor } from '@/lib/utils'
import { usePlanner } from '@/hooks/usePlanner'
import { PlannerSkeleton } from '@/components/common/Skeleton'
import EmptyState from '@/components/common/EmptyState'

/* ─── Helpers ────────────────────────────────────────────── */
function getWeekDates(baseDate) {
  const start = new Date(baseDate)
  start.setDate(start.getDate() - start.getDay()) // Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'CS', 'Biology']
const DURATIONS = [0.5, 1, 1.5, 2, 2.5, 3, 4]

export default function StudyPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [form, setForm] = useState({ subject: 'CS', duration: 1, note: '' })
  const [aiTopic, setAiTopic] = useState('')

  const {
    sessions,
    streak,
    isLoading,
    isGenerating,
    add,
    remove,
    generatePlan
  } = usePlanner()

  const weekDates = getWeekDates(currentDate)

  const prevWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    setCurrentDate(d)
  }
  const nextWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    setCurrentDate(d)
  }
  const goToday = () => setCurrentDate(new Date())

  const handleSlotClick = (date, hour) => {
    const slotDate = new Date(date)
    slotDate.setHours(hour, 0, 0, 0)
    setSelectedSlot(slotDate)
    setModalOpen(true)
  }

  const handleAddSession = async () => {
    if (!selectedSlot) return
    await add({
      subject: form.subject,
      duration: form.duration,
      date: selectedSlot.toISOString(),
      note: form.note,
    })
    setModalOpen(false)
    setForm({ subject: 'CS', duration: 1, note: '' })
  }

  const handleGenerateAiPlan = async () => {
    if (!aiTopic.trim()) return
    await generatePlan({ topic: aiTopic })
    setAiModalOpen(false)
    setAiTopic('')
  }

  /* Stats */
  const today = new Date()
  const todaySessions = sessions.filter((s) => {
    const sd = new Date(s.date)
    return sd.toDateString() === today.toDateString()
  })
  const weekTotalHours = sessions
    .filter((s) => {
      const sd = new Date(s.date)
      return weekDates.some((wd) => wd.toDateString() === sd.toDateString())
    })
    .reduce((acc, s) => acc + s.duration, 0)



  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const weekLabel = `Week of ${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header + Stats ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">{monthLabel}</h2>
          <p className="text-sm text-muted-foreground">{weekLabel}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak badge */}
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-2">
            <Flame className="h-4 w-4 text-rose-400" />
            <span className="text-sm font-bold text-rose-400">{streak} day streak</span>
          </div>

          {/* Week hours */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-brand-500/10 border border-brand-500/20 px-3 py-2">
            <Clock className="h-4 w-4 text-brand-400" />
            <span className="text-sm font-bold text-brand-400">{weekTotalHours}h this week</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToday} className="text-xs">
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" onClick={() => setAiModalOpen(true)} className="border-brand-500/30 text-brand-400 hover:bg-brand-500/5">
            <Sparkles className="h-4 w-4 mr-1 text-brand-400" />
            AI Auto-Plan
          </Button>

          <Button
            variant="gradient"
            onClick={() => {
              setSelectedSlot(new Date())
              setModalOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Add Session
          </Button>
        </div>
      </div>

      {/* ── Week calendar ───────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4 overflow-hidden relative">
        {isGenerating && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
            <span className="text-sm font-semibold text-brand-400">CampusGenie is building your customized study plan...</span>
          </div>
        )}
        {isLoading ? (
          <PlannerSkeleton />
        ) : (
          <WeekView
            weekDates={weekDates}
            sessions={sessions}
            onSlotClick={handleSlotClick}
            onSessionClick={(s) => {
              setSelectedSlot(new Date(s.date))
              setForm({ subject: s.subject, duration: s.duration, note: s.note || '' })
              setModalOpen(true)
            }}
          />
        )}
      </div>

      {/* ── Today's sessions list ───────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-brand-400" />
          Today's Study Sessions
          {!isLoading && (
            <span className="text-xs text-muted-foreground font-normal ml-1">
              {todaySessions.reduce((a, s) => a + s.duration, 0)}h planned
            </span>
          )}
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="h-20 bg-muted/20 animate-pulse rounded-xl" />
            <div className="h-20 bg-muted/20 animate-pulse rounded-xl" />
            <div className="h-20 bg-muted/20 animate-pulse rounded-xl" />
          </div>
        ) : todaySessions.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No study sessions planned for today"
            description="Use AI Auto-Plan to dynamically block calendar slots based on your upcoming assignments, or manually add a study block."
            action={{
              label: 'Add block',
              icon: Plus,
              onClick: () => {
                setSelectedSlot(new Date())
                setModalOpen(true)
              },
            }}
            size="sm"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {todaySessions.map((session) => (
                <TaskItem key={session.id} session={session} onDelete={remove} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Subject color legend ────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((subj) => {
          const sc = getSubjectColor(subj)
          return (
            <div
              key={subj}
              className={cn(
                'flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border',
                sc.bg,
                sc.text,
                sc.border
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', sc.dot)} />
              {subj}
            </div>
          )
        })}
      </div>

      {/* ── Add Session Modal ───────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-400" />
              Add Study Session
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Date/time display */}
            {selectedSlot && (
              <div className="rounded-lg bg-brand-500/10 border border-brand-500/20 px-3 py-2 text-sm text-brand-400 font-medium">
                📅 {selectedSlot.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                {' · '}
                {selectedSlot.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
            )}

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Duration</label>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm((p) => ({ ...p, duration: d }))}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                      form.duration === d
                        ? 'gradient-bg-primary text-white border-transparent shadow-md'
                        : 'border-border text-muted-foreground hover:border-brand-500/40'
                    )}
                  >
                    {d}h
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Note (optional)</label>
              <Input
                placeholder="e.g. Chapter 5 review"
                value={form.note}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleAddSession}>
              Add Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AI Auto-Plan Modal ───────────────────────────────── */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-400" />
              AI Study Auto-Plan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              CampusGenie will generate dynamic study blocks matching your topics, prioritizing upcoming assignments and balanced breaks.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">What topics or exams are you preparing for?</label>
              <Input
                placeholder="e.g. Quantum waves, Linear algebra, React state"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAiModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleGenerateAiPlan} disabled={!aiTopic.trim()}>
              Generate Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

