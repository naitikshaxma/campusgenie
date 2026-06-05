import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, CheckSquare, Camera, CalendarDays, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

import { useState, useEffect } from 'react'

const TABS = [
  { name: 'Home',   path: '/dashboard',   icon: LayoutDashboard },
  { name: 'Tasks',  path: '/assignments',  icon: CheckSquare },
  { name: 'Scan',   path: '/agent',        icon: Camera, isPrimary: true },
  { name: 'Plan',   path: '/planner',      icon: CalendarDays },
  { name: 'Chat',   path: '/chat',         icon: MessageSquare },
]

export default function MobileBottomNav() {
  const location = useLocation()
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    const handleFocus = (e) => {
      const tagName = e.target?.tagName?.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea') {
        setIsKeyboardVisible(true)
      }
    }
    
    const handleBlur = (e) => {
      const tagName = e.target?.tagName?.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea') {
        setTimeout(() => {
          const activeTag = document.activeElement?.tagName?.toLowerCase()
          if (activeTag !== 'input' && activeTag !== 'textarea') {
            setIsKeyboardVisible(false)
          }
        }, 100)
      }
    }

    document.addEventListener('focusin', handleFocus)
    document.addEventListener('focusout', handleBlur)

    return () => {
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('focusout', handleBlur)
    }
  }, [])

  if (isKeyboardVisible) return null

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Glass dock */}
      <div className="mx-3 mb-3">
        <div className="relative flex items-center bg-[#080C18]/90 backdrop-blur-2xl border border-white/[0.08] rounded-[26px] px-1 py-1 shadow-[0_-4px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(139,92,246,0.08)]">

          {/* Subtle ambient glow */}
          <div className="absolute inset-0 rounded-[26px] bg-gradient-to-r from-brand-500/[0.04] via-indigo-500/[0.04] to-purple-500/[0.04] pointer-events-none" />

          {TABS.map((tab) => {
            const isActive = location.pathname === tab.path
            const Icon = tab.icon

            if (tab.isPrimary) {
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className="relative flex-1 flex flex-col items-center justify-center h-14 no-callout"
                >
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute -top-4 w-[52px] h-[52px] rounded-[18px] bg-gradient-to-br from-brand-500 via-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_24px_rgba(139,92,246,0.55),0_4px_12px_rgba(0,0,0,0.4)] border border-white/20"
                  >
                    {/* Pulse ring */}
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-[18px] border border-brand-400/40"
                    />
                    <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </motion.div>
                </NavLink>
              )
            }

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="relative flex-1 flex flex-col items-center justify-center h-14 no-callout"
              >
                <motion.div
                  whileTap={{ scale: 0.82 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="relative flex flex-col items-center justify-center gap-1"
                >
                  {/* Active background pill */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="absolute inset-[-4px_-8px] rounded-xl bg-brand-500/12 border border-brand-500/15"
                      />
                    )}
                  </AnimatePresence>

                  <Icon
                    className={cn(
                      'h-[22px] w-[22px] relative transition-all duration-200',
                      isActive
                        ? 'text-brand-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.7)]'
                        : 'text-white/35'
                    )}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />

                  <span className={cn(
                    'text-[10px] font-semibold tracking-wide relative transition-all duration-200',
                    isActive ? 'text-brand-400' : 'text-white/25'
                  )}>
                    {tab.name}
                  </span>
                </motion.div>
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
