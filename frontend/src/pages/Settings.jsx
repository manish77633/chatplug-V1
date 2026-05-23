// src/pages/Settings.jsx
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Bell, Key, CreditCard, ArrowLeft, Eye, EyeOff, Check,
  Copy, RefreshCw, Zap, Shield, ChevronRight, Sparkles, Lock
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import api from '../utils/api'

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api',           label: 'API Keys',      icon: Key },
  { id: 'billing',       label: 'Billing',       icon: CreditCard },
]

function ProfileTab({ user }) {
  const [form, setForm] = useState({
    name:            user?.name || '',
    email:           user?.email || '',
    currentPassword: '',
    newPassword:     '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving]             = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    // Auth to be implemented later
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success('Profile updated!')
    console.log('[Settings] Profile save:', form)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-accent/20">
          {(form.name?.[0] || 'U').toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary mb-1">Profile photo</p>
          <button
            type="button"
            onClick={() => toast('Photo upload coming soon', { icon: '📷' })}
            className="text-sm text-accent hover:text-accent-secondary transition-colors font-medium"
          >
            Change photo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Lock size={16} className="text-accent" /> Change Password
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors pr-12"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.newPassword}
              onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
              placeholder="Min. 8 characters"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => toast('No changes to discard')} className="px-5 py-2.5 rounded-xl border border-border text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors font-medium text-sm">
          Discard
        </button>
        <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-colors shadow-lg shadow-accent/20 flex items-center gap-2 disabled:opacity-70">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newQueries:      true,
    weeklyDigest:    true,
    botStatusAlerts: true,
    billing:         false,
    marketing:       false,
  })

  const toggle = (key) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }))
    toast.success('Preference saved')
  }

  const items = [
    { key: 'newQueries',      label: 'New chat queries',         desc: 'Get notified when your bot receives new conversations' },
    { key: 'weeklyDigest',    label: 'Weekly analytics digest',  desc: 'A summary of your chatbot performance every Monday' },
    { key: 'botStatusAlerts', label: 'Bot status alerts',        desc: 'Get alerted when a bot finishes training or encounters an error' },
    { key: 'billing',         label: 'Billing & usage alerts',   desc: 'Alerts when you approach your plan limits' },
    { key: 'marketing',       label: 'Product updates',          desc: 'News about new features and product announcements' },
  ]

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.key} className="flex items-start justify-between p-5 bg-background border border-border rounded-2xl gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-primary text-sm">{item.label}</p>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
          <button
            id={`notif-toggle-${item.key}`}
            onClick={() => toggle(item.key)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${prefs[item.key] ? 'bg-accent' : 'bg-surface-elevated border border-border'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${prefs[item.key] ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      ))}
    </div>
  )
}

