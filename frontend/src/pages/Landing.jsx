import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useRef, useState } from 'react'
import {
  Zap, Shield, Globe, Code2, ArrowRight, Bot, Sparkles,
  FileText, MessageSquare, BarChart3, CheckCircle, Star,
  CloudUpload, Settings, Rocket, ChevronRight, Play, Check,
  Github, Twitter, Linkedin, ChevronDown
} from 'lucide-react'
import Navbar from '../components/ui/Navbar'
import { useAuthStore } from '../store/authStore'

const features = [
  {
    icon: Bot,
    title: 'Multi-tenant Architecture',
    desc: 'Create unlimited isolated knowledge bases for different use cases and departments.',
  },
  {
    icon: Zap,
    title: 'RAG 2.0 Pipeline',
    desc: 'Advanced vector search combined with LLMs delivers accurate, context-aware answers.',
  },
  {
    icon: BarChart3,
    title: 'Streaming Responses',
    desc: 'Ultra-low latency streaming delivers the first token in under 200ms.',
  },
  {
    icon: Globe,
    title: 'Embeddable Widget',
    desc: 'A beautiful, customizable chat widget you can embed anywhere with a single script tag.',
  },
  {
    icon: Settings,
    title: 'Background Jobs',
    desc: 'Asynchronous document processing handles massive PDFs without timing out.',
  },
  {
    icon: Shield,
    title: 'Admin Dashboard',
    desc: 'Comprehensive analytics, user management, and conversation logs in one place.',
  },
]

const steps = [
  {
    step: '01',
    icon: CloudUpload,
    title: 'Upload your docs',
    desc: 'Sync PDFs, websites, or plain text.',
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'Train & customize',
    desc: 'Set tone, behavior, and appearance.',
  },
  {
    step: '03',
    icon: Code2,
    title: 'Copy embed script',
    desc: 'Paste on your site and go live.',
  },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'Stripe',
    text: 'ChatPlug cut our support ticket volume by 60% in the first week. The RAG pipeline accuracy is genuinely impressive.',
    avatar: 'S',
  },
  {
    name: 'James Wilson',
    role: 'CTO',
    company: 'Vercel',
    text: 'Best decision for our customer support automation. Setup took less than 10 minutes and our team focuses on real problems now.',
    avatar: 'J',
  },
  {
    name: 'Emily Davis',
    role: 'Head of Ops',
    company: 'Linear',
    text: 'Our users love getting instant, accurate answers from our documentation. The streaming responses are incredibly fast.',
    avatar: 'E',
  },
  {
    name: 'Michael Chang',
    role: 'Engineering Lead',
    company: 'Raycast',
    text: 'The widget was so easy to embed. We literally added one script tag and our AI assistant was live. Beautiful UI out of the box.',
    avatar: 'M',
  },
  {
    name: 'Jessica Lee',
    role: 'Founder',
    company: 'Figma Plugins',
    text: 'I use ChatPlug for all my plugin documentation. The multi-tenant architecture is perfect for managing different knowledge bases.',
    avatar: 'J',
  },
  {
    name: 'David Smith',
    role: 'Customer Success',
    company: 'Acme Corp',
    text: 'The admin dashboard gives us amazing insights into what our users are struggling with. Highly recommend this tool!',
    avatar: 'D',
  }
]

const faqs = [
  {
    question: "What is RAG 2.0?",
    answer: "RAG (Retrieval-Augmented Generation) combines powerful vector search with Large Language Models. Our 2.0 pipeline ensures higher accuracy, fewer hallucinations, and blazing fast context retrieval compared to traditional methods."
  },
  {
    question: "How long does it take to train my chatbot?",
    answer: "Training is almost instant. Depending on the size of your documentation, it typically takes anywhere from a few seconds to a couple of minutes to index all your data and make the bot ready to answer questions."
  },
  {
    question: "Can I customize the widget's appearance?",
    answer: "Yes! You can fully customize colors, fonts, icons, and behavior to match your brand seamlessly. It will feel like a native part of your website."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. Your data is isolated in secure vector databases. We use enterprise-grade encryption and never use your private data to train public models."
  },
  {
    question: "Do I need to know how to code?",
    answer: "No coding is required! You can upload files, train your bot, and copy-paste a single script tag into your website's HTML without writing a single line of code."
  }
]

