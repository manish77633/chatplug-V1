import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3, Clock, MessageSquare, Bot, ChevronLeft, ArrowUp, ArrowDown,
  ChevronUp, ChevronDown, ChevronLeft as ChevronLeftIcon, ChevronRight, Filter, AlertCircle, FileText, Globe, BookOpen
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'
import api from '../utils/api'
import useAnalyticsStore from '../store/analyticsStore'
import { useAuthStore } from '../store/authStore'

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

function SkeletonCard() {
  return (
    <div className="p-5 md:p-6 bg-surface border border-border rounded-2xl animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 md:p-3 rounded-xl bg-surface-elevated w-11 h-11" />
        <div className="w-14 h-5 bg-surface-elevated rounded-md" />
      </div>
      <div className="w-20 h-7 bg-surface-elevated rounded-lg mb-1" />
      <div className="w-16 h-4 bg-surface-elevated rounded-md" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="bg-surface border border-border rounded-3xl p-5 md:p-6 animate-pulse">
      <div className="w-40 h-5 bg-surface-elevated rounded-lg mb-6" />
      <div className="h-[250px] md:h-[300px] bg-surface-elevated rounded-xl" />
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-sm font-semibold text-text-muted mb-1">{label}</p>
        <p className="text-lg font-bold text-text-primary">
          {payload[0].value} <span className="text-sm font-medium text-text-muted">queries</span>
        </p>
      </div>
    )
  }
  return null
}