function APIKeysTab() {
  const [apiKey] = useState('sk-chatplug-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
  const [revealed, setRevealed] = useState(false)

  const masked = apiKey.slice(0, 14) + '•'.repeat(28) + apiKey.slice(-4)

  return (
    <div className="space-y-6">
      <div className="p-5 bg-background border border-border rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-text-primary">Live API Key</p>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 font-mono text-sm text-text-muted bg-surface border border-border rounded-xl px-4 py-3 overflow-hidden overflow-ellipsis whitespace-nowrap">
            {revealed ? apiKey : masked}
          </code>
          <button
            id="api-key-reveal"
            onClick={() => setRevealed(r => !r)}
            className="p-3 border border-border rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={revealed ? 'Hide key' : 'Reveal key'}
          >
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            id="api-key-copy"
            onClick={() => { navigator.clipboard.writeText(apiKey); toast.success('API key copied!') }}
            className="p-3 border border-border rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Copy key"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex gap-3">
        <Shield size={16} className="text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-500/90 leading-relaxed">
          Never expose your API key in client-side code or public repositories. Treat it like a password.
        </p>
      </div>

      <button
        id="api-key-regenerate"
        onClick={() => toast('Key regeneration coming soon — requires email confirmation', { icon: '🔑' })}
        className="flex items-center gap-2 px-5 py-3 border border-danger/30 text-danger hover:bg-danger/5 rounded-xl text-sm font-semibold transition-colors"
      >
        <RefreshCw size={16} /> Regenerate Key
      </button>
    </div>
  )
}

function BillingTab({ user, setUser }) {
  const plans = [
    { name: 'Free', price: '$0', period: '/mo', features: ['3 Chatbots', '50 queries/day', 'Standard support'], current: user?.plan?.type === 'free', color: 'border-border' },
    { name: 'Pro',  price: '$49', period: '/mo', features: ['20 Chatbots', '2000 queries/day', 'Priority support', 'Remove branding'], current: user?.plan?.type === 'pro', color: 'border-accent', highlight: true },
    { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited chatbots', 'Custom volume', '24/7 support', 'Dedicated manager'], current: user?.plan?.type === 'enterprise', color: 'border-border' },
  ]

  const handleUpgrade = async () => {
    try {
      const { data } = await api.post('/payment/create-order', { plan: 'pro' });
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: 'INR',
        name: 'ChatPlug',
        description: 'Pro Plan',
        order_id: data.id,
        handler: async (response) => {
          try {
            const verify = await api.post('/payment/verify', response);
            if (verify.data.success) {
              toast.success('Upgraded to Pro!');
              const updatedUser = { ...user, plan: { type: 'pro' } };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#7c3aed' }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Failed to initiate payment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Usage */}
      <div className="p-5 bg-background border border-border rounded-2xl">
        <h3 className="font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
          <Zap size={16} className="text-accent" /> Current Usage
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Chatbots', used: 1, max: 3 },
            { label: 'Daily Queries', used: 12, max: 50 },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-text-muted">{item.label}</span>
                <span className="text-text-primary">{item.used} / {item.max}</span>
              </div>
              <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full transition-all duration-700"
                  style={{ width: `${(item.used / item.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div
            key={plan.name}
            className={`p-5 bg-background border-2 rounded-2xl flex flex-col transition-all ${plan.current ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40'}`}
          >
            {plan.highlight && !plan.current && (
              <span className="mb-3 self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-accent to-accent-secondary text-white">POPULAR</span>
            )}
            {plan.current && (
              <span className="mb-3 self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent border border-accent/30">CURRENT PLAN</span>
            )}
            <h4 className="font-bold text-text-primary mb-1">{plan.name}</h4>
            <div className="mb-4">
              <span className="text-2xl font-black text-text-primary">{plan.price}</span>
              <span className="text-text-muted text-sm">{plan.period}</span>
            </div>
            <ul className="space-y-2 flex-1 mb-4">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-text-primary">
                  <Check size={12} className="text-accent shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              id={`billing-plan-${plan.name.toLowerCase()}`}
              onClick={() => {
                if (plan.current) toast('You are already on this plan', { icon: '✅' })
                else if (plan.name === 'Enterprise') toast('Contact sales coming soon', { icon: '📞' })
                else handleUpgrade()
              }}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                plan.current
                  ? 'bg-surface-elevated text-text-muted cursor-default'
                  : plan.highlight
                  ? 'bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20'
                  : 'border border-border hover:border-accent/40 text-text-primary hover:text-accent'
              }`}
            >
              {plan.current ? 'Current Plan' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Settings() {
  const [searchParams] = useSearchParams()
  const defaultTab     = searchParams.get('tab') || 'profile'
  const [activeTab, setActiveTab] = useState(TABS.find(t => t.id === defaultTab)?.id || 'profile')
  const { user, setUser } = useAuthStore()
  const navigate   = useNavigate()

  const ActiveComp = {
    profile:       <ProfileTab user={user} />,
    notifications: <NotificationsTab />,
    api:           <APIKeysTab />,
    billing:       <BillingTab user={user} setUser={setUser} />,
  }[activeTab]

  return (
    <div className="bg-background text-text-primary font-inter selection:bg-accent/30">
      {/* Header */}
      <div className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full px-2.5 sm:px-4 lg:max-w-5xl lg:mx-auto py-3 flex items-center gap-3">
          <button
            id="settings-back"
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary leading-tight">Settings</h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
              <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <span>/</span>
              <span className="text-gray-300 capitalize">{TABS.find(t => t.id === activeTab)?.label}</span>
            </div>
          </div>
        </div>

        {/* Mobile icon-only tab bar — full width, no scroll */}
        <div className="lg:hidden w-full border-t border-border">
          <div className="flex w-full">
            {TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  id={`settings-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-3 transition-all relative ${
                    active
                      ? 'text-accent bg-accent/10'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                >
                  {active && (
                    <span className="absolute top-0 left-0 right-0 h-0.5 bg-accent rounded-b" />
                  )}
                  <Icon size={20} />
                  <span className="text-[10px] font-semibold">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="w-full px-2.5 sm:px-4 py-6 lg:max-w-5xl lg:mx-auto">
        <div className="flex flex-col">
          {/* Horizontal Tab Bar */}
          <div className="hidden lg:flex flex-row items-center gap-1 border-b border-white/8 mb-6 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  id={`settings-tab-desk-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-sm cursor-pointer whitespace-nowrap transition-all duration-200 relative flex items-center gap-2 ${
                    isActive
                      ? 'bg-white/[0.08] text-white border-b-2 border-purple-500 rounded-t-xl'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border-b-2 border-transparent rounded-t-xl'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <main className="w-full min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full bg-surface border border-border rounded-2xl p-4 sm:p-6"
              >
                <h2 className="text-base md:text-xl font-bold text-text-primary mb-5 flex items-center gap-2">
                  {(() => {
                    const t = TABS.find(t => t.id === activeTab)
                    return t ? <t.icon size={18} className="text-accent" /> : null
                  })()}
                  {TABS.find(t => t.id === activeTab)?.label}
                </h2>
                {ActiveComp}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
