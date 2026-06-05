import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Plus, Flame, Clock, X, Sparkles, Loader2,
  Play, Pause, RotateCcw, Volume2, Maximize2, Check, Trash2, GraduationCap
} from 'lucide-react'
import WeekView from '@/components/planner/WeekView'
import ProductivityPanel from '@/components/planner/ProductivityPanel'
import AILoadingOverlay from '@/components/planner/AILoadingOverlay'
import AIReasoningModal from '@/components/planner/AIReasoningModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { usePlanner } from '@/hooks/usePlanner'
import { useAssignments } from '@/hooks/useAssignments'
import { PlannerSkeleton } from '@/components/common/Skeleton'

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

const SUBJECTS = ['CS', 'DBMS', 'Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'Biology']
const DURATIONS = [0.5, 1, 1.5, 2, 2.5, 3]

export default function StudyPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  
  // Cinematic AI UX States
  const [reasoningModalOpen, setReasoningModalOpen] = useState(false)
  const [aiReasoningText, setAiReasoningText] = useState('')
  const [pendingAiSessions, setPendingAiSessions] = useState([])
  
  // Selected time slot and editing states
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [editingSession, setEditingSession] = useState(null)
  const [form, setForm] = useState({ subject: 'CS', duration: 1, note: '', status: 'pending' })
  const [forceShowGrid, setForceShowGrid] = useState(false)

  // AI Auto-Plan preferences
  const [aiForm, setAiForm] = useState({
    topic: '',
    preferredFocus: 'morning',
    intensity: 'balanced',
    allowWeekends: false
  })

  // Pomodoro Focus Mode States
  const [focusMode, setFocusMode] = useState(false)
  const [timerDuration, setTimerDuration] = useState(1500) // 25 mins in seconds
  const [timeLeft, setTimeLeft] = useState(1500)
  const [timerRunning, setTimerRunning] = useState(false)
  const [focusSubject, setFocusSubject] = useState('CS')
  const [ambientSound, setAmbientSound] = useState('none')
  
  const timerRef = useRef(null)
  const audioRef = useRef(null)

  const {
    sessions: rawSessions,
    setSessions,
    streak,
    isLoading,
    isGenerating,
    add,
    update,
    remove,
    generatePlan
  } = usePlanner()

  const { assignments } = useAssignments()

  const sessions = Array.isArray(rawSessions) ? rawSessions : []
  const weekDates = getWeekDates(currentDate)

  // Reset force view when week changes
  useEffect(() => {
    setForceShowGrid(false)
  }, [currentDate])

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
    setEditingSession(null)
    setForm({ subject: 'CS', duration: 1, note: '', status: 'pending' })
    setModalOpen(true)
  }

  const handleSessionClick = (session) => {
    setSelectedSlot(new Date(session.date))
    setEditingSession(session)
    setForm({
      subject: session.subject || 'CS',
      duration: session.duration || 1,
      note: session.topic || session.note || '',
      status: session.status || 'pending'
    })
    setModalOpen(true)
  }

  const handleSaveSession = async () => {
    if (!selectedSlot) return
    const payload = {
      subject: form.subject,
      duration: form.duration,
      date: selectedSlot.toISOString(),
      note: form.note,
      topic: form.note,
      status: form.status
    }

    if (editingSession) {
      await update(editingSession.id || editingSession._id, payload)
    } else {
      await add(payload)
    }
    setModalOpen(false)
    setForm({ subject: 'CS', duration: 1, note: '', status: 'pending' })
  }

  const handleDeleteSession = async () => {
    if (editingSession) {
      await remove(editingSession.id || editingSession._id)
      setModalOpen(false)
    }
  }

  const handleToggleComplete = async (id, newStatus) => {
    await update(id, { status: newStatus })
  }

  const handleGenerateAiPlan = async () => {
    if (!aiForm.topic.trim()) return
    setAiModalOpen(false) // Close the prompt immediately to show full loading
    try {
      const plan = await generatePlan(aiForm)
      if (plan && plan.reasoning) {
        setAiReasoningText(plan.reasoning)
        setPendingAiSessions(plan.sessions || [])
        setReasoningModalOpen(true)
      } else if (plan && Array.isArray(plan.sessions)) {
        setPendingAiSessions(plan.sessions)
        setReasoningModalOpen(true)
      } else if (Array.isArray(plan)) {
        setPendingAiSessions(plan)
        setReasoningModalOpen(true)
      }
    } catch (err) {
      console.error(err)
    }

    setAiForm({
      topic: '',
      preferredFocus: 'morning',
      intensity: 'balanced',
      allowWeekends: false
    })
  }

  const handleConstructSchedule = () => {
    // Add staggered animation delay to the incoming sessions
    const sessionsWithDelay = pendingAiSessions.map((s, idx) => ({
      ...s,
      animDelay: idx * 0.15
    }))
    setSessions(prev => [...prev, ...sessionsWithDelay])
    setPendingAiSessions([])
  }

  // Focus Timer Logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false)
            add({
              subject: focusSubject,
              duration: Math.round((timerDuration / 3600) * 100) / 100 || 0.5,
              date: new Date().toISOString(),
              note: 'Completed Focus Pomodoro Block',
              topic: 'Completed Focus Pomodoro Block',
              status: 'completed'
            }).catch(() => {})
            
            console.log(`[StudyPlanner] Focus session complete for ${focusSubject}`)
            setFocusMode(false)
            return timerDuration
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerRunning, focusSubject, timerDuration])

  // Ambient sound controller
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    if (ambientSound !== 'none') {
      const urls = {
        rain: 'https://assets.mixkit.co/active_storage/sfx/2433/2433-84.wav',
        lofi: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        waves: 'https://assets.mixkit.co/active_storage/sfx/1187/1187-84.wav'
      }
      audioRef.current = new Audio(urls[ambientSound])
      audioRef.current.loop = true
      if (timerRunning) {
        audioRef.current.play().catch(() => console.log('Audio autoplay blocked'))
      }
    }
  }, [ambientSound])

  useEffect(() => {
    if (audioRef.current) {
      if (timerRunning && ambientSound !== 'none') {
        audioRef.current.play().catch(() => console.log('Audio play error'))
      } else {
        audioRef.current.pause()
      }
    }
  }, [timerRunning])

  const selectTimerType = (mins) => {
    setTimerRunning(false)
    setTimerDuration(mins * 60)
    setTimeLeft(mins * 60)
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Filter sessions specifically for the selected week
  const weekSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (!s?.date) return false
      const sd = new Date(s.date)
      return !isNaN(sd) && weekDates.some((wd) => wd.toDateString() === sd.toDateString())
    })
  }, [sessions, weekDates])

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const weekLabel = weekDates.length > 0
    ? `Week of ${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : ''

  const hasNoSessionsInSelectedWeek = weekSessions.length === 0 && !forceShowGrid

  return (
    <div className="space-y-6 pb-12 relative text-foreground">
      
      {/* ── CINEMATIC AI UX ───────────────────────────────────── */}
      <AILoadingOverlay isVisible={isGenerating} />
      
      <AIReasoningModal 
        open={reasoningModalOpen} 
        onOpenChange={setReasoningModalOpen} 
        reasoning={aiReasoningText} 
        onAccept={handleConstructSchedule}
      />

      {/* ── FOCUS MODE POMODORO OVERLAY ───────────────────────── */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-50 bg-[#070B14]/98 backdrop-blur-lg flex flex-col items-center justify-center p-6"
          >
            <button
              onClick={() => {
                setTimerRunning(false)
                setFocusMode(false)
              }}
              className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-bold text-brand-400">
                  <Flame className="h-4 w-4 text-brand-400 fill-brand-400 animate-pulse" />
                  Focus Study Block
                </span>
                <h2 className="text-xl font-bold tracking-tight">Focusing on {focusSubject}</h2>
                <p className="text-xs text-muted-foreground">Ambient music plays while timer is active</p>
              </div>

              {/* Countdown Circular Visualization */}
              <div className="relative flex items-center justify-center h-64 w-64 mx-auto">
                <svg className="w-full h-full transform -rotate-90 animate-pulse" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="stroke-muted/10"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="stroke-brand-500 transition-all duration-300"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (282.7 * timeLeft) / timerDuration}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl font-black font-mono tracking-tighter text-foreground">{formatTime(timeLeft)}</span>
                  <span className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest mt-1">
                    {timerRunning ? 'Session active' : 'Paused'}
                  </span>
                </div>
              </div>

              {/* Timer presets */}
              <div className="flex justify-center gap-2">
                {[
                  { label: 'Pomodoro', mins: 25 },
                  { label: 'Short Break', mins: 5 },
                  { label: 'Long Break', mins: 15 }
                ].map(({ label, mins }) => (
                  <button
                    key={label}
                    onClick={() => selectTimerType(mins)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer',
                      timerDuration === mins * 60
                        ? 'bg-brand-500 text-white border-transparent'
                        : 'border-border text-muted-foreground hover:bg-secondary/40'
                    )}
                  >
                    {label} ({mins}m)
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => {
                    setTimerRunning(false)
                    setTimeLeft(timerDuration)
                  }}
                  className="h-12 w-12 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="h-5 w-5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="h-16 w-16 rounded-full bg-brand-500 flex items-center justify-center hover:bg-brand-600 shadow-lg shadow-brand-500/25 transition-all cursor-pointer"
                  title={timerRunning ? 'Pause' : 'Start'}
                >
                  {timerRunning ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white ml-1" />}
                </button>
                
                {/* Audio sound settings */}
                <div className="relative group">
                  <button
                    className="h-12 w-12 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    title="Ambient Noise"
                  >
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-card border border-border/80 rounded-xl p-2 shadow-xl hidden group-hover:block w-32 space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase text-center mb-1">Ambient Sound</p>
                    {[
                      { id: 'none', label: 'Off 🔇' },
                      { id: 'rain', label: 'Rain 🌧️' },
                      { id: 'lofi', label: 'Lofi 🎧' },
                      { id: 'waves', label: 'Waves 🌊' }
                    ].map(snd => (
                      <button
                        key={snd.id}
                        onClick={() => setAmbientSound(snd.id)}
                        className={cn(
                          'w-full text-left text-xs px-2 py-1 rounded transition-colors cursor-pointer',
                          ambientSound === snd.id ? 'bg-brand-500/10 text-brand-400 font-semibold' : 'text-muted-foreground hover:bg-secondary'
                        )}
                      >
                        {snd.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Focus subject selector */}
              <div className="space-y-2 max-w-[200px] mx-auto text-left">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Focus Subject</label>
                <select
                  value={focusSubject}
                  onChange={(e) => setFocusSubject(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-secondary/30 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-foreground"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s} className="bg-[#0B1020]">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header Toolbar ──────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0B1020]/45 p-4 rounded-xl border border-border/50 backdrop-blur-md">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <span>{monthLabel}</span>
            <span className="text-xs text-muted-foreground font-normal border-l border-border/50 pl-2 mt-0.5">{weekLabel}</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToday} className="text-xs h-8">
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => setAiModalOpen(true)}
            className="border-brand-500/30 text-brand-400 hover:bg-brand-500/10 h-8 text-xs font-semibold shrink-0 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1 text-brand-400" />
            AI Auto-Plan
          </Button>

          <Button
            variant="gradient"
            onClick={() => {
              setSelectedSlot(new Date())
              setEditingSession(null)
              setForm({ subject: 'CS', duration: 1, note: '', status: 'pending' })
              setModalOpen(true)
            }}
            className="h-8 text-xs shadow-lg shadow-brand-500/10 shrink-0 font-semibold cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Session
          </Button>
        </div>
      </div>

      {/* ── Main Layout Split Grid ───────────────────────────── */}
      {isLoading ? (
        <PlannerSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Calendar Timeline (9 columns) */}
          <div className="lg:col-span-9 space-y-6">
            
            {hasNoSessionsInSelectedWeek ? (
              /* Premium Notion-style empty week state */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/50 bg-[#0B1020]/15 p-12 text-center space-y-6 backdrop-blur-md min-h-[450px] flex flex-col justify-center items-center shadow-inner"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center shadow-lg shadow-brand-500/5">
                  <GraduationCap className="h-8 w-8 text-brand-400" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-lg font-black text-foreground">No study sessions planned this week</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Map out your academic week. Use the AI auto-scheduler to block sessions based on your workload, or manually map them out on the calendar.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    variant="gradient"
                    onClick={() => setAiModalOpen(true)}
                    className="h-9 px-5 text-xs font-semibold shadow-md shadow-brand-500/20 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Generate AI Study Plan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setForceShowGrid(true)}
                    className="h-9 px-5 text-xs font-semibold border-border hover:bg-secondary cursor-pointer"
                  >
                    Manually schedule block
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-border/80 bg-card p-4 overflow-hidden shadow-sm relative min-h-[500px]"
              >
                <WeekView
                  weekDates={weekDates}
                  sessions={sessions}
                  onSlotClick={handleSlotClick}
                  onSessionClick={handleSessionClick}
                  onUpdateSession={update}
                />
              </motion.div>
            )}
          </div>

          {/* RIGHT: Productivity Side Panel (3 columns) */}
          <div className="lg:col-span-3">
            <ProductivityPanel
              sessions={sessions}
              streak={streak}
              assignments={assignments}
              timeLeft={timeLeft}
              timerDuration={timerDuration}
              timerRunning={timerRunning}
              focusSubject={focusSubject}
              ambientSound={ambientSound}
              setTimerRunning={setTimerRunning}
              setTimeLeft={setTimeLeft}
              setTimerDuration={setTimerDuration}
              setFocusSubject={setFocusSubject}
              setAmbientSound={setAmbientSound}
              setFocusMode={setFocusMode}
              onDeleteSession={remove}
              onToggleComplete={handleToggleComplete}
              onAddSession={add}
            />
          </div>
        </div>
      )}

      {/* ── Add / Edit Session Modal ─────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm bg-card border border-border/80 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-base">
              <Clock className="h-5 w-5 text-brand-400" />
              {editingSession ? 'Edit Study Session' : 'Add Study Session'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-left">
            {/* Date/time display */}
            {selectedSlot && (
              <div className="rounded-xl bg-brand-500/10 border border-brand-500/20 px-3 py-2.5 text-xs text-brand-400 font-bold flex items-center justify-between">
                <span>
                  📅 {selectedSlot.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span>
                  🕒 {selectedSlot.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            )}

            {/* Subject selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-foreground"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s} className="bg-[#0B1020]">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration block selectors */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration</label>
              <div className="flex flex-wrap gap-1.5">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm((p) => ({ ...p, duration: d }))}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer',
                      form.duration === d
                        ? 'gradient-bg-primary text-white border-transparent shadow-sm'
                        : 'border-border text-muted-foreground hover:border-brand-500/40'
                    )}
                  >
                    {d}h
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Topic / Notes</label>
              <Input
                placeholder="e.g. Database Indexing review"
                value={form.note}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                className="text-xs bg-secondary/10 border-border rounded-xl px-3 h-9"
              />
            </div>

            {/* Completion toggler for editing sessions */}
            {editingSession && (
              <div className="flex items-center justify-between border border-border/50 rounded-xl p-3 bg-secondary/10">
                <span className="text-[11px] font-bold text-muted-foreground uppercase">Status Completion</span>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, status: p.status === 'completed' ? 'pending' : 'completed' }))}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all",
                    form.status === 'completed'
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {form.status === 'completed' ? (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      Completed
                    </>
                  ) : (
                    'Mark Completed'
                  )}
                </button>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row gap-2 justify-end">
            {editingSession && (
              <Button
                variant="outline"
                className="h-8 text-xs font-semibold border-rose-500/20 text-rose-400 hover:bg-rose-500/10 rounded-xl mr-auto cursor-pointer"
                onClick={handleDeleteSession}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            )}
            <Button variant="ghost" className="h-8 text-xs font-semibold rounded-xl cursor-pointer" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" className="h-8 text-xs font-semibold rounded-xl cursor-pointer" onClick={handleSaveSession}>
              {editingSession ? 'Update' : 'Add Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AI Auto-Plan Modal ───────────────────────────────── */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="max-w-sm bg-card border border-border/80 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-base">
              <Sparkles className="h-5 w-5 text-brand-400 animate-pulse" />
              AI Study Auto-Plan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-left">
            <p className="text-xs text-muted-foreground leading-relaxed">
              CampusGenie will generate high-yield study blocks matching your topics, prioritizing upcoming assignments and balanced breaks.
            </p>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">What topics or exams are you preparing for?</label>
              <Input
                placeholder="e.g. Relational databases, linear maps, physics formulas"
                value={aiForm.topic}
                onChange={(e) => setAiForm((p) => ({ ...p, topic: e.target.value }))}
                className="text-xs bg-secondary/10 border-border rounded-xl px-3 h-9"
              />
            </div>

            {/* Preferred focus hours */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Preferred Study Time</label>
              <select
                value={aiForm.preferredFocus}
                onChange={(e) => setAiForm((p) => ({ ...p, preferredFocus: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-foreground"
              >
                <option value="morning">Morning (08:00 - 12:00)</option>
                <option value="afternoon">Afternoon (13:00 - 17:00)</option>
                <option value="evening">Evening (18:00 - 21:00)</option>
                <option value="night">Night (21:00 - 00:00)</option>
              </select>
            </div>

            {/* Study intensity */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Workload Intensity</label>
              <div className="flex gap-1.5">
                {['light', 'balanced', 'intensive'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAiForm((p) => ({ ...p, intensity: mode }))}
                    className={cn(
                      'flex-1 py-1.5 rounded-lg border text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer',
                      aiForm.intensity === mode
                        ? 'gradient-bg-primary text-white border-transparent shadow-sm'
                        : 'border-border text-muted-foreground hover:border-brand-500/40'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Allow weekends toggle */}
            <div className="flex items-center justify-between border border-border/50 rounded-xl p-3 bg-secondary/10">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-foreground uppercase">Allow Weekend Study</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">Schedule sessions on Saturdays & Sundays</span>
              </div>
              <button
                type="button"
                onClick={() => setAiForm(p => ({ ...p, allowWeekends: !p.allowWeekends }))}
                className={cn(
                  "h-5 w-10 rounded-full transition-all relative border flex items-center px-0.5 cursor-pointer focus:outline-none",
                  aiForm.allowWeekends ? "bg-brand-500 border-transparent" : "bg-muted/10 border-border"
                )}
              >
                <span className={cn(
                  "h-4 w-4 rounded-full bg-white transition-all shadow",
                  aiForm.allowWeekends ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" className="h-8 text-xs font-semibold rounded-xl cursor-pointer" onClick={() => setAiModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" className="h-8 text-xs font-semibold rounded-xl cursor-pointer" onClick={handleGenerateAiPlan} disabled={!aiForm.topic.trim()}>
              Generate Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
