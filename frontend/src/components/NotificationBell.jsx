import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Bell, Check, Trash2, ExternalLink, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function NotificationBell({ placement = 'bottom-end' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [deletingIds, setDeletingIds] = useState(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)
  const longPressTimer = useRef(null)
  const { token } = useAuthStore()

  // VITE_API_URL should be just the origin (e.g. "http://localhost:5000")
  // The /api prefix is appended by each endpoint below
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const fetchNotifications = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      })

      // If server responds 304 Not Modified there's no body to parse
      if (res.status === 304) return
      if (!res.ok) {
        console.error('Failed to fetch notifications', res.status)
        return
      }

      const data = await res.json()
      if (data && data.success) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }

  // Fetch on mount and whenever token changes
  useEffect(() => {
    if (token) fetchNotifications()
    const interval = setInterval(() => {
      if (token) fetchNotifications()
    }, 60000)
    return () => clearInterval(interval)
  }, [token])

  // Re-fetch every time dropdown opens so data is always fresh
  useEffect(() => {
    if (isOpen && token) fetchNotifications()
  }, [isOpen])

  // Calculate dropdown position relative to the bell button
  const updateDropdownPosition = useCallback(() => {
    if (!isOpen || !buttonRef.current) return

    const btnRect = buttonRef.current.getBoundingClientRect()
    const styles = {}

    if (placement === 'bottom-end') {
      // Pop down below the button, right-aligned
      styles.top = `${btnRect.bottom + 8}px`
      styles.right = `16px`
      // On wider screens, pull from the right edge of the button
      if (window.innerWidth >= 640) {
        styles.right = `${window.innerWidth - btnRect.right}px`
      }
    } else if (placement === 'top-start') {
      // Pop up above the button, left-aligned
      styles.bottom = `${window.innerHeight - btnRect.top + 8}px`
      styles.left = `${btnRect.left}px`
    }

    setDropdownStyle(styles)
  }, [isOpen, placement])

  useEffect(() => {
    updateDropdownPosition()
    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('resize', updateDropdownPosition)
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true)
      window.removeEventListener('resize', updateDropdownPosition)
    }
  }, [updateDropdownPosition])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false)
        // Exit selection mode when closing dropdown
        if (selectionMode) {
          exitSelectionMode()
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectionMode])

  // ─── Selection mode handlers ──────────────────────────────────────────────────
  const enterSelectionMode = useCallback((id) => {
    setSelectionMode(true)
    setSelectedIds([id])
  }, [])

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false)
    setSelectedIds([])
  }, [])

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }, [])

  // ─── Long press handlers ──────────────────────────────────────────────────────
  const handlePressStart = useCallback((id) => {
    // Clear any previous timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    longPressTimer.current = setTimeout(() => {
      enterSelectionMode(id)
    }, 500)
  }, [enterSelectionMode])

  const handlePressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  // ─── Delete handlers ──────────────────────────────────────────────────────────
  const deleteSingle = async (id, e) => {
    e.stopPropagation()
    if (deletingIds.has(id)) return

    setDeletingIds(prev => new Set(prev).add(id))

    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id))
        setUnreadCount(prev => Math.max(0, prev - (notifications.find(n => n._id === id)?.isRead ? 0 : 1)))
      } else {
        console.error('Failed to delete notification')
      }
    } catch (err) {
      console.error('Failed to delete notification', err)
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const deleteSelected = async () => {
    if (selectedIds.length === 0 || bulkDeleting) return
    setBulkDeleting(true)

    try {
      const res = await fetch(`${API_BASE}/api/notifications/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      })
      if (res.ok) {
        setNotifications(prev => prev.filter(n => !selectedIds.includes(n._id)))
        setUnreadCount(prev => {
          const removedUnread = notifications.filter(n => selectedIds.includes(n._id) && !n.isRead).length
          return Math.max(0, prev - removedUnread)
        })
        exitSelectionMode()
      } else {
        console.error('Failed to bulk delete notifications')
      }
    } catch (err) {
      console.error('Failed to bulk delete notifications', err)
    } finally {
      setBulkDeleting(false)
    }
  }

  // ─── Mark as read ─────────────────────────────────────────────────────────────
  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, {
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
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      setUnreadCount(prev => Math.max(0, prev - 1))
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  const selectedCount = useMemo(() => selectedIds.length, [selectedIds])

  return (
    <>
      <div className="relative inline-flex">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#1a1a2e] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0d0d1a]"></span>
          )}
        </button>
      </div>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="fixed w-[calc(100vw-32px)] sm:w-80 bg-[#12121a] border border-[#1e1e2d] rounded-xl shadow-2xl z-[9999] overflow-hidden flex flex-col max-h-[400px]"
        >
          {/* ─── Top bar ─────────────────────────────────────────────────────── */}
          {selectionMode ? (
            <div className="p-3 border-b border-[#1e1e2d] flex items-center justify-between bg-[#151522] shrink-0">
              <span className="text-sm font-semibold text-white">
                {selectedCount} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={deleteSelected}
                  disabled={bulkDeleting || selectedCount === 0}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 size={14} />
                  {bulkDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={exitSelectionMode}
                  className="flex items-center gap-1 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg text-xs font-semibold transition-colors"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
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
          )}
          
          {/* ─── Notifications list ──────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => {
                  const isSelected = selectedIds.includes(notif._id)
                  const isDeleting = deletingIds.has(notif._id)

                  return (
                    <div 
                      key={notif._id} 
                      className={`
                        p-3 border-b border-[#1e1e2d]/50 transition-colors flex gap-3 group
                        ${selectionMode ? 'cursor-pointer select-none' : ''}
                        ${isSelected ? 'bg-accent/15 border-accent/30' : ''}
                        ${!selectionMode && !notif.isRead ? 'bg-[#1a1a2e]/30 hover:bg-[#1a1a2e]' : 'hover:bg-[#1a1a2e]/50'}
                        ${isDeleting ? 'opacity-40 pointer-events-none' : ''}
                      `}
                      onClick={() => {
                        if (selectionMode) {
                          toggleSelect(notif._id)
                        } else if (!notif.isRead) {
                          markAsRead(notif._id)
                        }
                      }}
                      onMouseDown={() => !selectionMode && handlePressStart(notif._id)}
                      onMouseUp={handlePressEnd}
                      onMouseLeave={handlePressEnd}
                      onTouchStart={() => !selectionMode && handlePressStart(notif._id)}
                      onTouchEnd={handlePressEnd}
                      onTouchMove={handlePressEnd}
                    >
                      {/* Checkbox (selection mode) */}
                      {selectionMode && (
                        <div className="flex items-center shrink-0 pt-0.5">
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                            ${isSelected
                              ? 'bg-accent border-accent'
                              : 'border-gray-500 bg-transparent'
                            }
                          `}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-medium ${notif.isRead ? 'text-gray-300' : 'text-white'}`}>
                            {notif.title}
                          </h4>
                          {!selectionMode && !notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{notif.message}</p>
                        {notif.link && (
                          <Link 
                            to={notif.link}
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsOpen(false)
                            }}
                            className="mt-2 text-xs text-accent hover:underline inline-flex items-center gap-1"
                          >
                            View Details <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>

                      {/* Single delete button (only when NOT in selection mode) */}
                      {!selectionMode && (
                        <button
                          onClick={(e) => deleteSingle(notif._id, e)}
                          disabled={isDeleting}
                          className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all shrink-0 self-start mt-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Delete notification"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}