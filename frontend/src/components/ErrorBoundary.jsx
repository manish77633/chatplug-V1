import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Allow per-page fallback
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Something went wrong</h2>
          <p className="text-text-muted mb-8 max-w-sm">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-accent text-white rounded-xl font-semibold shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} /> Refresh Page
          </button>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="mt-6 max-w-lg text-left">
              <summary className="text-sm text-text-muted cursor-pointer">Error details</summary>
              <pre className="mt-2 p-4 bg-surface border border-border rounded-xl text-xs text-red-400 overflow-auto">
                {this.state.error.stack || this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}