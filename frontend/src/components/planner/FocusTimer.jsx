import { Volume2, RotateCcw, Play, Pause, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUBJECTS = ['CS', 'DBMS', 'Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'Biology']

export default function FocusTimer({
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
  setFocusMode
}) {
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

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4.5 space-y-4 shadow-sm relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-brand-500/5 blur-xl pointer-events-none" />
      
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Focus Timer</span>
        <button
          onClick={() => setFocusMode(true)}
          className="p-1.5 hover:bg-secondary rounded-lg transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          title="Expand Focus Mode"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between bg-secondary/35 border border-border/30 rounded-xl p-3.5 shadow-inner">
        <div className="flex flex-col">
          <span className="text-2xl font-black font-mono tracking-tight text-foreground">{formatTime(timeLeft)}</span>
          <span className="text-[9px] text-muted-foreground font-black uppercase mt-0.5">Focusing on: {focusSubject}</span>
        </div>
        
        <div className="flex gap-1.5">
          <button
            onClick={() => {
              setTimerRunning(false)
              setTimeLeft(timerDuration)
            }}
            className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary cursor-pointer text-muted-foreground transition-colors"
            title="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className="h-8 w-8 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 shadow-lg shadow-brand-500/20 cursor-pointer transition-all"
            title={timerRunning ? 'Pause' : 'Start'}
          >
            {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Timer presets */}
      <div className="flex justify-between gap-1.5">
        {[
          { label: 'Pomodoro', mins: 25 },
          { label: 'Short Break', mins: 5 },
          { label: 'Long Break', mins: 15 }
        ].map(({ label, mins }) => (
          <button
            key={label}
            onClick={() => selectTimerType(mins)}
            className={cn(
              'flex-1 py-1 rounded-lg border text-[9px] font-bold transition-all cursor-pointer',
              timerDuration === mins * 60
                ? 'bg-brand-500 text-white border-transparent shadow-sm'
                : 'border-border text-muted-foreground hover:bg-secondary/40'
            )}
          >
            {mins}m
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Subject selector */}
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Subject</span>
          <select
            value={focusSubject}
            onChange={(e) => setFocusSubject(e.target.value)}
            className="w-full rounded-lg border border-border/80 bg-background/50 px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-brand-500 text-foreground"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s} className="bg-background">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Ambient noise selector */}
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Volume2 className="h-3 w-3" /> Audio
          </span>
          <select
            value={ambientSound}
            onChange={(e) => setAmbientSound(e.target.value)}
            className="w-full rounded-lg border border-border/80 bg-background/50 px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-brand-500 text-foreground"
          >
            <option value="none" className="bg-background">Mute 🔇</option>
            <option value="rain" className="bg-background">Rain 🌧️</option>
            <option value="lofi" className="bg-background">Lofi 🎧</option>
            <option value="waves" className="bg-background">Waves 🌊</option>
          </select>
        </div>
      </div>
    </div>
  )
}
