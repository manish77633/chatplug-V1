import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Bot, Trash2, Play, BarChart3, Settings, Zap, Calendar,
  Menu, X, LayoutDashboard, FileText, Globe, MessageSquare,
  Sparkles, Code, LogOut, ChevronRight, Bell, User
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'
import FAB from '../components/ui/FAB'

// CountUp component for animating numbers
function CountUp({ end }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = null
    const duration = 1500
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * end))
      if (progress < 1) window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
  }, [end])
  return <span>{count}</span>
}



export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [chatbots, setChatbots] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newNameError, setNewNameError] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchChatbots() }, [])

  const fetchChatbots = async () => {
    try {
      const { data } = await api.get('/chatbots')
      setChatbots(data.chatbots)
    } catch { toast.error('Failed to load chatbots') }
    finally { setLoading(false) }
  }

  const createChatbot = async (e) => {
    e.preventDefault()
    if (!newName.trim()) {
      setNewNameError('Bot name is required')
      return
    }
    setNewNameError('')
    setCreating(true)
    try {
      const { data } = await api.post('/chatbots', { name: newName, description: '' })
      setChatbots(p => [data.chatbot, ...p])
      setNewName('')
      setShowModal(false)
      toast.success('Chatbot created! 🎉')
      navigate(`/chatbot/${data.chatbot._id}`)
    } catch (err) {
      if (err.response?.status === 403) {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{err.response?.data?.message || 'Plan limit reached'}</span>
            <button 
              onClick={() => { toast.dismiss(t.id); navigate('/settings?tab=billing'); }}
              className="px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-lg self-start"
            >
              Upgrade to Pro
            </button>
          </div>
        ), { duration: 5000 });
      } else {
        toast.error(err.response?.data?.message || 'Failed to create')
      }
    } finally { setCreating(false) }
  }

  const deleteChatbot = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.delete(`/chatbots/${id}`)
      setChatbots(p => p.filter(c => c._id !== id))
      toast.success('Chatbot deleted')
    } catch { toast.error('Delete failed') }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const userName = user?.name || user?.email?.split('@')[0] || 'User'
  const greeting = `${getGreeting()}, ${userName} 👋`

  const stats = [
    { label: 'Total Chatbots', value: chatbots.length, icon: Bot, color: 'text-accent', border: 'border-l-accent', trend: '+2' },
    { label: 'Total Queries', value: chatbots.reduce((s, b) => s + (b.stats?.totalMessages || 0), 0), icon: MessageSquare, color: 'text-accent-secondary', border: 'border-l-accent-secondary', trend: '+14%' },
    { label: 'Docs Uploaded', value: chatbots.reduce((s, b) => s + (b.documents?.length || 0), 0), icon: FileText, color: 'text-purple-400', border: 'border-l-purple-400', trend: '+5' },
    { label: 'Active Embeds', value: chatbots.filter(b => b.status === 'ready').length, icon: Globe, color: 'text-blue-400', border: 'border-l-blue-400', trend: 'Stable' },
  ]

  const statusColor = {
    ready:    { bg: 'bg-green-500/10',  text: 'text-green-500',  dot: 'bg-green-500',  label: 'Active' },
    training: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', dot: 'bg-yellow-500', label: 'Training' },
    error:    { bg: 'bg-red-500/10',    text: 'text-red-500',    dot: 'bg-red-500',    label: 'Error' },
    draft:    { bg: 'bg-gray-500/10',   text: 'text-gray-400',   dot: 'bg-gray-400',   label: 'Draft' },
  }

  return (
    <div className="min-h-full bg-background text-text-primary font-inter flex flex-col selection:bg-accent/30 selection:text-text-primary">
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] noise-bg" />

        <div className="px-2.5 py-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full relative z-10 pb-24 lg:pb-10">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-text-primary"
            >
              {greeting}
            </motion.h1>
            {/* Desktop "New Chatbot" button — FAB handles mobile */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              id="desktop-new-chatbot-btn"
              onClick={() => setShowModal(true)}
              className="hidden sm:flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-accent to-accent-secondary text-white rounded-xl font-semibold shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} /> New Chatbot
            </motion.button>
          </div>

          {/* Stats Row — horizontal scroll snap on mobile, 4-col on desktop */}
          <div className="mb-8 sm:mb-12">
            {/* Mobile: snap scroll */}
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide sm:hidden -mx-2.5 px-2.5">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`snap-start shrink-0 w-40 p-4 bg-surface border border-border rounded-2xl border-l-4 ${stat.border} relative overflow-hidden`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <stat.icon size={16} className={stat.color} />
                    <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                      {stat.trend}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-text-primary leading-none mb-1">
                    <CountUp end={stat.value} />
                  </h3>
                  <p className="text-xs text-text-muted font-medium leading-tight">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Tablet/Desktop: grid */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`p-5 sm:p-6 bg-surface border border-border border-l-4 ${stat.border} rounded-2xl relative overflow-hidden group hover:border-l-4 transition-colors`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl bg-background border border-border ${stat.color}`}>
                      <stat.icon size={18} />
                    </div>
                    <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-md flex items-center gap-1">
                      {stat.trend} ↑
                    </span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-text-primary mb-1">
                      <CountUp end={stat.value} />
                    </h3>
                    <p className="text-sm text-text-muted font-medium">{stat.label}</p>
                  </div>
                  <div className="absolute -bottom-4 -right-4 text-border opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:scale-110 duration-500 pointer-events-none">
                    <stat.icon size={80} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chatbots Grid */}
          <div className="mb-10" id="chatbots-section">
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-5 flex items-center gap-2">
              <Bot className="text-accent" size={20} /> My Chatbots
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-56 bg-surface border border-border rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : chatbots.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full py-16 px-6 bg-surface border border-dashed border-border/80 rounded-3xl flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 bg-background border border-border rounded-2xl flex items-center justify-center mb-5 shadow-xl">
                  <Bot size={32} className="text-accent" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">No chatbots yet</h3>
                <p className="text-text-muted mb-6 max-w-sm text-sm sm:text-base">Create your first AI assistant and train it on your documentation in minutes.</p>
                <button
                  id="empty-state-create-btn"
                  onClick={() => setShowModal(true)}
                  className="px-6 py-3 bg-accent text-white rounded-xl font-semibold shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} /> Create your first chatbot
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {chatbots.map((bot, i) => {
                  const colors = statusColor[bot.status] || statusColor.draft
                  return (
                    <motion.div
                      key={bot._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="group p-5 sm:p-6 bg-surface border border-border hover:border-accent/40 rounded-3xl flex flex-col transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/5 relative"
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-background border border-border rounded-xl flex items-center justify-center group-hover:border-accent/30 transition-colors">
                            <Bot className="text-accent" size={22} />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-text-primary line-clamp-1">{bot.name}</h3>
                            <p className="text-xs text-text-muted">Created {new Date(bot.createdAt || Date.now()).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button
                          id={`delete-bot-${bot._id}`}
                          onClick={(e) => deleteChatbot(bot._id, e)}
                          className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-red-500/10 min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="flex gap-4 mb-5 pt-4 border-t border-border">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Knowledge</p>
                          <p className="text-sm font-bold text-text-primary">{bot.documents?.length || 0} Docs</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Status</p>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} text-xs font-bold`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${bot.status === 'ready' ? 'animate-pulse' : ''}`} />
                            {colors.label}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-auto">
                        <Link to={`/chatbot/${bot._id}`} className="flex-1" id={`open-bot-${bot._id}`}>
                          <button className="w-full py-2.5 bg-background border border-border hover:border-accent hover:text-accent rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5">
                            Open <ChevronRight size={14} />
                          </button>
                        </Link>
                        <Link to={`/chatbot/${bot._id}/playground`} id={`play-bot-${bot._id}`}>
                          <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-background border border-border hover:border-accent hover:text-accent rounded-xl transition-all" title="Open Playground">
                            <Play size={15} />
                          </button>
                        </Link>
                        <button
                          id={`copy-embed-${bot._id}`}
                          onClick={() => {
                            const apiBase = import.meta.env.VITE_API_URL || ''
                            const origin = apiBase ? apiBase.replace(/\/api\/?$/, '') : window.location.origin
                            const snippet = `<script src="${origin}/embed/${bot.embedId}/widget.js"></script>`
                            navigator.clipboard.writeText(snippet)
                            toast.success('Embed snippet copied!')
                          }}
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-background border border-border hover:border-accent hover:text-accent rounded-xl transition-all"
                          title="Copy embed snippet"
                        >
                          <Code size={15} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          {chatbots.length > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-5 flex items-center gap-2">
                <Calendar className="text-accent-secondary" size={20} /> Recent Activity
              </h2>
              <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6">
                <div className="space-y-5">
                  {[
                    { action: 'Chatbot created successfully', time: '2 hours ago', icon: Plus, color: 'text-accent', bg: 'bg-accent/10' },
                    { action: 'Knowledge base synced',        time: '5 hours ago', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { action: 'Widget embedded on production', time: '1 day ago',  icon: Globe, color: 'text-green-400', bg: 'bg-green-400/10' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                        <item.icon size={14} className={item.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">{item.action}</p>
                        <p className="text-xs text-text-muted">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      {/* ─── FLOATING ACTION BUTTON (mobile only, above bottom nav) ─── */}
      <FAB onClick={() => setShowModal(true)} />

      {/* ─── CREATE MODAL ─── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[50] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="relative z-[51] w-full sm:max-w-md bg-surface border border-border rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[calc(100dvh-60px)] sm:max-h-[90vh] overflow-y-auto mb-[60px] sm:mb-0"
            >
              {/* Drag handle for mobile */}
              <div className="sm:hidden w-10 h-1 bg-border rounded-full mx-auto mb-6" />
              <button
                id="modal-close-btn"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-2 rounded-lg hover:bg-surface-elevated transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-5">
                <Bot size={24} className="text-accent" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-1.5">Create new chatbot</h2>
              <p className="text-sm text-text-muted mb-6">Give your AI assistant a name to get started.</p>

              <form onSubmit={createChatbot}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-text-primary mb-2">Chatbot Name</label>
                  <input
                    type="text"
                    id="new-chatbot-name-input"
                    placeholder="e.g. Sales Assistant"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] transition-all text-base"
                    value={newName}
                    onChange={e => { setNewName(e.target.value); setNewNameError('') }}
                    autoFocus
                  />
                  {newNameError && <p className="mt-2 text-xs text-red-500">{newNameError}</p>}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    id="modal-cancel-btn"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-border bg-background text-text-primary font-medium hover:bg-surface-elevated transition-colors min-h-[48px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="modal-create-btn"
                    disabled={creating}
                    className="flex-1 py-3 px-4 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-70"
                  >
                    {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
