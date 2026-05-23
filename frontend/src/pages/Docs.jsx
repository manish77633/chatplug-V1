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
    <div className="min-h-screen bg-background text-text-primary font-inter selection:bg-accent/30 pb-[72px] md:pb-0">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 md:px-10 py-3 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
            title="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <Zap size={18} className="text-accent group-hover:scale-110 transition-transform" />
            <span className="text-base font-bold tracking-tight gradient-text">ChatPlug</span>
          </Link>
          <span className="text-border mx-1 hidden sm:inline">/</span>
          <span className="text-xs font-medium text-text-muted hidden sm:inline truncate">Quickstart Guide</span>
        </div>
        <Link
          to="/register"
          className="px-3 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-lg shadow-accent/20 shrink-0 ml-2"
        >
          Get Started <ArrowRight size={14} />
        </Link>
      </nav>

      <div className="w-full px-4 py-8 md:py-16 md:max-w-4xl md:mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-surface-elevated border border-border text-xs sm:text-sm font-medium text-accent-secondary mb-4 md:mb-6">
            How it works
          </span>
          <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-text-primary tracking-tight mb-3">
            From zero to embedded in{' '}
            <span className="gradient-text">4 steps</span>
          </h1>
          <p className="text-text-muted text-sm md:text-lg">No ML expertise required. No infrastructure to manage.</p>
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
            className="w-full bg-surface border border-border rounded-2xl p-5 md:p-10 shadow-xl mb-6"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                <step.icon className="text-accent" size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-mono text-text-muted mb-1 uppercase tracking-widest">
                  Step {current + 1} of {STEPS.length}
                </p>
                <h2 className="text-lg md:text-2xl font-bold text-text-primary mb-1.5">{step.title}</h2>
                <p className="text-sm md:text-base text-text-muted leading-relaxed">{step.desc}</p>
              </div>
            </div>

            {step.code && (
              <div className="relative bg-background border border-border rounded-xl mb-5 group">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">code</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(step.code); toast.success('Copied!') }}
                    className="flex items-center gap-1 px-2 py-1 bg-surface border border-border rounded-lg text-xs font-semibold text-text-primary hover:text-accent hover:border-accent/40 transition-colors"
                  >
                    <Copy size={11} /> Copy
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <pre className="text-xs md:text-sm text-green-400 font-mono whitespace-pre leading-relaxed p-4">
                    {step.code}
                  </pre>
                </div>
              </div>
            )}

            <div className="bg-accent/5 border border-accent/20 rounded-2xl px-5 py-4 mb-8">
              <p className="text-sm text-text-primary leading-relaxed">{step.tip}</p>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => setCurrent(p => Math.max(0, p - 1))}
                disabled={current === 0}
                className="flex items-center gap-2 h-10 px-4 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated border border-transparent hover:border-border transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm"
              >
                <ArrowLeft size={15} /> <span className="hidden sm:inline">Previous</span>
              </button>
              {current < STEPS.length - 1 ? (
                <button
                  onClick={() => setCurrent(p => p + 1)}
                  className="flex items-center gap-2 h-10 px-5 bg-accent hover:bg-accent/90 text-white rounded-xl font-semibold transition-all shadow-lg shadow-accent/20 text-sm"
                >
                  Next <ArrowRight size={15} />
                </button>
              ) : (
                <Link
                  to="/register"
                  className="flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-accent to-accent-secondary text-white rounded-xl font-semibold transition-all shadow-lg text-sm"
                >
                  Start Building <CheckCircle2 size={15} />
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Step Overview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`p-4 text-left rounded-xl border transition-all ${
                i === current
                  ? 'border-accent/40 bg-accent/5 shadow-lg shadow-accent/10'
                  : 'border-border bg-surface hover:border-accent/30'
              }`}
            >
              <s.icon
                className={`mb-2 ${i === current ? 'text-accent' : i < current ? 'text-accent/50' : 'text-text-muted'}`}
                size={16}
              />
              <p className={`text-[10px] font-mono mb-1 ${i < current ? 'text-accent' : 'text-text-muted'}`}>
                {i < current ? '✓ Done' : `0${i + 1}`}
              </p>
              <p className="text-xs font-semibold text-text-primary leading-tight">{s.title}</p>
            </button>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 md:mt-16 mb-[72px] md:mb-0 text-center p-6 md:p-10 bg-surface border border-border rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent-secondary/5 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-lg md:text-2xl font-bold text-text-primary mb-2 md:mb-3">Ready to build your first chatbot?</h3>
            <p className="text-text-muted text-sm mb-5">Takes less than 5 minutes. No credit card required.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-accent-secondary text-white rounded-xl font-semibold shadow-lg hover:shadow-accent/30 transition-all text-sm"
            >
              Start for Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
