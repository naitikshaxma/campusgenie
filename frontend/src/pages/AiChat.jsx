import { useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen, MessageSquare, Plus } from 'lucide-react'
import { useState } from 'react'
import { useChatSessions } from '@/hooks/useChatSessions'
import ChatBubble, { TypingIndicator } from '@/components/chat/ChatBubble'
import ChatInput from '@/components/chat/ChatInput'
import ChatSidebar from '@/components/chat/ChatSidebar'
import { ChatSkeleton } from '@/components/common/Skeleton'
import EmptyState from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'

export default function AiChat() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef = useRef(null)

  const {
    sessions, activeId, setActiveId,
    messages, isLoading, isMsgLoading, isSending,
    newSession, removeSession, send,
  } = useChatSessions()

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const activeSession = sessions.find((s) => s.id === activeId)

  return (
    <div className="flex h-full -m-4 md:-m-6 overflow-hidden rounded-xl border border-border/60 bg-card">
      {/* History sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && !isLoading && (
          <div className="hidden md:block">
            <ChatSidebar
              sessions={sessions}
              activeId={activeId}
              onSelect={(id) => setActiveId(id)}
              onNew={newSession}
              onDelete={removeSession}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 shrink-0">
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
          <div className="flex-1">
            {isLoading ? (
              <div className="h-4 w-40 rounded bg-muted/60 animate-pulse" />
            ) : (
              <>
                <h3 className="text-sm font-semibold">{activeSession?.title || 'CampusGenie AI'}</h3>
                <p className="text-[10px] text-muted-foreground">{messages.length} messages</p>
              </>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={newSession} className="h-8 text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Chat
          </Button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {isLoading || isMsgLoading ? (
            <ChatSkeleton />
          ) : sessions.length === 0 ? (
            /* No sessions yet */
            <EmptyState
              icon={MessageSquare}
              title="Start your first conversation"
              description="Ask CampusGenie anything — explain concepts, create study plans, summarize notes, and more."
              action={{ label: 'New Chat', onClick: newSession, icon: Plus }}
            />
          ) : messages.length === 0 && activeId ? (
            /* Session selected but no messages */
            <EmptyState
              icon={MessageSquare}
              title="Start this conversation"
              description="Type a question below or pick a suggested prompt to get started."
              size="sm"
            />
          ) : (
            /* Messages */
            <div className="px-4 py-6 space-y-5">
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ))}
              <AnimatePresence>
                {isSending && <TypingIndicator />}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        {(activeId || sessions.length === 0) && (
          <div className="px-4 pb-4 pt-2 border-t border-border/60 shrink-0">
            <ChatInput
              onSend={(text) => {
                if (!activeId) {
                  newSession().then(() => send(text))
                } else {
                  send(text)
                }
              }}
              disabled={isSending}
            />
          </div>
        )}
      </div>
    </div>
  )
}
