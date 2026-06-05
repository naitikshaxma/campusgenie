import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Plus, Trash2, Clock, Pin, PinOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'

export default function ChatSidebar({ sessions, activeId, onSelect, onNew, onDelete }) {
  const [pinnedIds, setPinnedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('pinned_chats')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const togglePin = (id, e) => {
    e.stopPropagation()
    const next = pinnedIds.includes(id) ? pinnedIds.filter(x => x !== id) : [...pinnedIds, id]
    setPinnedIds(next)
    localStorage.setItem('pinned_chats', JSON.stringify(next))
  }

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id)
      const bPinned = pinnedIds.includes(b.id)
      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
  }, [sessions, pinnedIds])

  return (
    <aside className="flex flex-col h-full border-r border-border/60 bg-card/50 w-64 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <h2 className="text-sm font-semibold tracking-tight">Chat History</h2>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onNew}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400 hover:bg-brand-500/25 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </motion.button>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 no-scrollbar">
        {sortedSessions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No chats yet. Start a new one!</p>
          </div>
        )}
        {sortedSessions.map((session) => {
          const isPinned = pinnedIds.includes(session.id)
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'group flex items-start gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200 border relative',
                activeId === session.id
                  ? 'bg-brand-500/15 border-brand-500/25 shadow-sm'
                  : 'hover:bg-accent border-transparent',
              )}
              onClick={() => onSelect(session.id)}
            >
              <MessageSquare className={cn(
                'h-3.5 w-3.5 mt-0.5 shrink-0',
                activeId === session.id ? 'text-brand-400' : 'text-muted-foreground',
              )} />
              
              <div className="flex-1 min-w-0 text-left">
                <p className={cn(
                  'text-xs font-semibold truncate leading-snug flex items-center gap-1.5',
                  activeId === session.id ? 'text-brand-400' : 'text-foreground',
                )}>
                  {session.title}
                  {isPinned && <Pin className="h-2.5 w-2.5 text-brand-400 fill-brand-400 rotate-45 shrink-0" />}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="h-2.5 w-2.5 text-muted-foreground/50" />
                  <span className="text-[10px] text-muted-foreground/60">{timeAgo(session.updatedAt)}</span>
                </div>
              </div>

              {/* Pin & Delete button container */}
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-0.5">
                <button
                  onClick={(e) => togglePin(session.id, e)}
                  className="text-muted-foreground hover:text-brand-400 transition-colors"
                  title={isPinned ? 'Unpin Chat' : 'Pin Chat'}
                >
                  <Pin className={cn("h-3 w-3", isPinned && "text-brand-400 fill-brand-400")} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(session.id) }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete Chat"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </aside>
  )
}
