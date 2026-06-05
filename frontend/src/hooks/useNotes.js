import { useState, useEffect, useCallback } from 'react'
import { fetchNotes, createNote, updateNote, deleteNote } from '@/services/notes.service'
import { isDemoMode, DEMO_NOTES } from '@/lib/demoData'

export function useNotes(subjectFilter = 'All') {
  const [notes,     setNotes]     = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    if (isDemoMode()) {
      setNotes([...DEMO_NOTES])
      setIsLoading(false)
      return
    }

    try {
      const params = subjectFilter !== 'All' ? { subject: subjectFilter } : {}
      const data = await fetchNotes(params)
      setNotes(Array.isArray(data) ? data : [])
    } catch {
      if (import.meta.env.DEV) console.info('[useNotes] API not connected — empty state')
      setNotes([])
    } finally {
      setIsLoading(false)
    }
  }, [subjectFilter])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (data) => {
    try {
      const created = await createNote(data)
      setNotes((prev) => [created, ...prev])
      return created
    } catch (err) {
      if (import.meta.env.DEV) console.error('[useNotes] Failed to create note:', err)
      throw err
    }
  }, [])

  const update = useCallback(async (id, data) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n))
    try {
      await updateNote(id, data)
    } catch (err) {
      await load()
      throw err
    }
  }, [load])

  const remove = useCallback(async (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    try {
      await deleteNote(id)
    } catch (err) {
      await load()
      throw err
    }
  }, [load])

  return { notes, isLoading, error, refetch: load, add, update, remove }
}
