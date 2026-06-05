import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ClipboardList, BookOpen, MessageSquare, Calendar,
  Flame, TrendingUp, ArrowRight, Sparkles,
  CheckCircle2, AlertCircle, Laptop, Camera, Plus,
} from 'lucide-react'
import { useAuth }       from '@/hooks/useAuth'
import { useStats }      from '@/hooks/useStats'
import { useAssignments } from '@/hooks/useAssignments'
import { usePlanner }     from '@/hooks/usePlanner'
import { useSync }       from '@/hooks/useSync'
import { fetchSessions }  from '@/services/chat.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button }        from '@/components/ui/button'
import { StatCardSkeleton, ListItemSkeleton } from '@/components/common/Skeleton'
import SyncIndicator     from '@/components/common/SyncIndicator'
import EmptyState        from '@/components/common/EmptyState'
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
  { label: 'Continue on Laptop', icon: Laptop,      to: '/office',      color: 'bg-emerald-500/15 text-emerald-400' },
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
    <div className="space-y-6 pb-8">
      {/* ── Greeting ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="font-display text-2xl font-black">
            {greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Student'}</span> 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user?.major && `${user.major} · `}{user?.year || 'Welcome to CampusGenie'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SyncIndicator status={syncStatus} lastSyncedAt={lastSyncedAt} />
          <Link to="/chat">
            <Button variant="gradient" className="group">
              <Sparkles className="h-4 w-4" />
              Ask AI
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, to }) => (
            <motion.div key={label} variants={item}>
              <Link to={to}>
                <Card className="group relative overflow-hidden hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 cursor-pointer">
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60', bg)} />
                  <CardContent className="relative p-5">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-background/50 border border-white/10 mb-3', color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-display font-black">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Main grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column: Deadlines & Planner sessions */}
        <div className="lg:col-span-2 space-y-6">
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
                  <div className="space-y-2">
                    {upcoming.map((a, i) => (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                        className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent transition-colors group"
                      >
                        <button
                          onClick={() => handleCompleteAssignment(a.id)}
                          className="text-muted-foreground/30 hover:text-emerald-500 hover:scale-110 transition-all shrink-0 p-1 rounded-full hover:bg-emerald-500/10"
                          title="Mark as done"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-brand-400 transition-colors">{a.title}</p>
                          <p className="text-xs text-muted-foreground">{a.subject}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize', PRIORITY_COLORS[a.priority])}>
                            {a.priority}
                          </span>
                          <span className="text-[10px] text-muted-foreground hidden sm:block">{formatDate(a.dueDate)}</span>
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
                  <div className="space-y-2">
                    {upcomingSessions.map((s, i) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.35 + i * 0.06 }}
                        className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent transition-colors group"
                      >
                        <button
                          onClick={() => handleCompletePlannerSession(s.id)}
                          className="text-muted-foreground/30 hover:text-emerald-500 hover:scale-110 transition-all shrink-0 p-1 rounded-full hover:bg-emerald-500/10"
                          title="Mark as completed"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-brand-400 transition-colors">
                            {s.topic || 'Study Session'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.subject} {s.startTime ? `· ${s.startTime}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-brand-500/20 text-brand-400 bg-brand-500/5">
                            {s.duration} hr{s.duration > 1 ? 's' : ''}
                          </span>
                          <span className="text-[10px] text-muted-foreground hidden sm:block">
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
            <Link to="/office">
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
