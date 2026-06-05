import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-background p-6">
          <div className="w-full max-w-sm text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The app encountered an unexpected error. Tap below to recover.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <pre className="mt-3 text-left text-[10px] text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full h-12 rounded-2xl gradient-bg-primary text-white font-semibold flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={() => { window.location.href = '/dashboard' }}
                className="w-full h-12 rounded-2xl bg-card border border-border text-foreground font-semibold flex items-center justify-center gap-2 text-sm"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
