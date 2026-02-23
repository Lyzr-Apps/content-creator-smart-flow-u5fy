'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { Menu, X, Copy, Download, Clock, Tag, FileText, ChevronRight, Pencil, Trash2, Plus, Check, AlertCircle, ChevronLeft } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const MANAGER_AGENT_ID = '699856ad9aed6ad6a982634f'

const AGENTS = [
  { id: '699856ad9aed6ad6a982634f', name: 'Content Production Manager', purpose: 'Orchestrates the full content pipeline' },
  { id: '699856973372c6fec01285bc', name: 'Idea & Outline Agent', purpose: 'Brainstorms angles and structures outlines' },
  { id: '69985698df489db34d9e700c', name: 'Draft Writer Agent', purpose: 'Writes the full blog post draft' },
  { id: '69985698a1589b1b569481f4', name: 'SEO Optimizer Agent', purpose: 'Optimizes content for search engines' },
]

const TONE_OPTIONS = ['Professional', 'Casual', 'Authoritative', 'Conversational', 'Witty']

const SAMPLE_TOPICS = [
  'Top 10 DeFi Trends for 2025',
  'Bitcoin Mining: A Beginner\'s Guide',
  'How Blockchain is Changing Finance',
  'Web3 Security Best Practices',
  'Understanding Cryptocurrency Regulations',
]

const LOADING_STAGES = [
  'Brainstorming ideas...',
  'Building outline...',
  'Writing draft...',
  'Optimizing for SEO...',
  'Finalizing content...',
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface ManagerResponse {
  final_content: string
  title: string
  meta_title: string
  meta_description: string
  primary_keywords: string[]
  keyword_density: string
  readability_score: string
  heading_structure: Array<{ level: string; text: string }>
  internal_linking_suggestions: string[]
  seo_score: string
  word_count: number
  summary: string
}

interface HistoryItem {
  id: string
  topic: string
  title: string
  date: string
  response: ManagerResponse
  formData: {
    topic: string
    audience: string
    tone: string
    keywords: string[]
    contentLength: string
  }
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const SAMPLE_RESPONSE: ManagerResponse = {
  final_content: `# Top 10 DeFi Trends Shaping 2025\n\nDecentralized Finance (DeFi) continues to evolve at a breakneck pace. As we move through 2025, several key trends are reshaping how we think about financial services, lending, and asset management in the blockchain ecosystem.\n\n## 1. Real-World Asset Tokenization\n\nThe bridge between traditional finance and DeFi is strengthening through **real-world asset (RWA) tokenization**. Everything from government bonds to real estate is being brought on-chain, creating new opportunities for global investors.\n\n### Why It Matters\n\n- Unlocks trillions in illiquid assets\n- Provides 24/7 trading of traditionally restricted instruments\n- Democratizes access to high-value investments\n\n## 2. AI-Powered DeFi Protocols\n\nArtificial intelligence is being integrated into DeFi protocols to optimize:\n\n- Yield farming strategies\n- Risk assessment and management\n- Automated portfolio rebalancing\n- Fraud detection and prevention\n\n## 3. Cross-Chain Interoperability\n\nSeamless movement of assets across different blockchain networks is becoming the norm. Protocols like LayerZero and Wormhole are enabling **true cross-chain composability**, allowing users to interact with DeFi applications regardless of the underlying chain.\n\n## 4. Institutional DeFi Adoption\n\nMajor financial institutions are no longer just watching from the sidelines. Banks, hedge funds, and asset managers are actively building on or integrating with DeFi protocols, bringing:\n\n- Enhanced liquidity\n- Regulatory clarity\n- Professional-grade tooling\n- Institutional-scale capital\n\n## 5. Decentralized Identity Solutions\n\nSelf-sovereign identity is becoming a cornerstone of DeFi participation, enabling compliant yet privacy-preserving interactions with protocols.\n\n## 6. Sustainable DeFi\n\nGreen DeFi initiatives are gaining traction, with protocols optimizing for energy efficiency and carbon-neutral operations.\n\n## 7. Advanced Derivatives Markets\n\nOn-chain derivatives are maturing, offering sophisticated options, futures, and structured products that rival traditional finance offerings.\n\n## 8. DeFi Insurance Evolution\n\nProtocol insurance is becoming more robust, covering smart contract risks, bridge exploits, and oracle failures with actuarial precision.\n\n## 9. Governance Innovation\n\nDAOs are experimenting with new governance models including quadratic voting, delegation markets, and time-weighted voting power.\n\n## 10. Mobile-First DeFi\n\nDeFi is becoming accessible to billions through mobile-optimized interfaces, simplified onboarding, and account abstraction.\n\n## Conclusion\n\nThe DeFi landscape in 2025 is more mature, accessible, and interconnected than ever before. These trends point toward a future where decentralized financial services are not just an alternative but a fundamental layer of the global financial system.`,
  title: 'Top 10 DeFi Trends Shaping 2025',
  meta_title: 'Top 10 DeFi Trends for 2025 | Bitoini.com',
  meta_description: 'Discover the top DeFi trends defining 2025, from real-world asset tokenization to AI-powered protocols. Stay ahead of the curve with our comprehensive analysis.',
  primary_keywords: ['DeFi trends 2025', 'decentralized finance', 'RWA tokenization', 'cross-chain DeFi', 'institutional DeFi'],
  keyword_density: '2.1%',
  readability_score: 'Good',
  heading_structure: [
    { level: 'H1', text: 'Top 10 DeFi Trends Shaping 2025' },
    { level: 'H2', text: '1. Real-World Asset Tokenization' },
    { level: 'H3', text: 'Why It Matters' },
    { level: 'H2', text: '2. AI-Powered DeFi Protocols' },
    { level: 'H2', text: '3. Cross-Chain Interoperability' },
    { level: 'H2', text: '4. Institutional DeFi Adoption' },
    { level: 'H2', text: '5. Decentralized Identity Solutions' },
    { level: 'H2', text: '6. Sustainable DeFi' },
    { level: 'H2', text: '7. Advanced Derivatives Markets' },
    { level: 'H2', text: '8. DeFi Insurance Evolution' },
    { level: 'H2', text: '9. Governance Innovation' },
    { level: 'H2', text: '10. Mobile-First DeFi' },
    { level: 'H2', text: 'Conclusion' },
  ],
  internal_linking_suggestions: [
    'Link to "What is DeFi?" explainer page',
    'Link to "Blockchain Basics" guide for new readers',
    'Cross-link to "Crypto Regulation Updates" page',
    'Link to "DeFi Yield Farming Strategies" article',
  ],
  seo_score: 'Good',
  word_count: 1487,
  summary: 'A comprehensive overview of the ten most impactful DeFi trends in 2025, covering real-world asset tokenization, AI integration, cross-chain interoperability, institutional adoption, and more.',
}

// ─── Markdown Renderer ───────────────────────────────────────────────────────

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold">
        {part}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  )
}

