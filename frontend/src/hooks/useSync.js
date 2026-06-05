import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * useSync — manages cross-device sync state.
 * In production this would connect to a WebSocket.
 * Architecture is ready for socket.io / SSE integration.
 */
export function useSync() {
  const [isSyncing,        setIsSyncing]        = useState(false)
  const [lastSyncedAt,     setLastSyncedAt]      = useState(null)
  const [deviceConnected,  setDeviceConnected]   = useState(false)
  const [syncStatus,       setSyncStatus]        = useState('idle') // 'idle' | 'syncing' | 'synced' | 'error'
  const socketRef = useRef(null)

  /* Simulate sync heartbeat — replace with real WebSocket */
  const triggerSync = useCallback((label = 'Syncing changes…') => {
    setIsSyncing(true)
    setSyncStatus('syncing')
    setTimeout(() => {
      setIsSyncing(false)
      setLastSyncedAt(new Date())
      setSyncStatus('synced')
    }, 1800)
  }, [])

  /* Simulate device connection — replace with real WS connect */
  const connectDevice = useCallback(() => {
    setDeviceConnected(true)
    triggerSync()
  }, [triggerSync])

  const disconnectDevice = useCallback(() => {
    setDeviceConnected(false)
    setSyncStatus('idle')
  }, [])

  /**
   * initSocket — attach a real WebSocket/socket.io here.
   * @param {string} url - WebSocket server URL
   */
  const initSocket = useCallback((url) => {
    // Ready for: socketRef.current = io(url)
    // socketRef.current.on('sync', (data) => { ... })
    // socketRef.current.on('device_connected', () => setDeviceConnected(true))
    if (import.meta.env.DEV) console.info('[useSync] Socket integration point ready:', url)
  }, [])

  return {
    isSyncing, lastSyncedAt, deviceConnected, syncStatus,
    triggerSync, connectDevice, disconnectDevice, initSocket,
  }
}