// ─── Pagination Component ──────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, totalItems, onPageChange }) {
  if (totalPages <= 1) return null

  // Show max 5 page numbers at a time
  let startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(totalPages, startPage + 4)
  if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4)

  const pages = []
  for (let i = startPage; i <= endPage; i++) pages.push(i)

  const startItem = (currentPage - 1) * 10 + 1
  const endItem = Math.min(currentPage * 10, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border">
      <p className="text-xs text-text-muted">
        Showing {startItem}–{endItem} of {totalItems} questions
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-w-[36px] min-h-[36px] flex items-center justify-center"
        >
          <ChevronLeftIcon size={16} />
        </button>

        {startPage > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors min-w-[36px] min-h-[36px]">1</button>
            {startPage > 2 && <span className="px-1 text-text-muted text-xs">...</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-w-[36px] min-h-[36px] ${
              p === currentPage
                ? 'bg-accent text-white'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
            }`}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-text-muted text-xs">...</span>}
            <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors min-w-[36px] min-h-[36px]">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-w-[36px] min-h-[36px] flex items-center justify-center"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Colors for pie/donut charts ─────────────────────────────────────────────
const PIE_COLORS = ['#6C63FF', '#00D9C0', '#FFB800', '#FF6B6B', '#4ECDC4', '#45B7D1'];

export default function Analytics() {
  const { id } = useParams()
  const backTo   = id ? `/chatbot/${id}` : '/dashboard'
  const backLabel = id ? 'Chatbot' : 'Dashboard'
  
  const { stats: storeStats, isLoading, fetchAnalytics } = useAnalyticsStore()
  const token = useAuthStore(s => s.token) || localStorage.getItem('token')
  const [error, setError] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')
  
  // Real data state
  const [chartData, setChartData] = useState([])
  const [topQuestions, setTopQuestions] = useState([])
  const [botList, setBotList] = useState([])
  const [botQueries, setBotQueries] = useState([])   // for bar chart
  const [docTypeData, setDocTypeData] = useState([])  // for pie chart
  const [chartsLoading, setChartsLoading] = useState(false)
  
  const [sortConfig, setSortConfig] = useState({ key: 'count', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Fetch analytics stats on mount
  useEffect(() => {
    fetchAnalytics(token)
  }, [])

  // Background refresh every 3 min
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics(token, false)
    }, 3 * 60 * 1000)
    return () => clearInterval(interval)
  }, [token])

  const [showFilter, setShowFilter] = useState(false)
  const [botFilter, setBotFilter] = useState('All')
  
  // Build stats array from store
  const stats = storeStats
    ? [
        { label: 'Total Queries', value: storeStats?.totalMessages ?? 0, icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/10', trend: '+12.5%' },
        { label: 'Avg Response Time', value: storeStats?.avgTime ?? 0, suffix: 'ms', icon: Clock, color: 'text-accent-secondary', bg: 'bg-accent-secondary/10', trend: '-5.2%' },
        { label: 'Total Sessions', value: storeStats?.totalSessions ?? 0, icon: Bot, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '+1' },
        { label: 'User Satisfaction', value: storeStats?.satisfaction ?? 0, suffix: '%', icon: BarChart3, color: 'text-green-400', bg: 'bg-green-400/10', trend: '+2.1%' },
      ]
    : null

  // Fetch charts data (area chart)
  useEffect(() => {
    const fetchCharts = async () => {
      setChartsLoading(true)
      try {
        const res = await api.get(`/analytics/messages?range=${timeRange}${botFilter !== 'All' ? `&botId=${botFilter}` : ''}`)
        const raw = res.data?.chartData || []
        const normalized = raw.map(d => ({
          name: d.name || (d.date ? new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }) : ''),
          date: d.date || null,
          queries: Number(d.queries) || 0,
        }))
        setChartData(normalized)
      } catch {
        setChartData([])
      } finally {
        setChartsLoading(false)
      }
    }
    fetchCharts()
  }, [timeRange, botFilter])

  // Fetch top questions with pagination
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const page = currentPage
        const res = await api.get(`/analytics/top-questions?botId=${botFilter === 'All' ? '' : botFilter}&page=${page}&limit=10`)
        setTopQuestions(res.data.questions || [])
        setTotalQuestions(res.data.total || 0)
        setTotalPages(res.data.totalPages || 0)
      } catch {
        setTopQuestions([])
        setTotalQuestions(0)
        setTotalPages(0)
      }
    }
    fetchQuestions()
  }, [botFilter, currentPage])

  // Reset to page 1 when botFilter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [botFilter])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Fetch bot list + bar chart data + donut chart data
  useEffect(() => {
    const fetchBotData = async () => {
      try {
        const res = await api.get('/chatbots')
        const bots = res.data.chatbots || []

        setBotList(bots)

        // Bar chart: queries per chatbot
        const queries = bots.map(bot => ({
          name: bot.name || 'Unnamed',
          queries: bot.stats?.totalMessages || 0,
        }))
        setBotQueries(queries)

        // Donut chart: count documents by type
        const typeCounts = { pdf: 0, url: 0, text: 0, other: 0 }
        for (const bot of bots) {
          if (bot.documents && Array.isArray(bot.documents)) {
            for (const doc of bot.documents) {
              const name = (doc.filename || doc.name || '').toLowerCase()
              if (name.endsWith('.pdf')) typeCounts.pdf++
              else if (name.endsWith('.txt') || name.endsWith('.doc') || name.endsWith('.docx')) typeCounts.text++
              else if (name.startsWith('http')) typeCounts.url++
              else typeCounts.other++
            }
          }
        }

        const pieData = [
          { name: 'PDF', value: typeCounts.pdf || 1, color: PIE_COLORS[0] },
          { name: 'URL', value: typeCounts.url || 1, color: PIE_COLORS[1] },
          { name: 'Text', value: typeCounts.text || 1, color: PIE_COLORS[2] },
        ].filter(d => d.value > 0)

        if (pieData.length === 0) {
          pieData.push({ name: 'No data', value: 1, color: '#2a2a3e' })
        }

        setDocTypeData(pieData)
      } catch {
        // ignore
      }
    }
    fetchBotData()
  }, [])

  const sortKeyMap = { 'Question': 'q', 'Bot': 'bot', 'Count': 'count', 'Sentiment': 'sentiment' }

  const sortedTableData = [...topQuestions]
    .filter(row => botFilter === 'All' || row.bot === botFilter)
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

  const requestSort = (col) => {
    const key = sortKeyMap[col] || col.toLowerCase()
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'
    setSortConfig({ key, direction })
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-60px)] md:min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-3">Failed to load analytics</h2>
        <p className="text-text-muted mb-8 max-w-sm">There was an error communicating with the server. Please try again later.</p>
        <button onClick={() => fetchAnalytics(token)} className="px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20">
          Try Again
        </button>
      </div>
    )
  }

  // ─── FULL PAGE LOADING ───
  if (isLoading && !stats) {
    return (
      <div className="bg-background text-text-primary font-inter">
        <div className="border-b border-border bg-surface/50">
          <div className="max-w-7xl mx-auto px-2.5 md:px-6 py-3 md:py-4">
            <div className="h-6 w-32 bg-surface-elevated rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-2.5 md:px-6 py-6 md:py-10 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><SkeletonChart /></div>
            <div><SkeletonChart /></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><SkeletonChart /></div>
            <div><SkeletonChart /></div>
          </div>
        </div>
      </div>
    )
  }

  const hasNoData = stats && Array.isArray(stats) && stats.every(s => (s.value ?? 0) === 0)

  if (hasNoData && !isLoading) {
    return (
      <div className="min-h-[calc(100vh-60px)] md:min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-surface-elevated border border-border rounded-full flex items-center justify-center mb-6">
          <BarChart3 size={36} className="text-text-muted" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-3">No data yet</h2>
        <p className="text-text-muted mb-8 max-w-sm">Start chatting with your bots to see analytics, usage trends, and popular questions.</p>
        <Link to="/dashboard" className="px-6 py-3 bg-surface border border-border text-text-primary font-medium rounded-xl hover:bg-surface-elevated transition-colors">
          Go to Dashboard
        </Link>
      </div>
    )
  }

  const totalDocs = docTypeData.reduce((s, d) => s + (d.name === 'No data' ? 0 : d.value), 0)

  return (
    <div className="bg-background text-text-primary font-inter selection:bg-accent/30 selection:text-text-primary">
      {/* Breadcrumb Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2.5 md:px-6 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              id="analytics-back-btn"
              to={backTo}
              className="p-2 -ml-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-text-primary leading-tight">Analytics</h1>
              <div className="flex items-center gap-2 text-xs text-text-muted font-medium mt-0.5">
                <Link to={backTo} className="hover:text-accent transition-colors">{backLabel}</Link>
                <span>/</span>
                <span className="text-text-primary">Overview</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Bot Selector */}
            <div className="relative flex-1 md:flex-none">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="w-full md:w-[200px] flex items-center justify-between px-4 py-2 bg-background border border-border hover:border-accent/50 rounded-xl text-sm font-medium transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <Bot size={16} className="text-accent" />
                  <span className="truncate">{botFilter === 'All' ? 'All Bots' : (botList.find(b => b._id === botFilter)?.name || botFilter)}</span>
                </div>
                <ChevronDown size={14} className="text-text-muted ml-2 shrink-0" />
              </button>
              
              {showFilter && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl z-50 py-2 max-h-[250px] overflow-y-auto">
                  <button
                    onClick={() => { setBotFilter('All'); setShowFilter(false) }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${botFilter === 'All' ? 'text-accent bg-accent/5 font-semibold' : 'text-text-primary hover:bg-surface-elevated'}`}
                  >
                    All Bots
                  </button>
                  {botList.map(bot => (
                    <button
                      key={bot._id}
                      onClick={() => { setBotFilter(bot._id || bot.name); setShowFilter(false) }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${botFilter === (bot._id || bot.name) ? 'text-accent bg-accent/5 font-semibold' : 'text-text-primary hover:bg-surface-elevated'}`}
                    >
                      {bot.name || 'Unnamed Bot'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time Range Selector */}
            <div className="relative bg-surface border border-border rounded-lg p-1 flex text-sm font-medium shrink-0">
              {['7d', '30d', '90d'].map(range => (
                <button
                  key={range}
                  id={`time-range-${range}`}
                  onClick={() => setTimeRange(range)}
                  className={`relative px-3 md:px-4 py-1.5 rounded-md transition-colors z-10 ${timeRange === range ? 'text-white' : 'text-text-muted hover:text-text-primary'}`}
                >
                  {timeRange === range && (
                    <motion.div layoutId="range-pill" className="absolute inset-0 bg-accent rounded-md -z-10" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2.5 md:px-6 py-6 md:py-10 space-y-8">
        
        {/* ─── KPI STATS ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats && stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`p-5 md:p-6 bg-surface border border-border rounded-2xl relative overflow-hidden group hover:border-border/80 transition-colors ${isLoading ? 'opacity-50' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 md:p-3 rounded-xl border border-border ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 ${stat.trend.startsWith('-') ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'}`}>
                  {stat.trend} {stat.trend.startsWith('-') ? '↓' : stat.trend !== 'Stable' ? '↑' : ''}
                </span>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
                  {<CountUp end={stat.value} />}{stat.suffix}
                </h3>
                <p className="text-xs md:text-sm text-text-muted font-medium">{stat.label}</p>
              </div>
              <div className="absolute -bottom-4 -right-4 text-border opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:scale-110 duration-500 pointer-events-none">
                <stat.icon size={100} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── CHARTS ROW 1 ─── */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isLoading || chartsLoading ? 'opacity-50' : 'opacity-100'}`}>
          
          {/* Main Area Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-surface border border-border rounded-3xl p-5 md:p-6"
          >
            <h3 className="text-base md:text-lg font-bold text-text-primary mb-6">Queries Over Time</h3>
            {chartData.length > 0 ? (
              <div className="h-[250px] md:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: '#8B8BA7', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: '#8B8BA7', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="queries" stroke="#6C63FF" strokeWidth={3} fillOpacity={1} fill="url(#colorQueries)" animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] md:h-[300px] flex items-center justify-center text-text-muted text-sm">
                No query data for this period
              </div>
            )}
          </motion.div>

          {/* Donut Chart — Document Types */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-surface border border-border rounded-3xl p-5 md:p-6 flex flex-col"
          >
            <h3 className="text-base md:text-lg font-bold text-text-primary mb-2">Document Types</h3>
            <div className="flex-1 min-h-[200px] md:min-h-[250px] relative w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={docTypeData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {docTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-text-primary">{totalDocs}</span>
                <span className="text-xs font-medium text-text-muted">Total Docs</span>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-2 flex-wrap">
              {docTypeData.map(entry => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium text-text-primary">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── CHARTS ROW 2 ─── */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          
          {/* Top Questions Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-surface border border-border rounded-3xl overflow-hidden"
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-base md:text-lg font-bold text-text-primary">Top Questions Asked</h3>
            </div>

            {topQuestions.length > 0 ? (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-background text-text-muted border-b border-border">
                      <tr>
                        {['Question', 'Bot', 'Count', 'Sentiment'].map((col) => (
                          <th
                            key={col}
                            className="p-4 font-semibold cursor-pointer hover:text-text-primary transition-colors group"
                            onClick={() => requestSort(col)}
                          >
                            <div className="flex items-center gap-1">
                              {col}
                              <div className="flex flex-col text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronUp size={10} className={sortConfig.key === (sortKeyMap[col] || col.toLowerCase()) && sortConfig.direction === 'asc' ? 'text-accent' : ''} />
                                <ChevronDown size={10} className="-mt-1 text-text-muted" />
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTableData.map((row, i) => (
                        <motion.tr
                          key={row.id}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-border/50 hover:bg-surface-elevated transition-colors"
                        >
                          <td className="p-4 font-medium text-text-primary">{row.q}</td>
                          <td className="p-4 text-text-muted">{row.bot}</td>
                          <td className="p-4 font-mono font-bold">
                            <div className="flex items-center gap-2">
                              <span>{row.count}</span>
                              <div className="w-16 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                                <div className="h-full bg-accent" style={{ width: `${Math.min(100, (row.count / Math.max(...sortedTableData.map(r => r.count), 1)) * 100)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              row.sentiment === 'Positive' ? 'bg-green-500/10 text-green-400' :
                              row.sentiment === 'Negative' ? 'bg-red-500/10 text-red-400' :
                              'bg-surface-elevated text-text-muted border border-border'
                            }`}>
                              {row.sentiment}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden divide-y divide-border">
                  {sortedTableData.map((row, i) => (
                    <div key={row.id} className="p-4 space-y-3">
                      <p className="text-sm font-semibold text-text-primary leading-tight">{row.q}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">{row.bot}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          row.sentiment === 'Positive' ? 'bg-green-500/10 text-green-400' :
                          row.sentiment === 'Negative' ? 'bg-red-500/10 text-red-400' :
                          'bg-surface-elevated text-text-muted'
                        }`}>
                          {row.sentiment}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-text-primary w-8">{row.count}</span>
                        <div className="flex-1 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${Math.min(100, (row.count / Math.max(...sortedTableData.map(r => r.count), 1)) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalQuestions}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="p-8 text-center text-text-muted text-sm">No questions found</div>
            )}
          </motion.div>

          {/* Horizontal Bar Chart — Queries per Chatbot */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-surface border border-border rounded-3xl p-5 md:p-6"
          >
            <h3 className="text-base md:text-lg font-bold text-text-primary mb-6">Queries per Chatbot</h3>
            {botQueries.length > 0 ? (
              <div className="h-[250px] md:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={botQueries} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} stroke="rgba(255,255,255,0.3)" tick={{ fill: '#8B8BA7', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
                    <Bar dataKey="queries" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
                      {botQueries.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] md:h-[300px] flex items-center justify-center text-text-muted text-sm">
                No chatbots found
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  )
}