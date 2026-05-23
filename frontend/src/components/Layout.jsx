import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Zap, Bell, LogOut } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuthStore } from '../store/authStore'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-[#0a0a14] overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden relative bg-[#0a0a14]">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 border-b border-[#1a1a2e] bg-[#0d0d1a] sticky top-0 z-20 shrink-0" style={{ minHeight: 56, maxHeight: 56 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#1a1a2e] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-accent" />
            <Link to="/" className="font-bold tracking-tight text-white">ChatPlug</Link>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#1a1a2e] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center">
              <Bell size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-red-400 hover:text-red-300 rounded-xl hover:bg-[#1a1a2e] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pb-[72px] md:pb-0 relative">
          {children}
        </div>
      </div>
    </div>
  )
}
