import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Laptop, Smartphone, ArrowRight, RefreshCw, CheckCircle2, Monitor, Wifi, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSync } from '@/hooks/useSync'
import SyncIndicator from '@/components/common/SyncIndicator'

export default function OfficeKit() {
  const navigate = useNavigate()
  const [connecting, setConnecting] = useState(false)
  const [step, setStep] = useState(1) // 1: QR & Instruction, 2: Connected transition
  const { deviceConnected, connectDevice, syncStatus } = useSync()

  const handleSimulateConnection = () => {
    setConnecting(true)
    setTimeout(() => {
      connectDevice()
      setStep(2)
      setConnecting(false)
      // Automatically redirect to Laptop Workspace as if the user just paired their browser tab
      setTimeout(() => {
        navigate('/workspace')
      }, 1500)
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Monitor className="h-5 w-5 text-brand-400" />
            OfficeKit Handoff
          </h1>
          <p className="text-xs text-muted-foreground">
            Pair your phone to continue writing notes and solving homework assignments on a larger screen.
          </p>
        </div>
        <SyncIndicator />
      </div>

      {/* ── Dynamic panels ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="pairing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* Left: Instructions */}
            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/10 text-xs font-semibold text-brand-400">
                    1
                  </span>
                  <span className="text-sm font-semibold">Open CampusGenie on Laptop</span>
                </div>
                <p className="text-xs text-muted-foreground pl-8 leading-relaxed">
                  Navigate to <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">campusgenie.app</code> or bookmark on your desktop.
                </p>

                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/10 text-xs font-semibold text-brand-400">
                    2
                  </span>
                  <span className="text-sm font-semibold">Scan connection key</span>
                </div>
                <p className="text-xs text-muted-foreground pl-8 leading-relaxed">
                  Hold your phone camera up to the QR code, or paste your secure workspace key to pair.
                </p>
              </div>

              <div className="pt-4 border-t border-border/40">
                <Button variant="gradient" className="w-full" onClick={handleSimulateConnection} disabled={connecting}>
                  {connecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> Pairing devices…
                    </>
                  ) : (
                    <>
                      Pair Laptop Workspace <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right: Simulated QR scanner */}
            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-brand-500/[0.02] pointer-events-none" />

              {/* Holographic QR Code mock */}
              <div className="relative h-44 w-44 rounded-xl border border-border p-3 bg-card/60 backdrop-blur-md flex items-center justify-center">
                {/* Laser scan animation line */}
                <motion.div
                  className="absolute left-0 w-full h-[2px] bg-brand-400 shadow-[0_0_8px_rgba(108,71,238,0.8)]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* QR graphic */}
                <div className="grid grid-cols-4 gap-1 opacity-70">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-7 w-7 rounded-sm ${
                        (i * 3 + 1) % 4 === 0 || i === 0 || i === 3 || i === 12 || i === 15
                          ? 'bg-foreground'
                          : 'bg-transparent border border-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold">Scan Secure QR Code</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Refreshes every 60 seconds</p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Connecting Transition state */
          <motion.div
            key="pairing-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-emerald-500/20 bg-card p-12 text-center space-y-5"
          >
            <div className="relative flex items-center justify-center mx-auto h-20 w-20">
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-full border border-emerald-500/30"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-emerald-400">Connection Established!</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your deep focus Laptop Workspace is loading...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
