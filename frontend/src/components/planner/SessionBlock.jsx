import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Sparkles, AlertCircle } from 'lucide-react'
import { cn, getSubjectColor } from '@/lib/utils'

export default function SessionBlock({
  session,
  startHour,
  hourHeight,
  colWidth,
  leftOffset = '0%',
  widthPercent = '100%',
  onUpdate,
  onClick
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ top: 0, left: 0 })
  const [resizeDeltaHeight, setResizeDeltaHeight] = useState(0)

  const blockRef = useRef(null)

  const sd = new Date(session.date)
  const isCompleted = session.status === 'completed'
  const isAiGenerated = session.generatedByAI === true

  const startVal = sd.getHours() + sd.getMinutes() / 60
  const initialTop = (startVal - startHour) * hourHeight
  const initialHeight = (Number(session.duration) || 1) * hourHeight

  const sc = getSubjectColor(session.subject || 'CS')

  // Drag logic
  const handleDragStart = (e) => {
    // Prevent dragging if clicking delete button or checkbox
    if (e.target.closest('.no-drag')) return
    e.preventDefault()
    
    setIsDragging(true)
    const startY = e.clientY
    const startX = e.clientX

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY
      const deltaX = moveEvent.clientX - startX
      setDragOffset({ top: deltaY, left: deltaX })
    }

    const handleMouseUp = (upEvent) => {
      setIsDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      const finalDeltaY = upEvent.clientY - startY
      const finalDeltaX = upEvent.clientX - startX
      setDragOffset({ top: 0, left: 0 })

      // Calculate new hour (snap to 15-min / 0.25h)
      const hourDiff = finalDeltaY / hourHeight
      const snappedHourDiff = Math.round(hourDiff * 4) / 4

      // Calculate day diff
      const dayDiff = colWidth > 0 ? Math.round(finalDeltaX / colWidth) : 0

      if (snappedHourDiff !== 0 || dayDiff !== 0) {
        const newDate = new Date(sd)
        newDate.setDate(sd.getDate() + dayDiff)
        
        // Adjust hours and minutes
        const currentHours = sd.getHours()
        const currentMins = sd.getMinutes()
        const newTotalMins = currentHours * 60 + currentMins + snappedHourDiff * 60
        const newHours = Math.max(0, Math.min(23, Math.floor(newTotalMins / 60)))
        const newMins = Math.max(0, Math.min(59, Math.round((newTotalMins % 60) / 15) * 15))
        
        newDate.setHours(newHours, newMins, 0, 0)
        
        onUpdate?.(session.id || session._id, {
          date: newDate.toISOString()
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Resize logic
  const handleResizeStart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    const startY = e.clientY

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY
      setResizeDeltaHeight(deltaY)
    }

    const handleMouseUp = (upEvent) => {
      setIsResizing(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      const finalDeltaY = upEvent.clientY - startY
      setResizeDeltaHeight(0)

      // Calculate new duration (snap to 15-min / 0.25h, min 0.5h)
      const currentDuration = Number(session.duration) || 1
      const durationDiff = finalDeltaY / hourHeight
      const newDuration = Math.max(0.5, Math.round((currentDuration + durationDiff) * 4) / 4)

      if (newDuration !== currentDuration) {
        onUpdate?.(session.id || session._id, {
          duration: newDuration
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const currentTop = initialTop + dragOffset.top
  const currentHeight = Math.max(hourHeight * 0.5, initialHeight + (isResizing ? resizeDeltaHeight : 0))
  const isShort = currentHeight < 45

  // Snap indicator top calculation
  const hourDiffPreview = dragOffset.top / hourHeight
  const snappedHourDiffPreview = Math.round(hourDiffPreview * 4) / 4
  const previewHourVal = startVal + snappedHourDiffPreview
  const previewHours = Math.floor(previewHourVal)
  const previewMins = Math.round((previewHourVal % 1) * 60)
  const previewTimeStr = `${String(previewHours % 12 || 12).padStart(2, '0')}:${String(previewMins).padStart(2, '0')} ${previewHours >= 12 ? 'PM' : 'AM'}`

  return (
    <motion.div
      ref={blockRef}
      initial={session.animDelay !== undefined ? { opacity: 0, y: -20, scale: 0.95 } : false}
      animate={session.animDelay !== undefined ? { opacity: 1, y: 0, scale: 1 } : false}
      transition={{ duration: 0.4, delay: session.animDelay || 0, ease: 'easeOut' }}
      className={cn(
        "absolute select-none group transition-shadow",
        isDragging ? "z-30 shadow-2xl cursor-grabbing" : isResizing ? "z-30 cursor-ns-resize" : "z-20 cursor-grab"
      )}
      style={{
        top: `${currentTop}px`,
        height: `${currentHeight}px`,
        left: `calc(${leftOffset} + 2px)`,
        width: `calc(${widthPercent} - 4px)`,
        transform: isDragging ? `translateX(${dragOffset.left}px)` : 'none'
      }}
      onMouseDown={handleDragStart}
    >
      <div
        className={cn(
          "h-full w-full rounded-2xl border p-2 flex flex-col justify-between overflow-hidden backdrop-blur-md transition-colors relative",
          isCompleted 
            ? "bg-muted/10 border-muted-foreground/20 text-muted-foreground/60 line-through" 
            : `${sc.bg} ${sc.border} ${sc.text} hover:border-${sc.dot.replace('bg-', '')}/40`,
          isAiGenerated && !isCompleted && "shadow-[0_0_15px_rgba(168,85,247,0.05)] border-purple-500/30"
        )}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(session)
        }}
      >
        {/* Glowing aura for AI scheduled tasks */}
        {isAiGenerated && !isCompleted && (
          <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-purple-500/10 blur-md pointer-events-none" />
        )}

        {/* Drag Snap Preview Popover */}
        {isDragging && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black border border-border/80 px-2 py-0.5 rounded text-[8px] font-mono text-white pointer-events-none z-40 whitespace-nowrap shadow-md">
            {previewTimeStr}
          </div>
        )}

        {isShort ? (
          <div className="flex items-center justify-between text-[9px] font-semibold w-full h-full leading-none">
            <span className="truncate flex items-center gap-1">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", isCompleted ? "bg-muted-foreground/40" : sc.dot)} />
              <span className="font-bold uppercase tracking-wider">{session.subject}:</span>
              <span className="text-foreground/90 truncate font-bold">{session.topic || session.note || 'Study Block'}</span>
            </span>
            {isAiGenerated && (
              <Sparkles className="h-2.5 w-2.5 text-purple-400 shrink-0 mx-1 animate-pulse" />
            )}
            <span className="font-mono text-[8px] opacity-80 shrink-0">{session.duration}h</span>
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full w-full text-left">
            <div className="flex flex-col gap-0.5 overflow-hidden">
              <div className="flex items-center justify-between gap-1 text-[9px] font-bold uppercase tracking-wider">
                <span className="truncate flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", isCompleted ? "bg-muted-foreground/40" : sc.dot)} />
                  {session.subject}
                </span>
                
                <div className="flex items-center gap-1 shrink-0 no-drag">
                  {isAiGenerated && (
                    <span className="px-1 py-0.5 rounded bg-purple-500/10 text-[7px] text-purple-400 border border-purple-500/20 font-semibold flex items-center gap-0.5">
                      <Sparkles className="h-2 w-2 text-purple-400" />
                      AI
                    </span>
                  )}
                  {isCompleted && (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 fill-emerald-950" />
                  )}
                </div>
              </div>
              
              <div className={cn(
                "text-[11px] font-black truncate leading-snug text-foreground/95 mt-0.5",
                isCompleted && "text-muted-foreground/60"
              )}>
                {session.topic || session.note || 'Study Session'}
              </div>
              
              {/* AI Reasoning Display (Demo Mode & General) */}
              {(session.aiReasoning || isAiGenerated) && !isShort && !isCompleted && (
                <div className="mt-1 text-[8px] leading-tight text-purple-300/80 line-clamp-2 border-l border-purple-500/30 pl-1.5 opacity-90">
                  {session.aiReasoning || "Optimized for your peak focus hours."}
                </div>
              )}
            </div>

            <div className="text-[9px] font-bold opacity-75 mt-auto flex items-center justify-between font-mono">
              <div className="flex items-center gap-1">
                <span>{session.duration}h</span>
                <span>•</span>
                <span>
                  {sd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resize Bottom Handle */}
      {!isCompleted && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-white/10 active:bg-brand-500/30 transition-all rounded-b-2xl flex items-center justify-center"
          onMouseDown={handleResizeStart}
        >
          <div className="w-8 h-0.5 rounded-full bg-muted-foreground/25 group-hover:bg-muted-foreground/50 transition-colors" />
        </div>
      )}
    </motion.div>
  )
}
