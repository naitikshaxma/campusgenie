import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Camera, Brain, MessageSquare, Monitor, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FloatingAiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const ACTIONS = [
    { id: 'scan', label: 'Scan Assignment', icon: Camera, route: '/agent', color: 'text-brand-400 bg-brand-500/10 border-brand-500/20' },
    { id: 'plan', label: 'Generate Plan', icon: Brain, route: '/planner', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { id: 'chat', label: 'Ask AI', icon: MessageSquare, route: '/chat', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { id: 'note', label: 'Quick Note', icon: Plus, route: '/notes', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { id: 'laptop', label: 'Continue on Laptop', icon: Monitor, route: '/continue', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ]

  const handleAction = (route) => {
    setIsOpen(false)
    navigate(route)
  }

  return (
    <div className="md:hidden fixed bottom-24 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex flex-col gap-3 mb-4 pointer-events-auto"
          >
            {ACTIONS.map((act, i) => (
              <motion.button
                key={act.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleAction(act.route)}
                className="flex items-center gap-3 justify-end group active:scale-95 transition-transform"
              >
                <span className="text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                  {act.label}
                </span>
                <div className={cn("h-12 w-12 rounded-full border shadow-xl flex items-center justify-center backdrop-blur-md", act.color)}>
                  <act.icon className="h-5 w-5" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto relative h-14 w-14 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-[0_4px_30px_rgba(139,92,246,0.6)] z-50 overflow-hidden active:scale-95 transition-transform"
        animate={isOpen ? { rotate: 135 } : { rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Breathing Pulse effect when closed */}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-white/20"
          />
        )}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        
        {isOpen ? <X className="h-6 w-6 relative z-10" /> : <Sparkles className="h-6 w-6 relative z-10" />}
      </motion.button>

      {/* Fullscreen dismiss overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/40 backdrop-blur-[2px] pointer-events-auto"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
