import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function NotificationBell({ placement = 'bottom-end' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)
  const { token } = useAuthStore()

  // Dynamic positioning based on placement
  let placementClasses = 'absolute mt-2 right-0' // default
  if (placement === 'bottom-end') {
    // Top header (mobile): pop down, align right but pull left on small screens
    placementClasses = 'absolute top-full right-[-44px] sm:right-0 mt-2'
  } else if (placement === 'top-start') {
    // Sidebar bottom (desktop): pop up, align left
    placementClasses = 'absolute bottom-full left-0 mb-2'
  }

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }

  useEffect(() => {
    if (token) fetchNotifications()
    // Optional: poll every minute
    const interval = setInterval(() => {
      if (token) fetchNotifications()
    }, 60000)
    return () => clearInterval(interval)
  }, [token])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllAsRead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const markAsRead = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      setUnreadCount(prev => Math.max(0, prev - 1))
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#1a1a2e] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0d0d1a]"></span>
        )}
      </button>

      {isOpen && (
        <div className={`${placementClasses} w-[calc(100vw-32px)] sm:w-80 bg-[#12121a] border border-[#1e1e2d] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]`}>
          <div className="p-3 border-b border-[#1e1e2d] flex items-center justify-between bg-[#151522] shrink-0">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-accent hover:text-accent-hover flex items-center gap-1"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`p-3 border-b border-[#1e1e2d]/50 hover:bg-[#1a1a2e] transition-colors flex gap-3 ${!notif.isRead ? 'bg-[#1a1a2e]/30' : ''}`}
                    onClick={() => !notif.isRead && markAsRead(notif._id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-medium ${notif.isRead ? 'text-gray-300' : 'text-white'}`}>
                          {notif.title}
                        </h4>
                        {!notif.isRead && <span className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{notif.message}</p>
                      {notif.link && (
                        <Link 
                          to={notif.link}
                          onClick={() => setIsOpen(false)}
                          className="mt-2 text-xs text-accent hover:underline inline-flex items-center gap-1"
                        >
                          View Details <ExternalLink size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
