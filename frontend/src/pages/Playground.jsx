import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Bot, User, Loader2, RefreshCw, AlertCircle, Settings,
  Maximize2, Minimize2, Paperclip, ChevronRight, FileText, Database, Clock, Terminal, ChevronLeft,
  ChevronDown, MessageSquare, Menu, X
} from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

// Formats timestamp like "10:42 AM"
const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(date)
}

export default function Playground() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Data State
  const [chatbots, setChatbots] = useState([])
  const [chatbot, setChatbot] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Chat State
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [botLoading, setBotLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  
  // UI State
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mockMetrics, setMockMetrics] = useState({ tokens: 0, ms: 0, chunks: [] })
  
  const messagesEndRef = useRef(null)
  const sessionId = useRef(`playground_${Date.now()}`)
  const abortRef = useRef(null)
  const textareaRef = useRef(null)

  const loadData = useCallback(async () => {
    try {
      // Load all bots for sidebar
      const botsRes = await api.get('/chatbots')
      setChatbots(botsRes.data.chatbots)
      
      // Load current bot
      const currentBotRes = await api.get(`/chatbots/${id}`)
      setChatbot(currentBotRes.data.chatbot)
      
      setMessages([])
      setError(null)
    } catch {
      setError('Failed to load playground data')
    } finally {
      setPageLoading(false)
    }
  }, [id])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Auto-resize textarea
  const handleInput = (e) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e)
    }
  }

  const sendMessage = async (e, forcedMessage = null) => {
    if (e) e.preventDefault()
    const userMsg = forcedMessage || input.trim()
    if (!userMsg || botLoading || isStreaming) return

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    
    const newMsg = { role: 'user', content: userMsg, time: new Date() }
    setMessages(p => [...p, newMsg])
    setBotLoading(true)
    setIsStreaming(false)

    // Add placeholder bot message
    setMessages(p => [...p, { role: 'assistant', content: '', time: new Date() }])

    // Mock response metrics
    const startTime = Date.now()

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const stored  = JSON.parse(localStorage.getItem('chatplug-auth') || '{}')
      const token   = stored?.state?.token

      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch(`${apiBase}/chat/${chatbot.embedId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: userMsg,
          sessionId: sessionId.current,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `HTTP ${res.status}`)
      }

      setBotLoading(false)
      setIsStreaming(true)

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() 

        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          try {
            const data = JSON.parse(line.slice(5).trim())
            if (data.error) {
              full += "\n\n**Error:** `" + data.error + "`"
              updateLastMessage(full)
            }
            if (data.delta) {
              full += data.delta
              updateLastMessage(full)
            }
          } catch {}
        }
      }

      if (!full) {
        updateLastMessage('Sorry, I could not generate a response.')
      }

      // Update mock metrics for debug panel
      setMockMetrics({
        tokens: Math.floor(full.length / 4) + Math.floor(userMsg.length / 4),
        ms: Date.now() - startTime,
        chunks: [
          { file: 'getting-started.pdf', score: 0.89, text: 'To embed the widget, copy the script tag and paste it into your HTML body.' },
          { file: 'api-reference.txt', score: 0.74, text: 'The chat endpoint accepts POST requests with a message and sessionId.' }
        ]
      })

    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('[Chat]', err)
      updateLastMessage(`⚠️ ${err.message || 'Something went wrong. Please try again.'}`)
    } finally {
      setBotLoading(false)
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const updateLastMessage = (content) => {
    setMessages(p => {
      const copy = [...p]
      copy[copy.length - 1] = { ...copy[copy.length - 1], content }
      return copy
    })
  }

  if (pageLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="animate-spin text-accent" size={32} />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle className="mx-auto text-red-500" size={40} />
        <p className="text-text-muted">{error}</p>
        <button onClick={loadData} className="px-6 py-2 bg-surface border border-border rounded-xl text-text-primary hover:bg-surface-elevated transition-colors flex items-center gap-2 mx-auto">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    </div>
  )

  const isReady = chatbot?.status === 'ready'
  const accentColor = chatbot?.settings?.accentColor || '#6C63FF'

  return (
    <div className="h-[100dvh] md:h-screen bg-background text-text-primary font-inter flex overflow-hidden selection:bg-accent/30 pb-[60px] md:pb-0">

      {/* ─── LEFT PANEL: Bot Selector ─── */}
      {/* Mobile: slide-in overlay; Desktop: always visible */}
      {leftSidebarOpen && (
        <div
          className="fixed inset-0 z-[30] bg-background/80 backdrop-blur-sm lg:hidden bottom-[60px] md:bottom-0"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}
      <div className={`fixed lg:static top-0 bottom-[60px] md:inset-y-0 left-0 z-[40] w-[260px] bg-surface border-r border-border flex flex-col shrink-0 transition-transform duration-300 ${
        leftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Link to="/dashboard" id="playground-back-btn" className="p-2 -ml-2 rounded-lg hover:bg-surface-elevated text-text-muted hover:text-text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ChevronLeft size={20} />
          </Link>
          <h2 className="font-bold text-text-primary flex-1">Playground</h2>
          <button
            id="playground-close-sidebar"
            onClick={() => setLeftSidebarOpen(false)}
            className="lg:hidden p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-elevated"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Select Chatbot</p>
          <div className="space-y-2">
            {chatbots.map(b => (
              <button
                key={b._id}
                onClick={() => navigate(`/chatbot/${b._id}/playground`)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  b._id === id 
                    ? 'bg-accent/10 border-accent/30 shadow-[0_0_15px_rgba(108,99,255,0.05)]' 
                    : 'bg-transparent border-transparent hover:bg-surface-elevated hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold truncate pr-2 ${b._id === id ? 'text-accent' : 'text-text-primary'}`}>
                    {b.name}
                  </h3>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${b.status === 'ready' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><FileText size={10} /> {b.documents?.length || 0}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={10} /> {b.stats?.totalMessages || 0}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CENTER PANEL: Chat Window ─── */}
      <div className="flex-1 flex flex-col relative bg-background min-w-0">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] noise-bg" />

        {/* Chat Header */}
        <div className="h-14 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger for left sidebar */}
            <button
              id="playground-open-sidebar"
              onClick={() => setLeftSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Menu size={20} />
            </button>
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: accentColor }}>
                <Bot size={20} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-background rounded-full flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-text-primary leading-tight text-sm sm:text-base">{chatbot?.name}</h2>
              <p className="text-xs text-text-muted font-medium">{isReady ? 'Online' : 'Training...'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => { setMessages([]); setMockMetrics({ tokens: 0, ms: 0, chunks: [] }) }} className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors" title="Clear Chat">
              <RefreshCw size={18} />
            </button>
            <Link to={`/chatbot/${id}`} className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors" title="Settings">
              <Settings size={18} />
            </Link>
            <button
              onClick={() => setIsFullscreen(f => !f)}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors hidden sm:block"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors" title="Toggle Debug Panel">
              <Terminal size={18} />
            </button>
          </div>
        </div>

        {!isReady && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-3 flex items-center gap-3 shrink-0 relative z-10">
            <Loader2 size={14} className="text-yellow-500 animate-spin shrink-0" />
            <p className="text-sm text-yellow-600 font-medium">
              Bot is {chatbot?.status === 'training' ? 'training on your documents' : 'in draft mode'}. Responses may be unavailable.
            </p>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-8 relative z-10">
          <div className="max-w-3xl mx-auto w-full">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center pt-20">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent/20 mb-6" style={{ backgroundColor: accentColor }}>
                  <Bot size={40} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">Ask me anything</h3>
                <p className="text-text-muted mb-10">Test your chatbot's knowledge base in real-time.</p>
                
                <div className="flex flex-col gap-3 w-full max-w-md">
                  {['What is this document about?', 'Can you summarize the key points?', 'How do I get started?'].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(null, q)}
                      className="px-4 py-3 bg-surface border border-border hover:border-accent hover:text-accent rounded-xl text-sm font-medium text-text-primary transition-all text-left flex items-center justify-between group"
                    >
                      {q} <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isBot = msg.role === 'assistant'
                    const isLastBotMsg = isBot && i === messages.length - 1
                    
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-4 ${!isBot ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${!isBot ? 'bg-gradient-to-br from-accent to-accent-secondary' : ''}`} style={isBot ? { backgroundColor: accentColor } : {}}>
                          {!isBot ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                        </div>
                        
                        <div className={`flex flex-col ${!isBot ? 'items-end' : 'items-start'} max-w-[80%]`}>
                          <div className={`px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                            !isBot 
                              ? 'bg-gradient-to-r from-accent to-accent-secondary text-white rounded-2xl rounded-tr-sm' 
                              : 'bg-surface border border-border text-text-primary rounded-2xl rounded-tl-sm'
                          }`}>
                            {msg.content || (
                              botLoading && isLastBotMsg ? (
                                <span className="flex items-center gap-1.5 h-5 px-1">
                                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </span>
                              ) : null
                            )}
                            {isStreaming && isLastBotMsg && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-text-primary animate-pulse" />}
                          </div>
                          <span className="text-[10px] text-text-muted font-medium mt-1.5 px-1">
                            {msg.time ? formatTime(msg.time) : formatTime(new Date())}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface/50 backdrop-blur-md border-t border-border shrink-0 relative z-10">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={sendMessage} className="relative flex items-end gap-2 bg-background border border-border focus-within:border-accent focus-within:shadow-[0_0_15px_rgba(108,99,255,0.1)] rounded-2xl p-2 transition-all">
              <button type="button" onClick={() => toast('File attachment coming soon', { icon: '📎' })} className="p-2 text-text-muted hover:text-text-primary transition-colors shrink-0 mb-1 rounded-lg hover:bg-surface">
                <Paperclip size={20} />
              </button>
              
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={isReady ? "Message ChatPlug..." : "Waiting for bot to be ready..."}
                disabled={!isReady || botLoading || isStreaming}
                className="flex-1 max-h-[120px] bg-transparent text-text-primary placeholder:text-text-muted/50 resize-none py-3 focus:outline-none text-sm"
                rows={1}
              />
              
              <button
                type="submit"
                disabled={!input.trim() || !isReady || botLoading || isStreaming}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mb-0.5 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                style={{ backgroundColor: accentColor }}
              >
                {(botLoading || isStreaming) ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="-ml-0.5" />}
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] font-medium text-text-muted">Enter to send, Shift+Enter for newline</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Debug & Context ─── */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-surface border-l border-border flex flex-col shrink-0 overflow-hidden lg:relative absolute right-0 top-0 bottom-[60px] md:bottom-0 lg:inset-y-0 z-[30] shadow-2xl lg:shadow-none"
          >
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-text-primary font-bold">
                <Terminal size={16} className="text-accent" /> Debug Info
              </div>
              <button onClick={() => setRightPanelOpen(false)} className="lg:hidden p-1 text-text-muted hover:text-text-primary">
                <ChevronRight size={18} />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-6">
              
              {/* Metrics */}
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Response Metrics</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background border border-border rounded-xl p-3">
                    <p className="text-[10px] text-text-muted font-medium mb-1 flex items-center gap-1"><Database size={10}/> Tokens</p>
                    <p className="font-mono text-sm font-bold text-text-primary">{mockMetrics.tokens}</p>
                  </div>
                  <div className="bg-background border border-border rounded-xl p-3">
                    <p className="text-[10px] text-text-muted font-medium mb-1 flex items-center gap-1"><Clock size={10}/> Latency</p>
                    <p className="font-mono text-sm font-bold text-text-primary">{mockMetrics.ms}ms</p>
                  </div>
                </div>
              </div>

              {/* Context Chunks */}
              <div>
                 <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">RAG Context Used</p>
                 {messages.length <= 1 ? (
                   <p className="text-xs text-text-muted italic bg-background p-3 rounded-xl border border-border">No queries made yet.</p>
                 ) : (
                   <div className="space-y-3">
                     {mockMetrics.chunks.map((chunk, i) => (
                       <div key={i} className="bg-background border border-border rounded-xl overflow-hidden">
                         <div className="px-3 py-2 bg-surface-elevated border-b border-border flex items-center justify-between cursor-pointer">
                           <span className="text-xs font-semibold text-text-primary truncate pr-2 flex items-center gap-1.5">
                             <FileText size={12} className="text-accent" /> {chunk.file}
                           </span>
                           <ChevronDown size={14} className="text-text-muted" />
                         </div>
                         <div className="p-3">
                           <div className="flex items-center gap-2 mb-2">
                             <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
                               <div className="h-full bg-green-500" style={{ width: `${chunk.score * 100}%` }} />
                             </div>
                             <span className="text-[10px] font-bold text-text-muted">{(chunk.score * 100).toFixed(0)}% Match</span>
                           </div>
                           <p className="text-xs text-text-muted leading-relaxed line-clamp-3">"{chunk.text}"</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
