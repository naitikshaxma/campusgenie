import { useState, useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import SessionBlock from './SessionBlock'
import EmptyState from '@/components/common/EmptyState'
import { Calendar, Brain } from 'lucide-react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOUR_HEIGHT = 60 // Height of one hour in px

export default function WeekView({ weekDates = [], sessions = [], onSlotClick, onSessionClick, onUpdateSession }) {
  const [now, setNow] = useState(new Date())
  const [colWidth, setColWidth] = useState(0)
  
  const gridRef = useRef(null)
  const scrollContainerRef = useRef(null)

  // Keep now updated every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Calculate dynamic active hour range to reduce dead vertical empty space
  const { hoursRange, startHour, endHour } = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        hoursRange: Array.from({ length: 18 }, (_, i) => i + 6), // Default 6 AM - 11 PM (18 hours)
        startHour: 6,
        endHour: 23
      }
    }

    const sessionHours = sessions.map((s) => {
      const d = new Date(s.date)
      const start = isNaN(d) ? 9 : d.getHours()
      const dur = Number(s.duration) || 1
      return { start, end: Math.min(24, Math.ceil(start + dur)) }
    })

    const minHour = Math.min(8, ...sessionHours.map((sh) => sh.start))
    const maxHour = Math.max(20, ...sessionHours.map((sh) => sh.end))
    
    // Pad by 2 hours on each side for smart scrolling margin
    const startHour = Math.max(0, minHour - 2)
    const endHour = Math.min(24, maxHour + 2)
    const hoursRange = Array.from({ length: endHour - startHour }, (_, i) => i + startHour)

    return { hoursRange, startHour, endHour }
  }, [sessions])

  // Track grid column width for dragging displacement
  useEffect(() => {
    if (gridRef.current) {
      setColWidth(gridRef.current.clientWidth / 7)
    }
    const handleResize = () => {
      if (gridRef.current) {
        setColWidth(gridRef.current.clientWidth / 7)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [hoursRange])

  // Auto-scroll to center current time on load
  useEffect(() => {
    if (scrollContainerRef.current) {
      const currentHourVal = now.getHours() + now.getMinutes() / 60
      if (currentHourVal >= startHour && currentHourVal <= endHour) {
        const targetScrollY = (currentHourVal - startHour) * HOUR_HEIGHT - 200
        scrollContainerRef.current.scrollTop = Math.max(0, targetScrollY)
      }
    }
  }, [startHour, endHour])

  // Handle slot click
  const handleColumnClick = (date, e) => {
    // Avoid double trigger if clicking directly on a SessionBlock
    if (e.target.closest('.pointer-events-auto') && !e.target.classList.contains('pointer-events-auto')) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const clickedHour = startHour + clickY / HOUR_HEIGHT
    const finalHour = Math.floor(clickedHour)
    onSlotClick?.(date, finalHour)
  }

  // Google Calendar style Event Overlap/Collision Solver
  const resolveDayOverlaps = (daySessions) => {
    if (daySessions.length === 0) return []

    // 1. Sort sessions by start hour
    const sorted = [...daySessions].map(s => {
      const sd = new Date(s.date)
      const start = sd.getHours() + sd.getMinutes() / 60
      const duration = Number(s.duration) || 1
      return { ...s, start, end: start + duration }
    }).sort((a, b) => a.start - b.start)

    // 2. Group sessions into overlapping clusters
    const clusters = []
    let currentCluster = []
    let clusterEnd = 0

    sorted.forEach(s => {
      if (currentCluster.length === 0) {
        currentCluster.push(s)
        clusterEnd = s.end
      } else if (s.start < clusterEnd) {
        currentCluster.push(s)
        clusterEnd = Math.max(clusterEnd, s.end)
      } else {
        clusters.push(currentCluster)
        currentCluster = [s]
        clusterEnd = s.end
      }
    })
    if (currentCluster.length > 0) {
      clusters.push(currentCluster)
    }

    // 3. Assign lanes inside each cluster
    const positioned = []
    clusters.forEach(cluster => {
      const lanes = [] // lanes[i] contains array of sessions in lane i
      
      cluster.forEach(s => {
        let placed = false
        for (let i = 0; i < lanes.length; i++) {
          const lastInLane = lanes[i][lanes[i].length - 1]
          // If this session starts after the previous session in this lane ends
          if (s.start >= lastInLane.end) {
            lanes[i].push(s)
            s.laneIndex = i
            placed = true
            break
          }
        }
        if (!placed) {
          lanes.push([s])
          s.laneIndex = lanes.length - 1
        }
      })

      const totalLanes = lanes.length
      cluster.forEach(s => {
        s.widthPercent = 100 / totalLanes
        s.leftOffset = s.laneIndex * s.widthPercent
        positioned.push(s)
      })
    })

    return positioned
  }

  // Render horizontal NOW line
  const renderNowLine = () => {
    const currentHourVal = now.getHours() + now.getMinutes() / 60
    if (currentHourVal < startHour || currentHourVal > endHour) return null
    const nowTop = (currentHourVal - startHour) * HOUR_HEIGHT

    return (
      <div
        className="absolute left-0 right-0 border-t-2 border-brand-500 z-10 pointer-events-none flex items-center"
        style={{ top: `${nowTop}px` }}
      >
        <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-brand-500 animate-ping" />
        <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-brand-500 shadow-md shadow-brand-500/50" />
      </div>
    )
  }

  return (
    <>
      {/* ── DESKTOP WEEK GRID ── */}
      <div className="hidden md:block overflow-x-auto select-none no-scrollbar">
        <div className="min-w-[760px] pb-2 text-foreground">
          {/* Sticky Day Headers */}
          <div className="grid grid-cols-8 gap-0 border-b border-border/20 pb-3 mb-2">
            <div className="w-14 shrink-0" />
            <div className="col-span-7 grid grid-cols-7">
              {weekDates.map((date, i) => {
                if (!date || isNaN(date)) return <div key={i} />
                const isToday = date.toDateString() === now.toDateString()
                return (
                  <div key={i} className="text-center">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                      {DAYS[date.getDay()]}
                    </div>
                    <div className={cn(
                      "text-sm font-black w-8 h-8 rounded-xl flex items-center justify-center mx-auto mt-1 transition-all",
                      isToday 
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25" 
                        : "text-foreground hover:bg-secondary/60"
                    )}>
                      {date.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Scrollable grid container */}
          <div
            ref={scrollContainerRef}
            className="max-h-[620px] overflow-y-auto no-scrollbar relative border border-border/40 rounded-2xl bg-card/10 backdrop-blur-md shadow-inner flex"
          >
            {/* Left: Time Labels */}
            <div className="flex flex-col border-r border-border/20 bg-background/35 w-14 shrink-0 justify-between select-none">
              {hoursRange.map((hour) => (
                <div
                  key={hour}
                  className="text-[9px] text-muted-foreground/60 text-right pr-2.5 font-bold font-mono flex items-center justify-end"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                >
                  {hour === 12 ? '12 PM' : hour === 0 ? '12 AM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
              ))}
            </div>

            {/* Right: Scrollable calendar columns */}
            <div ref={gridRef} className="flex-1 relative">
              {/* Background Grid Lines (Horizontal hour separator lines) */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                {hoursRange.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-border/10 w-full last:border-b-0"
                    style={{ height: `${HOUR_HEIGHT}px` }}
                  />
                ))}
              </div>

              {/* 7 Columns */}
              <div className="grid grid-cols-7 h-full relative divide-x divide-border/10">
                {weekDates.map((date, di) => {
                  if (!date || isNaN(date)) return <div key={di} className="h-full" />
                  const isToday = date.toDateString() === now.toDateString()

                  // Filter & position overlapping sessions
                  const daySessions = sessions.filter((s) => {
                    if (!s?.date) return false
                    const sd = new Date(s.date)
                    return !isNaN(sd) && sd.toDateString() === date.toDateString()
                  })
                  const positionedDaySessions = resolveDayOverlaps(daySessions)

                  return (
                    <div
                      key={di}
                      className={cn(
                        "relative h-full cursor-crosshair transition-colors hover:bg-brand-500/[0.01]",
                        isToday && "bg-brand-500/[0.03]"
                      )}
                      style={{ height: `${hoursRange.length * HOUR_HEIGHT}px` }}
                      onClick={(e) => handleColumnClick(date, e)}
                    >
                      {/* Live indicator line */}
                      {isToday && renderNowLine()}

                      {/* Positioned Study Blocks */}
                      {positionedDaySessions.map((session) => (
                        <SessionBlock
                          key={session.id || session._id}
                          session={session}
                          startHour={startHour}
                          hourHeight={HOUR_HEIGHT}
                          colWidth={colWidth}
                          leftOffset={`${session.leftOffset}%`}
                          widthPercent={`${session.widthPercent}%`}
                          onUpdate={onUpdateSession}
                          onClick={onSessionClick}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

            {/* ── MOBILE AGENDA VIEW ── */}
      <div className="md:hidden space-y-4 pb-20">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">
          Upcoming Agenda
        </h2>

        {sessions
          .slice()
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .filter(
            (s) => new Date(s.date) >= new Date(now.setHours(0, 0, 0, 0))
          )
          .map((session) => {
            const sd = new Date(session.date)
            const isCompleted = session.status === 'completed'

            return (
              <div
                key={session.id || session._id}
                onClick={() => onSessionClick?.(session)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md transition-all active:scale-[0.98]",
                  isCompleted
                    ? "bg-secondary/20 border-border/40 opacity-70"
                    : "bg-card border-brand-500/20 shadow-md hover:border-brand-500/40"
                )}
              >
                {/* Time Indicator */}
                <div className="flex flex-col items-center justify-center shrink-0 w-12 border-r border-border/40 pr-3">
                  <span className="text-xs font-bold text-foreground">
                    {
                      sd
                        .toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })
                        .split(' ')[0]
                    }
                  </span>

                  <span className="text-[9px] font-black text-muted-foreground uppercase">
                    {
                      sd
                        .toLocaleTimeString('en-US', {
                          hour12: true,
                        })
                        .split(' ')[1]
                    }
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-brand-400">
                    <span className="truncate">{session.subject}</span>

                    <span className="text-muted-foreground">
                      • {session.duration}h
                    </span>
                  </div>

                  <h3
                    className={cn(
                      "text-sm font-semibold truncate",
                      isCompleted && "line-through text-muted-foreground"
                    )}
                  >
                    {session.topic || session.note || 'Study Session'}
                  </h3>
                </div>

                {/* Status Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()

                    onUpdateSession?.(
                      session.id || session._id,
                      {
                        status: isCompleted ? 'todo' : 'completed',
                      }
                    )
                  }}
                  className={cn(
                    "h-10 w-10 shrink-0 rounded-full flex items-center justify-center transition-all shadow-sm",
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                      : "bg-secondary text-muted-foreground border border-border/50 hover:bg-brand-500/20 hover:text-brand-400"
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              </div>
            )
          })}

        {sessions.length === 0 && (
          <div className="pt-4">
            <EmptyState
              icon={Brain}
              title="No sessions planned"
              description="Let AI build your week for optimal productivity."
              size="sm"
            />
          </div>
        )}
      </div>
    </>
  )
}