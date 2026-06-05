import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

/**
 * PlannerErrorBoundary
 * Wraps the Study Planner page. If any child widget crashes,
 * shows a graceful fallback instead of a blank screen.
 * The sidebar and layout remain alive.
 */
export default class PlannerErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[PlannerErrorBoundary] Caught crash:', error, info)
  }

  handleReset() {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-7 w-7 text-amber-400" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h2 className="text-base font-bold text-foreground">Planner Widget Crashed</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A planner component encountered an unexpected error. Your data is safe.
              Try reloading the planner.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-[10px] bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-3 overflow-x-auto text-destructive/80">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={() => this.handleReset()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold hover:bg-brand-500/20 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reload Planner
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
