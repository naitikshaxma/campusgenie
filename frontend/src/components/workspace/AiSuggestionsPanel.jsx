import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronRight, RefreshCw, Loader2, Lightbulb, ListChecks, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUGGESTION_TYPES = [
  { id: 'outline',   label: 'Outline',      icon: ListChecks },
  { id: 'ideas',     label: 'Ideas',        icon: Lightbulb  },
  { id: 'sources',   label: 'Sources',      icon: BookOpen   },
]

/**
 * AiSuggestionsPanel — AI-powered writing assistant panel in LaptopWorkspace.
 * Calls AI API to generate suggestions based on document context.
 */
export default function AiSuggestionsPanel({ documentContext, className }) {
  const [activeType,  setActiveType]  = useState('outline')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading,   setIsLoading]   = useState(false)

  const generate = async () => {
    setIsLoading(true)
    setSuggestions([])
    // API-ready: replace with real AI call
    // const data = await aiService.suggest({ context: documentContext, type: activeType })
    await new Promise((r) => setTimeout(r, 1000))
    setSuggestions([]) // empty until API connected
    setIsLoading(false)
  }

  return (
    <div className={cn('flex flex-col border-t border-border/60 bg-card/20', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md gradient-bg-primary">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs font-semibold">AI Suggestions</span>
        </div>
        <button
          onClick={generate}
          disabled={isLoading}
          className="flex h-7 items-center gap-1 rounded-lg px-2 text-[10px] font-medium text-brand-400 hover:bg-brand-500/10 transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Generate
        </button>
      </div>

      {/* Type selector */}
      <div className="flex gap-1 px-3 py-2 border-b border-border/40">
        {SUGGESTION_TYPES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveType(id)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all',
              activeType === id
                ? 'bg-brand-500/15 text-brand-400'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Suggestions */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <AnimatePresence>
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex w-full items-center gap-2 rounded-lg p-2.5 text-left hover:bg-accent text-xs transition-colors group"
              >
                <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="flex-1">{s}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Sparkles className="h-6 w-6 text-muted-foreground/20 mb-2" />
            <p className="text-[10px] text-muted-foreground">
              {documentContext ? 'Click Generate for AI suggestions' : 'Start writing to get suggestions'}
            </p>
            {!documentContext && (
              <p className="text-[10px] text-muted-foreground/50 mt-1">Connect API to enable</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
