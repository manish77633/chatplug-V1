import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Check, Zap, User } from 'lucide-react'

const QUOTES = [
  "Deploy AI in 60 seconds",
  "Train on your docs",
  "Embed anywhere"
]

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const validate = () => {
    const newErrors = {}
    if (!form.name) newErrors.name = 'Full name is required'
    if (!form.email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format'
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 6) newErrors.password = 'Must be at least 6 characters'
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    return newErrors
  }

  const handle = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      // Auth to be implemented later
      await register(form.name, form.email, form.password)
      setSuccess(true)
      toast.success('Account created! Welcome 🎉')
      setTimeout(() => navigate('/dashboard'), 600)
    } catch (err) {
      setLoading(false)
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-text-primary selection:bg-accent/30 font-inter">
      {/* ─── LEFT PANEL ─── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden border-r border-border/50">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent rounded-full blur-[140px] opacity-20 mix-blend-screen animate-float" style={{ animationDuration: '8s' }} />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] noise-bg" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group inline-flex">
            <div className="w-12 h-12 bg-surface-elevated border border-border rounded-xl flex items-center justify-center shadow-lg shadow-accent/10 group-hover:scale-105 transition-transform">
              <Zap size={24} className="text-accent" />
            </div>
            <span className="text-3xl font-bold tracking-tight gradient-text">ChatPlug</span>
          </Link>

          <div className="mt-32 h-32 relative">
            <AnimatePresence mode="wait">
              <motion.h2
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-5xl font-black text-text-primary leading-[1.1] absolute inset-0"
              >
                {QUOTES[quoteIndex]}
              </motion.h2>
            </AnimatePresence>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-4 mt-auto">
          {['RAG 2.0 Engine', 'Sub-200ms Latency', 'Unlimited Bots'].map((pill, i) => (
            <div key={i} className="px-4 py-2 rounded-full bg-surface-elevated/50 border border-border/80 backdrop-blur-md flex items-center gap-2 text-sm font-medium text-text-muted">
              <Check size={14} className="text-accent" />
              {pill}
            </div>
          ))}
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-surface">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] noise-bg" />
        
        <div className="w-full max-w-[420px] relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-text-primary mb-2">Create an account</h1>
            <p className="text-text-muted text-base">Start building intelligent chatbots</p>
          </div>

          <motion.form 
            onSubmit={handle} 
            className="space-y-4"
            initial="hidden"
            animate={errors.form ? "shake" : "visible"}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              shake: { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } }
            }}
          >
            {/* Name Field */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <div className={`relative flex items-center bg-background border rounded-xl overflow-hidden transition-all duration-300 ${errors.name ? 'border-danger shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-border focus-within:border-accent focus-within:shadow-[0_0_15px_rgba(108,99,255,0.15)]'}`}>
                <div className="pl-4 pr-2 text-text-muted">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full py-3.5 pr-4 bg-transparent text-text-primary placeholder:text-text-muted/50 focus:outline-none text-sm"
                  value={form.name}
                  onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })) }}
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-danger font-medium pl-1">{errors.name}</p>}
            </motion.div>

            {/* Email Field */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <div className={`relative flex items-center bg-background border rounded-xl overflow-hidden transition-all duration-300 ${errors.email ? 'border-danger shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-border focus-within:border-accent focus-within:shadow-[0_0_15px_rgba(108,99,255,0.15)]'}`}>
                <div className="pl-4 pr-2 text-text-muted">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full py-3.5 pr-4 bg-transparent text-text-primary placeholder:text-text-muted/50 focus:outline-none text-sm"
                  value={form.email}
                  onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })) }}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-danger font-medium pl-1">{errors.email}</p>}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <div className={`relative flex items-center bg-background border rounded-xl overflow-hidden transition-all duration-300 ${errors.password ? 'border-danger shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-border focus-within:border-accent focus-within:shadow-[0_0_15px_rgba(108,99,255,0.15)]'}`}>
                <div className="pl-4 pr-2 text-text-muted">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full py-3.5 bg-transparent text-text-primary placeholder:text-text-muted/50 focus:outline-none text-sm"
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })) }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-4 text-text-muted hover:text-text-primary transition-colors focus:outline-none">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-danger font-medium pl-1">{errors.password}</p>}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <div className={`relative flex items-center bg-background border rounded-xl overflow-hidden transition-all duration-300 ${errors.confirmPassword ? 'border-danger shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-border focus-within:border-accent focus-within:shadow-[0_0_15px_rgba(108,99,255,0.15)]'}`}>
                <div className="pl-4 pr-2 text-text-muted">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className="w-full py-3.5 bg-transparent text-text-primary placeholder:text-text-muted/50 focus:outline-none text-sm"
                  value={form.confirmPassword}
                  onChange={e => { setForm(p => ({ ...p, confirmPassword: e.target.value })); setErrors(p => ({ ...p, confirmPassword: '' })) }}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-danger font-medium pl-1">{errors.confirmPassword}</p>}
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]
                  ${success ? 'bg-success shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-accent to-accent-secondary hover:shadow-[0_0_20px_rgba(108,99,255,0.3)] hover:brightness-110'}
                  ${(loading && !success) ? 'opacity-80 cursor-not-allowed' : ''}
                `}
              >
                {success ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                    <Check size={20} /> Success
                  </motion.div>
                ) : loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <div className="mt-8 mb-8 flex items-center justify-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-text-muted">or continue with</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* OAuth */}
          <button type="button" onClick={() => toast('Coming soon', { icon: '🚧' })} className="w-full py-3.5 bg-background hover:bg-surface-elevated border border-border rounded-xl flex items-center justify-center gap-3 transition-colors text-sm font-medium text-text-primary active:scale-[0.98]">
            <GoogleIcon />
            Google
          </button>

          <p className="mt-8 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent hover:text-accent-secondary transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
