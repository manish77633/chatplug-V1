// src/components/ui/ActionMenu.jsx
import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ActionMenu({ actions = [], align = 'right' }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        id="action-menu-trigger"
        onClick={() => setOpen(o => !o)}
        className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-elevated transition-colors inline-flex min-w-[36px] min-h-[36px] items-center justify-center"
      >
        <MoreVertical size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className={`absolute z-50 mt-1 w-44 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => { action.onClick(); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${
                  action.danger
                    ? 'text-danger hover:bg-danger/10'
                    : 'text-text-primary hover:bg-surface-elevated'
                }`}
              >
                {action.icon && <action.icon size={14} />}
                {action.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
