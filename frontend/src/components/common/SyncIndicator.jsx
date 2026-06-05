import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Wifi, WifiOff, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * SyncIndicator — shows real-time sync status.
 * syncing | synced | error | connected | disconnected
 */
export default function SyncIndicator({ status, lastSyncedAt, deviceConnected, className }) {
  const configs = {
    idle:    { icon: Wifi,         label: 'Ready',           color: 'text-muted-foreground',  bg: 'bg-muted/40' },
    syncing: { icon: Loader2,      label: 'Syncing…',        color: 'text-brand-400',         bg: 'bg-brand-500/10', spin: true },
    synced:  { icon: CheckCircle2, label: 'Synced',          color: 'text-emerald-400',       bg: 'bg-emerald-500/10' },
    error:   { icon: WifiOff,      label: 'Sync failed',     color: 'text-rose-400',          bg: 'bg-rose-500/10' },
  }

  const config = configs[status] || configs.idle

  const timeStr = lastSyncedAt
    ? lastSyncedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium',
          config.bg, config.color, className,
        )}
      >
        <config.icon className={cn('h-3 w-3', config.spin && 'animate-spin')} />
        <span>{config.label}</span>
        {status === 'synced' && timeStr && (
          <span className="opacity-60">· {timeStr}</span>
        )}
        {deviceConnected && status !== 'syncing' && (
          <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Full-width sync banner ──────────────────────────────── */
export function SyncBanner({ message = 'Syncing your changes…', onDismiss }) {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      exit={{    y: -40, opacity: 0 }}
      className="fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-2 py-2 bg-brand-600/95 backdrop-blur-sm text-white text-xs font-medium"
    >
      <Loader2 className="h-3 w-3 animate-spin" />
      {message}
    </motion.div>
  )
}
