import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Megaphone, Calendar, MapPin, Building, Sparkles, Check, Bell, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UploadZone from '@/components/agent/UploadZone'
import OcrProcessor from '@/components/agent/OcrProcessor'
import { extractNotice } from '@/services/ocr.service'
import { usePlanner } from '@/hooks/usePlanner'

export default function NoticeScanner() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'processing' | 'success' | 'error'
  const [ocrStep, setOcrStep] = useState(0)
  const [extractedData, setExtractedData] = useState(null)
  const [formData, setFormData] = useState({ event: '', venue: '', date: '', registrationDeadline: '', description: '' })
  const [saved, setSaved] = useState(false)

  const { add: addPlannerSession } = usePlanner()

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    startNoticeWorkflow(selectedFile)
  }

  const startNoticeWorkflow = async (selectedFile) => {
    setStatus('processing')
    setOcrStep(0)

    // Increment visual loading steps every 800ms
    const stepInterval = setInterval(() => {
      setOcrStep((prev) => (prev < 3 ? prev + 1 : prev))
    }, 800)

    try {
      const res = await extractNotice(selectedFile)
      clearInterval(stepInterval)
      setOcrStep(3)
      setExtractedData(res)
      setFormData({
        event: res.event || '',
        venue: res.venue || '',
        date: res.date || '',
        registrationDeadline: res.registrationDeadline || '',
        description: res.description || ''
      })
      setStatus('success')
    } catch (err) {
      clearInterval(stepInterval)
      setStatus('error')
      console.error('[NoticeScanner] OCR notice extraction error:', err)
    }
  }

  const handleAction = async (type) => {
    setSaved(true)
    try {
      if (type === 'calendar') {
        // Sync notice event directly to study planner calendar
        await addPlannerSession({
          subject: 'Event',
          topic: formData.event,
          duration: 1.5,
          date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
          notes: `Venue: ${formData.venue}. Description: ${formData.description}. Deadline: ${formData.registrationDeadline || 'None'}`
        })
      }
      setTimeout(() => {
        setSaved(false)
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      console.error('[NoticeScanner] Failed to save notice action:', err)
      alert('Failed to execute calendar action: ' + (err.message || err))
      setSaved(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setStatus('idle')
    setOcrStep(0)
    setExtractedData(null)
    setFormData({ event: '', venue: '', date: '', registrationDeadline: '', description: '' })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* ── Top Header ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-brand-400" />
            Campus Notice Scanner
          </h1>
          <p className="text-xs text-muted-foreground">
            Convert event flyers, newsletters, and bulletin boards into calendar events instantly.
          </p>
        </div>
      </div>

      {/* ── Main workflow card ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-border bg-card p-6 space-y-5"
          >
            <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/60 rounded-xl bg-muted/10">
              <Megaphone className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <h3 className="text-sm font-semibold mb-1">Scan Notice Board Flyer</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Take a quick photo of physical poster boards in hallways, or drag in notice screenshots.
              </p>
            </div>

            <UploadZone
              onFileSelect={handleFileSelect}
              label="Select announcement flyer"
            />
          </motion.div>
        )}

        {status === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <OcrProcessor currentStep={ocrStep} label="AI is parsing notice flyer details..." />
          </motion.div>
        )}

        {status === 'success' && extractedData && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Extracted notice details */}
            <div className="rounded-2xl border border-brand-500/20 bg-card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-brand-500/5 border-b border-brand-500/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15">
                  <Sparkles className="h-4 w-4 text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-400">Notice announcement structured</p>
                  <p className="text-[10px] text-muted-foreground">Ready to synchronize to calendar & alerts</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Event Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Event Announcement</label>
                  <Input
                    value={formData.event}
                    onChange={(e) => setFormData((p) => ({ ...p, event: e.target.value }))}
                    className="bg-background font-semibold"
                  />
                </div>
 
                {/* Info Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Event Date
                    </label>
                    <Input
                      type="date"
                      value={formData.date ? formData.date.split('T')[0] : ''}
                      onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                      className="bg-background text-xs"
                    />
                  </div>
 
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Venue
                    </label>
                    <Input
                      value={formData.venue}
                      onChange={(e) => setFormData((p) => ({ ...p, venue: e.target.value }))}
                      className="bg-background text-xs"
                    />
                  </div>
                </div>
 
                {/* Registration Deadline */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Registration Deadline
                  </label>
                  <Input
                    type="date"
                    value={formData.registrationDeadline ? formData.registrationDeadline.split('T')[0] : ''}
                    onChange={(e) => setFormData((p) => ({ ...p, registrationDeadline: e.target.value }))}
                    className="bg-background text-xs"
                  />
                </div>
 
                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Description Details</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
 
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 px-5 pb-5">
                <Button variant="gradient" className="flex-1" onClick={() => handleAction('calendar')}>
                  {saved ? (
                    <><Check className="h-4 w-4 mr-1" /> Added to Calendar</>
                  ) : (
                    <><Calendar className="h-4 w-4 mr-1" /> Add to Calendar</>
                  )}
                </Button>
                <Button variant="outline" className="flex-1 border-brand-500/20 text-foreground hover:bg-brand-500/5" onClick={() => handleAction('reminder')}>
                  <Bell className="h-4 w-4 mr-1 text-muted-foreground" />
                  Set Push Alert
                </Button>
              </div>
            </div>
 
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground">
                Reset notice board scanner
              </Button>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center space-y-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-destructive">Notice Scan Failed</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
                Could not read the uploaded poster image or communicate with the Gemini AI service. Please check your network and image quality, then try again.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
