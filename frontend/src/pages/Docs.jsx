import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Upload, Brain, Palette, Code2, ArrowRight, ArrowLeft, CheckCircle2,
  Zap, ChevronLeft, Copy
} from 'lucide-react'
import toast from 'react-hot-toast'

const STEPS = [
  {
    icon: Upload,
    title: 'Upload your data',
    desc: 'Add PDFs, paste URLs, or write plain text. ChatPlug scrapes and processes your content automatically.',
    code: null,
    tip: '💡 Tip: You can add multiple sources — ChatPlug merges them into one unified knowledge base.',
  },
  {
    icon: Brain,
    title: 'AI trains in background',
    desc: 'Your documents are split into chunks, embedded using OpenAI, and stored in a vector DB. Usually takes 1–2 minutes.',
    code: null,
    tip: '⚡ Powered by RAG — your bot only answers from YOUR content, never hallucinating beyond it.',
  },
  {
    icon: Palette,
    title: 'Customize look & feel',
    desc: 'Set the bot name, primary color, welcome message, and personality to match your brand perfectly.',
    code: `{
  "botName": "Support Assistant",
  "primaryColor": "#6C63FF",
  "welcomeMessage": "Hi! How can I help?",
  "personality": "Helpful"
}`,
    tip: '🎨 Your widget auto-updates with any changes you make — no re-embedding needed.',
  },
  {
    icon: Code2,
    title: 'Embed on any site',
    desc: 'Copy one script tag and paste it before </body>. Works on React, WordPress, Webflow — everything.',
    code: `<script src="https://api.chatplug.io/embed/YOUR_BOT_ID/widget.js"></script>`,
    tip: '🚀 The widget is under 8KB — zero impact on your site performance.',
  },
]

export default function Docs() {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()
  const step = STEPS[current]

  return (
    <div className="min-h-screen bg-background text-text-primary font-inter selection:bg-accent/30">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
            title="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2 group">
            <Zap size={20} className="text-accent group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold tracking-tight gradient-text">ChatPlug</span>
          </Link>
          <span className="text-border mx-1">/</span>
          <span className="text-sm font-medium text-text-muted">Quickstart Guide</span>
        </div>
        <Link
          to="/register"
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
        >
          Get Started <ArrowRight size={16} />
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-surface-elevated border border-border text-sm font-medium text-accent-secondary mb-6">
            How it works
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight mb-4">
            From zero to embedded in{' '}
            <span className="gradient-text">4 steps</span>
          </h1>
          <p className="text-text-muted text-lg">No ML expertise required. No infrastructure to manage.</p>
        </div>

        {/* Step Dots */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? 'w-8 h-2.5 bg-accent'
                  : i < current
                  ? 'w-2.5 h-2.5 bg-accent/40'
                  : 'w-2.5 h-2.5 bg-border'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Step Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-surface border border-border rounded-3xl p-8 md:p-10 shadow-xl mb-8"
          >
            <div className="flex items-start gap-5 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                <step.icon className="text-accent" size={26} />
              </div>
              <div>
                <p className="text-xs font-mono text-text-muted mb-1 uppercase tracking-widest">
                  Step {current + 1} of {STEPS.length}
                </p>
                <h2 className="text-2xl font-bold text-text-primary mb-2">{step.title}</h2>
                <p className="text-text-muted leading-relaxed">{step.desc}</p>
              </div>
            </div>

            {step.code && (
              <div className="relative bg-background border border-border rounded-2xl p-5 mb-6 group">
                <pre className="text-sm text-green-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {step.code}
                </pre>
                <button
                  onClick={() => { navigator.clipboard.writeText(step.code); toast.success('Copied!') }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-surface border border-border rounded-lg text-xs font-semibold text-text-primary flex items-center gap-1"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            )}

            <div className="bg-accent/5 border border-accent/20 rounded-2xl px-5 py-4 mb-8">
              <p className="text-sm text-text-primary leading-relaxed">{step.tip}</p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrent(p => Math.max(0, p - 1))}
                disabled={current === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated border border-transparent hover:border-border transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium"
              >
                <ArrowLeft size={16} /> Previous
              </button>
              {current < STEPS.length - 1 ? (
                <button
                  onClick={() => setCurrent(p => p + 1)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl font-semibold transition-all shadow-lg shadow-accent/20 hover:-translate-y-0.5"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-accent to-accent-secondary text-white rounded-xl font-semibold transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Start Building <CheckCircle2 size={16} />
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Step Overview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`p-5 text-left rounded-2xl border transition-all hover:-translate-y-0.5 ${
                i === current
                  ? 'border-accent/40 bg-accent/5 shadow-lg shadow-accent/10'
                  : 'border-border bg-surface hover:border-accent/30'
              }`}
            >
              <s.icon
                className={`mb-3 ${i === current ? 'text-accent' : i < current ? 'text-accent/50' : 'text-text-muted'}`}
                size={18}
              />
              <p className={`text-xs font-mono mb-1 ${i < current ? 'text-accent' : 'text-text-muted'}`}>
                {i < current ? '✓ Done' : `0${i + 1}`}
              </p>
              <p className="text-sm font-semibold text-text-primary leading-tight">{s.title}</p>
            </button>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center p-10 bg-surface border border-border rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent-secondary/5 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-text-primary mb-3">Ready to build your first chatbot?</h3>
            <p className="text-text-muted mb-6">Takes less than 5 minutes. No credit card required.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-accent to-accent-secondary text-white rounded-xl font-semibold shadow-lg hover:shadow-accent/30 transition-all hover:-translate-y-0.5"
            >
              Start for Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
