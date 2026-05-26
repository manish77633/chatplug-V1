import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Bot, MessageSquare, CreditCard, Search,
  Trash2, ShieldAlert, ShieldCheck, ChevronLeft, ChevronRight,
  TrendingUp, BarChart3, Crown, X, Calendar, Clock, Settings
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

const Avatar = ({ user, size = 'sm', onImageClick }) => {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-20 h-20 text-3xl' : 'w-10 h-10 text-sm'
  
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user?.name}
        onClick={(e) => { e.stopPropagation(); onImageClick?.({ src: user.avatar, name: user.name }) }}
        className={`${dim} rounded-full object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-transparent hover:ring-accent`}
      />
    )
  }
  return (
    <div className={`${dim} rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold shrink-0`}>
      {(user?.name || 'U').charAt(0).toUpperCase()}
    </div>
  )
}

const PlanBadge = ({ plan }) => {
  const styles = {
    free: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    pro: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    enterprise: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
  const type = plan?.type || 'free'
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase ${styles[type]}`}>
      {type}
    </span>
  )
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [revenue, setRevenue] = useState(null)

  const [previewImg, setPreviewImg] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetail, setUserDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [users, setUsers] = useState({ data: [], total: 0, pages: 1, loading: true })
  const [userPage, setUserPage] = useState(1)
  const [userSearch, setUserSearch] = useState('')
  const debouncedUserSearch = useDebounce(userSearch, 400)

  const [bots, setBots] = useState({ data: [], total: 0, pages: 1, loading: true })
  const [botPage, setBotPage] = useState(1)
  const [botSearch, setBotSearch] = useState('')
  const debouncedBotSearch = useDebounce(botSearch, 400)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r] = await Promise.all([api.get('/admin/stats'), api.get('/admin/revenue')])
        setStats(s.data.stats)
        setRevenue(r.data)
      } catch { toast.error('Failed to load dashboard') }
    }
    load()
  }, [])

  const fetchUsers = useCallback(async () => {
    setUsers(p => ({ ...p, loading: true }))
    try {
      const res = await api.get(`/admin/users?page=${userPage}&limit=15&search=${debouncedUserSearch}`)
      setUsers({ data: res.data.users, total: res.data.total, pages: res.data.pages, loading: false })
    } catch { toast.error('Failed to load users'); setUsers(p => ({ ...p, loading: false })) }
  }, [userPage, debouncedUserSearch])
  useEffect(() => { fetchUsers() }, [fetchUsers])

  const fetchBots = useCallback(async () => {
    setBots(p => ({ ...p, loading: true }))
    try {
      const res = await api.get(`/admin/chatbots?page=${botPage}&limit=15&search=${debouncedBotSearch}`)
      setBots({ data: res.data.chatbots, total: res.data.total, pages: res.data.pages, loading: false })
    } catch { toast.error('Failed to load chatbots'); setBots(p => ({ ...p, loading: false })) }
  }, [botPage, debouncedBotSearch])
  useEffect(() => { fetchBots() }, [fetchBots])

  const handleUpdatePlan = async (id, plan) => {
    try {
      await api.patch(`/admin/users/${id}/plan`, { plan })
      toast.success('Plan updated')
      fetchUsers()
      if (selectedUser && selectedUser._id === id) openUserDetail({ _id: id })
    } catch { toast.error('Failed to update plan') }
  }

  const handleToggleAdmin = async (id, isAdmin) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role: isAdmin ? 'user' : 'admin' })
      toast.success(`User ${isAdmin ? 'removed from' : 'made'} admin`)
      fetchUsers()
      if (selectedUser && selectedUser._id === id) openUserDetail({ _id: id })
    } catch { toast.error('Failed to update role') }
  }

  const handleBanUser = async (id, banned) => {
    try {
      await api.patch(`/admin/users/${id}/ban`)
      toast.success(`User ${banned ? 'unbanned' : 'banned'}`)
      fetchUsers()
      if (selectedUser && selectedUser._id === id) openUserDetail({ _id: id })
    } catch { toast.error('Failed to toggle ban') }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('User deleted')
      fetchUsers()
      if (selectedUser && selectedUser._id === id) setSelectedUser(null)
    } catch { toast.error('Failed to delete') }
  }

  const openUserDetail = async (user) => {
    setSelectedUser(user)
    setDetailLoading(true)
    try {
      const res = await api.get(`/admin/users/${user._id}`)
      setUserDetail(res.data)
    } catch {
      toast.error('Failed to load user details')
    } finally {
      setDetailLoading(false)
    }
  }

  const fmt = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n || 0
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'chatbots', label: 'Chatbots', icon: Bot },
    { id: 'revenue', label: 'Revenue', icon: CreditCard },
  ]

  return (
    <div className="bg-background min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Manage users, chatbots, and analytics.</p>
        </div>

        {/* Tabs — grid so no scroll */}
        <div className="grid grid-cols-4 border-b border-[#1a1a2e]">
          {tabs.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 text-xs sm:text-sm font-medium transition-colors border-b-2 ${active ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-white'
                  }`}
              >
                <tab.icon size={15} />
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
                <span className="sm:hidden text-[10px]">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="space-y-5">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Users', value: fmt(stats?.users), icon: Users, color: 'text-blue-400' },
                  { label: 'Chatbots', value: fmt(stats?.chatbots), icon: Bot, color: 'text-emerald-400' },
                  { label: 'Sessions', value: fmt(stats?.sessions), icon: MessageSquare, color: 'text-purple-400' },
                  { label: 'Tokens', value: fmt(stats?.totalTokens), icon: TrendingUp, color: 'text-amber-400' },
                ].map((k, i) => (
                  <div key={i} className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">{k.label}</p>
                      <h3 className="text-xl sm:text-2xl font-bold mt-0.5">{k.value ?? 0}</h3>
                    </div>
                    <div className={`p-2.5 rounded-lg bg-[#1a1a2e] ${k.color}`}><k.icon size={20} /></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Plan dist */}
                <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Plan Distribution</h3>
                  {revenue ? (
                    <div className="space-y-3">
                      {[
                        { label: 'Free', val: revenue.free, color: 'text-gray-400' },
                        { label: 'Pro', val: revenue.pro, color: 'text-purple-400' },
                        { label: 'Enterprise', val: revenue.enterprise, color: 'text-amber-400' },
                      ].map(r => (
                        <div key={r.label} className="flex justify-between items-center py-2 border-b border-[#1a1a2e]">
                          <span className={`text-sm font-medium ${r.color}`}>{r.label}</span>
                          <span className="font-bold">{r.val || 0}</span>
                        </div>
                      ))}
                      <div className="pt-2">
                        <p className="text-xs text-gray-400">Est. MRR</p>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">₹{revenue.estimatedMRR?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  ) : <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-4 bg-[#1a1a2e] rounded animate-pulse" />)}</div>}
                </div>

                {/* Recent users */}
                <div className="lg:col-span-2 bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {users.data.slice(0, 5).map(u => (
                      <div key={u._id} className="flex items-center gap-3 hover:bg-[#1a1a2e]/30 p-2 -mx-2 rounded-lg cursor-pointer transition-colors" onClick={() => openUserDetail(u)}>
                        <Avatar user={u} onImageClick={setPreviewImg} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                        <PlanBadge plan={u.plan} />
                        <span className="text-xs text-gray-400 shrink-0 hidden sm:block">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === 'users' && (
            <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl flex flex-col">
              <div className="p-3 border-b border-[#1a1a2e]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={e => { setUserSearch(e.target.value); setUserPage(1) }}
                    className="w-full bg-[#1a1a2e] border border-[#2a2a45] rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block min-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-[#1a1a2e]/50 border-b border-[#1a1a2e]">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.loading ? [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-[#1a1a2e]">
                        {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-4"><div className="h-5 bg-[#1a1a2e] rounded animate-pulse" /></td>)}
                      </tr>
                    )) : users.data.length === 0 ? (
                      <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No users found.</td></tr>
                    ) : users.data.map(u => (
                      <tr key={u._id} className={`border-b border-[#1a1a2e] hover:bg-[#1a1a2e]/30 transition-colors cursor-pointer ${u.isBanned ? 'opacity-50' : ''}`} onClick={() => openUserDetail(u)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar user={u} onImageClick={setPreviewImg} />
                            <div>
                              <div className="font-medium flex items-center gap-1">
                                {u.name}
                                {u.role === 'admin' && <ShieldCheck size={12} className="text-emerald-400" />}
                              </div>
                              <div className="text-xs text-gray-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.plan?.type || 'free'}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => { e.stopPropagation(); handleUpdatePlan(u._id, e.target.value) }}
                            className="bg-[#1a1a2e] border border-[#2a2a45] text-xs text-white rounded px-2 py-1 focus:outline-none"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleAdmin(u._id, u.role === 'admin') }}
                            className={`px-2 py-1 text-[10px] font-bold rounded-full border transition-colors ${u.role === 'admin'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                                : 'bg-[#1a1a2e] text-gray-400 border-[#2a2a45] hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                              }`}
                            title={u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          >
                            {u.role === 'admin' ? 'ADMIN' : 'USER'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {u.isBanned
                            ? <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">BANNED</span>
                            : <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={(e) => { e.stopPropagation(); handleBanUser(u._id, u.isBanned) }} title={u.isBanned ? 'Unban' : 'Ban'}
                              className="p-1.5 text-gray-400 hover:text-amber-400 bg-[#1a1a2e] hover:bg-[#2a2a45] rounded transition-colors">
                              <ShieldAlert size={14} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(u._id) }} title="Delete"
                              className="p-1.5 text-gray-400 hover:text-red-400 bg-[#1a1a2e] hover:bg-[#2a2a45] rounded transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[#1a1a2e]">
                {users.loading ? [...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 animate-pulse space-y-2">
                    <div className="h-4 bg-[#1a1a2e] rounded w-3/4" />
                    <div className="h-3 bg-[#1a1a2e] rounded w-1/2" />
                  </div>
                )) : users.data.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">No users found.</div>
                ) : users.data.map(u => (
                  <div key={u._id} className={`p-4 space-y-3 cursor-pointer hover:bg-[#1a1a2e]/20 transition-colors ${u.isBanned ? 'opacity-50' : ''}`} onClick={() => openUserDetail(u)}>
                    <div className="flex items-center gap-3">
                      <Avatar user={u} size="md" onImageClick={setPreviewImg} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-sm">{u.name}</span>
                          {u.role === 'admin' && <ShieldCheck size={12} className="text-emerald-400" />}
                          <PlanBadge plan={u.plan} />
                          {u.isBanned && <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-500/10 text-red-400">BANNED</span>}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={u.plan?.type || 'free'}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => { e.stopPropagation(); handleUpdatePlan(u._id, e.target.value) }}
                        className="flex-1 bg-[#1a1a2e] border border-[#2a2a45] text-xs text-white rounded px-2 py-1.5 focus:outline-none"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleAdmin(u._id, u.role === 'admin') }}
                        className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded border transition-colors ${u.role === 'admin'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-[#1a1a2e] text-gray-400 border-[#2a2a45]'
                          }`}
                      >
                        <Crown size={11} /> {u.role === 'admin' ? 'Admin' : 'User'}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleBanUser(u._id, u.isBanned) }}
                        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded border bg-[#1a1a2e] border-[#2a2a45] text-amber-400">
                        <ShieldAlert size={11} /> {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(u._id) }}
                        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded border bg-[#1a1a2e] border-[#2a2a45] text-red-400">
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-[#1a1a2e] flex items-center justify-between text-xs">
                <span className="text-gray-400">{users.total} users</span>
                <div className="flex gap-2 items-center">
                  <button disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)}
                    className="p-1 rounded bg-[#1a1a2e] disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <span className="px-2 py-1 bg-[#1a1a2e] rounded">{userPage}/{users.pages || 1}</span>
                  <button disabled={userPage >= users.pages} onClick={() => setUserPage(p => p + 1)}
                    className="p-1 rounded bg-[#1a1a2e] disabled:opacity-40"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          )}

          {/* ── CHATBOTS ── */}
          {activeTab === 'chatbots' && (
            <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl flex flex-col">
              <div className="p-3 border-b border-[#1a1a2e]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input type="text" placeholder="Search bots..." value={botSearch}
                    onChange={e => { setBotSearch(e.target.value); setBotPage(1) }}
                    className="w-full bg-[#1a1a2e] border border-[#2a2a45] rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-accent" />
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block min-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-[#1a1a2e]/50 border-b border-[#1a1a2e]">
                    <tr>
                      <th className="px-4 py-3">Bot Name</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Docs</th>
                      <th className="px-4 py-3 text-center">Queries</th>
                      <th className="px-4 py-3 text-center">Tokens</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bots.loading ? [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-[#1a1a2e]">
                        {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-[#1a1a2e] rounded animate-pulse" /></td>)}
                      </tr>
                    )) : bots.data.length === 0 ? (
                      <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">No chatbots found.</td></tr>
                    ) : bots.data.map(bot => (
                      <tr key={bot._id} className="border-b border-[#1a1a2e] hover:bg-[#1a1a2e]/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{bot.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar user={bot.owner} onImageClick={setPreviewImg} />
                            <div>
                              <div className="text-sm">{bot.owner?.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-400">{bot.owner?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${bot.status === 'active' || bot.status === 'ready'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>{bot.status}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-400">{bot.documents?.length || 0}</td>
                        <td className="px-4 py-3 text-center text-gray-400">{bot.queries ?? bot.stats?.totalMessages ?? bot.stats?.totalChats ?? 0}</td>
                        <td className="px-4 py-3 text-center text-gray-400">{fmt(bot.tokens ?? bot.stats?.totalTokens ?? 0)}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(bot.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[#1a1a2e]">
                {bots.loading ? [...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 animate-pulse space-y-2">
                    <div className="h-4 bg-[#1a1a2e] rounded w-1/2" />
                    <div className="h-3 bg-[#1a1a2e] rounded w-3/4" />
                  </div>
                )) : bots.data.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">No chatbots found.</div>
                ) : bots.data.map(bot => (
                  <div key={bot._id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                          <Bot size={15} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{bot.name}</p>
                          <p className="text-xs text-gray-400">{new Date(bot.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${bot.status === 'active' || bot.status === 'ready'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>{bot.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar user={bot.owner} onImageClick={setPreviewImg} />
                      <span className="text-xs text-gray-400 truncate">{bot.owner?.email || 'Unknown'}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>📄 {bot.documents?.length || 0} docs</span>
                      <span>💬 {bot.queries ?? bot.stats?.totalMessages ?? bot.stats?.totalChats ?? 0} queries</span>
                      <span>🔤 {fmt(bot.tokens ?? bot.stats?.totalTokens ?? 0)} tokens</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-[#1a1a2e] flex items-center justify-between text-xs">
                <span className="text-gray-400">{bots.total} bots</span>
                <div className="flex gap-2 items-center">
                  <button disabled={botPage === 1} onClick={() => setBotPage(p => p - 1)}
                    className="p-1 rounded bg-[#1a1a2e] disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <span className="px-2 py-1 bg-[#1a1a2e] rounded">{botPage}/{bots.pages || 1}</span>
                  <button disabled={botPage >= bots.pages} onClick={() => setBotPage(p => p + 1)}
                    className="p-1 rounded bg-[#1a1a2e] disabled:opacity-40"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          )}

          {/* ── REVENUE ── */}
          {activeTab === 'revenue' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400"><CreditCard size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-400">Monthly Recurring Revenue</p>
                    <p className="text-2xl font-bold mt-0.5">₹{revenue?.estimatedMRR?.toLocaleString() || 0}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Based on Pro subscriptions (₹499/mo).</p>
              </div>

              <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl p-5">
                <h3 className="font-semibold mb-4 text-sm">Subscriber Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Free', val: revenue?.free, color: 'bg-gray-500', rev: null },
                    { label: 'Pro', val: revenue?.pro, color: 'bg-purple-500', rev: (revenue?.pro || 0) * 499 },
                    { label: 'Enterprise', val: revenue?.enterprise, color: 'bg-amber-500', rev: null },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a2e]/50 border border-[#2a2a45]">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                        <span className="text-sm font-medium">{r.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{r.val || 0} users</div>
                        {r.rev !== null && <div className="text-xs text-emerald-400">₹{r.rev.toLocaleString()}/mo</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 flex flex-col items-center justify-center p-4"
            onClick={() => setPreviewImg(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative flex flex-col items-center"
            >
              <button
                onClick={() => setPreviewImg(null)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white p-2"
              >
                <X size={28} />
              </button>
              <img
                src={previewImg.src}
                alt={previewImg.name}
                className="max-w-[90vw] max-h-[75vh] w-[360px] rounded-2xl object-cover shadow-2xl"
              />
              <p className="text-white font-semibold mt-4 text-lg">{previewImg.name}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Detail Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[101] w-full sm:w-[420px] bg-[#0d0d1a] border-l border-[#1a1a2e] flex flex-col overflow-y-auto"
            >
              {/* Header */}
              <div className="relative p-6 border-b border-[#1a1a2e] bg-gradient-to-b from-[#1a1a2e]/50 to-transparent">
                <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-[#1a1a2e] rounded-full transition-colors">
                  <X size={18} />
                </button>
                <div className="flex flex-col items-center text-center mt-4">
                  <Avatar user={selectedUser} size="lg" onImageClick={setPreviewImg} />
                  <h2 className="text-xl font-bold text-white mt-4 flex items-center justify-center gap-2">
                    {selectedUser.name}
                    {selectedUser.role === 'admin' && <ShieldCheck size={18} className="text-emerald-400" />}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <PlanBadge plan={selectedUser.plan} />
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase ${selectedUser.isBanned ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {selectedUser.isBanned ? 'Banned' : 'Active'}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase ${selectedUser.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[#1a1a2e] text-gray-400 border-[#2a2a45]'}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 space-y-8">
                {detailLoading || !userDetail ? (
                  <div className="animate-pulse space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[#1a1a2e] rounded-xl" />)}
                    </div>
                    <div className="h-12 bg-[#1a1a2e] rounded-xl" />
                    <div className="h-32 bg-[#1a1a2e] rounded-xl" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#1a1a2e]/50 border border-[#2a2a45] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                        <Bot size={20} className="text-emerald-400 mb-2" />
                        <span className="text-2xl font-bold text-white">{userDetail?.chatbotsCount ?? 0}</span>
                        <span className="text-xs text-gray-400 mt-1">Chatbots</span>
                      </div>
                      <div className="bg-[#1a1a2e]/50 border border-[#2a2a45] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                        <MessageSquare size={20} className="text-purple-400 mb-2" />
                        <span className="text-2xl font-bold text-white">{userDetail?.sessionsCount ?? 0}</span>
                        <span className="text-xs text-gray-400 mt-1">Sessions</span>
                      </div>
                      <div className="bg-[#1a1a2e]/50 border border-[#2a2a45] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                        <MessageSquare size={20} className="text-blue-400 mb-2" />
                        <span className="text-2xl font-bold text-white">{userDetail?.totalMessages ?? 0}</span>
                        <span className="text-xs text-gray-400 mt-1">Messages</span>
                      </div>
                      <div className="bg-[#1a1a2e]/50 border border-[#2a2a45] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                        <TrendingUp size={20} className="text-amber-400 mb-2" />
                        <span className="text-2xl font-bold text-white">{fmt(userDetail?.monthlyTokens ?? 0)}</span>
                        <span className="text-xs text-gray-400 mt-1">Tokens (month)</span>
                      </div>
                      <div className="bg-[#1a1a2e]/50 border border-[#2a2a45] rounded-xl p-4 flex flex-col items-center justify-center text-center col-span-2">
                        <TrendingUp size={20} className="text-emerald-400 mb-2" />
                        <span className="text-2xl font-bold text-white">{fmt(userDetail?.totalTokens ?? 0)}</span>
                        <span className="text-xs text-gray-400 mt-1">Tokens (total)</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                        <Settings size={14} className="text-gray-400" /> Account Settings
                      </h3>
                      <div className="bg-[#1a1a2e]/30 border border-[#2a2a45] rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">Current Plan</p>
                            <p className="text-xs text-gray-400">Change user's subscription</p>
                          </div>
                          <select
                            value={userDetail.user.plan?.type || 'free'}
                            onChange={e => handleUpdatePlan(userDetail.user._id, e.target.value)}
                            className="bg-[#0d0d1a] border border-[#2a2a45] text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </div>
                        <div className="h-px bg-[#2a2a45]" />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">Admin Access</p>
                            <p className="text-xs text-gray-400">Grant dashboard access</p>
                          </div>
                          <button
                            onClick={() => handleToggleAdmin(userDetail.user._id, userDetail.user.role === 'admin')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${userDetail.user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}
                          >
                            {userDetail.user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2">
                        <ShieldAlert size={14} /> Danger Zone
                      </h3>
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">Suspend User</p>
                            <p className="text-xs text-gray-400">Prevent login access</p>
                          </div>
                          <button
                            onClick={() => handleBanUser(userDetail.user._id, userDetail.user.isBanned)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${userDetail.user.isBanned ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}
                          >
                            {userDetail.user.isBanned ? 'Unban Account' : 'Ban Account'}
                          </button>
                        </div>
                        <div className="h-px bg-red-500/20" />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">Delete Account</p>
                            <p className="text-xs text-gray-400">Permanent removal</p>
                          </div>
                          <button
                            onClick={() => handleDeleteUser(userDetail.user._id)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-4">
                      <span className="flex items-center gap-1"><Calendar size={12} /> Joined: {new Date(userDetail.user.createdAt).toLocaleDateString()}</span>
                      {userDetail.user.lastLogin && <span className="flex items-center gap-1"><Clock size={12} /> Login: {new Date(userDetail.user.lastLogin).toLocaleDateString()}</span>}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}