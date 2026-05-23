import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { Toaster } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

import Landing       from './pages/Landing'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Dashboard     from './pages/Dashboard'
import ChatbotDetail from './pages/ChatbotDetail'
import Playground    from './pages/Playground'
import Analytics     from './pages/Analytics'
import Docs          from './pages/Docs'
import DocsApi       from './pages/DocsApi'
import DocsGuides    from './pages/DocsGuides'
import Settings      from './pages/Settings'
import Profile       from './pages/Profile'
import AdminPanel    from './pages/AdminPanel'
import AuthCallback  from './pages/AuthCallback'
import BottomNav     from './components/ui/BottomNav'
import Layout        from './components/Layout'

const Protected = ({ children }) => {
  const token = useAuthStore(s => s.token) || localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

const AdminRoute = ({ children }) => {
  const user = useAuthStore(s => s.user) || JSON.parse(localStorage.getItem('user') || 'null')
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  const { syncAuth } = useAuthStore()

  useEffect(() => {
    syncAuth()
  }, [syncAuth])

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Public */}
        <Route path="/"            element={<Landing />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected */}
        <Route element={<Protected><Layout /></Protected>}>
          <Route path="/docs"                           element={<Docs />} />
          <Route path="/docs/api"                       element={<DocsApi />} />
          <Route path="/docs/guides"                    element={<DocsGuides />} />
          
          <Route path="/dashboard"                      element={<Dashboard />} />
          <Route path="/chatbots"                       element={<Dashboard />} />
          <Route path="/settings"                       element={<Settings />} />
          <Route path="/profile"                        element={<Profile />} />
          <Route path="/chatbot/:id"                    element={<ChatbotDetail />} />
          <Route path="/chatbot/:id/playground"         element={<Playground />} />
          <Route path="/chatbot/:id/analytics"          element={<Analytics />} />
          <Route path="/analytics"                      element={<Analytics />} />
        </Route>

        {/* Admin */}
        <Route element={<Protected><AdminRoute><Layout /></AdminRoute></Protected>}>
          <Route path="/admin" element={<AdminPanel />} />
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
