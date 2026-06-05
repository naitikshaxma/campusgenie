import { useState, useEffect, useCallback } from 'react'
import {
  fetchSessions, createSession, updateSession,
  deleteSession, generateAiPlan, fetchStreakData,
} from '@/services/planner.service'
import { isDemoMode, DEMO_SESSIONS, DEMO_STUDENT } from '@/lib/demoData'

export function usePlanner() {
  const [sessions,    setSessions]    = useState([])
  const [streak,      setStreak]      = useState(0)
  const [isLoading,   setIsLoading]   = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error,       setError]       = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)

    if (isDemoMode()) {
      setTimeout(() => {
        setSessions([...DEMO_SESSIONS])
        setStreak(DEMO_STUDENT.streak)
        setIsLoading(false)
      }, 600)
      return
    }

    try {
      const [sessionsData, streakData] = await Promise.all([
        fetchSessions(),
        fetchStreakData()
      ])
      setSessions(Array.isArray(sessionsData) ? sessionsData : [])
      setStreak(streakData?.streak ?? 0)
    } catch {
      if (import.meta.env.DEV) console.info('[usePlanner] API not connected — empty state')
      setSessions([])
      setStreak(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (data) => {
    try {
      const created = await createSession(data)
      setSessions((prev) => [...prev, created])
      return created
    } catch (err) {
      if (import.meta.env.DEV) console.error('[usePlanner] Failed to add planner session:', err)
      throw err
    }
  }, [])

  const update = useCallback(async (id, data) => {
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, ...data } : s))
    try {
      const updated = await updateSession(id, data)
      await load()
      return updated
    } catch (err) {
      await load()
      throw err
    }
  }, [load])

  const remove = useCallback(async (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    try {
      await deleteSession(id)
    } catch (err) {
      await load()
      throw err
    }
  }, [load])

  const generatePlan = useCallback(async (params) => {
    setIsGenerating(true)
    try {
      const plan = await generateAiPlan(params)
      // We do not auto-append to state here so the UI can orchestrate the cinematic reveal.
      return plan
    } catch (err) {
      if (import.meta.env.DEV) console.error('[usePlanner] Failed to generate study plan:', err)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return { sessions, setSessions, streak, isLoading, isGenerating, error, refetch: load, add, update, remove, generatePlan }
}
