import { useState, useEffect, useCallback } from 'react'
import { fetchAssignmentStats } from '@/services/assignments.service'
import api from '@/services/api'

/**
 * useStats — aggregates dashboard stats from multiple endpoints.
 * Falls back to zeros when API is not connected.
 */
export function useStats() {
  const [stats,     setStats]     = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const [assignmentStats, notesCount, streakData, chatStats] = await Promise.allSettled([
        fetchAssignmentStats(),
        api.get('/notes/count'),
        api.get('/planner/streak'),
        api.get('/chat/stats'),
      ])

      setStats({
        pendingAssignments: assignmentStats.status === 'fulfilled'
          ? assignmentStats.value?.pending ?? 0 : 0,
        notesCount: notesCount.status === 'fulfilled'
          ? notesCount.value?.count ?? 0 : 0,
        aiQueries: chatStats.status === 'fulfilled'
          ? chatStats.value?.totalMessages ?? 0 : 0,
        studyStreak: streakData.status === 'fulfilled'
          ? streakData.value?.streak ?? 0 : 0,
      })
    } catch {
      setStats({ pendingAssignments: 0, notesCount: 0, aiQueries: 0, studyStreak: 0 })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { stats, isLoading, refetch: load }
}
