import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Sparkles, Monitor, Brain, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SLIDES = [
  {
    id: 1,
    title: 'Scan Assignments Instantly',
    description: 'Use your camera to turn syllabi and notice boards into structured tasks in seconds.',
    icon: Camera,
    color: 'from-brand-600 to-indigo-500',
    glow: 'shadow-[0_0_40px_rgba(139,92,246,0.4)]'
  },
  {
    id: 2,
    title: 'AI Builds Your Study Plan',
    description: 'CampusGenie cognitively balances your workload to create the perfect study week.',
    icon: Brain,
    color: 'from-indigo-500 to-cyan-500',
    glow: 'shadow-[0_0_40px_rgba(6,182,212,0.4)]'
  },
  {
    id: 3,
    title: 'Continue on Laptop',
    description: 'Start scanning on your phone, then instantly sync to your laptop for deep focus sessions.',
    icon: Monitor,
    color: 'from-emerald-500 to-teal-500',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.4)]'
  },
  {
    id: 4,
    title: 'Focus Smarter with AI',
    description: 'Your intelligent student operating system is ready. Let’s crush those grades.',
    icon: Sparkles,
    color: 'from-brand-500 to-rose-500',
    glow: 'shadow-[0_0_40px_rgba(244,63,94,0.4)]'
  }
]

export default function MobileOnboarding({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Disable body scroll when onboarding is active
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleNext = () => {
    if (currentSlide === SLIDES.length - 1) {
      localStorage.setItem('hasOnboarded', 'true')
      onComplete()
    } else {
      setCurrentSlide(p => p + 1)
    }
  }

  const slide = SLIDES[currentSlide]
  const Icon = slide.icon

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-between px-6 py-12 md:hidden overflow-hidden touch-none">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('absolute -top-[20%] -right-[20%] w-[140%] h-[60%] rounded-full blur-[120px] bg-gradient-to-tr opacity-20', slide.color)}
        />
      </div>

      {/* Top Branding */}
      <div className="w-full flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-400" />
          <span className="font-black tracking-tighter text-lg">CampusGenie</span>
        </div>
        <button 
          onClick={() => {
            localStorage.setItem('hasOnboarded', 'true')
            onComplete()
          }}
          className="text-xs font-bold text-muted-foreground"
        >
          Skip
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center z-10 space-y-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center space-y-8 w-full"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x
              if (swipe < -50) {
                handleNext()
              } else if (swipe > 50 && currentSlide > 0) {
                setCurrentSlide(p => p - 1)
              }
            }}
          >
            {/* 3D Icon Graphic */}
            <div className={cn("relative flex items-center justify-center h-48 w-48 rounded-full bg-card border border-border/50", slide.glow)}>
              <div className={cn("absolute inset-2 rounded-full opacity-20 bg-gradient-to-tr", slide.color)} />
              <Icon className="h-20 w-20 text-foreground relative z-10" />
            </div>

            {/* Text */}
            <div className="space-y-4 px-2">
              <h1 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                {slide.title}
              </h1>
              <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed max-w-[280px] mx-auto">
                {slide.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className="w-full flex flex-col items-center space-y-8 z-10">
        {/* Progress Dots */}
        <div className="flex gap-2.5">
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              className={cn("h-2 rounded-full transition-all duration-300", i === currentSlide ? "w-6 bg-brand-400" : "w-2 bg-border")}
            />
          ))}
        </div>

        {/* CTA */}
        <Button
          variant="gradient"
          className="w-full h-14 rounded-2xl text-base font-bold shadow-[0_8px_30px_-4px_rgba(139,92,246,0.5)] active:scale-95 transition-all"
          onClick={handleNext}
        >
          {currentSlide === SLIDES.length - 1 ? "Get Started" : "Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
