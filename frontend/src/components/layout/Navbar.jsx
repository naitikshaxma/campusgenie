import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Bell, Search, LogOut } from 'lucide-react'
import ThemeToggle from '@/components/common/ThemeToggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const PAGE_TITLES = {
  '/dashboard':   { title: 'Dashboard',    subtitle: 'Welcome back!' },
  '/chat':        { title: 'AI Chat',      subtitle: 'Ask anything, learn everything' },
  '/assignments': { title: 'Assignments',  subtitle: 'Track your academic work' },
  '/notes':       { title: 'Notes',        subtitle: 'Capture your thoughts' },
  '/planner':     { title: 'Study Planner', subtitle: 'Plan smarter, not harder' },
}

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'CampusGenie', subtitle: '' }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CG'

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center gap-4 px-4 md:px-6',
        'glass-light dark:glass border-b border-border/60',
        'backdrop-blur-xl',
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h1 className="text-base font-semibold text-foreground leading-none">{pageInfo.title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{pageInfo.subtitle}</p>
        </motion.div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search button */}
        <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <Search className="h-4 w-4" />
        </button>

        {/* Notification bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-background" />
        </button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Avatar Dropdown */}
        <div className="relative">
          <Avatar
            onClick={() => setDropdownOpen((p) => !p)}
            className="h-8 w-8 ring-2 ring-brand-500/30 cursor-pointer hover:ring-brand-500/60 active:scale-95 transition-all"
          >
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
          
          <AnimatePresence>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl p-1.5 z-40 text-left"
                >
                  <div className="px-2.5 py-2 border-b border-border/30">
                    <p className="text-xs font-bold text-foreground truncate">{user?.name || 'Student'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'student@campus.edu'}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
