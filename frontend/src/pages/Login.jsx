import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Brain, Sparkles } from 'lucide-react'
import LoginForm from '@/components/auth/LoginForm'
import ThemeToggle from '@/components/common/ThemeToggle'

const PERKS = [
  { icon: Brain,    text: 'AI-powered study assistance' },
  { icon: BookOpen, text: 'Smart notes & assignments' },
  { icon: Sparkles, text: 'Personalized study planner' },
]

export default function Login() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left panel (illustration) ──────────────────────── */}
      <div className="hidden lg:flex flex-col w-1/2 gradient-bg-primary relative overflow-hidden p-12">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-pattern opacity-20" />

        {/* Floating orb */}
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2.5 z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 border border-white/30">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">CampusGenie</span>
        </Link>

        {/* Hero content */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl font-black text-white leading-tight mb-4">
              Welcome back,<br />superstar student! 🎓
            </h1>
            <p className="text-white/70 text-base leading-relaxed mb-8">
              Your AI-powered college assistant is ready to help you study smarter, not harder.
            </p>

            {/* Perks */}
            <div className="space-y-3">
              {PERKS.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 border border-white/20">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-white/80 font-medium">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom quote */}
        <p className="relative z-10 text-xs text-white/40 text-center">
          Trusted by 50,000+ students at 150+ universities
        </p>
      </div>

      {/* ── Right panel (form) ──────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 relative">
        {/* Theme toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        {/* Mobile logo */}
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
            <h2 className="font-display text-2xl font-black">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter your credentials to continue</p>
          </div>

          <LoginForm />
        </motion.div>
      </div>
    </div>
  )
}
