import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, CheckSquare, Sparkles, CalendarDays, Camera, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { name: 'Home', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: 'Tasks', path: '/assignments', icon: <CheckSquare className="h-5 w-5" /> },
  { name: 'Scan', path: '/agent', icon: <Camera className="h-6 w-6" />, isPrimary: true },
  { name: 'Plan', path: '/planner', icon: <CalendarDays className="h-5 w-5" /> },
  { name: 'Chat', path: '/chat', icon: <MessageSquare className="h-5 w-5" /> },
]

export default function MobileBottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
      <div className="mx-auto max-w-sm pointer-events-auto">
        <div className="flex items-center justify-between bg-[#070B14]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
          
          {/* Subtle gradient glow in the background */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-indigo-500/5 to-purple-500/5 pointer-events-none" />

          {TABS.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => cn(
                "relative flex flex-col items-center justify-center w-full h-12 transition-all tap-highlight-transparent z-10",
                isActive ? "text-brand-400" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {({ isActive }) => (
                <>
                  {tab.isPrimary ? (
                    <motion.div 
                      whileTap={{ scale: 0.9 }}
                      className="absolute -top-5 w-14 h-14 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] border-4 border-[#070B14]"
                    >
                      {tab.icon}
                    </motion.div>
                  ) : (
                    <motion.div 
                      whileTap={{ scale: 0.85 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className={cn("transition-transform duration-200", isActive && "-translate-y-1")}>
                        {tab.icon}
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold tracking-wide transition-all duration-200 absolute -bottom-1",
                        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                      )}>
                        {tab.name}
                      </span>
                    </motion.div>
                  )}

                  {/* Active Indicator Pill */}
                  {isActive && !tab.isPrimary && (
                    <motion.div
                      layoutId="mobile-nav-pill"
                      className="absolute inset-0 bg-brand-500/10 rounded-2xl -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}
