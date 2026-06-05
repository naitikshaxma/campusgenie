import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ClipboardList, BookOpen, MessageSquare, Calendar,
  Flame, TrendingUp, ArrowRight, Sparkles,
  CheckCircle2, AlertCircle, Laptop, Camera, Plus, Clock, Lightbulb, CheckSquare
} from 'lucide-react'
import { useAuth }       from '@/hooks/useAuth'
import { useStats }      from '@/hooks/useStats'
import { useAssignments } from '@/hooks/useAssignments'
import { usePlanner }     from '@/hooks/usePlanner'
import { useSync }       from '@/hooks/useSync'
import { fetchSessions }  from '@/services/chat.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button }        from '@/components/ui/button'
import { StatCardSkeleton, ListItemSkeleton } from '@/components/common/Skeleton'
import SyncIndicator     from '@/components/common/SyncIndicator'
import EmptyState        from '@/components/common/EmptyState'
import AiCompanion       from '@/components/common/AiCompanion'
import { cn, formatDate } from '@/lib/utils'

const PRIORITY_COLORS = {
  high:   'text-rose-400 bg-rose-500/10 border-rose-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  low:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

const QUICK_ACTIONS = [
  { label: 'Capture Assignment', icon: Camera,      to: '/agent',       color: 'gradient-bg-primary text-white' },
  { label: 'Ask AI',             icon: Sparkles,    to: '/chat',        color: 'bg-violet-500/15 text-violet-400' },
  { label: 'New Note',           icon: BookOpen,    to: '/notes',       color: 'bg-cyan-500/15 text-cyan-400' },
  { label: 'Continue on Laptop', icon: Laptop,      to: '/continue',    color: 'bg-emerald-500/15 text-emerald-400' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user }               = useAuth()
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useStats()
  const { assignments, isLoading: assignmentsLoading, move: moveAssignment } = useAssignments()
  const { sessions: plannerSessions, isLoading: plannerLoading, update: updatePlannerSession } = usePlanner()
  
  const [chatSessions, setChatSessions] = useState([])
  const [chatsLoading, setChatsLoading] = useState(true)
  const { syncStatus, lastSyncedAt } = useSync()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const loadChats = useCallback(async () => {
    setChatsLoading(true)
    try {
      const data = await fetchSessions()
      setChatSessions(Array.isArray(data) ? data : [])
    } catch {
      setChatSessions([])
    } finally {
      setChatsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadChats()
  }, [loadChats])

  const handleCompleteAssignment = async (id) => {
    try {
      await moveAssignment(id, 'done')
      refetchStats()
    } catch (err) {
      console.error('[Dashboard] Failed to complete assignment:', err)
    }
  }

  const handleCompletePlannerSession = async (id) => {
    try {
      await updatePlannerSession(id, { status: 'completed' })
      refetchStats()
    } catch (err) {
      console.error('[Dashboard] Failed to complete planner session:', err)
    }
  }

  const upcoming = useMemo(() => {
    return assignments
      .filter((a) => a.status !== 'done')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
  }, [assignments])

  const upcomingSessions = useMemo(() => {
    return plannerSessions
      .filter((s) => s.status === 'pending')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3)
  }, [plannerSessions])

  // Derive productivity completion rate
  const completionStats = useMemo(() => {
    const total = assignments.length
    const completed = assignments.filter(a => a.status === 'done').length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, rate }
  }, [assignments])

  // Dynamic weekly hours distribution from plannerSessions
  const weeklyStudyHours = useMemo(() => {
    const today = new Date()
    const currentDay = today.getDay()
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1
    const monday = new Date(today)
    monday.setDate(today.getDate() - distanceToMonday)
    monday.setHours(0, 0, 0, 0)
    
    const weekData = [
      { day: 'Mon', hours: 0, date: new Date(monday.getTime()) },
      { day: 'Tue', hours: 0, date: new Date(monday.getTime() + 1 * 86400000) },
      { day: 'Wed', hours: 0, date: new Date(monday.getTime() + 2 * 86400000) },
      { day: 'Thu', hours: 0, date: new Date(monday.getTime() + 3 * 86400000) },
      { day: 'Fri', hours: 0, date: new Date(monday.getTime() + 4 * 86400000) },
      { day: 'Sat', hours: 0, date: new Date(monday.getTime() + 5 * 86400000) },
      { day: 'Sun', hours: 0, date: new Date(monday.getTime() + 6 * 86400000) },
    ]

    plannerSessions.forEach(session => {
      if (session.status === 'completed' && session.date) {
        const sDate = new Date(session.date)
        sDate.setHours(0, 0, 0, 0)
        const dayDiff = Math.round((sDate - monday) / 86400000)
        if (dayDiff >= 0 && dayDiff <= 6) {
          weekData[dayDiff].hours += session.duration || 0
        }
      }
    })

    return weekData.map(d => ({ day: d.day, hours: Number(d.hours.toFixed(1)) }))
  }, [plannerSessions])

  const maxHours = Math.max(...weeklyStudyHours.map(d => d.hours), 1)

  // Dynamic Streak Grid cells from plannerSessions (last 28 days)
  const streakCells = useMemo(() => {
    const totalDays = 28
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const hoursByDate = {}
    plannerSessions.forEach(session => {
      if (session.status === 'completed' && session.date) {
        const sDate = new Date(session.date)
        sDate.setHours(0, 0, 0, 0)
        const key = sDate.getTime()
        hoursByDate[key] = (hoursByDate[key] || 0) + (session.duration || 0)
      }
    })

    const cells = []
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000)
      const key = d.getTime()
      const hours = hoursByDate[key] || 0
      
      let level = 'none'
      if (hours >= 3) level = 'high'
      else if (hours >= 1) level = 'medium'
      else if (hours > 0) level = 'low'

      cells.push({
        dayNum: totalDays - i,
        isActive: hours > 0,
        level,
        date: d
      })
    }
    return cells
  }, [plannerSessions])

  // AI Generated Recommendations
  const aiTips = useMemo(() => {
    const overdueCount = assignments.filter(a => {
      const diff = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
      return diff < 0 && a.status !== 'done'
    }).length

    const tips = [
      { id: 1, text: 'Your most productive hours are 6 PM – 9 PM. Consider scheduling your deep focus session today around this slot.', type: 'info' },
      { id: 2, text: 'Take a look at your note taking patterns. Scanning notices and importing them saves up to 40 mins per assignment.', type: 'tip' }
    ]

    if (overdueCount > 0) {
      tips.unshift({
        id: 0,
        text: `You have ${overdueCount} overdue assignment${overdueCount > 1 ? 's' : ''}. Complete them first or use the AI Planner to reschedule.`,
        type: 'warning'
      })
    }

    return tips
  }, [assignments])

  const STAT_CARDS = useMemo(() => [
    {
      label: 'Assignments',
      value: stats?.pendingAssignments ?? '—',
      icon: ClipboardList,
      color: 'text-amber-400',
      bg: 'from-amber-500/20 to-amber-600/5',
      to: '/assignments',
    },
    {
      label: 'Notes',
      value: stats?.notesCount ?? '—',
      icon: BookOpen,
      color: 'text-cyan-400',
      bg: 'from-cyan-500/20 to-cyan-600/5',
      to: '/notes',
    },
    {
      label: 'AI Queries',
      value: stats?.aiQueries ?? '—',
      icon: MessageSquare,
      color: 'text-brand-400',
      bg: 'from-brand-500/20 to-brand-600/5',
      to: '/chat',
    },
    {
      label: 'Study Streak',
      value: stats?.studyStreak ? `${stats.studyStreak}d` : '—',
      icon: Flame,
      color: 'text-rose-400',
      bg: 'from-rose-500/20 to-rose-600/5',
      to: '/planner',
    },
  ], [stats])

  return (
    <div className="space-y-4 md:space-y-6 pb-4">
      {/* ── Mobile-first Greeting ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-brand-500/10 via-indigo-500/5 to-transparent p-4 md:p-6"
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">{greeting()}</p>
            <h1 className="font-display text-xl md:text-3xl font-black mt-0.5 truncate">
              <span className="gradient-text">{user?.name?.split(' ')[0] || 'Student'}</span> 👋
            </h1>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {user?.major ? `${user.major} · ` : ''}{user?.year || 'AI-powered student OS'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <SyncIndicator status={syncStatus} lastSyncedAt={lastSyncedAt} />
            <Link to="/chat">
              <Button variant="gradient" size="sm" className="group h-8 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Ask AI
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>


      {/* ── AI Companion ─────────────────────────────────────── */}
      <AiCompanion insights={aiTips.map(t => t.text)} />

      {/* ── Stat cards ───────────────────────────────────────── */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, to }) => (
            <motion.div key={label} variants={item}>
              <Link to={to}>
                <Card className="group relative overflow-hidden hover:border-brand-500/30 transition-all duration-300 cursor-pointer active:scale-[0.97]">
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', bg)} />
                  <CardContent className="relative p-3 md:p-5">
                    <div className={cn('flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-background/50 border border-white/10 mb-2 md:mb-3', color)}>
                      <Icon className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <p className="text-xl md:text-2xl font-display font-black">{value}</p>
                    <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">{label}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Visual Analytics Section ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Score SVG Widget */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Productivity Score</CardTitle>
            <CardDescription className="text-xs">Assignment completion metrics</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-1 py-4">
            <div className="relative flex items-center justify-center h-32 w-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-muted/20"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Active Progress */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-brand-500 transition-all duration-1000"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * completionStats.rate) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono text-foreground">{completionStats.rate}%</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Completed</span>
              </div>
            </div>
            <div className="flex gap-6 mt-4 text-xs font-semibold text-center border-t border-border/40 w-full pt-3">
              <div className="flex-1">
                <p className="text-foreground text-sm font-mono">{completionStats.completed}</p>
                <p className="text-muted-foreground text-[10px]">Closed</p>
              </div>
              <div className="border-l border-border/40 h-8" />
              <div className="flex-1">
                <p className="text-foreground text-sm font-mono">{completionStats.total}</p>
                <p className="text-muted-foreground text-[10px]">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Focus Blocks (Bar Chart) */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Weekly Study Hours</CardTitle>
            <CardDescription className="text-xs">Focused work distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end justify-between h-44 py-2">
            {weeklyStudyHours.map(({ day, hours }) => {
              const heightPercent = maxHours > 0 ? (hours / maxHours) * 100 : 0
              return (
                <div key={day} className="flex flex-col items-center flex-1 group">
                  <div className="w-full flex justify-center mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-[9px] font-mono font-bold bg-secondary/80 text-foreground px-1.5 py-0.5 rounded border border-border/40">
                      {hours}h
                    </span>
                  </div>
                  <div className="w-6 sm:w-7 bg-muted/20 rounded-md h-24 relative overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-600 to-accent-cyan rounded-md"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground mt-2">{day}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Study Streak Heatmap */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight flex items-center justify-between">
              <span>Consistency Grid</span>
              <span className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                <Flame className="h-3.5 w-3.5 fill-rose-500" />
                {stats?.studyStreak || 0} Day Streak
              </span>
            </CardTitle>
            <CardDescription className="text-xs">Visualizing 28-day habit tracking</CardDescription>
          </CardHeader>
          <CardContent className="py-3 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-7 gap-1.5 justify-center">
              {streakCells.map(({ dayNum, level }) => (
                <div
                  key={dayNum}
                  title={`Day ${dayNum} focus`}
                  className={cn(
                    'aspect-square w-full max-w-[28px] rounded-md transition-all duration-300 border border-transparent',
                    level === 'none' && 'bg-muted/10 hover:bg-muted/20 border-border/20',
                    level === 'low' && 'bg-brand-500/20 border-brand-500/30 hover:bg-brand-500/30',
                    level === 'medium' && 'bg-brand-500/50 border-brand-500/60 hover:bg-brand-500/60',
                    level === 'high' && 'bg-brand-500 border-brand-500/90 shadow-[0_0_8px_rgba(139,92,246,0.3)] hover:brightness-110'
                  )}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 text-[9px] text-muted-foreground font-semibold px-0.5">
              <span>Less</span>
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 rounded bg-muted/10" />
                <div className="w-2 h-2 rounded bg-brand-500/20" />
                <div className="w-2 h-2 rounded bg-brand-500/50" />
                <div className="w-2 h-2 rounded bg-brand-500" />
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Upcoming deadlines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    Upcoming Deadlines
                  </CardTitle>
                  <Link to="/assignments">
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      View all <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {assignmentsLoading ? (
                  <ListItemSkeleton count={4} />
                ) : upcoming.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle2}
                    title="All caught up!"
                    description="No pending assignments. Add one using the Assignment Agent."
                    size="sm"
                    action={{ label: 'Capture Assignment', onClick: () => navigate('/agent'), icon: Camera }}
                  />
                ) : (
                  <div className="flex overflow-x-auto lg:flex-col lg:overflow-visible gap-3 pb-4 lg:pb-0 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                    {upcoming.map((a, i) => (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
                        className="flex flex-col lg:flex-row lg:items-center gap-3 rounded-lg p-3 sm:p-4 bg-accent/40 lg:bg-transparent lg:hover:bg-accent border lg:border-transparent min-w-[240px] max-w-[280px] lg:min-w-0 lg:max-w-none snap-center group"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCompleteAssignment(a.id)}
                            className="text-muted-foreground/30 hover:text-emerald-500 hover:scale-110 transition-all shrink-0 p-1 rounded-full hover:bg-emerald-500/10"
                            title="Mark as done"
                          >
                            <CheckCircle2 className="h-5 w-5 lg:h-4 lg:w-4" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-brand-400 transition-colors">{a.title}</p>
                            <p className="text-xs text-muted-foreground">{a.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between lg:justify-end gap-2 mt-2 lg:mt-0 w-full lg:w-auto pl-9 lg:pl-0">
                          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize', PRIORITY_COLORS[a.priority])}>
                            {a.priority}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground">{formatDate(a.dueDate)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Study Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-brand-400" />
                    Upcoming Study Sessions
                  </CardTitle>
                  <Link to="/planner">
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      View Planner <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {plannerLoading ? (
                  <ListItemSkeleton count={3} />
                ) : upcomingSessions.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle2}
                    title="No sessions scheduled"
                    description="You are all caught up on your study planner sessions."
                    size="sm"
                    action={{ label: 'Go to Planner', onClick: () => navigate('/planner'), icon: Calendar }}
                  />
                ) : (
                  <div className="flex overflow-x-auto lg:flex-col lg:overflow-visible gap-3 pb-4 lg:pb-0 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                    {upcomingSessions.map((s, i) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 + i * 0.06 }}
                        className="flex flex-col lg:flex-row lg:items-center gap-3 rounded-lg p-3 sm:p-4 bg-accent/40 lg:bg-transparent lg:hover:bg-accent border lg:border-transparent min-w-[240px] max-w-[280px] lg:min-w-0 lg:max-w-none snap-center group"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCompletePlannerSession(s.id)}
                            className="text-muted-foreground/30 hover:text-emerald-500 hover:scale-110 transition-all shrink-0 p-1 rounded-full hover:bg-emerald-500/10"
                            title="Mark as completed"
                          >
                            <CheckCircle2 className="h-5 w-5 lg:h-4 lg:w-4" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-brand-400 transition-colors">
                              {s.topic || 'Study Session'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {s.subject} {s.startTime ? `· ${s.startTime}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between lg:justify-end gap-2 mt-2 lg:mt-0 w-full lg:w-auto pl-9 lg:pl-0">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-brand-500/20 text-brand-400 bg-brand-500/5">
                            {s.duration} hr{s.duration > 1 ? 's' : ''}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {formatDate(s.date)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map(({ label, icon: Icon, to, color }) => (
                  <Link key={label} to={to}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn('flex flex-col items-center gap-2 rounded-xl p-3 cursor-pointer transition-all duration-200', color)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium text-center leading-tight">{label}</span>
                    </motion.div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent AI Chats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-violet-400" />
                    Recent AI Chats
                  </CardTitle>
                  <Link to="/chat">
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                      All <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {chatsLoading ? (
                  <ListItemSkeleton count={2} />
                ) : chatSessions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground">No recent conversations.</p>
                    <Link to="/chat">
                      <Button size="xs" variant="outline" className="mt-2 text-[10px] h-6 px-2">
                        <Sparkles className="h-3 w-3 mr-1" /> Start Chat
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatSessions.slice(0, 3).map((session, i) => (
                      <Link key={session.id} to="/chat" className="block">
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.4 + i * 0.05 }}
                          className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-accent transition-colors group cursor-pointer text-left"
                        >
                          <MessageSquare className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate group-hover:text-brand-400 transition-colors">
                              {session.title || 'Conversation'}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {session.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Office Kit CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Link to="/continue">
              <Card className="group border-brand-500/20 hover:border-brand-500/40 cursor-pointer transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent" />
                <CardContent className="relative p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg-primary shrink-0">
                    <Laptop className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold group-hover:text-brand-400 transition-colors">Continue on Laptop</p>
                    <p className="text-xs text-muted-foreground">Office Kit — deep work mode</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-brand-400 transition-all group-hover:translate-x-0.5" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
