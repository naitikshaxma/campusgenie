import { useState, useEffect, useCallback } from 'react'
import {
  fetchSessions, createSession, deleteSession, fetchMessages, sendMessage,
} from '@/services/chat.service'

export function useChatSessions() {
  const [sessions,      setSessions]      = useState([])
  const [activeId,      setActiveId]      = useState(null)
  const [messages,      setMessages]      = useState([])
  const [isLoading,     setIsLoading]     = useState(true)
  const [isMsgLoading,  setIsMsgLoading]  = useState(false)
  const [isSending,     setIsSending]     = useState(false)

  /* Load sessions */
  const loadSessions = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchSessions()
      const list = Array.isArray(data) ? data : []
      setSessions(list)
      if (list.length > 0 && !activeId) setActiveId(list[0].id)
    } catch {
      if (import.meta.env.DEV) console.info('[useChatSessions] API not connected')
      setSessions([])
    } finally {
      setIsLoading(false)
    }
  }, [activeId])

  useEffect(() => { loadSessions() }, []) // eslint-disable-line

  /* Load messages when session changes */
  useEffect(() => {
    if (!activeId) return
    setIsMsgLoading(true)
    setMessages([])
    fetchMessages(activeId)
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]))
      .finally(() => setIsMsgLoading(false))
  }, [activeId])

  const newSession = useCallback(async () => {
    try {
      const session = await createSession()
      setSessions((prev) => [session, ...prev])
      setActiveId(session.id)
      setMessages([])
      return session
    } catch {
      const local = { id: `local_${Date.now()}`, title: 'New conversation', updatedAt: new Date().toISOString() }
      setSessions((prev) => [local, ...prev])
      setActiveId(local.id)
      setMessages([])
      return local
    }
  }, [])

  const removeSession = useCallback(async (id) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id)
      if (activeId === id && remaining.length > 0) setActiveId(remaining[0].id)
      if (remaining.length === 0) { setActiveId(null); setMessages([]) }
      return remaining
    })
    try { await deleteSession(id) } catch { /* silent */ }
  }, [activeId])

  const send = useCallback(async (content) => {
    if (!activeId || !content.trim()) return

    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsSending(true)

    try {
      const aiMsg = await sendMessage(activeId, content)
      setMessages((prev) => [...prev, { ...aiMsg, id: aiMsg.id || `a_${Date.now()}` }])
    } catch {
      setMessages((prev) => [...prev, {
        id: `err_${Date.now()}`,
        role: 'ai',
        content: 'Sorry, I could not connect to the AI server. Please check your API configuration.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        isError: true,
      }])
    } finally {
      setIsSending(false)
    }
  }, [activeId])

  return {
    sessions, activeId, setActiveId,
    messages, isLoading, isMsgLoading, isSending,
    newSession, removeSession, send,
  }
}
