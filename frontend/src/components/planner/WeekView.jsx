import { motion } from 'framer-motion'
import { cn, getSubjectColor } from '@/lib/utils'
import TaskItem from './TaskItem'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am – 8pm

export default function WeekView({ weekDates, sessions, onSlotClick, onSessionClick }) {
  const today = new Date()

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Day headers */}
        <div className="grid grid-cols-8 gap-px mb-1">
          {/* Time gutter */}
          <div className="text-xs text-muted-foreground text-right pr-2 py-2" />

          {weekDates.map((date, i) => {
            const isToday = date.toDateString() === today.toDateString()
            return (
              <div key={i} className={cn(
                'text-center py-2 rounded-lg',
                isToday && 'bg-brand-500/10',
              )}>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{DAYS[date.getDay()]}</div>
                <div className={cn(
                  'text-base font-bold leading-none mt-0.5',
                  isToday ? 'text-brand-400' : 'text-foreground',
                )}>
                  {date.getDate()}
                </div>
                {isToday && (
                  <div className="h-1 w-1 rounded-full bg-brand-500 mx-auto mt-1" />
                )}
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div className="relative border border-border/60 rounded-xl overflow-hidden">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-px border-b border-border/30 last:border-b-0">
              {/* Time label */}
              <div className="text-[10px] text-muted-foreground/60 text-right pr-2 pt-2 min-h-[52px] bg-card/30">
                {hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? 'am' : 'pm'}
              </div>

              {/* Day columns */}
              {weekDates.map((date, di) => {
                const isToday = date.toDateString() === today.toDateString()
                const daySessions = sessions.filter((s) => {
                  const sd = new Date(s.date)
                  return sd.toDateString() === date.toDateString() && sd.getHours() === hour
                })

                return (
                  <div
                    key={di}
                    className={cn(
                      'relative min-h-[52px] cursor-pointer transition-colors duration-150',
                      isToday ? 'bg-brand-500/5' : 'bg-card/30',
                      'hover:bg-brand-500/10',
                    )}
                    onClick={() => onSlotClick(date, hour)}
                  >
                    {daySessions.map((session) => {
                      const sc = getSubjectColor(session.subject)
                      return (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            'absolute inset-1 rounded-md px-1.5 py-1 cursor-pointer text-[10px] font-medium leading-tight',
                            'border',
                            sc.bg, sc.text, sc.border,
                          )}
                          onClick={(e) => { e.stopPropagation(); onSessionClick(session) }}
                        >
                          <div className="font-semibold truncate">{session.subject}</div>
                          <div className="opacity-70">{session.duration}h</div>
                        </motion.div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
