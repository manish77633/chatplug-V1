import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Settings, BarChart3, FileText,
  LayoutDashboard, LogOut, Sparkles, User, X, Home, Shield
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import NotificationBell from './NotificationBell'


export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const userName = user?.name || user?.email?.split('@')[0] || 'User'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { name: 'Home',        icon: Home,            path: '/' },
    { name: 'Dashboard',   icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Chatbots', icon: Bot,             path: '/chatbots' },
    { name: 'Analytics',   icon: BarChart3,       path: '/analytics' },
    { name: 'Docs',        icon: FileText,        path: '/docs' },
    { name: 'Settings',    icon: Settings,        path: '/settings' },
  ]

  return (
    <>
      <aside className={`fixed lg:static inset-y-0 left-0 z-[110] w-64 bg-[#0d0d1a] border-r border-[#1a1a2e] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col h-screen`}>
        {/* User Profile */}
        <div className="p-5 flex items-center gap-3 border-b border-[#1a1a2e]">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-xl object-cover object-center shrink-0" />
          ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white font-bold text-base shadow-lg shrink-0">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate text-sm">{userName}</h3>
            <span className="px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent">
              {user?.plan?.type?.toUpperCase() || 'FREE'}
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-text-muted hover:text-text-primary p-1">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path === '/chatbots' && location.pathname.startsWith('/chatbot')) ||
                             (item.path === '/docs' && location.pathname.startsWith('/docs'))

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm min-h-[44px] ${isActive ? 'bg-[#1a1a2e] text-white' : 'text-gray-400 hover:bg-[#1a1a2e]/50 hover:text-white'}`}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                {item.name}
              </Link>
            )
          })}
          
          {user?.role === 'admin' && (
            <>
              <div className="my-2 border-t border-[#1a1a2e]" />
              <Link
                to="/admin"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm min-h-[44px] ${location.pathname === '/admin' ? 'bg-[#1a1a2e] text-white' : 'text-gray-400 hover:bg-[#1a1a2e]/50 hover:text-white'}`}
              >
                <Shield size={18} className={location.pathname === '/admin' ? 'text-white' : 'text-gray-400'} />
                Admin Panel
              </Link>
            </>
          )}
        </nav>

        {/* Upgrade Card + Logout */}
        <div className="p-3 mt-auto space-y-2">
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] border border-accent/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles size={20} className="text-accent mb-2" />
            <h4 className="font-semibold text-white mb-0.5 text-sm">Upgrade to Pro</h4>
            <p className="text-xs text-gray-400 mb-3">Get unlimited queries & priority support.</p>
            <button
              onClick={() => navigate('/settings?tab=billing')}
              className="w-full py-2 bg-background border border-[#1a1a2e] hover:border-accent/50 rounded-lg text-xs font-medium text-white transition-colors relative z-10"
            >
              View Plans
            </button>
          </div>
          
          {/* Profile Dropdown trigger as Logout button area on desktop */}
          <div className="flex items-center justify-between w-full px-3 py-2.5 mt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-all text-sm font-medium"
            >
              <LogOut size={16} /> Sign out
            </button>
            <div className="flex items-center gap-1">
              <NotificationBell placement="top-start" />
              <button
                onClick={() => { navigate('/settings'); if (onClose) onClose(); }}
                className="w-[34px] h-[34px] rounded-full bg-[#1e1e30] border border-[#2a2a45] hover:bg-[#252540] flex items-center justify-center text-sm font-medium text-gray-200 transition-colors overflow-hidden"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover object-center" />
                ) : (
                  userName?.charAt(0)?.toUpperCase() || 'U'
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] lg:hidden" onClick={onClose} />
      )}
    </>
  )
}
