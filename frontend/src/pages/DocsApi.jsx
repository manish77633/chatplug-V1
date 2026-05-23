// src/pages/DocsApi.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, ChevronLeft, Copy, ArrowRight, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const endpoints = [
  {
    method: 'POST',
    path: '/api/auth/register',
    summary: 'Register a new user account',
    description: 'Creates a new user and returns a JWT token. Use this token in the Authorization header for all subsequent requests.',
    request: `{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}`,
    response: `{
  "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}`,
    auth: false,
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    summary: 'Authenticate and obtain a token',
    description: 'Returns a JWT bearer token on success. Pass this as `Authorization: Bearer <token>` on all protected routes.',
    request: `{
  "email": "jane@example.com",
  "password": "securepassword"
}`,
    response: `{
  "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}`,
    auth: false,
  },
  {
    method: 'GET',
    path: '/api/chatbots',
    summary: 'List all chatbots for the authenticated user',
    description: 'Returns an array of chatbot objects owned by the current user. Includes document counts and status.',
    request: null,
    response: `{
  "chatbots": [
    {
      "_id": "abc123",
      "name": "Sales Assistant",
      "status": "ready",
      "embedId": "embed_xyz",
      "documents": [{ "_id": "...", "name": "pricing.pdf", "status": "ready" }]
    }
  ]
}`,
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/chatbots',
    summary: 'Create a new chatbot',
    description: 'Creates a new chatbot in draft status. You must upload documents and complete setup before it becomes active.',
    request: `{
  "name": "Support Bot",
  "description": "Handles customer inquiries"
}`,
    response: `{
  "chatbot": {
    "_id": "abc123",
    "name": "Support Bot",
    "status": "draft",
    "embedId": "embed_xyz"
  }
}`,
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/documents/:botId/upload',
    summary: 'Upload a document to a chatbot',
    description: 'Accepts multipart/form-data. Supported file types: PDF, TXT, DOCX (max 50MB). Or pass a URL to scrape instead of a file.',
    request: `FormData:
  type: "pdf"  | "url"
  file: <binary>  (if type=pdf)
  url: "https://..." (if type=url)`,
    response: `{
  "document": {
    "_id": "...",
    "name": "getting-started.pdf",
    "status": "processing"
  },
  "message": "Document queued for training"
}`,
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/chat/:embedId',
    summary: 'Send a message to a deployed chatbot',
    description: 'Streams server-sent events (SSE). Each data event contains a `delta` field with the next chunk of the response. The stream ends when the connection closes.',
    request: `{
  "message": "How do I reset my password?",
  "sessionId": "user_session_abc123",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}`,
    response: `data: {"delta": "To reset"}
data: {"delta": " your password,"}
data: {"delta": " go to Settings..."}
(connection closes)`,
    auth: false,
  },
]

const METHOD_COLORS = {
  GET:    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  POST:   'bg-green-500/10 text-green-400 border border-green-500/20',
  PUT:    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  DELETE: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

function CodeBlock({ code, lang = 'json' }) {
  return (
    <div className="relative group">
      <pre className="text-sm text-green-400 font-mono leading-relaxed overflow-x-auto bg-background border border-border rounded-xl p-4 whitespace-pre-wrap break-words">
        {code}
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); toast.success('Copied!') }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-surface border border-border rounded-lg text-xs font-semibold text-text-primary flex items-center gap-1"
      >
        <Copy size={12} /> Copy
      </button>
    </div>
  )
}

export default function DocsApi() {
  const navigate = useNavigate()
  const [activeEndpoint, setActiveEndpoint] = useState(0)

  return (
    <div className="bg-background text-text-primary font-inter selection:bg-accent/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-2.5 sm:px-10 py-4 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            id="docs-api-back"
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
          <span className="text-sm font-medium text-text-muted hidden sm:block">API Reference</span>
        </div>
        <Link
          to="/register"
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
        >
          Get API Key <ArrowRight size={14} />
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-2.5 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar — Endpoint list */}
        <aside className="lg:w-60 shrink-0">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 px-3">Endpoints</p>
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {endpoints.map((ep, i) => (
              <button
                key={i}
                id={`api-ep-${i}`}
                onClick={() => setActiveEndpoint(i)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all shrink-0 lg:shrink lg:w-full min-h-[44px] ${
                  activeEndpoint === i
                    ? 'bg-accent/10 border border-accent/20'
                    : 'hover:bg-surface-elevated border border-transparent'
                }`}
              >
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${METHOD_COLORS[ep.method]}`}>
                  {ep.method}
                </span>
                <span className={`text-xs font-medium truncate ${activeEndpoint === i ? 'text-accent' : 'text-text-muted'}`}>
                  {ep.path.split('/').slice(-2).join('/')}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-surface border border-border rounded-2xl hidden lg:block">
            <p className="text-xs font-semibold text-text-muted mb-2">Base URL</p>
            <code className="text-xs text-accent font-mono break-all">https://api.chatplug.io</code>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {endpoints.map((ep, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: activeEndpoint === i ? 1 : 0, y: activeEndpoint === i ? 0 : 16 }}
              className={activeEndpoint === i ? 'block' : 'hidden'}
            >
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className={`px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${METHOD_COLORS[ep.method]}`}>
                  {ep.method}
                </span>
                <code className="text-text-primary font-mono text-base break-all">{ep.path}</code>
                {ep.auth && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-1 rounded-lg">
                    <Lock size={10} /> Auth required
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-text-primary mb-2">{ep.summary}</h2>
              <p className="text-text-muted leading-relaxed mb-6">{ep.description}</p>

              {ep.request && (
                <div className="mb-5">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Request Body</p>
                  <CodeBlock code={ep.request} />
                </div>
              )}

              <div className="mb-5">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Response</p>
                <CodeBlock code={ep.response} />
              </div>
            </motion.div>
          ))}
        </main>
      </div>
    </div>
  )
}
