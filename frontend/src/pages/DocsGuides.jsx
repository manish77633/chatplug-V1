// src/pages/DocsGuides.jsx
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, ChevronLeft, ArrowRight, Rocket, Code2, Puzzle, Palette,
  Globe, Shield, Book, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

const guides = [
  {
    icon: Rocket,
    tag: 'Beginner',
    tagColor: 'text-green-400 bg-green-400/10 border-green-400/20',
    title: 'Getting Started in 5 Minutes',
    desc: 'Create your first chatbot, upload a PDF, and get an embeddable widget — all in under 5 minutes.',
    time: '5 min read',
    to: '/docs',
    action: null,
  },
  {
    icon: Code2,
    tag: 'Integration',
    tagColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    title: 'React Integration Guide',
    desc: 'Use the `@chatplug/react` package to embed your chatbot natively inside a React application with full TypeScript support.',
    time: '8 min read',
    to: null,
    action: () => toast('React integration guide coming soon', { icon: '⚛️' }),
  },
  {
    icon: Globe,
    tag: 'Integration',
    tagColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    title: 'WordPress Plugin Setup',
    desc: 'Install the official ChatPlug WordPress plugin and configure your bot from the WP admin dashboard — no code required.',
    time: '6 min read',
    to: null,
    action: () => toast('WordPress guide coming soon', { icon: '🔌' }),
  },
  {
    icon: Palette,
    tag: 'Customization',
    tagColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    title: 'Styling the Chat Widget',
    desc: 'Customize colors, fonts, positioning, and animations of the embeddable widget to perfectly match your brand.',
    time: '10 min read',
    to: null,
    action: () => toast('Styling guide coming soon', { icon: '🎨' }),
  },
  {
    icon: Puzzle,
    tag: 'Advanced',
    tagColor: 'text-accent bg-accent/10 border-accent/20',
    title: 'Webhooks & Event Streaming',
    desc: 'Set up webhooks to receive real-time events when users send messages, bots complete training, or errors occur.',
    time: '12 min read',
    to: null,
    action: () => toast('Webhooks guide coming soon', { icon: '🔗' }),
  },
  {
    icon: Shield,
    tag: 'Security',
    tagColor: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    title: 'Rate Limits & Best Practices',
    desc: 'Understand API rate limits, implement exponential backoff, and protect your API keys in production environments.',
    time: '7 min read',
    to: null,
    action: () => toast('Security guide coming soon', { icon: '🛡️' }),
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function DocsGuides() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-text-primary font-inter selection:bg-accent/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-10 py-4 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            id="docs-guides-back"
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2 group">
            <Zap size={20} className="text-accent group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold tracking-tight gradient-text">ChatPlug</span>
          </Link>
          <span className="text-border mx-1 hidden sm:block">/</span>
          <span className="text-sm font-medium text-text-muted hidden sm:block">Guides</span>
        </div>
        <Link
          to="/register"
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
        >
          Get Started <ArrowRight size={14} />
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-elevated border border-border text-sm font-medium text-accent-secondary mb-6">
            <Book size={14} /> Guides & Tutorials
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-text-primary tracking-tight mb-4">
            Learn to build with{' '}
            <span className="gradient-text">ChatPlug</span>
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Step-by-step tutorials, integration patterns, and best practices for getting the most out of ChatPlug.
          </p>
        </div>

        {/* Guides Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {guides.map((guide, i) => {
            const Icon = guide.icon
            const content = (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group p-6 bg-surface border border-border rounded-3xl hover:border-accent/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300 flex flex-col cursor-pointer"
                onClick={guide.action || undefined}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Icon size={22} className="text-accent" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${guide.tagColor}`}>
                      {guide.tag}
                    </span>
                    <ExternalLink size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2 group-hover:text-accent transition-colors leading-snug">
                  {guide.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed flex-1 mb-4">{guide.desc}</p>
                <span className="text-xs text-text-muted font-medium">{guide.time}</span>
              </motion.div>
            )

            return guide.to ? (
              <Link key={i} to={guide.to} className="contents">
                {content}
              </Link>
            ) : (
              <div key={i}>{content}</div>
            )
          })}
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center p-10 bg-surface border border-border rounded-3xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent-secondary/5 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-text-primary mb-3">Something missing?</h3>
            <p className="text-text-muted mb-6">Can't find what you're looking for? Our team is happy to help.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-accent-secondary text-white rounded-xl font-semibold shadow-lg hover:shadow-accent/30 transition-all hover:-translate-y-0.5"
              >
                Read Quickstart <ArrowRight size={16} />
              </Link>
              <button
                id="guides-contact-support"
                onClick={() => toast('Support chat coming soon', { icon: '💬' })}
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text-primary rounded-xl font-semibold hover:border-accent/40 hover:text-accent transition-all"
              >
                Contact Support
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
