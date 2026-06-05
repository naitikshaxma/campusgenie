import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, CheckCircle2 } from 'lucide-react'
import SignupForm from '@/components/auth/SignupForm'
import ThemeToggle from '@/components/common/ThemeToggle'

const BENEFITS = [
  'Free forever — no credit card needed',
  'Unlimited AI chat queries',
  'Smart notes with subject tagging',
  'Kanban assignment board',
  'Visual weekly study planner',
]

export default function Signup() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-1/2 relative overflow-hidden p-12 bg-[#09090b]">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"
        />

        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg-primary shadow-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">CampusGenie</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl font-black text-white leading-tight mb-4">
              Join 50K+ students<br />studying smarter 🚀
            </h1>
            <p className="text-white/60 text-base mb-8 leading-relaxed">
              Create your free account and unlock every feature CampusGenie has to offer.
            </p>

            <div className="space-y-3">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-white/70">{b}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <Link to="/" className="flex lg:hidden items-center gap-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg-primary">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold text-base gradient-text-brand">CampusGenie</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h2 className="font-display text-2xl font-black">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-1">Start studying smarter today — it's free</p>
          </div>
          <SignupForm />
        </motion.div>
      </div>
    </div>
  )
}
