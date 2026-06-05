import { useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Flame, Sparkles, BookOpen, Clock, CalendarRange, Plus } from 'lucide-react'
import FocusTimer from './FocusTimer'
import TaskItem from './TaskItem'
import AiInsights from './AiInsights'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function ProductivityPanel({
  sessions = [],
  streak = 0,
  assignments = [],
  timeLeft,
  timerDuration,
  timerRunning,
  focusSubject,
  ambientSound,
  setTimerRunning,
  setTimeLeft,
  setTimerDuration,
  setFocusSubject,
  setAmbientSound,
  setFocusMode,
  onDeleteSession,
  onToggleComplete,
  onAddSession
}) {
  // Filter today's sessions
  const todaySessions = useMemo(() => {
    const todayStr = new Date().toDateString()
    return sessions.filter(s => {
      if (!s?.date) return false
      const sd = new Date(s.date)
      return !isNaN(sd) && sd.toDateString() === todayStr
    })
  }, [sessions])

  // Filter unscheduled assignments (active assignments with no planner sessions linked)
  const unscheduledAssignments = useMemo(() => {
    const scheduledIds = new Set(
      sessions
        .map(s => s.linkedAssignment || s.linkedAssignmentId)
        .filter(Boolean)
    )
    return assignments.filter(a => a.status !== 'done' && !scheduledIds.has(a.id || a._id))
  }, [assignments, sessions])

  // Smart Auto-Placement Algorithm: find first free slot
  const handleAutoPlace = async (assignment) => {
    // Search next 7 days
    const tomorrow = new Date()
    tomorrow.setHours(0,0,0,0)
    
    let targetSlot = null
    
    // Loop through next 7 days
    for (let day = 1; day <= 7; day++) {
      const checkDate = new Date(tomorrow)
      checkDate.setDate(tomorrow.getDate() + day)
      
      // Look for standard study windows: 9 AM, 11 AM, 2 PM, 4 PM
      const hoursToTry = [9, 11, 14, 16]
      for (const hour of hoursToTry) {
        const testStart = new Date(checkDate)
        testStart.setHours(hour, 0, 0, 0)
        const testEnd = new Date(checkDate)
        testEnd.setHours(hour + 1.5, 0, 0, 0) // default 1.5h session
        
        // Check collision
        const collision = sessions.some(s => {
          if (!s?.date) return false
          const sStart = new Date(s.date)
          const sEnd = new Date(sStart.getTime() + (Number(s.duration) || 1) * 3600000)
          return (testStart < sEnd && testEnd > sStart)
        })
        
        if (!collision) {
          targetSlot = testStart
          break
        }
      }
      if (targetSlot) break
    }

    // Fallback: 7 days from now at 10 AM
    if (!targetSlot) {
      targetSlot = new Date(tomorrow)
      targetSlot.setDate(tomorrow.getDate() + 7)
      targetSlot.setHours(10, 0, 0, 0)
    }

    await onAddSession?.({
      subject: assignment.subject || 'CS',
      duration: 1.5,
      date: targetSlot.toISOString(),
      note: `Complete: ${assignment.title}`,
      topic: `Complete: ${assignment.title}`,
      linkedAssignment: assignment.id || assignment._id
    })
  }

  const completedTodayCount = todaySessions.filter(s => s.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* 1. Consistency Streak Card */}
      <div className="relative overflow-hidden rounded-2xl border border-rose-500/25 bg-rose-500/[0.03] p-4 flex items-center gap-4 shadow-sm backdrop-blur-md">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-rose-500/5 blur-xl pointer-events-none" />
        <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
          <Flame className="h-5.5 w-5.5 text-rose-400 fill-rose-500/10 animate-pulse" />
        </div>
        <div>
          <div className="text-sm font-black text-rose-400">{streak} Day Consistency Streak</div>
          <p className="text-[11px] text-muted-foreground/80 mt-0.5 font-semibold">Study daily to hold your position.</p>
        </div>
      </div>

      {/* 2. Pomodoro Focus Widget */}
      <FocusTimer
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
      />

      {/* 3. Today's Sessions Checklist */}
      <div className="space-y-3 text-left">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Today's Focus</span>
          <span className="text-[10px] text-muted-foreground/60 font-mono">
            {completedTodayCount}/{todaySessions.length} done
          </span>
        </h3>
        
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
          {todaySessions.length === 0 ? (
            <div className="border border-dashed border-border/60 rounded-xl p-4 text-center">
              <p className="text-[11px] text-muted-foreground font-bold">No study sessions planned today.</p>
            </div>
          ) : (
            <AnimatePresence>
              {todaySessions.map(session => (
                <TaskItem
                  key={session.id || session._id}
                  session={session}
                  onDelete={onDeleteSession}
                  onToggle={onToggleComplete}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* 4. Unscheduled Assignments Panel */}
      <div className="space-y-3 text-left">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <CalendarRange className="h-3.5 w-3.5" /> Unscheduled Work
        </h3>
        
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
          {unscheduledAssignments.length === 0 ? (
            <div className="border border-dashed border-border/40 rounded-xl p-3.5 text-center bg-emerald-500/[0.01]">
              <p className="text-[10px] text-emerald-400 font-bold">All active tasks are scheduled!</p>
            </div>
          ) : (
            unscheduledAssignments.map(assignment => (
              <div
                key={assignment.id || assignment._id}
                className="flex items-center justify-between bg-card border border-border/60 rounded-xl p-3.5 hover:border-brand-500/30 transition-all text-xs font-semibold group shadow-sm"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="text-[9px] uppercase font-bold text-muted-foreground truncate">
                    {assignment.subject}
                  </div>
                  <div className="text-foreground/90 font-black mt-0.5 truncate">
                    {assignment.title}
                  </div>
                  <div className="text-[8px] text-muted-foreground font-medium mt-1 font-mono">
                    Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                
                <Button
                  onClick={() => handleAutoPlace(assignment)}
                  size="icon"
                  className="h-7 w-7 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-white transition-all shrink-0 cursor-pointer"
                  title="Auto Place on Calendar"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. AI Productivity Intelligence & Warnings */}
      <AiInsights sessions={sessions} />
    </div>
  )
}
