import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Users, Bot, MessageSquare, DollarSign, Search, Filter, MoreVertical,
  ChevronLeft, Database, Activity, CheckCircle2, Server
} from 'lucide-react'

const MOCK_USERS = [
  { id: 1, name: 'Alex Rivera', email: 'alex@example.com', plan: 'Pro', bots: 4, queries: '12.4k', joined: 'Oct 12, 2025' },
  { id: 2, name: 'Sarah Chen', email: 'sarah@startup.io', plan: 'Enterprise', bots: 12, queries: '45.1k', joined: 'Sep 04, 2025' },
  { id: 3, name: 'John Doe', email: 'john@personal.dev', plan: 'Free', bots: 1, queries: '142', joined: 'Nov 01, 2025' },
  { id: 4, name: 'Emma Wilson', email: 'emma@agency.com', plan: 'Pro', bots: 8, queries: '28.9k', joined: 'Aug 22, 2025' },
  { id: 5, name: 'Tech Corp', email: 'admin@techcorp.com', plan: 'Enterprise', bots: 24, queries: '156.2k', joined: 'Jul 15, 2025' },
]

export default function AdminPanel() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState('All')

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const stats = [
    { label: 'Total Users', value: '1,248', icon: Users, color: 'text-accent' },
    { label: 'Total Chatbots', value: '4,592', icon: Bot, color: 'text-accent-secondary' },
    { label: 'Total Queries', value: '2.4M', icon: MessageSquare, color: 'text-purple-400' },
    { label: 'MRR', value: '$12,450', icon: DollarSign, color: 'text-green-400' },
  ]

  const healthData = [
    { name: 'API Server', status: 'Healthy', icon: Server, color: 'text-green-400' },
    { name: 'Redis Cache', status: 'Healthy', icon: Database, color: 'text-green-400' },
    { name: 'MongoDB', status: 'Healthy', icon: Database, color: 'text-green-400' },
    { name: 'Background Workers', status: '12 pending', icon: Activity, color: 'text-yellow-400' },
  ]

  const filteredUsers = MOCK_USERS.filter(u => 
    (planFilter === 'All' || u.plan === planFilter) &&
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
    <div className="min-h-screen bg-background text-text-primary font-inter selection:bg-accent/30 selection:text-text-primary pb-12">
      {/* Breadcrumb Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 -ml-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-text-primary leading-tight">Admin Console</h1>
              <div className="flex items-center gap-2 text-xs text-text-muted font-medium mt-0.5">
                <Link to="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-text-primary">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        
        {/* ─── STATS ROW ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-surface border border-border rounded-2xl relative overflow-hidden group hover:border-border/80 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl border border-border bg-background flex items-center justify-center mb-4 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <h3 className="text-3xl font-bold text-text-primary mb-1">{stat.value}</h3>
              <p className="text-sm text-text-muted font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── MAIN CONTENT GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* USERS TABLE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-surface border border-border rounded-3xl overflow-hidden flex flex-col"
          >
            {/* Table Toolbar */}
            <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-text-primary">User Management</h3>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent transition-colors w-full sm:w-64"
                  />
                </div>
                
                <div className="relative">
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="pl-4 pr-8 py-2 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                  >
                    <option value="All">All Plans</option>
                    <option value="Free">Free</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                  <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-background text-text-muted border-b border-border">
                  <tr>
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Plan</th>
                    <th className="p-4 font-semibold text-center">Bots</th>
                    <th className="p-4 font-semibold text-center">Queries</th>
                    <th className="p-4 font-semibold">Joined</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, i) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 hover:bg-surface-elevated transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/80 to-accent-secondary/80 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary leading-tight">{user.name}</p>
                            <p className="text-xs text-text-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          user.plan === 'Pro' ? 'bg-accent/10 text-accent border border-accent/20' :
                          user.plan === 'Enterprise' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          'bg-surface-elevated text-text-muted border border-border'
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono font-medium">{user.bots}</td>
                      <td className="p-4 text-center font-mono font-medium">{user.queries}</td>
                      <td className="p-4 text-text-muted">{user.joined}</td>
                      <td className="p-4 text-right">
                        <button className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-background transition-colors inline-flex">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-border bg-background flex items-center justify-between text-sm text-text-muted">
              <span>Showing {filteredUsers.length} users</span>
              <div className="flex gap-1">
                <button onClick={() => toast('No previous page', { icon: '⬅️' })} className="px-3 py-1 border border-border rounded-lg hover:bg-surface hover:text-text-primary disabled:opacity-50">Prev</button>
                <button onClick={() => toast('No next page', { icon: '➡️' })} className="px-3 py-1 border border-border rounded-lg hover:bg-surface hover:text-text-primary">Next</button>
              </div>
            </div>
          </motion.div>

          {/* SYSTEM HEALTH */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface border border-border rounded-3xl p-6 h-fit"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Activity size={18} className="text-accent" /> System Health
              </h3>
              <span className="text-xs font-medium text-text-muted">Updated just now</span>
            </div>

            <div className="space-y-3">
              {healthData.map((node, i) => (
                <div key={i} className="p-4 bg-background border border-border rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <node.icon size={16} className="text-text-muted" />
                    <span className="font-semibold text-text-primary text-sm">{node.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-muted">{node.status}</span>
                    <span className={`w-2 h-2 rounded-full ${node.color} ${node.status === 'Healthy' ? 'animate-pulse' : ''}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => toast.success('Redis cache flushed successfully')} 
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-background border border-border hover:border-accent hover:text-accent transition-colors text-sm font-medium"
                >
                  Flush Redis Cache
                </button>
                <button
                  onClick={() => toast.success('Vector DB sync restarted')}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-background border border-border hover:border-accent hover:text-accent transition-colors text-sm font-medium"
                >
                  Restart Vector DB sync
                </button>
                <button
                  onClick={() => toast('Maintenance mode coming soon', { icon: '🚧' })}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-background border border-danger/30 text-danger hover:bg-danger/10 transition-colors text-sm font-medium"
                >
                  Enter Maintenance Mode
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
