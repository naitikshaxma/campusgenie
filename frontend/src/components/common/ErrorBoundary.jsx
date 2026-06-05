import React from 'react'
import { AlertTriangle, RefreshCw, Home, Terminal } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught crash:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  handleGoDashboard = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden font-sans text-foreground">
          {/* Neon Purple Light Leaks */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Glassmorphic Panel */}
          <div className="w-full max-w-md rounded-3xl border border-purple-500/25 bg-slate-900/50 backdrop-blur-xl p-8 shadow-2xl shadow-purple-500/5 text-center space-y-7 relative z-10">
            {/* Cinematic Animated Icon Ring */}
            <div className="flex justify-center">
              <div className="relative flex items-center justify-center h-20 w-20">
                <div className="absolute inset-0 rounded-3xl border border-purple-500/30 animate-pulse" />
                <div className="absolute inset-2 rounded-2xl bg-purple-500/10 border border-purple-500/20" />
                <AlertTriangle className="h-9 w-9 text-purple-400 relative z-10" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">System Crash Intercepted</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                CampusGenie safeguarded your workspace session. We've captured the diagnostics below. Tap reload to restart the view.
              </p>
              
              {this.state.error && (
                <div className="mt-4 text-left rounded-xl border border-purple-500/15 bg-purple-950/20 p-4 font-mono text-[10px] leading-relaxed text-purple-300 overflow-hidden relative">
                  <div className="flex items-center gap-1.5 border-b border-purple-500/10 pb-2 mb-2 text-muted-foreground/80 font-bold uppercase tracking-wider">
                    <Terminal className="h-3.5 w-3.5 text-purple-400" />
                    Diagnostics Log
                  </div>
                  <pre className="max-h-24 overflow-y-auto whitespace-pre-wrap font-mono select-text">
                    {this.state.error.stack || this.state.error.message || String(this.state.error)}
                  </pre>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2 text-xs shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4 animate-spin-slow" />
                Reload Application
              </button>
              <button
                type="button"
                onClick={this.handleGoDashboard}
                className="w-full h-11 rounded-2xl bg-slate-950/40 border border-purple-500/20 hover:bg-slate-900/60 text-purple-300 hover:text-purple-200 font-bold flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.98]"
              >
                <Home className="h-4 w-4" />
                Return to Workspace
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
