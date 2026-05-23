import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, Check, Loader2, Trash2, ArrowLeft, Copy,
  ExternalLink, Send, Plus, Monitor, Code, Palette, Settings, MessageSquare, Shield, Globe, Bot
} from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STEPS = ['Basic Info', 'Upload Docs', 'Appearance', 'Deploy']
const PRESET_COLORS = ['#6C63FF', '#00D9C0', '#FF3366', '#00C2FF', '#FFB800', '#10B981']

export default function ChatbotDetail() {
  const { id } = useParams()
  const [chatbot, setChatbot] = useState(null)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  // Form States
  const [botName, setBotName] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('Hi there! How can I help you today?')
  const [personality, setPersonality] = useState('Helpful')
  
  const [urlInput, setUrlInput] = useState('')
  const [uploadType, setUploadType] = useState('pdf')
  
  const [accentColor, setAccentColor] = useState('#6C63FF')
  const [position, setPosition] = useState('right')
  
  const [showConfetti, setShowConfetti] = useState(false)
  const [activeTab, setActiveTab] = useState('html')

  const pollRef = useRef(null)

  const fetchChatbot = useCallback(async () => {
    try {
      const { data } = await api.get(`/chatbots/${id}`)
      setChatbot(data.chatbot)
      setBotName(data.chatbot.name || '')
      
      const st = data.chatbot.settings || {}
      setWelcomeMessage(st.welcomeMessage || 'Hi there! How can I help you today?')
      setPersonality(st.personality || 'Helpful')
      setAccentColor(st.accentColor || '#6C63FF')
      setPosition(st.position || 'right')
      
    } catch {
      toast.error('Failed to load chatbot')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchChatbot() }, [fetchChatbot])

  // Auto-resume step based on chatbot state (only when step should be advanced)
  useEffect(() => {
    if (chatbot && step === 0 && chatbot.documents?.length > 0) {
      if (chatbot.status === 'ready' || chatbot.status === 'active') {
        setStep(3)
      } else {
        setStep(2)
      }
    }
  }, [chatbot])

  // Auto-poll when training
  useEffect(() => {
    if (chatbot?.status === 'training') {
      pollRef.current = setInterval(async () => {
        try {
          const { data } = await api.get(`/chatbots/${id}`)
          setChatbot(data.chatbot)
          if (data.chatbot.status === 'ready' || data.chatbot.status === 'active') {
            clearInterval(pollRef.current)
            toast.success('🎉 Training complete! Bot is ready.')
          }
        } catch {}
      }, 3000)
    } else {
      clearInterval(pollRef.current)
    }
    return () => clearInterval(pollRef.current)
  }, [chatbot?.status, id])

  const handleUpload = async (e) => {
    e.preventDefault()
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('type', uploadType)
      if (uploadType === 'pdf') {
        const file = e.target?.files?.[0] || e.currentTarget?.querySelector('input[type=file]')?.files?.[0] || e.dataTransfer?.files?.[0]
        if (!file) { toast.error('Select a PDF'); return }
        formData.append('file', file)
      } else {
        if (!urlInput.trim()) { toast.error('Enter a URL'); return }
        formData.append('url', urlInput)
      }
      await api.post(`/documents/${id}/upload`, formData)
      toast.success('Document queued! Training started.')
      fetchChatbot()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const deleteDoc = async (docId) => {
    try {
      await api.delete(`/documents/${docId}`)
      toast.success('Document removed')
      fetchChatbot()
    } catch { toast.error('Failed to delete') }
  }

  const handleSaveAndNext = async () => {
    if (step === 0) {
      if (!botName.trim()) return toast.error('Bot name is required')
      try {
        await api.put(`/chatbots/${id}`, { 
          name: botName,
          settings: { ...chatbot.settings, welcomeMessage, personality, accentColor, position }
        })
        setStep(1)
      } catch { toast.error('Failed to save') }
    } 
    else if (step === 1) {
      if (!chatbot?.documents?.length) return toast.error('Upload at least one document')
      setStep(2)
    }
    else if (step === 2) {
      try {
        await api.put(`/chatbots/${id}`, { 
          settings: { ...chatbot.settings, welcomeMessage, personality, accentColor, position }
        })
        setStep(3)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      } catch { toast.error('Failed to save settings') }
    }
  }

  const getEmbedUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || ''
    if (apiUrl) return apiUrl.replace(/\/api\/?$/, '')
    return window.location.origin
  }

  const embedSnippet = `<script src="${getEmbedUrl()}/embed/${chatbot?.embedId}/widget.js"></script>`

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="animate-spin text-accent" size={32} />
    </div>
  )

  const isStepValid = () => {
    if (step === 0) return botName.trim().length > 0
    if (step === 1) return chatbot?.documents?.length > 0
    return true
  }

  return (
    <div className="bg-background text-text-primary font-inter flex flex-col selection:bg-accent/30 selection:text-text-primary overflow-x-hidden relative">
      {/* ─── NAV ─── */}
      <nav className="flex items-center justify-between px-2.5 sm:px-8 py-3 sm:py-4 border-b border-border bg-surface sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" id="chatbot-detail-back" className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center shadow-md">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-text-primary text-lg leading-tight">{chatbot?.name || 'Setup Chatbot'}</h1>
              <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${chatbot?.status === 'ready' || chatbot?.status === 'active' ? 'bg-green-500 animate-pulse' : chatbot?.status === 'training' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                {chatbot?.status === 'ready' || chatbot?.status === 'active' ? 'Active' : chatbot?.status === 'training' ? 'Training...' : 'Draft'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-2.5 sm:px-6 py-6 sm:py-12 relative z-10 flex flex-col">
        
        {/* ─── STEPPER HEADER ─── */}
        <div className="w-full max-w-4xl mx-auto mb-8 sm:mb-16 relative">
          {/* Progress bar — hidden on mobile for cleanliness */}
          <div className="hidden sm:block absolute top-6 left-[10%] right-[10%] h-1 bg-surface-elevated rounded-full overflow-hidden z-0">
            <div className="h-full bg-accent transition-all duration-700 ease-in-out" style={{ width: `${(step / 3) * 100}%` }} />
          </div>

          {/* Desktop stepper */}
          <div className="hidden sm:flex justify-between relative z-10">
            {STEPS.map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-3 relative">
                <div className="relative">
                  {i === step && (
                    <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-30 scale-150" />
                  )}
                  <button
                    id={`step-btn-${i}`}
                    onClick={() => i < step && setStep(i)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 relative z-10
                      ${i < step ? 'bg-accent text-white hover:scale-105 shadow-lg shadow-accent/20 cursor-pointer' : 
                        i === step ? 'bg-surface-elevated border-2 border-accent text-accent shadow-[0_0_20px_rgba(108,99,255,0.2)]' : 
                        'bg-surface border-2 border-border text-text-muted cursor-not-allowed'}`}
                    disabled={i > step}
                  >
                    {i < step ? <Check size={18} /> : i + 1}
                  </button>
                </div>
                <span className={`text-sm font-semibold transition-colors ${i <= step ? 'text-text-primary' : 'text-text-muted'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Mobile stepper — compact dots + current label */}
          <div className="sm:hidden">
            <div className="flex items-center justify-center gap-3 mb-3">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  id={`step-dot-${i}`}
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={`rounded-full transition-all duration-300 ${
                    i < step  ? 'w-6 h-6 bg-accent flex items-center justify-center cursor-pointer' :
                    i === step ? 'w-8 h-8 bg-surface-elevated border-2 border-accent text-accent text-xs font-bold flex items-center justify-center' :
                    'w-6 h-6 bg-surface border border-border cursor-not-allowed'
                  }`}
                >
                  {i < step ? <Check size={10} className="text-white" /> : i === step ? i + 1 : null}
                </button>
              ))}
            </div>
            <p className="text-center text-sm font-semibold text-text-primary">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </p>
            <div className="mt-2 h-1 bg-surface-elevated rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all duration-700" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* ─── TWO COLUMN LAYOUT ─── */}
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto w-full">
          
          {/* Left Form Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-surface border border-border rounded-3xl p-8 md:p-10 shadow-xl"
              >
                
                {/* STEP 1: Basic Info */}
                {step === 0 && (
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Name your chatbot</h2>
                    <p className="text-text-muted mb-10">Let's start with the basics. You can always change this later.</p>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Bot Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Sales Assistant" 
                          value={botName}
                          onChange={e => setBotName(e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Welcome Message</label>
                        <textarea 
                          placeholder="The first message your bot will send..." 
                          value={welcomeMessage}
                          onChange={e => setWelcomeMessage(e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] transition-all resize-none min-h-[100px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Bot Personality</label>
                        <select 
                          value={personality}
                          onChange={e => setPersonality(e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-text-primary focus:outline-none focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] transition-all appearance-none"
                        >
                          <option value="Helpful">🤝 Helpful & Supportive</option>
                          <option value="Professional">💼 Professional & Direct</option>
                          <option value="Friendly">👋 Friendly & Casual</option>
                          <option value="Technical">⚙️ Technical & Detailed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Upload Docs */}
                {step === 1 && (
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Train your chatbot</h2>
                    <p className="text-text-muted mb-10">Upload knowledge base documents to teach your AI how to answer.</p>
                    
                    <div className="flex gap-2 mb-6 p-1 bg-background rounded-xl w-fit border border-border">
                      <button onClick={() => setUploadType('pdf')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${uploadType === 'pdf' ? 'bg-surface-elevated text-accent shadow-sm border border-border' : 'text-text-muted hover:text-text-primary'}`}>Files</button>
                      <button onClick={() => setUploadType('url')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${uploadType === 'url' ? 'bg-surface-elevated text-accent shadow-sm border border-border' : 'text-text-muted hover:text-text-primary'}`}>Website URL</button>
                    </div>

                    <form onSubmit={handleUpload}>
                      {uploadType === 'pdf' ? (
                        <label className="block border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 group">
                          <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform group-hover:border-accent/30 group-hover:shadow-[0_0_20px_rgba(108,99,255,0.2)]">
                            <Upload className="text-text-muted group-hover:text-accent transition-colors" size={24} />
                          </div>
                          <p className="text-text-primary font-semibold mb-1">Click to upload or drag and drop</p>
                          <p className="text-sm text-text-muted">PDF, TXT, DOCX (max 50MB)</p>
                          <input type="file" accept=".pdf,.txt,.docx" className="hidden" onChange={(e) => e.target.files.length && handleUpload(e)} />
                        </label>
                      ) : (
                        <div className="flex items-center gap-3">
                          <input 
                            type="url" 
                            placeholder="https://example.com/docs" 
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                            className="flex-1 px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-text-primary focus:outline-none transition-all"
                          />
                          <button type="submit" disabled={uploading} className="px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                            {uploading ? <Loader2 size={18} className="animate-spin" /> : 'Fetch URL'}
                          </button>
                        </div>
                      )}
                    </form>

                    {/* Uploaded Files List */}
                    {chatbot?.documents?.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-border">
                        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><FileText size={16} className="text-accent" /> Processing Queue</h3>
                        <div className="space-y-3">
                          {chatbot.documents.map(doc => (
                            <div key={doc._id} className="p-4 bg-background border border-border rounded-xl flex items-center justify-between group">
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`p-2 rounded-lg ${doc.status === 'completed' ? 'bg-green-500/10' : doc.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
                                  {doc.status === 'completed' ? <Check size={16} className="text-green-500" /> : doc.status === 'failed' ? <Check size={16} className="text-red-500" /> : <Loader2 size={16} className="text-yellow-500 animate-spin" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-text-primary truncate">{doc.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
                                      <div className={`h-full ${doc.status === 'completed' ? 'bg-green-500 w-full' : doc.status === 'failed' ? 'bg-red-500 w-full' : 'bg-yellow-500 w-2/3 animate-pulse'}`} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase text-text-muted">{doc.status}</span>
                                  </div>
                                </div>
                              </div>
                              <button onClick={() => deleteDoc(doc._id)} className="ml-4 p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: Customize Appearance */}
                {step === 2 && (
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Design your widget</h2>
                    <p className="text-text-muted mb-10">Make it match your brand perfectly.</p>
                    
                    <div className="space-y-8">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-4">
                          <Palette size={16} className="text-accent" /> Accent Color
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {PRESET_COLORS.map(color => (
                            <button
                              key={color}
                              onClick={() => setAccentColor(color)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${accentColor === color ? 'scale-110 ring-2 ring-offset-2 ring-offset-surface ring-accent' : 'hover:scale-105'}`}
                              style={{ backgroundColor: color }}
                            >
                              {accentColor === color && <Check size={16} className="text-white" />}
                            </button>
                          ))}
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border">
                             <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="absolute -inset-2 w-14 h-14 cursor-pointer" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-4">
                          <Monitor size={16} className="text-accent" /> Widget Position
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => setPosition('left')} className={`p-4 border rounded-xl flex items-end justify-start h-24 transition-all ${position === 'left' ? 'border-accent bg-accent/5' : 'border-border bg-background hover:border-border/80'}`}>
                            <div className="w-8 h-8 rounded-full bg-accent shadow-lg" />
                          </button>
                          <button onClick={() => setPosition('right')} className={`p-4 border rounded-xl flex items-end justify-end h-24 transition-all ${position === 'right' ? 'border-accent bg-accent/5' : 'border-border bg-background hover:border-border/80'}`}>
                            <div className="w-8 h-8 rounded-full bg-accent shadow-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Deploy */}
                {step === 3 && (
                  <div className="relative">
                    {showConfetti && (
                      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-3xl">
                        {[...Array(50)].map((_, i) => (
                           <motion.div
                             key={i}
                             initial={{ y: "100%", x: "50%", scale: 0 }}
                             animate={{ 
                               y: [null, -Math.random() * 500, 1000],
                               x: [null, (Math.random() - 0.5) * 500, (Math.random() - 0.5) * 800],
                               scale: [0, 1, 1],
                               rotate: [0, Math.random() * 360, Math.random() * 720]
                             }}
                             transition={{ duration: 2.5 + Math.random(), ease: "easeOut" }}
                             className="absolute bottom-0 left-1/2 w-3 h-3 rounded-sm"
                             style={{ backgroundColor: PRESET_COLORS[i % PRESET_COLORS.length] }}
                           />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center text-center mb-10">
                      <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                        <Check size={40} className="text-green-500 relative z-10" />
                      </div>
                      <h2 className="text-3xl font-bold text-text-primary mb-2">Your chatbot is ready!</h2>
                      <p className="text-text-muted max-w-md">Copy the code snippet below and paste it into your website's HTML, just before the closing <code>&lt;/body&gt;</code> tag.</p>
                    </div>

                    <div className="bg-background border border-border rounded-2xl overflow-hidden mb-8">
                      <div className="flex items-center gap-1 border-b border-border bg-surface-elevated px-4 py-3">
                        <div className="flex gap-1.5 mr-4">
                          <div className="w-3 h-3 rounded-full bg-red-500/80" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                          <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setActiveTab('html')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeTab === 'html' ? 'bg-surface text-text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text-primary'}`}>HTML</button>
                          <button onClick={() => setActiveTab('react')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeTab === 'react' ? 'bg-surface text-text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text-primary'}`}>React</button>
                        </div>
                      </div>
                      <div className="p-6 relative group">
                        <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                          {activeTab === 'html' ? embedSnippet : `import { ChatPlug } from '@chatplug/react'\n\nexport default function App() {\n  return <ChatPlug id="${chatbot?.embedId}" />\n}`}
                        </pre>
                        <button
                          onClick={() => { navigator.clipboard.writeText(activeTab === 'html' ? embedSnippet : `import { ChatPlug } from '@chatplug/react'\n\nexport default function App() {\n  return <ChatPlug id="${chatbot?.embedId}" />\n}`); toast.success('Copied to clipboard!') }}
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-surface hover:bg-surface-elevated border border-border rounded-lg text-text-primary flex items-center gap-2 text-xs font-semibold shadow-lg"
                        >
                          <Copy size={14} /> Copy Code
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                      {(chatbot?.status === 'ready' || chatbot?.status === 'active') && (
                        <Link to={`/chatbot/${id}/playground`} className="px-6 py-3 bg-gradient-to-r from-accent to-accent-secondary text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(108,99,255,0.3)] transition-all flex items-center gap-2 hover:-translate-y-0.5">
                          Test in Playground <ExternalLink size={16} />
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          const shareUrl = `${getEmbedUrl()}/chat/${chatbot?.embedId}`
                          navigator.clipboard.writeText(shareUrl)
                          toast.success('Share link copied!')
                        }}
                        className="px-6 py-3 bg-background border border-border hover:border-accent/50 text-text-primary font-semibold rounded-xl transition-all flex items-center gap-2"
                      >
                        <Globe size={16} /> Share Link
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Navigation */}
            <div className="mt-8 flex justify-between items-center px-4">
              <button 
                onClick={() => setStep(p => Math.max(0, p - 1))}
                className={`px-6 py-3 font-semibold text-text-muted hover:text-text-primary transition-colors flex items-center gap-2 ${step === 0 || step === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                <ArrowLeft size={18} /> Back
              </button>
              
              {step < 3 && (
                <button 
                  onClick={handleSaveAndNext}
                  disabled={!isStepValid()}
                  className="px-8 py-3 bg-gradient-to-r from-accent to-accent-secondary text-white font-semibold rounded-xl shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-accent/20 ml-auto flex items-center gap-2"
                >
                  {step === 2 ? 'Finish Setup' : 'Continue'} <ArrowLeft size={18} className="rotate-180" />
                </button>
              )}
              {step === 3 && (
                <Link to="/dashboard" className="px-8 py-3 bg-surface border border-border text-text-primary font-semibold rounded-xl hover:bg-surface-elevated transition-all ml-auto">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Right Live Preview Area */}
          <div className="w-full lg:w-[360px] shrink-0">
            <div className="sticky top-28 bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl h-[600px] flex flex-col relative">
              {/* Chrome Header */}
              <div className="px-4 py-3 bg-background border-b border-border flex items-center gap-2 z-10">
                <div className="flex gap-1.5 flex-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-surface px-2 py-0.5 rounded-md">Live Preview</div>
              </div>

              {/* Chat Widget Wrapper */}
              <div className="flex-1 bg-surface-elevated relative overflow-hidden bg-grid">
                <div className={`absolute bottom-6 ${position === 'left' ? 'left-6' : 'right-6'} w-[300px] bg-background border border-border rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col transition-all duration-500`}>
                  {/* Widget Header */}
                  <div className="p-4 text-white flex items-center gap-3 relative overflow-hidden" style={{ backgroundColor: accentColor }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm relative z-10">
                      <Bot size={20} className="text-white" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-bold text-sm leading-tight">{botName || 'Chatbot Name'}</h3>
                      <p className="text-[10px] text-white/80 font-medium flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online
                      </p>
                    </div>
                  </div>

                  {/* Widget Body */}
                  <div className="h-[300px] p-4 bg-background overflow-y-auto flex flex-col gap-4">
                    {/* Welcome Bubble */}
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="flex gap-2 max-w-[85%]">
                       <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: accentColor }}>
                         <Bot size={12} className="text-white" />
                       </div>
                       <div className="p-3 rounded-2xl rounded-tl-none bg-surface-elevated border border-border text-sm text-text-primary leading-relaxed">
                         {welcomeMessage || 'Hi there! How can I help you today?'}
                       </div>
                    </motion.div>
                    
                    {/* User typing demo if they change personality */}
                    {personality && step === 0 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex gap-2 max-w-[85%] ml-auto justify-end">
                         <div className="p-3 rounded-2xl rounded-tr-none bg-accent/10 border border-accent/20 text-sm text-text-primary leading-relaxed">
                           What kind of bot are you?
                         </div>
                      </motion.div>
                    )}
                    {personality && step === 0 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }} className="flex gap-2 max-w-[85%]">
                         <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: accentColor }}>
                           <Bot size={12} className="text-white" />
                         </div>
                         <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-surface-elevated border border-border text-sm text-text-primary leading-relaxed flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce delay-75" />
                            <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce delay-150" />
                         </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Widget Input */}
                  <div className="p-3 bg-surface border-t border-border flex items-center gap-2">
                    <input type="text" placeholder="Type a message..." disabled className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-xs text-text-primary" />
                    <button disabled className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: accentColor }}>
                      <Send size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
