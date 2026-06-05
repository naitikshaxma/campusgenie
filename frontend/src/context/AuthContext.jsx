import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import api from '@/services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  /* ── Hydrate from localStorage and verify with Backend on mount ── */
  useEffect(() => {
    const storedToken = localStorage.getItem('cg_token')
    if (storedToken) {
      setToken(storedToken)
      api.get('/auth/me')
        .then((res) => {
          // res is already unwrapped to data = { user } by our interceptor
          const currentUser = res?.user || res
          setUser(currentUser)
          localStorage.setItem('cg_user', JSON.stringify(currentUser))
        })
        .catch((err) => {
          if (import.meta.env.DEV) console.warn('[AuthContext] Verification failed:', err)
          localStorage.removeItem('cg_token')
          localStorage.removeItem('cg_user')
          setToken(null)
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  /* ── Login via REST API ── */
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    // res is unwrapped to data = { user, accessToken }
    const { user: loggedInUser, accessToken } = res
    
    localStorage.setItem('cg_token', accessToken)
    localStorage.setItem('cg_user',  JSON.stringify(loggedInUser))
    setToken(accessToken)
    setUser(loggedInUser)
    
    return loggedInUser
  }, [])

  /* ── Signup via REST API ── */
  const signup = useCallback(async (signupData) => {
    const res = await api.post('/auth/signup', signupData)
    // res is unwrapped to data = { user, accessToken }
    const { user: registeredUser, accessToken } = res
    
    localStorage.setItem('cg_token', accessToken)
    localStorage.setItem('cg_user',  JSON.stringify(registeredUser))
    setToken(accessToken)
    setUser(registeredUser)
    
    return registeredUser
  }, [])

  /* ── Logout ── */
  const logout = useCallback(() => {
    // Clear localStorage keys
    localStorage.removeItem('cg_token')
    localStorage.removeItem('cg_user')
    localStorage.removeItem('cg_demo_mode')
    localStorage.clear() // Clear all other key states to ensure complete reset

    setToken(null)
    setUser(null)

    // Clear browser Cache Storage
    if (window.caches) {
      window.caches.keys().then((names) => {
        names.forEach((name) => {
          window.caches.delete(name)
        })
      }).catch(() => {})
    }

    // Redirect safely
    window.location.href = '/login'
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      login,
      signup,
      logout,
    }),
    [user, token, loading, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
