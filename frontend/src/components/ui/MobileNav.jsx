// src/components/ui/MobileNav.jsx
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Bot, BarChart3, Settings, User } from 'lucide-react'

const navItems = [
  { label: 'Home',      icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Bots',      icon: Bot,             href: '/dashboard#chatbots-section' },
  { label: 'Analytics', icon: BarChart3,        href: '/chatbot/global/analytics', external: true },
  { label: 'Settings',  icon: Settings,         href: '/settings' },
  { label: 'Profile',   icon: User,             href: '/settings?tab=profile' },
]

export default function MobileNav({ onAnalyticsClick }) {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-surface/95 backdrop-blur-xl border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/dashboard')
          const Icon = item.icon

          if (item.external && onAnalyticsClick) {
            return (
              <button
                key={item.label}
                id={`mobile-nav-${item.label.toLowerCase()}`}
                onClick={onAnalyticsClick}
                className={`flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-accent'
                    : 'text-text-muted hover:text-text-primary active:scale-95'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold leading-none">{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.label}
              id={`mobile-nav-${item.label.toLowerCase()}`}
              to={item.href}
              className={`flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center px-3 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-primary active:scale-95'
              }`}
            >
              {isActive && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
