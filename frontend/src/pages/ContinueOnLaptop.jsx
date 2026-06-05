import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Smartphone, ArrowRight, RefreshCw, CheckCircle2, ChevronRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSync } from '@/hooks/useSync'
import SyncIndicator from '@/components/common/SyncIndicator'

export default function ContinueOnLaptop() {
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
      }, 2500)
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8 px-4 sm:px-0">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <Monitor className="h-5 w-5 text-emerald-400" />
            Continue on Laptop
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
            Instantly sync your planner, notes, and assignments to a larger screen for deep focus work.
          </p>
        </div>
        <SyncIndicator />
      </div>

      {/* ── Dynamic panels ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="pairing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* Left: Instructions */}
            <div className="rounded-2xl border border-border/50 bg-card/40 p-6 flex flex-col justify-between space-y-8 backdrop-blur-xl shadow-lg">
              <div className="space-y-6">
                <div className="flex gap-4 items-start group">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Open CampusGenie on your laptop</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Go to <code className="bg-background border border-border/40 px-1.5 py-0.5 rounded text-[10px] text-emerald-400 font-mono">campusgenie.app</code> on your computer's browser.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start group">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Scan the secure QR code</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Point your phone camera at the screen to establish a secure end-to-end encrypted connection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/40">
                <Button 
                  variant="gradient" 
                  className="w-full h-12 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border-0" 
                  onClick={handleSimulateConnection} 
                  disabled={connecting}
                >
                  {connecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Establishing connection…
                    </>
                  ) : (
                    <>
                      Simulate Scan <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-muted-foreground font-semibold">
                  <Lock className="h-3 w-3" /> End-to-end encrypted
                </div>
              </div>
            </div>

            {/* Right: Simulated QR scanner */}
            <div className="rounded-2xl border border-border/50 bg-card/40 p-6 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden backdrop-blur-xl">
              {/* Particle Background */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />

              {/* Holographic QR Code mock */}
              <div className="relative h-48 w-48 rounded-2xl border-2 border-emerald-500/30 p-4 bg-background shadow-[0_0_50px_rgba(16,185,129,0.1)] flex items-center justify-center overflow-hidden">
                {/* Laser scan animation line */}
                <motion.div
                  className="absolute left-0 w-full h-[3px] bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,1)] z-10"
                  animate={{ top: ['-10%', '110%', '-10%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />

                {/* QR graphic */}
                <div className="grid grid-cols-4 gap-1.5 opacity-80 relative z-0 w-full h-full">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0.2 }}
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                      className={`rounded-sm ${
                        (i * 3 + 1) % 4 === 0 || i === 0 || i === 3 || i === 12 || i === 15
                          ? 'bg-foreground'
                          : 'bg-emerald-500/20 border border-emerald-500/30'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Corner reticles */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
              </div>

              <div>
                <p className="text-sm font-bold text-foreground">Waiting for scan...</p>
                <p className="text-[10px] font-semibold text-emerald-500/70 mt-1 uppercase tracking-widest">Active Sync Session</p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Connecting Transition state */
          <motion.div
            key="pairing-success"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="rounded-3xl border border-emerald-500/30 bg-card p-8 md:p-12 text-center space-y-6 max-w-sm mx-auto shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden flex flex-col items-center justify-center"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
            
            <div className="relative flex items-center justify-center mx-auto h-24 w-24">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald-400"
                animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-teal-400"
                animate={{ scale: [1, 1.2, 1.8], opacity: [0.8, 0.4, 0] }}
                transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, ease: "easeOut" }}
              />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-md z-10">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <h3 className="text-xl font-black text-emerald-400 tracking-tight">Devices Synced!</h3>
              <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                Your mobile session is securely connected. Transitioning to Laptop Workspace...
              </p>
            </div>

            {/* Laptop UI Mockup Graphic */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              className="mt-6 w-full max-w-[240px] aspect-[16/10] bg-secondary/30 rounded-t-xl border-t border-x border-border/40 relative overflow-hidden flex flex-col mx-auto"
            >
              {/* Laptop Screen Bar */}
              <div className="w-full h-2 bg-secondary/80 border-b border-border/30 flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
              </div>
              {/* Mock App Layout inside Laptop */}
              <div className="flex-1 p-2 flex gap-2">
                <div className="w-1/4 h-full bg-secondary/40 rounded border border-border/20" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="w-full h-1/3 bg-emerald-500/10 rounded border border-emerald-500/20" />
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="h-full bg-secondary/40 rounded border border-border/20" />
                    <div className="h-full bg-secondary/40 rounded border border-border/20" />
                  </div>
                </div>
              </div>
              {/* Laptop Base Glow */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
