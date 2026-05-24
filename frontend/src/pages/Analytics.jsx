import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3, Clock, MessageSquare, Bot, ChevronLeft, ArrowUp, ArrowDown,
  ChevronUp, ChevronDown, Filter, AlertCircle
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts'
import api from '../utils/api'
import useAnalyticsStore from '../store/analyticsStore'
import { useAuthStore } from '../store/authStore'

// Mocks
const mockAreaData = [
  { name: 'Mon', queries: 120 },
  { name: 'Tue', queries: 250 },
  { name: 'Wed', queries: 180 },
  { name: 'Thu', queries: 390 },
  { name: 'Fri', queries: 450 },
  { name: 'Sat', queries: 310 },
  { name: 'Sun', queries: 520 },
]

const mockBarData = [
  { name: 'Sales Assistant', queries: 1240 },
  { name: 'Support Bot', queries: 890 },
  { name: 'Onboarding AI', queries: 430 },
  { name: 'Docs Navigator', queries: 210 },
]

const mockPieData = [
  { name: 'PDF', value: 45, color: '#6C63FF' },
  { name: 'URL', value: 35, color: '#00D9C0' },
  { name: 'Text', value: 20, color: '#FFB800' },
]

const mockTableData = [
  { id: 1, q: "How do I reset my password?", bot: "Support Bot", count: 145, sentiment: "Neutral" },
  { id: 2, q: "What is your pricing?", bot: "Sales Assistant", count: 98, sentiment: "Positive" },
  { id: 3, q: "Can I embed this in React?", bot: "Docs Navigator", count: 76, sentiment: "Positive" },
  { id: 4, q: "The widget won't load", bot: "Support Bot", count: 42, sentiment: "Negative" },
  { id: 5, q: "How to upgrade plan", bot: "Sales Assistant", count: 35, sentiment: "Neutral" },
]

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

// Skeleton card component matching KPI layout
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

export default function Analytics() {
  const { id } = useParams()
  const backTo   = id ? `/chatbot/${id}` : '/dashboard'
  const backLabel = id ? 'Chatbot' : 'Dashboard'
  
  const { stats: storeStats, isLoading, fetchAnalytics } = useAnalyticsStore()
  const token = useAuthStore(s => s.token) || localStorage.getItem('token')
  const [error, setError] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')
  
  const stats = storeStats
    ? [
        { label: 'Total Queries', value: storeStats?.totalMessages ?? 0, icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/10', trend: '+12.5%' },
        { label: 'Avg Response Time', value: storeStats?.avgTime ?? 184, suffix: 'ms', icon: Clock, color: 'text-accent-secondary', bg: 'bg-accent-secondary/10', trend: '-5.2%' },
        { label: 'Active Bots', value: storeStats?.totalSessions ?? 0, icon: Bot, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '+1' },
        { label: 'User Satisfaction', value: storeStats?.satisfaction ?? 92, suffix: '%', icon: BarChart3, color: 'text-green-400', bg: 'bg-green-400/10', trend: '+2.1%' },
      ]
    : null
  const [chartData, setChartData] = useState([])
  const [topQuestions, setTopQuestions] = useState([])
  const [botList, setBotList] = useState([])
  
  const [sortConfig, setSortConfig] = useState({ key: 'count', direction: 'desc' })

  // Fetch analytics stats on mount — Zustand cache handles re-fetch logic
  useEffect(() => {
    fetchAnalytics(token)
  }, [])

  // Background refresh: if data is stale (>3 min), refresh silently
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics(token, '7d', false)
    }, 3 * 60 * 1000)
    return () => clearInterval(interval)
  }, [token])

  const [showFilter, setShowFilter] = useState(false)
  const [botFilter, setBotFilter] = useState('All')
  
  // Charts Data
  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const res = await api.get(`/analytics/messages?range=${timeRange}${botFilter !== 'All' ? `&botId=${botFilter}` : ''}`)
        setChartData(res.data.chartData || mockAreaData)
      } catch {
        setChartData(mockAreaData)
      }
    }
    fetchCharts()
  }, [timeRange, botFilter])

  // Top Questions Data
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/analytics/top-questions?botId=${botFilter === 'All' ? '' : botFilter}`)
        setTopQuestions(res.data.questions || mockTableData)
      } catch {
        setTimeout(() => setTopQuestions([...mockTableData]), 800)
      }
    }
    fetchQuestions()
  }, [botFilter])

  // Bot list
  useEffect(() => {
    const fetchBots = async () => {
      try {
        const botRes = await api.get('/chatbots')
        setBotList(botRes.data.chatbots || [])
      } catch {
        // ignore
      }
    }
    fetchBots()
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

  // ─── FULL PAGE LOADING STATE (skeleton matches layout) ───
  if (isLoading && !stats) {
    return (
      <div className="bg-background text-text-primary font-inter">
        {/* Breadcrumb Header skeleton */}
        <div className="border-b border-border bg-surface/50">
          <div className="max-w-7xl mx-auto px-2.5 md:px-6 py-3 md:py-4">
            <div className="h-6 w-32 bg-surface-elevated rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-2.5 md:px-6 py-6 md:py-10 space-y-8">
          {/* KPI skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          {/* Chart skeletons */}
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
  
  const hasNoData = stats && stats[0].value === 0

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
                  {stat.isString ? stat.value : <CountUp end={stat.value} />}{stat.suffix}
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
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          
          {/* Main Area Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-surface border border-border rounded-3xl p-5 md:p-6"
          >
            <h3 className="text-base md:text-lg font-bold text-text-primary mb-6">Queries Over Time</h3>
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
          </motion.div>

          {/* Donut Chart */}
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
                    data={mockPieData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {mockPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-text-primary">100</span>
                <span className="text-xs font-medium text-text-muted">Total Docs</span>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-2">
              {mockPieData.map(entry => (
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
                            <div className="h-full bg-accent" style={{ width: `${Math.min(100, (row.count / 150) * 100)}%` }} />
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
                  {sortedTableData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-text-muted">No questions found</td>
                    </tr>
                  )}
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
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-mono font-bold text-text-primary w-8">{row.count}</span>
                    <div className="flex-1 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${Math.min(100, (row.count / 150) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {sortedTableData.length === 0 && (
                <div className="p-8 text-center text-text-muted text-sm">No questions found</div>
              )}
            </div>
          </motion.div>

          {/* Horizontal Bar Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-surface border border-border rounded-3xl p-5 md:p-6"
          >
            <h3 className="text-base md:text-lg font-bold text-text-primary mb-6">Queries per Chatbot</h3>
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockBarData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} stroke="rgba(255,255,255,0.3)" tick={{ fill: '#8B8BA7', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
                  <Bar dataKey="queries" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
                    {mockBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#6C63FF' : index === 1 ? '#00D9C0' : 'rgba(255,255,255,0.1)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}