function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null
  return (
    <div className="space-y-3" style={{ lineHeight: '1.7' }}>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return (
            <h4 key={i} className="font-serif font-bold text-base mt-6 mb-2 text-foreground" style={{ letterSpacing: '-0.02em' }}>
              {formatInline(line.slice(4))}
            </h4>
          )
        if (line.startsWith('## '))
          return (
            <h3 key={i} className="font-serif font-bold text-lg mt-8 mb-3 text-foreground" style={{ letterSpacing: '-0.02em' }}>
              {formatInline(line.slice(3))}
            </h3>
          )
        if (line.startsWith('# '))
          return (
            <h2 key={i} className="font-serif font-bold text-2xl mt-8 mb-4 text-foreground" style={{ letterSpacing: '-0.02em' }}>
              {formatInline(line.slice(2))}
            </h2>
          )
        if (line.startsWith('- ') || line.startsWith('* '))
          return (
            <li key={i} className="ml-6 list-disc text-sm text-foreground/90">
              {formatInline(line.slice(2))}
            </li>
          )
        if (/^\d+\.\s/.test(line))
          return (
            <li key={i} className="ml-6 list-decimal text-sm text-foreground/90">
              {formatInline(line.replace(/^\d+\.\s/, ''))}
            </li>
          )
        if (!line.trim()) return <div key={i} className="h-2" />
        return (
          <p key={i} className="text-sm text-foreground/90">
            {formatInline(line)}
          </p>
        )
      })}
    </div>
  )
}