function FAQItem({ faq, index }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="border border-border bg-surface rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="font-medium text-text-primary text-base md:text-lg">{faq.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="text-text-muted" size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-5 text-sm md:text-base text-text-muted leading-relaxed border-t border-border/50 pt-4">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function Landing() {
  const heroRef = useRef(null)
  const { user, token: storeToken } = useAuthStore()
  const token = storeToken || localStorage.getItem('token')
  const targetRoute = user ? '/dashboard' : '/register'

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-accent/30 selection:text-text-primary">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <Navbar isAuthenticated={!!token} />

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 overflow-hidden noise-bg">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent rounded-full blur-[120px] opacity-[0.15] mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-accent-secondary rounded-full blur-[100px] opacity-[0.10] mix-blend-screen" />
        </div>

        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
             }}
        />

        <div className="container-md relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-left"
          >
            <motion.div variants={itemVariants} className="mb-6 inline-block">
              <div className="relative p-[1px] rounded-full overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-secondary opacity-50 group-hover:opacity-100 transition-opacity shimmer" />
                <div className="relative px-4 py-1.5 rounded-full bg-surface-elevated/80 backdrop-blur-sm border border-border flex items-center gap-2">
                  <span className="text-accent">✦</span>
                  <span className="text-sm font-medium text-text-primary">Now in Beta — Free to use</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h1 className="text-[32px] sm:text-[48px] md:text-[64px] font-bold tracking-tight text-text-primary leading-[1.1] mb-6">
                Embed AI that{' '}
                <span className="gradient-text">
                  actually understands
                </span>{' '}
                your users
              </h1>
            </motion.div>

            <motion.div variants={itemVariants}>
              <p className="text-base md:text-[18px] text-text-muted leading-[1.6] mb-8 max-w-xl">
                Train a chatbot on your docs in minutes. Embed anywhere with one script tag.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-row gap-3 justify-center lg:justify-start mt-6 mb-8 w-full">
              <Link to={targetRoute} className="flex-1 sm:flex-none">
                <button className="w-full px-4 sm:px-8 py-3 sm:py-4 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm sm:text-base font-medium transition-all shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap">
                  {user ? 'New Chatbot' : 'Start Free'} <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </Link>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 bg-surface-elevated hover:bg-surface-elevated/80 text-text-primary border border-border rounded-xl text-sm sm:text-base font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 hover:-translate-y-0.5 whitespace-nowrap"
              >
                <Play size={16} className="text-accent sm:w-[18px] sm:h-[18px]" />
                Features
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-3 text-sm text-text-muted font-medium">
              <span>No credit card</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>3 chatbots free</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Deploy in 60 seconds</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:ml-auto w-full max-w-md"
          >
            <div className="absolute -top-6 -left-6 px-4 py-2 bg-surface-elevated border border-border rounded-xl text-sm font-medium text-text-primary shadow-xl z-20 animate-float" style={{ animationDelay: '0s' }}>
              RAG Powered
            </div>
            <div className="absolute top-1/4 -right-8 px-4 py-2 bg-surface-elevated border border-border rounded-xl text-sm font-medium text-text-primary shadow-xl z-20 animate-float" style={{ animationDelay: '1s' }}>
              Streaming
            </div>
            <div className="absolute -bottom-4 left-1/4 px-4 py-2 bg-surface-elevated border border-border rounded-xl text-sm font-medium text-text-primary shadow-xl z-20 animate-float" style={{ animationDelay: '2s' }}>
              Embeddable
            </div>

            <div className="relative z-10 glass rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-4 py-3 border-b border-border bg-surface flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              
              <div className="p-6 bg-background space-y-4">
                <div className="flex gap-3 animate-fadeUp opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-surface-elevated border border-border rounded-2xl rounded-tl-none p-3 text-sm text-text-primary">
                    Hi! I've read your documentation. How can I help?
                  </div>
                </div>

                <div className="flex gap-3 justify-end animate-fadeUp opacity-0" style={{ animationDelay: '1.4s', animationFillMode: 'forwards' }}>
                  <div className="bg-accent rounded-2xl rounded-tr-none p-3 text-sm text-white">
                    Can I embed this in React?
                  </div>
                </div>

                <div className="flex gap-3 animate-fadeUp opacity-0" style={{ animationDelay: '2.0s', animationFillMode: 'forwards' }}>
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-surface-elevated border border-border rounded-2xl rounded-tl-none p-3 text-sm text-text-primary">
                    Yes! Just install our <code className="text-accent-secondary bg-background px-1 rounded">@chatplug/react</code> package.
                  </div>
                </div>

                <div className="flex gap-3 animate-fadeUp opacity-0" style={{ animationDelay: '2.6s', animationFillMode: 'forwards' }}>
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-surface-elevated border border-border rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border bg-surface">
                <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2">
                  <span className="text-text-muted text-sm flex-1">Type your message...</span>
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <ArrowRight size={12} className="text-accent" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="py-32 px-4 relative scroll-mt-16">
        <div className="container-md">
          <motion.div
            className="text-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-surface-elevated border border-border text-sm font-medium text-accent-secondary mb-6">
              Simple Setup
            </span>
            <h2 className="text-[32px] md:text-[48px] font-bold text-text-primary tracking-tight">
              From docs to deployed in 3 steps
            </h2>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            {/* Animated Connector Line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-border overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-accent to-accent-secondary"
                initial={{ x: '-100%' }}
                whileInView={{ x: '0%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              />
            </div>

            <motion.div
              className="grid md:grid-cols-3 gap-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {steps.map((item, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -40 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
                  }}
                  className="relative text-center z-10"
                >
                  <div className="w-24 h-24 mx-auto bg-surface-elevated border border-border rounded-2xl flex items-center justify-center mb-8 relative group">
                    <div className="absolute inset-0 bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                    <item.icon size={32} className="text-accent" />
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center text-xs font-bold text-text-primary">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">{item.title}</h3>
                  <p className="text-text-muted text-base">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="py-32 sm:px-4 bg-surface border-y border-border scroll-mt-16" id="features">
        <div className="container-md w-[90%] sm:w-full px-0 sm:px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-[32px] md:text-[48px] font-bold text-text-primary tracking-tight mb-6">
              Powerful features out of the box
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Everything you need to build, deploy, and scale intelligent AI chatbots.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="p-8 bg-background border border-border rounded-3xl hover:border-accent/50 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent-secondary/20 flex items-center justify-center mb-6">
                  <f.icon size={20} className="text-accent" />
                </div>
                <h3 className="text-[16px] font-medium text-text-primary mb-2 group-hover:text-accent transition-colors">
                  {f.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="py-32 px-4 overflow-hidden scroll-mt-16">
        <div className="container-md text-center">
          <motion.h3 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-text-muted tracking-wide uppercase mb-12"
          >
            Trusted by developers building smarter products
          </motion.h3>

          {/* Marquee */}
          <div className="relative w-full overflow-hidden mb-24">
            <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="flex items-center w-max animate-[shimmer_20s_linear_infinite]" style={{ backgroundPosition: '0 0' }}>
               <div className="flex items-center justify-center gap-12 md:gap-24 px-6 md:px-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                  {/* Logos Placeholders */}
                  <div className="text-2xl font-bold tracking-tighter text-gray-200">Vercel</div>
                  <div className="text-2xl font-bold tracking-tighter text-gray-200">Stripe</div>
                  <div className="text-2xl font-bold tracking-tighter text-gray-200">Linear</div>
                  <div className="text-2xl font-bold tracking-tighter text-gray-200">Raycast</div>
                  <div className="text-2xl font-bold tracking-tighter text-gray-200">Figma</div>
               </div>
               <div className="flex items-center justify-center gap-12 md:gap-24 px-6 md:px-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                  <div className="text-2xl font-bold tracking-tighter text-gray-200">Vercel</div>
                  <div className="text-2xl font-bold tracking-tighter text-gray-200">Stripe</div>
                  <div className="text-2xl font-bold tracking-tighter text-gray-200">Linear</div>
                  <div className="text-2xl font-bold tracking-tighter text-gray-200">Raycast</div>
                  <div className="text-2xl font-bold tracking-tighter text-gray-200">Figma</div>
               </div>
            </div>
          </div>

          {/* Testimonials Marquee */}
          <div className="relative w-full overflow-hidden mt-12 py-4">
            <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <div className="flex gap-6 w-max animate-marquee">
               {/* First Set */}
               <div className="flex gap-6 items-center">
                  {testimonials.map((t, i) => (
                    <div key={`t1-${i}`} className="w-[280px] md:w-[340px] p-6 bg-surface border border-border rounded-3xl text-left hover:border-border/80 transition-colors shrink-0 flex flex-col h-full">
                      <div className="flex gap-1 mb-4">
                        {[1,2,3,4,5].map((_, j) => (
                          <Star key={j} size={14} className="text-accent fill-accent" />
                        ))}
                      </div>
                      <p className="text-text-primary text-sm md:text-base leading-relaxed mb-6 flex-1">"{t.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white font-bold text-base shrink-0">
                          {t.avatar}
                        </div>
                        <div>
                          <h4 className="text-text-primary text-sm font-medium">{t.name}</h4>
                          <p className="text-xs text-text-muted">{t.role} @ {t.company}</p>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
               {/* Second Set */}
               <div className="flex gap-6 items-center">
                  {testimonials.map((t, i) => (
                    <div key={`t2-${i}`} className="w-[280px] md:w-[340px] p-6 bg-surface border border-border rounded-3xl text-left hover:border-border/80 transition-colors shrink-0 flex flex-col h-full">
                      <div className="flex gap-1 mb-4">
                        {[1,2,3,4,5].map((_, j) => (
                          <Star key={j} size={14} className="text-accent fill-accent" />
                        ))}
                      </div>
                      <p className="text-text-primary text-sm md:text-base leading-relaxed mb-6 flex-1">"{t.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white font-bold text-base shrink-0">
                          {t.avatar}
                        </div>
                        <div>
                          <h4 className="text-text-primary text-sm font-medium">{t.name}</h4>
                          <p className="text-xs text-text-muted">{t.role} @ {t.company}</p>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="py-32 sm:px-4 bg-surface border-t border-border relative scroll-mt-16" id="pricing">
        <div className="absolute inset-0 bg-background noise-bg" />
        <div className="container-md relative z-10 w-[90%] sm:w-full px-0 sm:px-6">
           <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[32px] md:text-[48px] font-bold text-text-primary tracking-tight mb-6">
              Simple, transparent pricing
            </h2>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Free */}
            <motion.div variants={itemVariants} className="p-8 bg-background border border-border rounded-3xl hover:border-accent/50 transition-all hover:shadow-[0_0_40px_rgba(108,99,255,0.1)] flex flex-col">
              <h3 className="text-xl font-medium text-text-primary mb-2">Free</h3>
              <div className="mb-6"><span className="text-4xl font-bold">$0</span><span className="text-text-muted">/mo</span></div>
              <p className="text-sm text-text-muted mb-8">Perfect for side projects and evaluating ChatPlug.</p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-text-primary"><Check size={16} className="text-accent" /> 3 Chatbots</li>
                <li className="flex items-center gap-3 text-sm text-text-primary"><Check size={16} className="text-accent" /> 50 queries/day</li>
                <li className="flex items-center gap-3 text-sm text-text-primary"><Check size={16} className="text-accent" /> Standard Support</li>
              </ul>
              <Link to={targetRoute}><button className="w-full py-3 px-4 rounded-xl border border-border bg-surface text-text-primary hover:bg-surface-elevated transition-colors font-medium">{user ? 'New Chatbot' : 'Get Started'}</button></Link>
            </motion.div>

            {/* Pro */}
            <motion.div variants={itemVariants} className="relative rounded-2xl p-[1px] bg-gradient-to-b from-purple-500 to-blue-600 flex flex-col hover:shadow-[0_0_40px_rgba(108,99,255,0.15)] transition-all md:scale-105 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-accent to-accent-secondary rounded-full text-xs font-bold text-white shadow-lg z-20">
                MOST POPULAR
              </div>
              
              <div className="bg-[#0d0d1a] rounded-2xl p-6 h-full flex flex-col relative z-10">
                <h3 className="text-xl font-medium text-text-primary mb-2">Pro</h3>
                <div className="mb-6"><span className="text-4xl font-bold">$49</span><span className="text-text-muted">/mo</span></div>
                <p className="text-sm text-text-muted mb-8">For growing startups and professional sites.</p>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-text-primary"><Check size={16} className="text-accent" /> 20 Chatbots</li>
                  <li className="flex items-center gap-3 text-sm text-text-primary"><Check size={16} className="text-accent" /> 2000 queries/day</li>
                  <li className="flex items-center gap-3 text-sm text-text-primary"><Check size={16} className="text-accent" /> Priority Support</li>
                  <li className="flex items-center gap-3 text-sm text-text-primary"><Check size={16} className="text-accent" /> Remove branding</li>
                </ul>
                <Link to={targetRoute}><button className="w-full py-3 px-4 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors font-medium shadow-lg shadow-accent/20">{user ? 'New Chatbot' : 'Upgrade to Pro'}</button></Link>
              </div>
            </motion.div>

            {/* Enterprise */}
            <motion.div variants={itemVariants} className="p-8 bg-background border border-border rounded-3xl hover:border-accent/50 transition-all hover:shadow-[0_0_40px_rgba(108,99,255,0.1)] flex flex-col">
              <h3 className="text-xl font-medium text-text-primary mb-2">Enterprise</h3>
              <div className="mb-6"><span className="text-4xl font-bold">Custom</span></div>
              <p className="text-sm text-text-muted mb-8">Custom limits and dedicated infrastructure.</p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-text-primary"><Check size={16} className="text-accent" /> Unlimited Chatbots</li>
                <li className="flex items-center gap-3 text-sm text-text-primary"><Check size={16} className="text-accent" /> Custom volume</li>
                <li className="flex items-center gap-3 text-sm text-text-primary"><Check size={16} className="text-accent" /> 24/7 Phone Support</li>
                <li className="flex items-center gap-3 text-sm text-text-primary"><Check size={16} className="text-accent" /> Dedicated Account Manager</li>
              </ul>
              <button onClick={() => toast('Coming soon', { icon: '🚧' })} className="w-full py-3 px-4 rounded-xl border border-border bg-surface text-text-primary hover:bg-surface-elevated transition-colors font-medium">Contact Sales</button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="py-32 sm:px-4 bg-background relative scroll-mt-16" id="faq">
        <div className="container-md max-w-3xl mx-auto w-[90%] sm:w-full px-0 sm:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-[28px] md:text-[48px] font-bold text-text-primary tracking-tight mb-4 md:mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-base md:text-lg text-text-muted">
              Got questions? We've got answers.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-background relative">
        {/* Gradient separator line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="container-md pt-20 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6 group">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-accent group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  <span className="gradient-text">ChatPlug</span>
                </span>
              </Link>
              <p className="text-text-muted text-sm max-w-xs leading-relaxed">
                Empowering businesses with intelligent, context-aware AI chatbots. Built for the modern web.
              </p>
            </div>
            <div>
              <h4 className="text-text-primary font-medium mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-text-muted">
                <li><a href="#features" onClick={e => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }} className="hover:text-accent transition-colors cursor-pointer">Features</a></li>
                <li><a href="#pricing" onClick={e => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) }} className="hover:text-accent transition-colors cursor-pointer">Pricing</a></li>
                <li><button onClick={() => toast('Changelog coming soon', { icon: '📝' })} className="hover:text-accent transition-colors">Changelog</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-text-primary font-medium mb-6">Docs</h4>
              <ul className="space-y-4 text-sm text-text-muted">
                <li><Link to="/docs" id="footer-docs-quickstart" className="hover:text-accent transition-colors">Quickstart</Link></li>
                <li><Link to="/docs/api" id="footer-docs-api" className="hover:text-accent transition-colors">API Reference</Link></li>
                <li><Link to="/docs/guides" id="footer-docs-guides" className="hover:text-accent transition-colors">Guides</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-text-primary font-medium mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-text-muted">
                <li><button onClick={() => toast('Coming soon', { icon: '🚧' })} className="hover:text-accent transition-colors">About</button></li>
                <li><button onClick={() => toast('Coming soon', { icon: '🚧' })} className="hover:text-accent transition-colors">Blog</button></li>
                <li><button onClick={() => toast('Coming soon', { icon: '🚧' })} className="hover:text-accent transition-colors">Careers</button></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-muted">© {new Date().getFullYear()} ChatPlug Inc. All rights reserved.</p>
            <div className="flex items-center gap-6 text-text-muted">
              <button onClick={() => toast('Coming soon', { icon: '🚧' })} className="hover:text-accent transition-colors"><Twitter size={18} /></button>
              <button onClick={() => toast('Coming soon', { icon: '🚧' })} className="hover:text-accent transition-colors"><Github size={18} /></button>
              <button onClick={() => toast('Coming soon', { icon: '🚧' })} className="hover:text-accent transition-colors"><Linkedin size={18} /></button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}