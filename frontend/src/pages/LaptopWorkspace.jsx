import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Monitor, Laptop, Wifi, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DocumentEditor from '@/components/workspace/DocumentEditor'
import ResearchSidebar from '@/components/workspace/ResearchSidebar'
import AiSuggestionsPanel from '@/components/workspace/AiSuggestionsPanel'
import { useSync } from '@/hooks/useSync'

export default function LaptopWorkspace() {
  const navigate = useNavigate()
  const { isSyncing, lastSyncedAt, disconnectDevice } = useSync()
  const [isSaving, setIsSaving] = useState(false)
  const [doc, setDoc] = useState({
    title: 'Quantum Electrodynamics Thesis Notes',
    content: `# Quantum Electrodynamics (QED)

Quantum electrodynamics is the relativistic quantum field theory of electrodynamics. In essence, it describes how light and matter interact and is the first theory where full agreement between quantum mechanics and special relativity is achieved.

## Fundamental Interactions
QED mathematically describes all phenomena involving electrically charged particles interacting by means of exchange of photons.

- **Electron propagation:** e⁻ → e⁻
- **Photon propagation:** γ → γ
- **Vertex interaction:** e⁻ emission or absorption of a photon

## Dirac Equation
The equation is given by:
(iγ^μ ∂_μ - m)ψ = 0

Where γ^μ are the Dirac matrices.`,
  })

  const handleSave = async (updatedDoc) => {
    setIsSaving(true)
    setDoc(updatedDoc)
    // Simulate API saving
    await new Promise((r) => setTimeout(r, 1200))
    setIsSaving(false)
  }

  const handleDisconnect = () => {
    disconnectDevice()
    navigate('/office')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] border border-border/60 bg-background rounded-2xl overflow-hidden shadow-2xl">
      {/* ── Top Synced Context Bar ──────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleDisconnect} className="rounded-full h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Laptop className="h-4.5 w-4.5 text-brand-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Laptop Active Session</span>
          </div>
        </div>

        {/* Sync information */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
            <Wifi className="h-3 w-3 animate-pulse" />
            Synced to Phone
          </div>
          <span className="text-muted-foreground">
            {isSyncing ? 'Syncing...' : lastSyncedAt ? `Saved ${new Date(lastSyncedAt).toLocaleTimeString()}` : 'Sync idle'}
          </span>
          <Button variant="outline" size="sm" onClick={handleDisconnect} className="h-7 text-xs border-rose-500/20 text-rose-400 hover:bg-rose-500/5">
            Disconnect
          </Button>
        </div>
      </div>

      {/* ── Main workspace layout ────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Interactive document writer */}
        <div className="flex-1 overflow-y-auto">
          <DocumentEditor
            document={doc}
            onSave={handleSave}
            isSaving={isSaving}
            className="h-full"
          />
        </div>

        {/* Right panels: Research and Suggestions */}
        <div className="flex flex-col w-72 border-l border-border bg-card/30 shrink-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <ResearchSidebar assignmentContext={doc.title} />
          </div>
          <div className="h-64 border-t border-border shrink-0 overflow-y-auto">
            <AiSuggestionsPanel documentContext={doc.content} />
          </div>
        </div>
      </div>
    </div>
  )
}
