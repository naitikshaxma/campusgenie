import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Search, BookOpen, FileText, ExternalLink, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const RESOURCE_TYPES = [
  { id: 'web',     label: 'Web',      icon: Globe },
  { id: 'notes',   label: 'My Notes', icon: FileText },
  { id: 'books',   label: 'Books',    icon: BookOpen },
]

/**
 * ResearchSidebar — right panel in LaptopWorkspace for looking up sources.
 * Designed to be API-ready: search hooks into your research API.
 */
export default function ResearchSidebar({ assignmentContext }) {
  const [query,     setQuery]     = useState('')
  const [activeTab, setActiveTab] = useState('web')
  const [results,   setResults]   = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsSearching(true)
    setResults([])

    // API-ready: replace with actual search service call
    // const data = await searchService.search(query, { type: activeTab })
    await new Promise((r) => setTimeout(r, 800))
    setResults([]) // empty until API connected
    setIsSearching(false)
  }

  return (
    <div className="flex flex-col h-full border-l border-border/60 bg-card/30 w-72 shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/60">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Research</h3>

        {/* Type tabs */}
        <div className="flex gap-1 mb-3">
          {RESOURCE_TYPES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all',
                activeTab === id
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent',
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'notes' ? 'your notes' : activeTab === 'books' ? 'textbooks' : 'the web'}…`}
            className="pl-8 h-8 text-xs"
          />
        </form>
      </div>

      {/* Context chip */}
      {assignmentContext && (
        <div className="px-4 py-2 border-b border-border/40">
          <div className="flex items-center gap-2 rounded-lg bg-brand-500/5 border border-brand-500/10 px-2.5 py-1.5">
            <BookOpen className="h-3 w-3 text-brand-400 shrink-0" />
            <p className="text-[10px] text-brand-400 truncate">{assignmentContext}</p>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isSearching ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Searching…</span>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            {results.map((result, i) => (
              <motion.a
                key={i}
                href={result.url}
                target="_blank"
                rel="noopener"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="block rounded-lg border border-border p-3 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium leading-snug group-hover:text-brand-400 transition-colors line-clamp-2">
                    {result.title}
                  </p>
                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground mt-0.5" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{result.snippet}</p>
              </motion.a>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Globe className="h-8 w-8 text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground">Search to find resources</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Connect API to enable search</p>
          </div>
        )}
      </div>
    </div>
  )
}
