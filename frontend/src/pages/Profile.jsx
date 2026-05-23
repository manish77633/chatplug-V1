// src/pages/Profile.jsx
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Shield, Calendar, Edit2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const PLAN_COLORS = {
  free:       'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  pro:        'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  enterprise: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
}

export default function Profile() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const name  = user?.name  || 'User'
  const email = user?.email || 'user@example.com'
  const plan  = user?.plan?.type || 'free'
  const role  = user?.role || 'user'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="bg-background text-text-primary font-inter flex flex-col selection:bg-accent/30 selection:text-text-primary pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#111118]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          id="profile-back"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-white">Profile</h1>
      </div>

      <div className="w-full px-4 py-6 md:max-w-2xl md:mx-auto">
        {/* Avatar card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 mb-4 flex items-center gap-5"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-purple-900/40 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{name}</h2>
            <p className="text-sm text-gray-400 truncate">{email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${PLAN_COLORS[plan]}`}>
                {plan} plan
              </span>
              {role === 'admin' && (
                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Admin
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Info cards */}
        {[
          { icon: Mail,     label: 'Email',       value: email },
          { icon: Shield,   label: 'Account Type', value: role.charAt(0).toUpperCase() + role.slice(1) },
          { icon: Calendar, label: 'Member Since', value: 'May 2025' },
        ].map(({ icon: Icon, label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * (i + 1) }}
            className="w-full bg-[#1a1a2e] border border-white/5 rounded-2xl px-5 py-4 mb-3 flex items-center gap-4"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-sm font-semibold text-white truncate">{value}</p>
            </div>
          </motion.div>
        ))}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            id="profile-edit-btn"
            onClick={() => navigate('/settings')}
            className="w-full h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-900/30"
          >
            <Edit2 size={16} /> Edit Profile
          </button>
          <button
            id="profile-logout-btn"
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="w-full h-12 rounded-2xl bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-400 font-semibold text-sm transition-colors border border-white/5 hover:border-red-500/20"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
