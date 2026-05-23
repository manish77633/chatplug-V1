// src/components/ui/BottomNav.jsx
import { useLocation, Link } from 'react-router-dom'
import { LayoutDashboard, Bot, BarChart3, FileText, Settings } from 'lucide-react'

const TABS = [
  { icon: LayoutDashboard, label: 'Home',      path: '/dashboard' },
  { icon: Bot,             label: 'Bots',       path: '/chatbots'  },
  { icon: BarChart3,       label: 'Analytics',  path: '/analytics' },
  { icon: FileText,        label: 'Docs',       path: '/docs'      },
  { icon: Settings,        label: 'Settings',   path: '/settings'  },
]

export default function BottomNav() {
  const location = useLocation()

  // Hide on auth pages and landing
  const hidden = ['/', '/login', '/register']
  if (hidden.includes(location.pathname)) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] md:hidden"
      style={{
        background: '#0f0f1a',
        borderTop: '1px solid #1e1e30',
        height: 60,
      }}
    >
      <div className="flex items-center justify-around h-full px-2">
        {TABS.map(({ icon: Icon, label, path }) => {
          const isActive =
            path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(path)
          return (
            <Link
              key={path}
              to={path}
              id={`bottom-nav-${label.toLowerCase()}`}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
              aria-label={label}
            >
              <Icon
                size={22}
                className={isActive ? 'text-purple-500' : 'text-gray-500'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] font-semibold ${
                  isActive ? 'text-purple-500' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
