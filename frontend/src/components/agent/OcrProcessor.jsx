import { motion } from 'framer-motion'
import { Scan, Brain, FileSearch, Sparkles } from 'lucide-react'

const STEPS = [
  { icon: Scan,        label: 'Scanning image…',          color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
  { icon: FileSearch,  label: 'Extracting text (OCR)…',   color: 'text-brand-400',   bg: 'bg-brand-500/10' },
  { icon: Brain,       label: 'AI understanding content…', color: 'text-violet-400',  bg: 'bg-violet-500/10' },
  { icon: Sparkles,    label: 'Structuring results…',     color: 'text-amber-400',   bg: 'bg-amber-500/10' },
]

/**
 * OcrProcessor — animated processing state shown during OCR extraction.
 * Shows progressive step indicators with pulsing glow.
 */
export default function OcrProcessor({ currentStep = 0, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-brand-500/20 bg-card p-6 text-center space-y-6"
    >
      {/* Central orb */}
      <div className="relative flex items-center justify-center mx-auto h-20 w-20">
        {/* Pulsing rings */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-brand-500/30"
            animate={{ scale: [1, 1.3 + i * 0.15, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
          />
        ))}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full gradient-bg-primary shadow-lg">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Brain className="h-8 w-8 text-white" />
          </motion.div>
        </div>
      </div>

      {/* Label */}
      <div>
        <p className="text-sm font-semibold text-foreground">{label || 'Processing with AI…'}</p>
        <p className="text-xs text-muted-foreground mt-1">This takes a few seconds</p>
      </div>

      {/* Step indicators */}
      <div className="space-y-2">
        {STEPS.map(({ icon: Icon, label: stepLabel, color, bg }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{
              opacity: i <= currentStep ? 1 : 0.3,
              x: 0,
            }}
            transition={{ duration: 0.3, delay: i * 0.15 }}
            className="flex items-center gap-3 rounded-lg p-2.5 text-left"
            style={{ background: i === currentStep ? 'rgba(108,71,238,0.05)' : 'transparent' }}
          >
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${bg}`}>
              {i < currentStep ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                </motion.div>
              ) : i === currentStep ? (
                <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </motion.div>
              ) : (
                <Icon className={`h-3.5 w-3.5 ${color} opacity-30`} />
              )}
            </div>
            <span className={`text-xs font-medium ${i <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
              {stepLabel}
            </span>
            {i === currentStep && (
              <motion.div
                className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
