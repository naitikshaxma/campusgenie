import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, Clock, Laptop } from 'lucide-react'
import { isDemoMode } from '@/lib/demoData'

export default function DemoLandingOverlay() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only run if demo mode is enabled and we haven't shown it yet in this session
    if (isDemoMode() && !sessionStorage.getItem('CAMPUSGENIE_DEMO_PLAYED')) {
      setShow(true)
      sessionStorage.setItem('CAMPUSGENIE_DEMO_PLAYED', 'true')
      
      // Auto-hide after 4.5 seconds
      const timer = setTimeout(() => {
        setShow(false)
      }, 4500)
      
      return () => clearTimeout(timer)
    }
  }, [])

  if (!show) return null

  const steps = [
    { icon: Sparkles, text: "Scan", color: "text-amber-400" },
    { icon: Brain, text: "AI Plans", color: "text-brand-400" },
    { icon: Clock, text: "Focus", color: "text-emerald-400" },
    { icon: Laptop, text: "Anywhere", color: "text-cyan-400" }
  ]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <motion.div
            animate={{ 
              background: [
                "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 50%)",
                "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 50%)",
                "radial-gradient(circle at 50% 50%, rgba(56,189,248,0.15) 0%, rgba(0,0,0,0) 50%)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {/* Logo Sequence */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg-primary shadow-[0_0_40px_rgba(139,92,246,0.5)]">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white">
                CampusGenie
              </h1>
            </motion.div>

            {/* Tagline Sequence */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="space-y-2 mb-12"
            >
              <h2 className="text-xl font-bold bg-gradient-to-r from-brand-300 to-cyan-300 bg-clip-text text-transparent">
                AI Student OS
              </h2>
              <p className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
                Built for Phone-First Productivity
              </p>
            </motion.div>

            {/* Icons Sequence */}
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.text}
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.5 + (i * 0.2), duration: 0.5, type: "spring" }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <Icon className={`h-6 w-6 ${step.color}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                      {step.text}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