// ─── Utility: Markdown to HTML ────────────────────────────────────────────────

function markdownToHtml(md: string): string {
  let html = md
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>')
  html = html.replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
  html = html.replace(/\n\n/g, '</p><p>')
  html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Blog Post</title><style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 20px;color:#141414;line-height:1.7}h1{font-size:2em;margin-top:1.5em}h2{font-size:1.5em;margin-top:1.3em}h3{font-size:1.2em;margin-top:1em}li{margin-left:1.5em;margin-bottom:0.3em}p{margin-bottom:1em}</style></head><body><p>${html}</p></body></html>`
  return html
}

// ─── Utility: Download file ───────────────────────────────────────────────────

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── ErrorBoundary ────────────────────────────────────────────────────────────

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Score Color Helper ───────────────────────────────────────────────────────

function getScoreBadgeClasses(score: string): string {
  const s = (score ?? '').toLowerCase()
  if (s === 'good' || s === 'excellent') return 'bg-green-100 text-green-800 border border-green-300'
  if (s === 'needs work' || s === 'average' || s === 'fair') return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
  if (s === 'poor' || s === 'bad') return 'bg-red-100 text-red-800 border border-red-300'
  return 'bg-secondary text-secondary-foreground border border-border'
}

// ─── Sidebar History Item ─────────────────────────────────────────────────────

