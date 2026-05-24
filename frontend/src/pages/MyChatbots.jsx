import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Bot, Trash2, Play, X, FileText, Globe,
  Code, ChevronRight, Search, LayoutGrid, List,
  ArrowUpDown, Filter
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'
import FAB from '../components/ui/FAB'
import useDashboardStore from '../store/dashboardStore'

const statusColor = {
  ready:    { bg: 'bg-green-500/10',  text: 'text-green-500',  dot: 'bg-green-500',  label: 'Active' },
  active:   { bg: 'bg-green-500/10',  text: 'text-green-500',  dot: 'bg-green-500',  label: 'Active' },
  training: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', dot: 'bg-yellow-500', label: 'Training' },
  error:    { bg: 'bg-red-500/10',    text: 'text-red-500',    dot: 'bg-red-500',    label: 'Error' },
  draft:    { bg: 'bg-gray-500/10',   text: 'text-gray-400',   dot: 'bg-gray-400',   label: 'Draft' },
}

const FILTERS = ['All', 'Active', 'Training', 'Draft', 'Error']
const SORTS   = [
  { label: 'Newest',   fn: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
  { label: 'Oldest',   fn: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) },
  { label: 'Name A–Z', fn: (a, b) => a.name.localeCompare(b.name) },
  { label: 'Name Z–A', fn: (a, b) => b.name.localeCompare(a.name) },
  { label: 'Most Docs',fn: (a, b) => (b.documents?.length || 0) - (a.documents?.length || 0) },
]

