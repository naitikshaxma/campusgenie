import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Activity, Layers, Target, CheckCircle2 } from 'lucide-react'

const STAGES = [
  { text: 'Analyzing assignments and deadlines...', icon: <Layers className="h-5 w-5" /> },
  { text: 'Calculating cognitive workload...', icon: <Activity className="h-5 w-5" /> },
  { text: 'Balancing fatigue and recovery windows...', icon: <CheckCircle2 className="h-5 w-5" /> },
  { text: 'Generating spaced repetition blocks...', icon: <Target className="h-5 w-5" /> },
  { text: 'Optimizing high-focus study periods...', icon: <Sparkles className="h-5 w-5" /> },
  { text: 'Building your personalized study system...', icon: <CheckCircle2 className="h-5 w-5" /> },
]

export default function AILoadingOverlay({ isVisible }) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    if (!isVisible) {
      setStageIndex(0)
      return
    }

    // Cycle through stages, getting progressively slower to build anticipation
    const intervals = [800, 1000, 1200, 1400, 1200, 1500]
    let currentIdx = 0
    let timeout

    const nextStage = () => {
      if (currentIdx < STAGES.length - 1) {
        currentIdx++
        setStageIndex(currentIdx)
        timeout = setTimeout(nextStage, intervals[currentIdx])
      }
    }

    timeout = setTimeout(nextStage, intervals[0])

    return () => clearTimeout(timeout)
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070B14]/80 p-6 overflow-hidden"
        >
          {/* Animated Background Particles / Lines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-brand-500/20 border-dashed"
            />
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-brand-400/20 border-dotted"
            />
          </div>

          <div className="relative max-w-md w-full bg-[#0B1020]/90 border border-brand-500/30 p-8 rounded-3xl shadow-[0_0_80px_-20px_rgba(139,92,246,0.3)] backdrop-blur-xl flex flex-col items-center text-center">
            
            {/* Glowing Icon */}
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 bg-brand-500 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-2 bg-brand-500 rounded-full animate-pulse opacity-40" />
              <div className="relative h-full w-full bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/50">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-6 tracking-tight">AI Executive Planner</h2>

            {/* Stages Timeline */}
            <div className="w-full space-y-4">
              {STAGES.map((stage, idx) => {
                const isActive = idx === stageIndex
                const isPassed = idx < stageIndex
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: isActive ? 1 : isPassed ? 0.3 : 0.1, 
                      x: 0,
                      scale: isActive ? 1.02 : 1 
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 text-left"
                  >
                    <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center border transition-colors ${
                      isActive 
                        ? 'border-brand-500 bg-brand-500/20 text-brand-400 shadow-[0_0_15px_rgba(139,92,246,0.4)]' 
                        : isPassed 
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' 
                          : 'border-muted text-muted-foreground'
                    }`}>
                      {isPassed ? <CheckCircle2 className="h-4 w-4" /> : stage.icon}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${isActive ? 'text-brand-300' : isPassed ? 'text-emerald-400/70' : 'text-muted-foreground'}`}>
                      {stage.text}
                    </span>
                  </motion.div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-muted/30 rounded-full mt-8 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-brand-500 to-indigo-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