function HistoryEntry({
  item,
  isActive,
  onSelect,
  onDelete,
}: {
  item: HistoryItem
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={`group px-4 py-3 cursor-pointer border-b border-border transition-colors ${isActive ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{item?.title || item?.topic || 'Untitled'}</p>
          <p className="text-xs text-muted-foreground mt-1">{item?.date ?? ''}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
          aria-label="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton({ stageIndex }: { stageIndex: number }) {
  return (
    <div className="border border-border bg-card p-8 mt-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground animate-spin" style={{ borderRadius: '50%' }} />
        <span className="text-sm font-medium text-foreground">{LOADING_STAGES[stageIndex] ?? 'Processing...'}</span>
      </div>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-6 bg-muted animate-pulse w-3/4" />
          <div className="h-4 bg-muted animate-pulse w-full" />
          <div className="h-4 bg-muted animate-pulse w-5/6" />
          <div className="h-4 bg-muted animate-pulse w-4/5" />
        </div>
        <div className="space-y-3">
          <div className="h-5 bg-muted animate-pulse w-2/5" />
          <div className="h-4 bg-muted animate-pulse w-full" />
          <div className="h-4 bg-muted animate-pulse w-3/4" />
        </div>
        <div className="space-y-3">
          <div className="h-5 bg-muted animate-pulse w-1/3" />
          <div className="h-4 bg-muted animate-pulse w-full" />
          <div className="h-4 bg-muted animate-pulse w-2/3" />
        </div>
      </div>
      <div className="mt-8 flex gap-2">
        {LOADING_STAGES.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 transition-colors duration-500 ${idx <= stageIndex ? 'bg-foreground' : 'bg-muted'}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {LOADING_STAGES.map((_, idx) => (
          <span
            key={idx}
            className={`text-[10px] ${idx <= stageIndex ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {idx + 1}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── SEO Metadata Panel ──────────────────────────────────────────────────────

function SeoPanel({ data }: { data: ManagerResponse }) {
  return (
    <div className="border border-border bg-card mt-6">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-serif font-bold text-lg text-foreground" style={{ letterSpacing: '-0.02em' }}>SEO Analysis</h3>
      </div>
      <div className="p-6 space-y-5">
        {/* Meta Title */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Meta Title</label>
          <p className="text-sm text-foreground mt-1">{data?.meta_title ?? 'N/A'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{(data?.meta_title ?? '').length} / 60 characters</p>
        </div>

        {/* Meta Description */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Meta Description</label>
          <p className="text-sm text-foreground mt-1">{data?.meta_description ?? 'N/A'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{(data?.meta_description ?? '').length} / 160 characters</p>
        </div>

        {/* Scores Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">SEO Score</label>
            <div className="mt-1">
              <span className={`inline-block px-2 py-0.5 text-xs font-medium ${getScoreBadgeClasses(data?.seo_score ?? '')}`}>
                {data?.seo_score ?? 'N/A'}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Readability</label>
            <div className="mt-1">
              <span className={`inline-block px-2 py-0.5 text-xs font-medium ${getScoreBadgeClasses(data?.readability_score ?? '')}`}>
                {data?.readability_score ?? 'N/A'}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Keyword Density</label>
            <p className="text-sm font-medium text-foreground mt-1">{data?.keyword_density ?? 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Word Count</label>
            <p className="text-sm font-medium text-foreground mt-1">{data?.word_count ?? 0}</p>
          </div>
        </div>

        {/* Primary Keywords */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Primary Keywords</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.isArray(data?.primary_keywords) && data.primary_keywords.length > 0 ? (
              data.primary_keywords.map((kw, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground border border-border">
                  <Tag size={10} />
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No keywords</span>
            )}
          </div>
        </div>

        {/* Heading Structure */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Heading Structure</label>
          <div className="mt-2 space-y-1">
            {Array.isArray(data?.heading_structure) && data.heading_structure.length > 0 ? (
              data.heading_structure.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="font-mono bg-muted px-1.5 py-0.5 text-muted-foreground border border-border" style={{ minWidth: '28px', textAlign: 'center' }}>
                    {h?.level ?? ''}
                  </span>
                  <span className="text-foreground truncate">{h?.text ?? ''}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No heading structure data</span>
            )}
          </div>
        </div>

        {/* Internal Linking Suggestions */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Internal Linking Suggestions</label>
          <ul className="mt-2 space-y-1">
            {Array.isArray(data?.internal_linking_suggestions) && data.internal_linking_suggestions.length > 0 ? (
              data.internal_linking_suggestions.map((link, idx) => (
                <li key={idx} className="text-xs text-foreground/80 flex items-start gap-2">
                  <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <span>{link}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-muted-foreground">No suggestions</li>
            )}
          </ul>
        </div>

        {/* Summary */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Summary</label>
          <p className="text-sm text-foreground/80 mt-1" style={{ lineHeight: '1.7' }}>{data?.summary ?? 'No summary available'}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Agent Status Panel ───────────────────────────────────────────────────────

function AgentStatusPanel({ activeAgentId }: { activeAgentId: string | null }) {
  return (
    <div className="border border-border bg-card mt-6">
      <div className="px-6 py-3 border-b border-border">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent Pipeline</h3>
      </div>
      <div className="px-6 py-3 space-y-2">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="flex items-center gap-3">
            <div className={`w-2 h-2 flex-shrink-0 ${activeAgentId === agent.id ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} style={{ borderRadius: '50%' }} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs truncate ${activeAgentId === agent.id ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {agent.name}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground hidden md:block">{agent.purpose}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Page() {
  // Form state
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [tone, setTone] = useState('Professional')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [contentLength, setContentLength] = useState('Medium')

  // Generation state
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<ManagerResponse | null>(null)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // Editing state
  const [editedContent, setEditedContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const editAreaRef = useRef<HTMLTextAreaElement>(null)

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)

  // Sample data toggle
  const [showSample, setShowSample] = useState(false)

  // Clipboard status
  const [copied, setCopied] = useState(false)

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bitoini_content_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setHistory(parsed)
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Save history to localStorage
  const saveHistory = useCallback((items: HistoryItem[]) => {
    setHistory(items)
    try {
      localStorage.setItem('bitoini_content_history', JSON.stringify(items))
    } catch {
      // Ignore storage errors
    }
  }, [])

  // Loading stage animation
  useEffect(() => {
    if (!loading) return
    setLoadingStage(0)
    const interval = setInterval(() => {
      setLoadingStage((prev) => {
        if (prev >= LOADING_STAGES.length - 1) return prev
        return prev + 1
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [loading])

  // Handle sample data toggle
  useEffect(() => {
    if (showSample) {
      setTopic('Top 10 DeFi Trends for 2025')
      setAudience('Crypto enthusiasts and investors')
      setTone('Authoritative')
      setKeywords(['DeFi', 'decentralized finance', 'blockchain', 'crypto trends'])
      setContentLength('Medium')
      setResponse(SAMPLE_RESPONSE)
      setEditedContent(SAMPLE_RESPONSE.final_content)
      setError(null)
    } else {
      setResponse(null)
      setEditedContent('')
      setTopic('')
      setAudience('')
      setTone('Professional')
      setKeywords([])
      setContentLength('Medium')
    }
  }, [showSample])

  // Sync edited content when response changes
  useEffect(() => {
    if (response?.final_content) {
      setEditedContent(response.final_content)
    }
  }, [response])

  // Add keyword on Enter
  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = keywordInput.trim()
      if (trimmed && !keywords.includes(trimmed)) {
        setKeywords((prev) => [...prev, trimmed])
      }
      setKeywordInput('')
    }
  }

  const removeKeyword = (kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw))
  }

  // Generate content
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or prompt to generate content.')
      return
    }
    setLoading(true)
    setError(null)
    setResponse(null)
    setActiveAgentId(MANAGER_AGENT_ID)
    setActiveHistoryId(null)
    setIsEditing(false)

    const message = `Create a blog post about: ${topic}

Target Audience: ${audience || 'General'}
Tone: ${tone}
Target Keywords: ${keywords.length > 0 ? keywords.join(', ') : 'None specified'}
Content Length: ${contentLength} (${contentLength === 'Short' ? '~800 words' : contentLength === 'Medium' ? '~1500 words' : '~2500+ words'})

Additional context: Write a comprehensive, well-structured blog post for Bitoini.com on this topic. Follow the complete pipeline: brainstorm content angles, create an outline, write the full draft, and then optimize for SEO.`

    try {
      const result = await callAIAgent(message, MANAGER_AGENT_ID)

      if (result?.success) {
        let parsed: ManagerResponse | null = null
        const agentResult = result?.response?.result

        if (typeof agentResult === 'string') {
          try {
            parsed = JSON.parse(agentResult) as ManagerResponse
          } catch {
            parsed = null
          }
        } else if (agentResult && typeof agentResult === 'object') {
          parsed = agentResult as ManagerResponse
        }

        if (parsed) {
          setResponse(parsed)
          setEditedContent(parsed?.final_content ?? '')

          // Save to history
          const newItem: HistoryItem = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
            topic: topic,
            title: parsed?.title ?? topic,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            response: parsed,
            formData: { topic, audience, tone, keywords: [...keywords], contentLength },
          }
          saveHistory([newItem, ...history])
          setActiveHistoryId(newItem.id)
        } else {
          // Try to extract text if no structured response
          const textResult = result?.response?.message ?? result?.response?.result?.text ?? ''
          if (textResult) {
            const fallbackResponse: ManagerResponse = {
              final_content: typeof textResult === 'string' ? textResult : JSON.stringify(textResult),
              title: topic,
              meta_title: '',
              meta_description: '',
              primary_keywords: [],
              keyword_density: 'N/A',
              readability_score: 'N/A',
              heading_structure: [],
              internal_linking_suggestions: [],
              seo_score: 'N/A',
              word_count: 0,
              summary: '',
            }
            setResponse(fallbackResponse)
            setEditedContent(fallbackResponse.final_content)
          } else {
            setError('Failed to parse the agent response. Please try again.')
          }
        }
      } else {
        setError(result?.error ?? result?.response?.message ?? 'An error occurred while generating content. Please try again.')
      }
    } catch {
      setError('A network error occurred. Please check your connection and try again.')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }

  // Load history item
  const loadHistoryItem = (item: HistoryItem) => {
    setResponse(item.response)
    setEditedContent(item.response?.final_content ?? '')
    setTopic(item.formData?.topic ?? '')
    setAudience(item.formData?.audience ?? '')
    setTone(item.formData?.tone ?? 'Professional')
    setKeywords(Array.isArray(item.formData?.keywords) ? item.formData.keywords : [])
    setContentLength(item.formData?.contentLength ?? 'Medium')
    setActiveHistoryId(item.id)
    setError(null)
    setIsEditing(false)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  // Delete history item
  const deleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id)
    saveHistory(updated)
    if (activeHistoryId === id) {
      setActiveHistoryId(null)
    }
  }

  // Copy to clipboard
  const handleCopy = async () => {
    const success = await copyToClipboard(editedContent || response?.final_content || '')
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Export handlers
  const handleExportMd = () => {
    const content = editedContent || response?.final_content || ''
    const title = response?.title || 'blog-post'
    const safeTitle = title.replace(/[^a-zA-Z0-9\-_ ]/g, '').replace(/\s+/g, '-').toLowerCase()
    downloadFile(content, `${safeTitle}.md`, 'text/markdown')
  }

  const handleExportHtml = () => {
    const content = editedContent || response?.final_content || ''
    const title = response?.title || 'blog-post'
    const safeTitle = title.replace(/[^a-zA-Z0-9\-_ ]/g, '').replace(/\s+/g, '-').toLowerCase()
    const html = markdownToHtml(content)
    downloadFile(html, `${safeTitle}.html`, 'text/html')
  }

  // Select sample topic
  const handleSampleTopic = (t: string) => {
    setTopic(t)
  }

  const currentContent = editedContent || response?.final_content || ''

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* ── Sidebar Overlay (mobile) ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`fixed md:relative z-40 h-screen flex-shrink-0 bg-card border-r border-border flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:-translate-x-full'}`}
          style={{ overflow: 'hidden' }}
        >
          <div className="w-72 h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock size={14} />
                History
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close sidebar"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <FileText size={24} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No history yet. Generate your first content to see it here.</p>
                </div>
              ) : (
                history.map((item) => (
                  <HistoryEntry
                    key={item.id}
                    item={item}
                    isActive={activeHistoryId === item.id}
                    onSelect={() => loadHistoryItem(item)}
                    onDelete={() => deleteHistoryItem(item.id)}
                  />
                ))
              )}
            </div>

            {/* Sidebar Footer */}
            {history.length > 0 && (
              <div className="px-4 py-3 border-t border-border">
                <button
                  onClick={() => {
                    saveHistory([])
                    setActiveHistoryId(null)
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear all history
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 flex flex-col min-h-screen min-w-0">
          {/* ── Header ── */}
          <header className="border-b border-border bg-card px-4 md:px-8 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
              </button>
              <div>
                <h1 className="font-serif font-bold text-xl text-foreground" style={{ letterSpacing: '-0.02em' }}>
                  Content Creator
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">AI-powered blog post generation with SEO optimization</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <span>Sample Data</span>
                <div
                  className={`relative w-9 h-5 border transition-colors cursor-pointer ${showSample ? 'bg-foreground border-foreground' : 'bg-muted border-border'}`}
                  onClick={() => setShowSample(!showSample)}
                  role="switch"
                  aria-checked={showSample}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowSample(!showSample) }}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-card transition-transform ${showSample ? 'translate-x-4' : 'translate-x-0.5'}`}
                  />
                </div>
              </label>
            </div>
          </header>

          {/* ── Scrollable Content Area ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

              {/* ── Input Section ── */}
              <section className="border border-border bg-card">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="font-serif font-bold text-base text-foreground" style={{ letterSpacing: '-0.02em' }}>
                    Create New Content
                  </h2>
                </div>
                <div className="p-6 space-y-5">
                  {/* Topic */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Topic / Prompt
                    </label>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter your topic, prompt, or content brief..."
                      className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors resize-none"
                      rows={3}
                      style={{ lineHeight: '1.7' }}
                    />
                  </div>

                  {/* Audience + Tone Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        placeholder="e.g., Crypto beginners, DeFi developers"
                        className="w-full px-4 py-2.5 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Tone
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-foreground transition-colors appearance-none cursor-pointer"
                      >
                        {TONE_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Target Keywords
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {keywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-secondary text-secondary-foreground border border-border"
                        >
                          <Tag size={10} />
                          {kw}
                          <button
                            onClick={() => removeKeyword(kw)}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                            aria-label={`Remove keyword ${kw}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordKeyDown}
                      placeholder="Type a keyword and press Enter"
                      className="w-full px-4 py-2.5 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>

                  {/* Content Length */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Content Length
                    </label>
                    <div className="flex gap-0">
                      {[
                        { label: 'Short', desc: '~800 words' },
                        { label: 'Medium', desc: '~1500 words' },
                        { label: 'Long', desc: '~2500+ words' },
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setContentLength(opt.label)}
                          className={`flex-1 py-2.5 px-3 text-sm border border-border transition-colors ${contentLength === opt.label ? 'bg-foreground text-background border-foreground' : 'bg-background text-foreground hover:bg-secondary'}`}
                        >
                          <span className="font-medium">{opt.label}</span>
                          <span className="block text-[10px] mt-0.5 opacity-70">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !topic.trim()}
                    className="w-full py-3 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background/30 border-t-background animate-spin" style={{ borderRadius: '50%' }} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Generate Content
                      </>
                    )}
                  </button>
                </div>
              </section>

              {/* ── Error Banner ── */}
              {error && (
                <div className="mt-6 border border-destructive/30 bg-destructive/5 px-6 py-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{error}</p>
                  </div>
                  <button
                    onClick={handleGenerate}
                    className="text-xs font-medium text-foreground px-3 py-1 border border-border hover:bg-secondary transition-colors flex-shrink-0"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* ── Loading State ── */}
              {loading && <LoadingSkeleton stageIndex={loadingStage} />}

              {/* ── Empty State (no response, no loading) ── */}
              {!loading && !response && !error && !showSample && (
                <div className="mt-8 border border-border bg-card p-8 md:p-12 text-center">
                  <FileText size={40} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-serif font-bold text-lg text-foreground mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Ready to Create
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6" style={{ lineHeight: '1.7' }}>
                    Enter a topic above and let the AI pipeline handle the rest. The manager agent coordinates brainstorming, drafting, and SEO optimization to deliver publish-ready content.
                  </p>
                  <div className="text-left max-w-md mx-auto mb-8">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Tips for effective prompts</h4>
                    <ul className="space-y-2">
                      <li className="text-xs text-foreground/70 flex items-start gap-2">
                        <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
                        Be specific about your angle or perspective
                      </li>
                      <li className="text-xs text-foreground/70 flex items-start gap-2">
                        <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
                        Include target keywords for better SEO optimization
                      </li>
                      <li className="text-xs text-foreground/70 flex items-start gap-2">
                        <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
                        Define your audience to shape tone and complexity
                      </li>
                      <li className="text-xs text-foreground/70 flex items-start gap-2">
                        <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
                        Mention any data points or sources you want included
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Try a sample topic</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {SAMPLE_TOPICS.map((st) => (
                        <button
                          key={st}
                          onClick={() => handleSampleTopic(st)}
                          className="px-3 py-1.5 text-xs border border-border text-foreground hover:bg-secondary transition-colors"
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Content Output ── */}
              {!loading && response && (
                <>
                  {/* Content Panel */}
                  <div className="mt-8 border border-border bg-card">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                      <div>
                        <h2 className="font-serif font-bold text-lg text-foreground" style={{ letterSpacing: '-0.02em' }}>
                          {response?.title ?? 'Generated Content'}
                        </h2>
                        {(response?.word_count ?? 0) > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {response.word_count} words
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setIsEditing(!isEditing)
                          if (!isEditing && editAreaRef.current) {
                            setTimeout(() => editAreaRef.current?.focus(), 100)
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors ${isEditing ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                      >
                        <Pencil size={12} />
                        {isEditing ? 'Preview' : 'Edit'}
                      </button>
                    </div>
                    <div className="p-6 md:p-8">
                      {isEditing ? (
                        <textarea
                          ref={editAreaRef}
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full min-h-[500px] bg-background border border-border p-4 text-sm text-foreground font-mono focus:outline-none focus:border-foreground transition-colors resize-y"
                          style={{ lineHeight: '1.7' }}
                        />
                      ) : (
                        <div>
                          {renderMarkdown(currentContent)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-4 flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 text-xs border border-border text-foreground hover:bg-secondary transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy to Clipboard'}
                    </button>
                    <button
                      onClick={handleExportMd}
                      className="flex items-center gap-2 px-4 py-2 text-xs border border-border text-foreground hover:bg-secondary transition-colors"
                    >
                      <Download size={14} />
                      Export .md
                    </button>
                    <button
                      onClick={handleExportHtml}
                      className="flex items-center gap-2 px-4 py-2 text-xs border border-border text-foreground hover:bg-secondary transition-colors"
                    >
                      <Download size={14} />
                      Export .html
                    </button>
                  </div>

                  {/* SEO Panel */}
                  <SeoPanel data={response} />
                </>
              )}

              {/* Agent Status */}
              <AgentStatusPanel activeAgentId={activeAgentId} />

            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
