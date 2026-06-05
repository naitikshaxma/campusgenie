import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * EmptyState — reusable empty state component.
 * Used everywhere mock data has been removed.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,        // { label, onClick, to }
  className,
  size = 'md',   // 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: { wrap: 'py-10', icon: 'h-8 w-8',  iconWrap: 'h-14 w-14', title: 'text-sm', desc: 'text-xs' },
    md: { wrap: 'py-16', icon: 'h-10 w-10', iconWrap: 'h-18 w-18', title: 'text-base', desc: 'text-sm' },
    lg: { wrap: 'py-24', icon: 'h-12 w-12', iconWrap: 'h-24 w-24', title: 'text-lg', desc: 'text-base' },
  }
  const s = sizes[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col items-center justify-center text-center', s.wrap, className)}
    >
      {Icon && (
        <div className={cn(
          'flex items-center justify-center rounded-2xl mb-4',
          'bg-brand-500/5 border border-brand-500/10',
          s.iconWrap,
          'h-16 w-16',
        )}>
          <Icon className={cn(s.icon, 'text-muted-foreground/40')} />
        </div>
      )}

      {title && (
        <h3 className={cn('font-semibold text-foreground mb-1.5', s.title)}>{title}</h3>
      )}

      {description && (
        <p className={cn('text-muted-foreground leading-relaxed max-w-xs', s.desc)}>
          {description}
        </p>
      )}

      {action && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={action.onClick}
          className={cn(
            'mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5',
            'text-sm font-semibold shadow-sm transition-all',
            action.variant === 'outline' 
              ? 'border border-border/60 hover:bg-accent text-foreground'
              : 'gradient-bg-primary text-white shadow-[0_8px_20px_-4px_rgba(139,92,246,0.4)] hover:opacity-90',
          )}
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}
