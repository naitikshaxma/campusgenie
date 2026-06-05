import { useRef, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageSquare, Plus, Sparkles, BookOpen, Brain, Lightbulb } from 'lucide-react'
import { useChatSessions } from '@/hooks/useChatSessions'
import ChatBubble, { TypingIndicator } from '@/components/chat/ChatBubble'
import ChatInput from '@/components/chat/ChatInput'
import ChatSidebar from '@/components/chat/ChatSidebar'
import { ChatSkeleton } from '@/components/common/Skeleton'
import { Button } from '@/components/ui/button'

const QUICK_PROMPTS = [
  { label: 'Explain a concept', icon: Brain },
  { label: 'Create study plan', icon: BookOpen },
  { label: 'Summarize notes', icon: Sparkles },
  { label: 'Quiz me', icon: Lightbulb },
]

export default function AiChat() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef(null)

  const {
    sessions, activeId, setActiveId,
    messages, isLoading, isMsgLoading, isSending,
    newSession, removeSession, send,
  } = useChatSessions()

  /* Auto-scroll to latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const activeSession = sessions?.find((s) => s?.id === activeId)
  const hasMessages = Array.isArray(messages) && messages.length > 0

  const handleSend = (text) => {
    if (!text?.trim()) return
    if (!activeId) {
      newSession().then(() => send(text))
    } else {
      send(text)
    }
  }

  const handleQuickPrompt = (label) => handleSend(label)

  return (
    /* Full-height flex column — no negative margins on mobile */
    <div className="flex h-full -m-4 md:-m-6 overflow-hidden rounded-xl border border-border/60 bg-card flex-col">

      {/* Desktop history sidebar (hidden on mobile) */}
      <AnimatePresence initial={false}>
        {sidebarOpen && !isLoading && (
          <div className="hidden md:flex">
            <ChatSidebar
              sessions={sessions ?? []}
              activeId={activeId}
              onSelect={setActiveId}
              onNew={newSession}
              onDelete={removeSession}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Chat area wrapper */}
      <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 shrink-0">
          {/* Desktop sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle sidebar"
          >
            <MessageSquare className="h-4 w-4" />
          </button>

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="h-4 w-40 rounded bg-muted/60 animate-pulse" />
            ) : (
              <>
                <h1 className="text-sm font-bold truncate">{activeSession?.title || 'CampusGenie AI'}</h1>
                <p className="text-[10px] text-muted-foreground">{(messages ?? []).length} messages</p>
              </>
            )}
          </div>

          <Button size="sm" variant="ghost" onClick={newSession} className="h-8 text-xs gap-1.5 shrink-0">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>

        {/* Scrollable messages */}
        <div className="flex-1 overflow-y-auto mobile-scroll">
          {isLoading || isMsgLoading ? (
            <ChatSkeleton />
          ) : !sessions?.length ? (
            /* Welcome state */
            <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center space-y-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="h-20 w-20 rounded-3xl gradient-bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.4)]"
              >
                <Sparkles className="h-10 w-10 text-white" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-xl font-black">Ask me anything</h2>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  I can explain concepts, create study plans, summarize your notes, and quiz you.
                </p>
              </div>
              {/* Quick prompt chips */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                {QUICK_PROMPTS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => handleQuickPrompt(label)}
                    className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/50 px-3 py-3 text-left text-xs font-medium hover:bg-accent transition-colors touch-target"
                  >
                    <Icon className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : !hasMessages && activeId ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center space-y-3">
              <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Start this conversation below</p>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-4">
              {(messages ?? []).map((msg) => msg && (
                <ChatBubble
                  key={msg.id ?? msg._id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp ?? msg.createdAt}
                />
              ))}
              <AnimatePresence>
                {isSending && <TypingIndicator />}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Sticky Chat Input — always visible */}
        {(activeId || !sessions?.length) && (
          <div className="shrink-0 px-3 pb-3 pt-2 border-t border-border/60">
            <ChatInput onSend={handleSend} disabled={isSending} />
          </div>
        )}
      </div>
    </div>
  )
}
