import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useAuthStore } from './store/authStore'
import { Toaster } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy loaded pages
const Landing       = lazy(() => import('./pages/Landing'))
const Login         = lazy(() => import('./pages/Login'))
const Register      = lazy(() => import('./pages/Register'))
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const MyChatbots    = lazy(() => import('./pages/MyChatbots'))
const ChatbotDetail = lazy(() => import('./pages/ChatbotDetail'))
const Playground    = lazy(() => import('./pages/Playground'))
const Analytics     = lazy(() => import('./pages/Analytics'))
const Docs          = lazy(() => import('./pages/Docs'))
const DocsApi       = lazy(() => import('./pages/DocsApi'))
const DocsGuides    = lazy(() => import('./pages/DocsGuides'))
const Settings      = lazy(() => import('./pages/Settings'))
const Profile       = lazy(() => import('./pages/Profile'))
const AdminPanel    = lazy(() => import('./pages/AdminPanel'))
const AuthCallback  = lazy(() => import('./pages/AuthCallback'))
import BottomNav     from './components/ui/BottomNav'
import Layout        from './components/Layout'

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="animate-spin text-accent" size={32} />
  </div>
)

const Protected = ({ children }) => {
  const token = useAuthStore(s => s.token) || localStorage.getItem('token')

  // Check token expiry
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return <Navigate to="/login" replace />
      }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return <Navigate to="/login" replace />
    }
  }

  if (!token) return <Navigate to="/login" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const token = useAuthStore(s => s.token) || localStorage.getItem('token')
  if (token) {
    // Check if token is valid
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp * 1000 > Date.now()) {
        return <Navigate to="/dashboard" replace />
      }
    } catch {}
  }
  return children
}

const AdminRoute = ({ children }) => {
  const user = useAuthStore(s => s.user) || JSON.parse(localStorage.getItem('user') || 'null')
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />
}

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  </Suspense>
)

export default function App() {
  const { syncAuth } = useAuthStore()

  // Warm up backend (Render cold start) — fire on mount, silent fail
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || ''
    if (apiBase) {
      fetch(`${apiBase}/health`).catch(() => {})
    }
  }, [])

  useEffect(() => {
    syncAuth()
  }, [syncAuth])

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Public */}
        {/* Landing page — accessible to both guests and logged-in users */}
        <Route path="/"            element={<SuspenseWrapper><Landing /></SuspenseWrapper>} />
        <Route path="/login"       element={<SuspenseWrapper><PublicRoute><Login /></PublicRoute></SuspenseWrapper>} />
        <Route path="/register"    element={<SuspenseWrapper><PublicRoute><Register /></PublicRoute></SuspenseWrapper>} />
        <Route path="/auth/callback" element={<SuspenseWrapper><AuthCallback /></SuspenseWrapper>} />

        {/* Protected */}
        <Route element={<Protected><Layout /></Protected>}>
          <Route path="/docs"                           element={<SuspenseWrapper><Docs /></SuspenseWrapper>} />
          <Route path="/docs/api"                       element={<SuspenseWrapper><DocsApi /></SuspenseWrapper>} />
          <Route path="/docs/guides"                    element={<SuspenseWrapper><DocsGuides /></SuspenseWrapper>} />
          
          <Route path="/dashboard"                      element={<SuspenseWrapper><Dashboard /></SuspenseWrapper>} />
          <Route path="/chatbots"                       element={<SuspenseWrapper><MyChatbots /></SuspenseWrapper>} />
          <Route path="/settings"                       element={<SuspenseWrapper><Settings /></SuspenseWrapper>} />
          <Route path="/profile"                        element={<SuspenseWrapper><Profile /></SuspenseWrapper>} />
          <Route path="/chatbot/:id"                    element={<SuspenseWrapper><ChatbotDetail /></SuspenseWrapper>} />
          <Route path="/chatbot/:id/playground"         element={<SuspenseWrapper><Playground /></SuspenseWrapper>} />
          <Route path="/chatbot/:id/analytics"          element={<SuspenseWrapper><Analytics /></SuspenseWrapper>} />
          <Route path="/analytics"                      element={<SuspenseWrapper><Analytics /></SuspenseWrapper>} />
        </Route>

        {/* Admin */}
        <Route element={<Protected><AdminRoute><Layout /></AdminRoute></Protected>}>
          <Route path="/admin" element={<SuspenseWrapper><AdminPanel /></SuspenseWrapper>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global bottom nav — auto-hides on /login, /register, / */}
      <BottomNav />

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
        }}
      />
    </div>
  )
}