import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

export default function ThemeToggle({ className }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-lg',
        'bg-secondary/60 text-muted-foreground',
        'hover:bg-secondary hover:text-foreground',
        'border border-border/50',
        'transition-colors duration-200',
        className,
      )}
      aria-label="Toggle theme"
    >
      <AnimatedIcon isDark={isDark} />
    </motion.button>
  )
}

function AnimatedIcon({ isDark }) {
  return (
    <motion.div
      key={isDark ? 'dark' : 'light'}
      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
      animate={{ rotate: 0,   opacity: 1, scale: 1 }}
      exit={{    rotate:  90, opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.25, ease: 'backOut' }}
    >
      {isDark ? (
        <Moon className="h-4 w-4 text-brand-400" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500" />
      )}
    </motion.div>
  )
}
