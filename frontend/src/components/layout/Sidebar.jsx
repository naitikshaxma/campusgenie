import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, MessageSquare, ClipboardList,
  BookOpen, Calendar, ChevronLeft, LogOut,
  GraduationCap, Settings, Zap, Sparkles, Megaphone, Laptop
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard',   label: 'Dashboard',         icon: LayoutDashboard },
  { to: '/chat',        label: 'AI Chat',           icon: MessageSquare  },
  { to: '/assignments', label: 'Assignments',       icon: ClipboardList  },
  { to: '/notes',       label: 'Notes',             icon: BookOpen       },
  { to: '/planner',     label: 'Study Planner',     icon: Calendar       },
  { to: '/agent',       label: 'Assignment Agent',  icon: Sparkles       },
  { to: '/scanner',     label: 'Notice Scanner',    icon: Megaphone      },
  { to: '/office',      label: 'OfficeKit Handoff', icon: Laptop         },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CG'

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          // Mobile: fixed drawer
          'fixed inset-y-0 left-0 z-50 flex flex-col',
          'bg-card/95 backdrop-blur-xl border-r border-border/60',
          'md:relative md:translate-x-0',
          // Mobile slide
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'transition-transform duration-300 ease-in-out md:transition-none',
        )}
      >
        {/* Brand header */}
        <div className={cn(
          'flex flex-col justify-center gap-1.5 px-4 h-16 border-b border-border/60',
          collapsed && 'items-center justify-center px-2',
        )}>
          <div className="flex items-center gap-3 w-full">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-bg-primary shadow-lg relative">
              <GraduationCap className="h-4 w-4 text-white" />
              {/* Glowing AI pulse indicator */}
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col min-w-0"
                >
                  <span className="font-display font-black text-sm tracking-tight gradient-text-brand leading-none">
                    CampusGenie
                  </span>
                  <span className="text-[9px] font-medium text-muted-foreground tracking-tight mt-0.5 truncate uppercase">
                    AI Student Workspace
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapse toggle (desktop only) */}
            {!collapsed && (
              <button
                onClick={() => setCollapsed(true)}
                className="hidden md:flex ml-auto h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="hidden md:flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mt-1"
            >
              <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
            </button>
          )}
        </div>

        {/* AI Quick Action */}
        <div className={cn('px-3 py-3', collapsed && 'px-2')}>
          <NavLink to="/chat" onClick={onClose}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer',
                'bg-gradient-to-r from-brand-600/20 to-accent-cyan/10',
                'border border-brand-500/20 hover:border-brand-500/40',
                'transition-all duration-200',
                collapsed && 'justify-center px-2',
              )}
            >
              <Zap className="h-4 w-4 text-brand-400 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold text-brand-400"
                  >
                    Ask AI anything…
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </NavLink>
        </div>

        <Separator className="opacity-40" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 no-scrollbar">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} collapsed={collapsed} onClick={onClose} />
          ))}
        </nav>

        <Separator className="opacity-40" />

        {/* Bottom section */}
        <div className={cn('px-3 py-3 space-y-1', collapsed && 'px-2')}>
          <SidebarButton
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            collapsed={collapsed}
            onClick={() => {}}
          />
          {/* User profile */}
          <div className={cn(
            'flex items-center gap-3 rounded-lg px-2 py-2 mt-2',
            'bg-secondary/40 border border-border/40',
            collapsed && 'justify-center',
          )}>
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-semibold truncate text-foreground">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.major}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!collapsed && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

function NavItem({ to, label, Icon, collapsed, onClick }) {
  return (
    <NavLink to={to} onClick={onClick}>
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 cursor-pointer',
            collapsed && 'justify-center px-2',
            isActive
              ? 'bg-brand-500/15 text-brand-400 font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
          title={collapsed ? label : undefined}
        >
          {isActive && (
            <motion.div
              layoutId="active-nav"
              className="absolute inset-0 rounded-lg bg-brand-500/10 border border-brand-500/20"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Icon className={cn('h-4 w-4 shrink-0 z-10', isActive && 'text-brand-400')} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="z-10"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </NavLink>
  )
}

function SidebarButton({ icon, label, collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm',
        'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
        collapsed && 'justify-center px-2',
      )}
      title={collapsed ? label : undefined}
    >
      {icon}
      <AnimatePresence>
        {!collapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
