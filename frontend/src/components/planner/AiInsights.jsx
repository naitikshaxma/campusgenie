import { useMemo } from 'react'
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AiInsights({ sessions = [] }) {
  const auditResult = useMemo(() => {
    const warnings = []
    const insights = []

    if (!sessions || sessions.length === 0) {
      return {
        warnings: ["No sessions scheduled yet. Use AI Auto-Plan to seed your calendar."],
        insights: ["Schedule study blocks during your peak energy hours for 2x retention."]
      }
    }

    // Group sessions by date string
    const sessionsByDay = {}
    sessions.forEach(s => {
      if (!s?.date) return
      const dateStr = new Date(s.date).toDateString()
      if (!sessionsByDay[dateStr]) sessionsByDay[dateStr] = []
      sessionsByDay[dateStr].push(s)
    })

    let hasOverlaps = false
    let hasOverload = false
    let hasLateNight = false
    let completedCount = 0

    Object.entries(sessionsByDay).forEach(([dayStr, daySessions]) => {
      // Sort sessions by date/time
      const sorted = [...daySessions].sort((a, b) => new Date(a.date) - new Date(b.date))
      
      // 1. Check overload
      const totalHours = sorted.reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0)
      if (totalHours > 4) {
        hasOverload = true
        warnings.push(`⚠ ${dayStr.split(' ')[0]} ${dayStr.split(' ')[2]} is overloaded with ${totalHours}h of study.`)
      }

      // 2. Check overlap and no-break
      for (let i = 0; i < sorted.length; i++) {
        const curr = sorted[i]
        const currStart = new Date(curr.date)
        const currEnd = new Date(currStart.getTime() + (Number(curr.duration) || 1) * 3600000)

        if (curr.status === 'completed') completedCount++
        if (currStart.getHours() >= 22 || currStart.getHours() < 5) {
          hasLateNight = true
        }

        if (i > 0) {
          const prev = sorted[i - 1]
          const prevStart = new Date(prev.date)
          const prevEnd = new Date(prevStart.getTime() + (Number(prev.duration) || 1) * 3600000)

          // Overlap check
          if (currStart < prevEnd) {
            hasOverlaps = true
          } else {
            // Gap check (no break warning)
            const gapMins = (currStart - prevEnd) / 60000
            if (gapMins < 30 && curr.status !== 'completed' && prev.status !== 'completed') {
              warnings.push(`⚠ Back-to-back sessions on ${dayStr.split(' ')[0]} without a 30m break.`)
            }
          }
        }
      }
    })

    if (hasOverlaps) {
      warnings.push("⚠ You have overlapping calendar blocks. Adjust your start times.")
    }
    if (hasLateNight) {
      warnings.push("⚠ Late-night studying detected. This reduces sleep-based memory consolidation.")
    }

    // Compile dynamic AI insights
    const subjects = [...new Set(sessions.map(s => s.subject))]
    if (subjects.length > 0) {
      insights.push(`You studied ${Math.round((completedCount / sessions.length) * 100) || 0}% of your scheduled sessions.`)
      
      const incompleteBySubj = {}
      sessions.forEach(s => {
        if (s.status !== 'completed') {
          incompleteBySubj[s.subject] = (incompleteBySubj[s.subject] || 0) + 1
        }
      })
      const lowestSubj = Object.entries(incompleteBySubj).sort((a, b) => b[1] - a[1])[0]
      if (lowestSubj) {
        insights.push(`Your ${lowestSubj[0]} sessions have the lowest completion rate this week.`)
      } else {
        insights.push("Excellent work! You have maintained a 100% block completion rate.")
      }
    }

    // Default fallbacks if warnings are clean
    if (warnings.length === 0) {
      warnings.push("✓ Schedule check: No workload or collision warnings detected. Looking clean!")
    }

    insights.push("Pro Tip: Math/CS topics are best scheduled in the morning for peak cognitive performance.")
    
    return { warnings, insights }
  }, [sessions])

  return (
    <div className="space-y-4">
      {/* Smart Burnout Warnings */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-sm">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-500">
          <AlertTriangle className="h-4 w-4" />
          <span>Burnout Alerts</span>
        </div>
        <div className="space-y-2">
          {auditResult.warnings.map((warn, i) => (
            <div key={i} className="flex gap-2 text-[11px] font-medium leading-relaxed text-muted-foreground">
              <span className={cn(
                "h-1.5 w-1.5 rounded-full mt-1.5 shrink-0",
                warn.startsWith('✓') ? 'bg-emerald-500' : 'bg-amber-500'
              )} />
              <p>{warn}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Productivity Insights */}
      <div className="rounded-2xl border border-brand-500/25 bg-brand-500/[0.01] p-4.5 space-y-3 relative overflow-hidden shadow-inner">
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-brand-500/5 blur-xl pointer-events-none" />
        
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand-400">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>Productivity Intelligence</span>
        </div>
        
        <div className="space-y-2">
          {auditResult.insights.map((insight, i) => (
            <div key={i} className="flex gap-2 text-[11px] font-medium leading-relaxed text-muted-foreground">
              <Lightbulb className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
              <p>{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
