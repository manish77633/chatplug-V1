import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Zap } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function Navbar({ isAuthenticated }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'glass border-border/100' : 'bg-transparent border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-accent group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="gradient-text">ChatPlug</span>
          </span>
        </Link>

        {/* Desktop Menu - Center */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          <button
            onClick={() => {
              const el = document.getElementById('features')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
              else navigate('/#features')
            }}
            className="text-sm text-text-muted hover:text-text-primary transition-colors relative group"
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('pricing')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
              else navigate('/#pricing')
            }}
            className="text-sm text-text-muted hover:text-text-primary transition-colors relative group"
          >
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
          </button>
          <Link to="/docs" className="text-sm text-text-muted hover:text-text-primary transition-colors relative group">
            Docs
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        {/* Desktop Menu - Right */}
        <div className="hidden md:flex items-center gap-6">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-sm text-text-muted hover:text-text-primary transition-colors">Sign in</Link>
              <Link to="/register">
                <button className="relative px-5 py-2 text-sm font-semibold text-text-primary rounded-xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-secondary opacity-20 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-[1px] bg-surface rounded-xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-secondary blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <span className="relative z-10 group-hover:gradient-text transition-all">Get Started</span>
                </button>
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-text-muted">{user?.email}</span>
              <button onClick={handleLogout} className="text-text-muted hover:text-danger transition-colors p-2 rounded-xl">
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-text-primary">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface glass">
          <div className="px-6 py-4 space-y-4">
            {!isAuthenticated ? (
              <>
                <button onClick={() => { const el = document.getElementById('features'); if (el) el.scrollIntoView({ behavior: 'smooth' }); else navigate('/#features'); setMobileOpen(false) }} className="block text-sm text-text-muted hover:text-text-primary w-full text-left">Features</button>
                <button onClick={() => { const el = document.getElementById('pricing'); if (el) el.scrollIntoView({ behavior: 'smooth' }); else navigate('/#pricing'); setMobileOpen(false) }} className="block text-sm text-text-muted hover:text-text-primary w-full text-left">Pricing</button>
                <Link to="/docs" onClick={() => setMobileOpen(false)} className="block text-sm text-text-muted hover:text-text-primary">Docs</Link>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-text-muted hover:text-text-primary">Sign in</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2 bg-accent rounded-lg text-white font-semibold">Get Started</Link>
              </>
            ) : (
              <>
                <div className="text-sm text-text-muted mb-2">{user?.email}</div>
                <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="w-full text-left text-sm text-danger p-2 rounded-lg transition-colors">
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
