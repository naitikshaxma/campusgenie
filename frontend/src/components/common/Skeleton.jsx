import { cn } from '@/lib/utils'

/* ── Base shimmer ──────────────────────────────────────────── */
function ShimmerBox({ className }) {
  return (
    <div className={cn(
      'rounded-lg bg-muted/60 relative overflow-hidden',
      'before:absolute before:inset-0',
      'before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
      'before:animate-shimmer before:bg-[length:200%_100%]',
      className,
    )} />
  )
}

/* ── Dashboard stat card skeleton ─────────────────────────── */
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <ShimmerBox className="h-10 w-10 rounded-xl" />
      <ShimmerBox className="h-7 w-16" />
      <ShimmerBox className="h-3 w-20" />
    </div>
  )
}

/* ── List item skeleton ────────────────────────────────────── */
export function ListItemSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-3">
          <ShimmerBox className="h-4 w-4 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <ShimmerBox className="h-3.5 w-3/4" />
            <ShimmerBox className="h-3 w-1/3" />
          </div>
          <ShimmerBox className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/* ── Card grid skeleton ────────────────────────────────────── */
export function CardGridSkeleton({ count = 6, cols = 3 }) {
  return (
    <div className={cn(
      'grid gap-4',
      cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <ShimmerBox className="h-8 w-8 rounded-lg" />
            <ShimmerBox className="h-4 flex-1" />
          </div>
          <ShimmerBox className="h-3 w-full" />
          <ShimmerBox className="h-3 w-4/5" />
          <ShimmerBox className="h-3 w-2/3" />
          <div className="flex gap-2 pt-1">
            <ShimmerBox className="h-5 w-16 rounded-full" />
            <ShimmerBox className="h-5 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Chat message skeleton ─────────────────────────────────── */
export function ChatSkeleton() {
  return (
    <div className="space-y-6 px-4 py-6">
      {[false, true, false, true].map((isUser, i) => (
        <div key={i} className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
          <ShimmerBox className="h-8 w-8 shrink-0 rounded-full" />
          <div className={cn('space-y-1.5 max-w-[70%]', isUser && 'items-end')}>
            <ShimmerBox className={cn('h-10 rounded-2xl', isUser ? 'w-48' : 'w-64')} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Kanban column skeleton ────────────────────────────────── */
export function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[3, 2, 1].map((count, ci) => (
        <div key={ci} className="rounded-xl border border-border bg-surface-100/50 p-3 space-y-3">
          <div className="flex items-center gap-2 px-1 py-2">
            <ShimmerBox className="h-2.5 w-2.5 rounded-full" />
            <ShimmerBox className="h-4 w-24" />
          </div>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <ShimmerBox className="h-4 w-4/5" />
              <ShimmerBox className="h-3 w-full" />
              <ShimmerBox className="h-3 w-3/5" />
              <div className="flex gap-2">
                <ShimmerBox className="h-5 w-16 rounded-full" />
                <ShimmerBox className="h-5 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/* ── Weekly planner skeleton ───────────────────────────────── */
export function PlannerSkeleton() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-8 gap-1 mb-2">
        <ShimmerBox className="h-8" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <ShimmerBox className="h-3 w-8" />
            <ShimmerBox className="h-6 w-8 rounded-lg" />
          </div>
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid grid-cols-8 gap-1">
          <ShimmerBox className="h-12" />
          {Array.from({ length: 7 }).map((_, j) => (
            <ShimmerBox key={j} className="h-12 rounded-sm" style={{ opacity: Math.random() > 0.7 ? 0.6 : 0.2 }} />
          ))}
        </div>
      ))}
    </div>
  )
}
