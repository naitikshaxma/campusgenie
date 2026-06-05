import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GraduationCap, MessageSquare, BookOpen, Calendar,
  ClipboardList, Sparkles, ArrowRight, Star, Zap, Shield, Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/common/ThemeToggle'

/* ─── Animation helpers ──────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 30 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
})

const FEATURES = [
  { icon: MessageSquare, color: 'from-violet-500 to-brand-600',  title: 'AI Study Chat',      desc: 'Get instant answers, explanations, and study help from your personal AI tutor — available 24/7.' },
  { icon: Sparkles,      color: 'from-cyan-500 to-blue-600',     title: 'Assignment Agent',   desc: 'Snap a photo of worksheets, whiteboards or notices. Our OCR automatically schedules them.' },
  { icon: BookOpen,      color: 'from-pink-500 to-rose-600',     title: 'Smart Notes',         desc: 'Capture, organize, and search your notes with subject tagging and rich formatting.' },
  { icon: Calendar,      color: 'from-amber-500 to-orange-600',  title: 'OfficeKit Handoff',   desc: 'Start writing notes on your phone during class and transition to laptop with one tap.' },
]

const TESTIMONIALS = [
  { name: 'Priya S.',   year: 'CS Junior',       text: 'CampusGenie helped me ace my finals. The AI chat explains things better than my textbook!',   rating: 5 },
  { name: 'Marcus T.',  year: 'Physics Senior',   text: 'The Kanban board for assignments is a game-changer. I never miss deadlines anymore.',          rating: 5 },
  { name: 'Aisha K.',   year: 'Math Sophomore',   text: 'Beautiful UI and super fast. It feels like Notion and ChatGPT had a baby made for students.',  rating: 5 },
]

const STATS = [
  { value: '50K+', label: 'Students' },
  { value: '2M+',  label: 'AI Queries' },
  { value: '98%',  label: 'Satisfaction' },
  { value: '150+', label: 'Universities' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-light dark:glass border-b border-border/40 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg-primary shadow-lg">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-base gradient-text-brand">CampusGenie</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {['Features', 'Testimonials', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button variant="gradient" size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-bg-hero pointer-events-none" />
        <div className="absolute inset-0 grid-pattern pointer-events-none opacity-40" />

        {/* Floating orbs */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-32 right-[10%] h-64 w-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-48 left-[5%] h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
        />

        <div className="container relative text-center">
          {/* Badge */}
          <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-400">
              <Sparkles className="h-3 w-3" />
              AI-Powered Student OS
              <span className="ml-1 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] text-white font-semibold">NEW</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 {...fadeUp(0.2)} className="font-display text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Your AI-powered
            <br />
            <span className="gradient-text">student operating system</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p {...fadeUp(0.35)} className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed mb-10">
            CampusGenie combines smart OCR scanners, class note editors, AI study assistant chat, and OfficeKit cross-device handoff into one stunning college ecosystem.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.45)} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button variant="gradient" size="xl" className="group animate-glow-pulse">
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="glass" size="xl">
                View demo
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div {...fadeUp(0.55)} className="flex flex-wrap justify-center gap-8 mt-16">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-display font-black gradient-text-brand">{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="features" className="py-24 container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl font-black tracking-tight mb-3">
            Everything you need to <span className="gradient-text">excel</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Built by students, for students. Each feature is thoughtfully designed to fit your academic life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group rounded-2xl border border-border bg-card p-6 hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-lg mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-base font-bold mb-2 group-hover:text-brand-400 transition-colors">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Highlight banner ────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-brand-600/10 via-brand-500/5 to-cyan-500/10 border-y border-border/40">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-12">
            {[
              { icon: Zap,    text: 'Lightning fast AI responses' },
              { icon: Shield, text: 'Privacy-first, your data stays yours' },
              { icon: Globe,  text: 'Works on any device, anywhere' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-brand-400" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section id="testimonials" className="py-24 container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl font-black tracking-tight mb-3">
            Loved by <span className="gradient-text">students</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, year, text, rating }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="rounded-2xl border border-border bg-card p-6 hover:border-brand-500/20 hover:shadow-lg transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-6">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white">
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-muted-foreground">{year}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 container">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl gradient-bg-primary p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 grid-pattern opacity-10" />
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4 relative">
            Ready to level up your <br className="hidden md:block" /> academic game?
          </h2>
          <p className="text-white/70 text-lg mb-8 relative max-w-md mx-auto">
            Join 50,000+ students already using CampusGenie to study smarter.
          </p>
          <Link to="/signup" className="relative">
            <Button size="xl" className="bg-white text-brand-700 hover:bg-white/90 shadow-xl font-bold">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border/60 py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md gradient-bg-primary">
              <GraduationCap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-sm gradient-text-brand">CampusGenie</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 CampusGenie. Built for students, by students.</p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Contact'].map((item) => (
              <a key={item} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
