import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, BrainCircuit, Activity, Clock, Layers } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AIReasoningModal({ open, onOpenChange, reasoning, onAccept }) {
  // Try to parse the reasoning string into bullet points or paragraphs if it's long
  const paragraphs = reasoning 
    ? reasoning.split(/(?:\r?\n)+/).filter(p => p.trim() !== '')
    : ['Study plan generated successfully.']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#0B1020]/95 border border-brand-500/30 rounded-2xl shadow-[0_0_80px_-20px_rgba(139,92,246,0.25)] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground text-lg">
            <Sparkles className="h-5 w-5 text-brand-400" />
            AI Scheduling Logic
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-left py-2">
          
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="h-10 w-10 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-500/30 shrink-0">
              <BrainCircuit className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Cognitive Optimization</h4>
              <p className="text-[11px] text-muted-foreground leading-tight">
                CampusGenie analyzed your workload and applied spaced repetition principles to maximize retention.
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {paragraphs.map((p, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="p-3 rounded-xl bg-secondary/20 border border-border/40 text-xs text-muted-foreground/90 leading-relaxed"
              >
                {p}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            {[
              { icon: <Activity className="h-4 w-4" />, label: 'Fatigue Managed' },
              { icon: <Clock className="h-4 w-4" />, label: 'Focus Optimized' },
              { icon: <Layers className="h-4 w-4" />, label: 'Spaced Repetition' }
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-2 rounded-lg bg-card/50 border border-border/30 text-center gap-1.5">
                <div className="text-emerald-400/80">{feature.icon}</div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
          
        </div>

        <DialogFooter className="border-t border-border/50 pt-4">
          <Button 
            variant="gradient" 
            className="w-full h-10 text-sm font-bold rounded-xl cursor-pointer shadow-lg shadow-brand-500/20" 
            onClick={() => {
              onOpenChange(false)
              onAccept?.()
            }}
          >
            Construct Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