export default function MyChatbots() {
  const { user }   = useAuthStore()
  const token      = useAuthStore(s => s.token) || localStorage.getItem('token')
  const navigate   = useNavigate()
  const { chatbots, isLoading: loading, fetchDashboard, invalidate } = useDashboardStore()

  const [creating,    setCreating]    = useState(false)
  const [newName,     setNewName]     = useState('')
  const [newNameError,setNewNameError]= useState('')
  const [showModal,   setShowModal]   = useState(false)
  const [search,      setSearch]      = useState('')
  const [activeFilter,setActiveFilter]= useState('All')
  const [sortIdx,     setSortIdx]     = useState(0)
  const [gridView,    setGridView]    = useState(true)
  const [showSort,    setShowSort]    = useState(false)

  useEffect(() => { fetchDashboard(token) }, [user?._id])

  const createChatbot = async (e) => {
    e.preventDefault()
    if (!newName.trim()) { setNewNameError('Bot name is required'); return }
    setNewNameError('')
    setCreating(true)
    try {
      const { data } = await api.post('/chatbots', { name: newName, description: '' })
      invalidate(); fetchDashboard(token, true)
      setNewName(''); setShowModal(false)
      toast.success('Chatbot created! 🎉')
      navigate(`/chatbot/${data.chatbot._id}`)
    } catch (err) {
      if (err.response?.status === 403) {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{err.response?.data?.message || 'Plan limit reached'}</span>
            <button onClick={() => { toast.dismiss(t.id); navigate('/settings?tab=billing') }}
              className="px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-lg self-start">
              Upgrade to Pro
            </button>
          </div>
        ), { duration: 5000 })
      } else { toast.error(err.response?.data?.message || 'Failed to create') }
    } finally { setCreating(false) }
  }

  const deleteChatbot = async (id, e) => {
    e.preventDefault(); e.stopPropagation()
    try {
      await api.delete(`/chatbots/${id}`)
      invalidate(); fetchDashboard(token, true)
      toast.success('Chatbot deleted')
    } catch { toast.error('Delete failed') }
  }

  // Filter + search + sort
  const filtered = chatbots
    .filter(bot => {
      const matchSearch = bot.name.toLowerCase().includes(search.toLowerCase())
      const matchFilter = activeFilter === 'All' ||
        (activeFilter === 'Active'   && (bot.status === 'active' || bot.status === 'ready')) ||
        (activeFilter === 'Training' && bot.status === 'training') ||
        (activeFilter === 'Draft'    && bot.status === 'draft') ||
        (activeFilter === 'Error'    && bot.status === 'error')
      return matchSearch && matchFilter
    })
    .sort(SORTS[sortIdx].fn)

  // Stats
  const totalActive = chatbots.filter(b => b.status === 'active' || b.status === 'ready').length
  const totalDocs   = chatbots.reduce((s, b) => s + (b.documents?.length || 0), 0)
  const totalMsgs   = chatbots.reduce((s, b) => s + (b.stats?.totalMessages || 0), 0)

  return (
    <div className="min-h-full bg-background text-text-primary font-inter flex flex-col selection:bg-accent/30">
      <div className="px-2.5 py-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full pb-24 lg:pb-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            My Chatbots
          </motion.h1>
          <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            onClick={() => setShowModal(true)}
            className="hidden sm:flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-accent to-accent-secondary text-white rounded-xl font-semibold shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all hover:-translate-y-0.5 active:scale-95">
            <Plus size={18} /> New Chatbot
          </motion.button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Bots',    value: chatbots.length },
            { label: 'Active',        value: totalActive },
            { label: 'Total Docs',    value: totalDocs },
          ].map((s, i) => (
            <div key={i} className="p-3 sm:p-4 bg-surface border border-border rounded-2xl text-center">
              <p className="text-xl sm:text-2xl font-black text-text-primary">{s.value}</p>
              <p className="text-[11px] text-text-muted font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" placeholder="Search chatbots..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-all text-sm" />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button onClick={() => setShowSort(s => !s)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-muted hover:text-text-primary hover:border-accent/40 transition-colors whitespace-nowrap">
              <ArrowUpDown size={15} /> {SORTS[sortIdx].label}
            </button>
            <AnimatePresence>
              {showSort && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 top-full mt-2 w-40 bg-surface border border-border rounded-xl shadow-xl z-20 overflow-hidden">
                  {SORTS.map((s, i) => (
                    <button key={i} onClick={() => { setSortIdx(i); setShowSort(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${i === sortIdx ? 'text-accent bg-accent/10' : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'}`}>
                      {s.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Grid/List toggle */}
          <div className="flex border border-border rounded-xl overflow-hidden bg-surface">
            <button onClick={() => setGridView(true)}
              className={`flex-1 flex items-center justify-center px-3 py-2.5 transition-colors ${gridView ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-primary'}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setGridView(false)}
              className={`flex-1 flex items-center justify-center px-3 py-2.5 transition-colors ${!gridView ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-primary'}`}>
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === f
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border text-text-muted hover:text-text-primary'}`}>
              {f}
              {f !== 'All' && (
                <span className="ml-1.5 opacity-60">
                  {chatbots.filter(b =>
                    (f === 'Active'   && (b.status === 'active' || b.status === 'ready')) ||
                    (f === 'Training' && b.status === 'training') ||
                    (f === 'Draft'    && b.status === 'draft') ||
                    (f === 'Error'    && b.status === 'error')
                  ).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Chatbots */}
        {loading ? (
          <div className={gridView ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-3'}>
            {[1,2,3].map(i => <div key={i} className="h-56 bg-surface border border-border rounded-3xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full py-16 px-6 bg-surface border border-dashed border-border/80 rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-background border border-border rounded-2xl flex items-center justify-center mb-5">
              <Bot size={32} className="text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {search || activeFilter !== 'All' ? 'No matching chatbots' : 'No chatbots yet'}
            </h3>
            <p className="text-text-muted mb-6 max-w-sm text-sm">
              {search || activeFilter !== 'All'
                ? 'Try different filters or create a new chatbot.'
                : 'Create your first AI assistant in minutes.'}
            </p>
            <button onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-accent text-white rounded-xl font-semibold shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors flex items-center gap-2">
              <Plus size={18} /> Create chatbot
            </button>
          </motion.div>
        ) : gridView ? (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((bot, i) => {
              const colors = statusColor[bot.status] || statusColor.draft
              return (
                <motion.div key={bot._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="group p-5 sm:p-6 bg-surface border border-border hover:border-accent/40 rounded-3xl flex flex-col transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/5">
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
                    <button onClick={(e) => deleteChatbot(bot._id, e)}
                      className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-red-500/10 min-w-[36px] min-h-[36px] flex items-center justify-center">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="flex gap-4 mb-5 pt-4 border-t border-border">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Knowledge</p>
                      <p className="text-sm font-bold text-text-primary">{bot.documents?.length || 0} Docs</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Queries</p>
                      <p className="text-sm font-bold text-text-primary">{bot.stats?.totalMessages || 0}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Status</p>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} text-xs font-bold`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${(bot.status === 'ready' || bot.status === 'active') ? 'animate-pulse' : ''}`} />
                        {colors.label}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <Link to={`/chatbot/${bot._id}`} className="flex-1">
                      <button className="w-full py-2.5 bg-background border border-border hover:border-accent hover:text-accent rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5">
                        Open <ChevronRight size={14} />
                      </button>
                    </Link>
                    <Link to={`/chatbot/${bot._id}/playground`}>
                      <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-background border border-border hover:border-accent hover:text-accent rounded-xl transition-all" title="Playground">
                        <Play size={15} />
                      </button>
                    </Link>
                    <button onClick={() => {
                      const apiBase = import.meta.env.VITE_API_URL || ''
                      const origin = apiBase ? apiBase.replace(/\/api\/?$/, '') : window.location.origin
                      navigator.clipboard.writeText(`<script src="${origin}/embed/${bot.embedId}/widget.js"></script>`)
                      toast.success('Embed snippet copied!')
                    }} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-background border border-border hover:border-accent hover:text-accent rounded-xl transition-all" title="Copy embed">
                      <Code size={15} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          // List View
          <div className="flex flex-col gap-3">
            {filtered.map((bot, i) => {
              const colors = statusColor[bot.status] || statusColor.draft
              return (
                <motion.div key={bot._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center gap-4 p-4 bg-surface border border-border hover:border-accent/40 rounded-2xl transition-all">
                  <div className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center shrink-0 group-hover:border-accent/30 transition-colors">
                    <Bot className="text-accent" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-primary text-sm truncate">{bot.name}</h3>
                    <p className="text-xs text-text-muted">{bot.documents?.length || 0} docs • {bot.stats?.totalMessages || 0} queries • {new Date(bot.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <div className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} text-xs font-bold shrink-0`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} /> {colors.label}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/chatbot/${bot._id}`}>
                      <button className="px-3 py-1.5 bg-background border border-border hover:border-accent hover:text-accent rounded-lg text-xs font-semibold transition-all flex items-center gap-1">
                        Open <ChevronRight size={12} />
                      </button>
                    </Link>
                    <Link to={`/chatbot/${bot._id}/playground`}>
                      <button className="w-8 h-8 flex items-center justify-center bg-background border border-border hover:border-accent hover:text-accent rounded-lg transition-all">
                        <Play size={13} />
                      </button>
                    </Link>
                    <button onClick={(e) => deleteChatbot(bot._id, e)}
                      className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <FAB onClick={() => setShowModal(true)} />

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[50] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="relative z-[51] w-full sm:max-w-md bg-surface border border-border rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl mb-[60px] sm:mb-0">
              <div className="sm:hidden w-10 h-1 bg-border rounded-full mx-auto mb-6" />
              <button onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-2 rounded-lg hover:bg-surface-elevated transition-colors">
                <X size={20} />
              </button>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-5">
                <Bot size={24} className="text-accent" />
              </div>
              <h2 className="text-xl font-bold mb-1.5">Create new chatbot</h2>
              <p className="text-sm text-text-muted mb-6">Give your AI assistant a name to get started.</p>
              <form onSubmit={createChatbot}>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2">Chatbot Name</label>
                  <input type="text" placeholder="e.g. Sales Assistant" autoFocus
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-all text-base"
                    value={newName} onChange={e => { setNewName(e.target.value); setNewNameError('') }} />
                  {newNameError && <p className="mt-2 text-xs text-red-500">{newNameError}</p>}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl border border-border bg-background text-text-primary font-medium hover:bg-surface-elevated transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={creating}
                    className="flex-1 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-70">
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