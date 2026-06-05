import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Wifi } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupForm() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [slowNetwork, setSlowNetwork] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setSlowNetwork(false)

    // Show a helpful message if request takes > 5s (Render cold start)
    const slowTimer = setTimeout(() => setSlowNetwork(true), 5000)

    try {
      await signup({ name: form.name, email: form.email, password: form.password })
      clearTimeout(slowTimer)
      navigate('/dashboard')
    } catch (err) {
      clearTimeout(slowTimer)
      setSlowNetwork(false)
      setError(err.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="signup-name">Full name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-name"
            name="name"
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
            className="pl-10"
            autoComplete="off"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="signup-email">Email address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-email"
            name="email"
            type="email"
            placeholder="you@campus.edu"
            value={form.email}
            onChange={handleChange}
            className="pl-10"
            autoComplete="off"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="signup-pass">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-pass"
            name="password"
            type={showPass ? 'text' : 'password'}
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            className="pl-10 pr-10"
            autoComplete="new-password"
            required
          />
          <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="signup-confirm">Confirm password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-confirm"
            name="confirm"
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={handleChange}
            className="pl-10"
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      {/* Slow network hint */}
      {loading && slowNetwork && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2"
        >
          <Wifi className="h-3.5 w-3.5 shrink-0" />
          Server is waking up (free tier). This may take up to 30 seconds — please wait…
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
        >
          {error}
        </motion.p>
      )}

      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {slowNetwork ? 'Server starting up…' : 'Creating account…'}
          </span>
        ) : (
          <>Create account <ArrowRight className="h-4 w-4" /></>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  )
}
