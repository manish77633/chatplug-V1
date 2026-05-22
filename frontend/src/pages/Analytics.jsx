import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3, Clock, MessageSquare, Bot, ChevronLeft, ArrowUp, ArrowDown,
  ChevronUp, ChevronDown, Filter
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts'

// Mocks
const areaData = [
  { name: 'Mon', queries: 120 },
  { name: 'Tue', queries: 250 },
  { name: 'Wed', queries: 180 },
  { name: 'Thu', queries: 390 },
  { name: 'Fri', queries: 450 },
  { name: 'Sat', queries: 310 },
  { name: 'Sun', queries: 520 },
]

const barData = [
  { name: 'Sales Assistant', queries: 1240 },
  { name: 'Support Bot', queries: 890 },
  { name: 'Onboarding AI', queries: 430 },
  { name: 'Docs Navigator', queries: 210 },
]

const pieData = [
  { name: 'PDF', value: 45, color: '#6C63FF' },
  { name: 'URL', value: 35, color: '#00D9C0' },
  { name: 'Text', value: 20, color: '#FFB800' },
]

const tableData = [
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

export default function Analytics() {
  const { id } = useParams()
  const backTo   = id ? `/chatbot/${id}` : '/dashboard'
  const backLabel = id ? 'Chatbot' : 'Dashboard'
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [sortConfig, setSortConfig] = useState({ key: 'count', direction: 'desc' })
  const [showFilter, setShowFilter] = useState(false)
  const [botFilter, setBotFilter] = useState('All')

  useEffect(() => {
    // Simulate data fetch
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [timeRange])

  const stats = [
    { label: 'Total Queries', value: 2450, icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/10', trend: '+12.5%' },
    { label: 'Avg Response Time', value: 184, suffix: 'ms', icon: Clock, color: 'text-accent-secondary', bg: 'bg-accent-secondary/10', trend: '-5.2%' },
    { label: 'User Satisfaction', value: 92, suffix: '%', icon: BarChart3, color: 'text-green-400', bg: 'bg-green-400/10', trend: '+2.1%' },
    { label: 'Top Bot', value: 'Sales AI', isString: true, icon: Bot, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: 'Stable' },
  ]

  const sortKeyMap = { 'Question': 'q', 'Bot': 'bot', 'Count': 'count', 'Sentiment': 'sentiment' }

  const sortedTableData = [...tableData]
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

  if (loading) return (
    <div className="min-h-screen bg-background p-8 space-y-6">
      <div className="h-8 w-48 bg-surface border border-border rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-surface border border-border rounded-2xl animate-pulse" />)}
      </div>
      <div className="h-[400px] bg-surface border border-border rounded-2xl animate-pulse" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-text-primary font-inter selection:bg-accent/30 selection:text-text-primary">
      {/* Breadcrumb Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Link
              id="analytics-back-btn"
              to={backTo}
              className="p-2 -ml-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-text-primary leading-tight">Analytics Overview</h1>
              <div className="flex items-center gap-2 text-xs text-text-muted font-medium mt-0.5">
                <Link to={backTo} className="hover:text-accent transition-colors">{backLabel}</Link>
                <span>/</span>
                <span className="text-text-primary">Analytics</span>
              </div>
            </div>
          </div>

          <div className="relative bg-surface border border-border rounded-lg p-1 flex text-sm font-medium">
            {['7d', '30d', '90d'].map(range => (
              <button
                key={range}
                id={`time-range-${range}`}
                onClick={() => setTimeRange(range)}
                className={`relative px-3 sm:px-4 py-1.5 rounded-md transition-colors z-10 ${timeRange === range ? 'text-white' : 'text-text-muted hover:text-text-primary'}`}
              >
                {timeRange === range && (
                  <motion.div layoutId="range-pill" className="absolute inset-0 bg-accent rounded-md -z-10" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                {range === '7d' ? '7d' : range === '30d' ? '30d' : '90d'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        
        {/* ─── KPI STATS ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-6 bg-surface border border-border rounded-2xl relative overflow-hidden group hover:border-border/80 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl border border-border ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 ${stat.trend.startsWith('-') ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'}`}>
                  {stat.trend} {stat.trend.startsWith('-') ? '↓' : stat.trend !== 'Stable' ? '↑' : ''}
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-text-primary mb-1">
                  {stat.isString ? stat.value : <CountUp end={stat.value} />}{stat.suffix}
                </h3>
                <p className="text-sm text-text-muted font-medium">{stat.label}</p>
              </div>
              <div className="absolute -bottom-4 -right-4 text-border opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:scale-110 duration-500 pointer-events-none">
                <stat.icon size={100} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── CHARTS ROW 1 ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Area Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-surface border border-border rounded-3xl p-6"
          >
            <h3 className="text-lg font-bold text-text-primary mb-6">Queries Over Time</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            className="bg-surface border border-border rounded-3xl p-6 flex flex-col"
          >
            <h3 className="text-lg font-bold text-text-primary mb-2">Document Types</h3>
            <div className="flex-1 min-h-[250px] relative w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {pieData.map((entry, index) => (
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
              {pieData.map(entry => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium text-text-primary">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── CHARTS ROW 2 ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Questions Table — desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-surface border border-border rounded-3xl overflow-hidden"
          >
            <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-text-primary">Top Questions Asked</h3>
              <div className="relative">
                <button
                  id="analytics-filter-btn"
                  onClick={() => setShowFilter(f => !f)}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 min-h-[44px] px-2 ${showFilter ? 'text-accent' : 'text-text-muted hover:text-accent'}`}
                >
                  <Filter size={14} /> Filter
                </button>
                {showFilter && (
                  <div className="absolute right-0 top-8 bg-surface border border-border rounded-xl shadow-xl z-20 p-3 w-48">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Filter by Bot</p>
                    {['All', ...new Set(tableData.map(r => r.bot))].map(bot => (
                      <button
                        key={bot}
                        onClick={() => { setBotFilter(bot); setShowFilter(false) }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          botFilter === bot ? 'bg-accent/10 text-accent font-semibold' : 'text-text-primary hover:bg-surface-elevated'
                        }`}
                      >
                        {bot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                      <td className="p-4 font-mono font-bold">{row.count}</td>
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
                <div key={row.id} className="p-4 space-y-2">
                  <p className="text-sm font-semibold text-text-primary">{row.q}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-text-muted">{row.bot}</span>
                    <span className="text-xs font-mono font-bold text-text-primary">{row.count} asks</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      row.sentiment === 'Positive' ? 'bg-green-500/10 text-green-400' :
                      row.sentiment === 'Negative' ? 'bg-red-500/10 text-red-400' :
                      'bg-surface-elevated text-text-muted'
                    }`}>
                      {row.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Horizontal Bar Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-surface border border-border rounded-3xl p-6"
          >
            <h3 className="text-lg font-bold text-text-primary mb-6">Queries per Chatbot</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} stroke="rgba(255,255,255,0.3)" tick={{ fill: '#8B8BA7', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
                  <Bar dataKey="queries" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
                    {barData.map((entry, index) => (
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
