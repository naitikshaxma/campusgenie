import { useState, useEffect, useCallback } from 'react'
import {
  fetchAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  moveAssignment,
} from '@/services/assignments.service'
import { isDemoMode, DEMO_ASSIGNMENTS } from '@/lib/demoData'

/**
 * useAssignments — manages the full assignments state.
 * API-ready: when backend is connected, it fetches real data.
 * Until then, returns empty state with proper loading/error handling.
 */
export function useAssignments() {
  const [assignments, setAssignments] = useState([])
  const [isLoading,   setIsLoading]   = useState(true)
  const [error,       setError]       = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    if (isDemoMode()) {
      setTimeout(() => {
        setAssignments([...DEMO_ASSIGNMENTS])
        setIsLoading(false)
      }, 600) // slight delay to simulate load and allow cinematic intro
      return
    }

    try {
      const data = await fetchAssignments()
      setAssignments(Array.isArray(data) ? data : [])
    } catch (err) {
      // If API is not connected yet, silently fall back to empty state
      if (import.meta.env.DEV) console.info('[useAssignments] API not connected — empty state')
      setAssignments([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (data) => {
    try {
      const created = await createAssignment(data)
      setAssignments((prev) => [created, ...prev])
      return created
    } catch (err) {
      if (import.meta.env.DEV) console.error('[useAssignments] Failed to add assignment:', err)
      throw err
    }
  }, [])

  const update = useCallback(async (id, data) => {
    setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, ...data } : a))
    try {
      await updateAssignment(id, data)
    } catch (err) {
      await load()
      throw err
    }
  }, [load])

  const remove = useCallback(async (id) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id))
    try {
      await deleteAssignment(id)
    } catch (err) {
      await load()
      throw err
    }
  }, [load])

  const move = useCallback(async (id, status) => {
    setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
    try {
      await moveAssignment(id, status)
    } catch (err) {
      await load()
      throw err
    }
  }, [load])

  return { assignments, isLoading, error, refetch: load, add, update, remove, move }
}
