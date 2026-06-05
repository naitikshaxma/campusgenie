import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AiCompanion({ insights = [] }) {
  const [currentInsight, setCurrentInsight] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!insights || insights.length === 0) return
    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [insights])

  if (!isVisible || !insights || insights.length === 0) return null

  const insight = insights[currentInsight]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative overflow-hidden rounded-2xl border border-brand-500/30 bg-card p-4 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-3 relative z-10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 border border-brand-500/20 shadow-inner">
            <Sparkles className="h-5 w-5 text-brand-400 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-1">
              AI Study Coach
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentInsight}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-sm font-medium text-foreground leading-snug"
              >
                {insight}
              </motion.p>
            </AnimatePresence>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
