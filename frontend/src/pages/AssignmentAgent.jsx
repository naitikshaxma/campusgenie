import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Camera, ArrowLeft, Brain, CheckCircle, AlertCircle, FileSearch, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UploadZone from '@/components/agent/UploadZone'
import ExtractionResult from '@/components/agent/ExtractionResult'
import { extractAssignment } from '@/services/ocr.service'
import { createAssignment } from '@/services/assignments.service'
import { usePlanner } from '@/hooks/usePlanner'
import { cn } from '@/lib/utils'

const WORKFLOW_STEPS = [
  { label: 'Uploading image source', key: 'upload' },
  { label: 'Analyzing layout (Vision)', key: 'ocr' },
  { label: 'Structuring assignment JSON', key: 'structure' },
  { label: 'Saving to Kanban board', key: 'save' }
]

export default function AssignmentAgent() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'processing' | 'success' | 'error'
  const [ocrStep, setOcrStep] = useState(0)
  const [extractedData, setExtractedData] = useState(null)
  const [ocrError, setOcrError] = useState(null) // { category, detail }
  const [isCreating, setIsCreating] = useState(false)
  const [toasts, setToasts] = useState([])

  const { generatePlan } = usePlanner()

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return
    setFile(selectedFile)
    
    // Revoke old url if any
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(URL.createObjectURL(selectedFile))
    startOcrWorkflow(selectedFile)
  }

  const startOcrWorkflow = async (selectedFile) => {
    setStatus('processing')
    setOcrStep(0) // Stage 0: Uploading image
    setOcrError(null)

    // Simulate progress transition from uploading to OCR scanning
    const step1Timeout = setTimeout(() => {
      setOcrStep(1) // Stage 1: Analyzing layout (Vision)
    }, 700)

    const step2Timeout = setTimeout(() => {
      setOcrStep(2) // Stage 2: Structuring JSON
    }, 1800)

    try {
      const res = await extractAssignment(selectedFile)
      
      clearTimeout(step1Timeout)
      clearTimeout(step2Timeout)
      setOcrStep(2)

      // Defensive API checks
      if (!res || res.success === false) {
        throw new Error(res?.message || 'Gemini Vision could not parse the document structure.')
      }

      setExtractedData(res)
      setStatus('success')
      addToast('Assignment structured successfully!')
    } catch (err) {
      clearTimeout(step1Timeout)
      clearTimeout(step2Timeout)
      setStatus('error')

      const msg = err.message || ''
      let category = 'Could not extract assignment'
      let detail = msg || 'Verify that the document contains legible tasks and deadlines.'

      if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('taking too long') || msg.includes('ECONNABORTED')) {
        category = 'Gemini timeout'
        detail = 'The request timed out. This may happen on Render backend cold starts or during peak Google API latency. Please try again.'
      } else if (msg.includes('file type') || msg.includes('mimetype') || msg.includes('format') || msg.includes('type')) {
        category = 'Unsupported image'
        detail = 'Invalid file type. Only PNG, JPG, JPEG, and WebP images up to 5MB are supported by the Gemini Vision engine.'
      } else if (msg.includes('upload') || msg.includes('network') || msg.includes('establish') || msg.includes('reach')) {
        category = 'Upload failed'
        detail = 'Could not upload the image to the server. Please check your internet connection and try again.'
      }

      setOcrError({ category, detail })
      addToast(category, 'error')
      console.error('[AssignmentAgent] OCR extraction error:', err)
    }
  }

  const handleCreateAssignment = async (editedData) => {
    setIsCreating(true)
    setOcrStep(3) // Stage 3: Saving to workspace
    try {
      // Safe trim title checks
      const finalTitle = (editedData?.title || '').trim() || 'Untitled Assignment'
      await createAssignment({
        ...editedData,
        title: finalTitle,
        status: 'todo', // Default to todo column
        aiGenerated: true
      })
      addToast('Assignment saved to Kanban board!', 'success')
      setTimeout(() => {
        navigate('/assignments')
      }, 1000)
    } catch (err) {
      console.error('[AssignmentAgent] Create assignment failed:', err)
      addToast('Failed to save assignment details.', 'error')
      setOcrStep(2) // Revert back to structuring stage on error
    } finally {
      setIsCreating(false)
    }
  }

  const handleGeneratePlan = async (editedData) => {
    setIsCreating(true)
    setOcrStep(3) // Stage 3: Saving to workspace
    try {
      const finalTitle = (editedData?.title || '').trim() || 'Untitled Assignment'
      await generatePlan({
        assignmentTitle: finalTitle,
        subject: editedData?.subject || 'CS',
        deadline: editedData?.dueDate,
        difficulty: editedData?.priority || 'medium',
        availableHours: editedData?.estimatedStudyHours || editedData?.estimatedHours || 2
      })
      addToast('Study roadmap sessions built!', 'success')
      setTimeout(() => {
        navigate('/planner')
      }, 1000)
    } catch (err) {
      console.error('[AssignmentAgent] Study plan generation failed:', err)
      addToast('Failed to build study planner sessions.', 'error')
      setOcrStep(2) // Revert back to structuring stage on error
    } finally {
      setIsCreating(false)
    }
  }

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFile(null)
    setPreviewUrl(null)
    setStatus('idle')
    setOcrStep(0)
    setExtractedData(null)
    setOcrError(null)
  }

  return (
    <div className="space-y-6 pb-8 relative">
      {/* ── Toast notifications overlay ─────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={cn(
                'pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl border backdrop-blur-xl',
                t.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
                  : t.type === 'warn'
                  ? 'bg-amber-500/10 border-amber-500/35 text-amber-400'
                  : 'bg-rose-500/10 border-rose-500/35 text-rose-400'
              )}
            >
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 tracking-tight text-white">
            <Sparkles className="h-5 w-5 text-brand-400 fill-brand-400/10" />
            AI Assignment Scanner
          </h1>
          <p className="text-xs text-muted-foreground">
            Convert assignment notice images, whiteboard snapshots, or class flyers into structured academic workflows instantly.
          </p>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload and Status logs (Span 5) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-md p-6 space-y-5 relative overflow-hidden">
            {/* Visual background gradient pulse */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="text-left space-y-1">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <FileSearch className="h-4 w-4 text-brand-400" />
                Upload homework source
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add an image notice or take a photo to let Gemini Vision OCR structure your assignments.
              </p>
            </div>

            <UploadZone
              onFileSelect={handleFileSelect}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              disabled={status === 'processing'}
              status={status}
              label="Upload syllabus or assignment"
            />

            {/* Mobile-first Quick Snap CTA */}
            <div className="flex justify-center gap-3 pt-1">
              <label className="w-full flex items-center justify-center gap-2 text-xs font-semibold px-4 py-3 rounded-xl border border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/10 text-brand-300 cursor-pointer transition-all select-none active:scale-[0.98]">
                <Camera className="h-4.5 w-4.5 text-brand-400" />
                <span>Snap Homework Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0]
                    if (selected) handleFileSelect(selected)
                  }}
                  disabled={status === 'processing'}
                />
              </label>
            </div>

            <div className="pt-2 text-left space-y-1.5 border-t border-border/30 text-[10px] text-muted-foreground font-semibold">
              <p className="uppercase tracking-wider">Supported formats:</p>
              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground/80 font-normal">
                <li>Accepts PNG, JPG, JPEG, and WebP images</li>
                <li>Size limit up to 5MB per upload</li>
                <li>Ensure texts are legible with clear lighting</li>
              </ul>
            </div>
          </div>

          {/* AI Workflow steps card shown during processing or success */}
          {(status === 'processing' || status === 'success') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card/45 backdrop-blur-md p-5 space-y-4 text-left"
            >
              <div className="flex items-center gap-2 border-b border-border/30 pb-3">
                <Brain className={cn(
                  'h-5 w-5 text-brand-400',
                  status === 'processing' && 'animate-pulse'
                )} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Cognitive workflow status</h3>
              </div>

              <div className="space-y-2.5">
                {WORKFLOW_STEPS.map((step, idx) => {
                  const isActive = idx === ocrStep
                  const isCompleted = idx < ocrStep
                  return (
                    <div
                      key={step.key}
                      className={cn(
                        'flex items-center gap-2.5 text-xs transition-colors duration-200',
                        isActive ? 'text-brand-400 font-semibold' :
                        isCompleted ? 'text-emerald-400' : 'text-muted-foreground/45'
                      )}
                    >
                      <div className={cn(
                        'h-4 w-4 rounded-full border flex items-center justify-center shrink-0',
                        isCompleted ? 'border-emerald-500/40 bg-emerald-500/10' :
                        isActive ? 'border-brand-500/40 bg-brand-500/10' : 'border-border/60'
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="h-3 w-3 fill-emerald-500/10" />
                        ) : isActive ? (
                          <div className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-ping" />
                        ) : (
                          <span className="text-[8px] font-bold font-mono">{idx + 1}</span>
                        )}
                      </div>
                      <span className="truncate">{step.label}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Live Structured Details (Span 7) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                key="idle-placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-border/60 bg-card/10 backdrop-blur-sm p-10 text-center min-h-[400px] flex flex-col items-center justify-center space-y-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="max-w-xs space-y-2">
                  <h3 className="text-sm font-bold text-foreground">Awaiting notice scan...</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Upload your class homework snapshot. Once processed, the editable AI structured preview will display here in real-time.
                  </p>
                </div>
              </motion.div>
            )}

            {status === 'processing' && (
              <motion.div
                key="processing-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-border bg-[#080C18]/60 backdrop-blur-2xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center space-y-6 relative overflow-hidden"
              >
                {/* Visual scanner laser overlay */}
                {previewUrl && (
                  <div className="relative w-48 h-48 rounded-2xl border border-white/10 overflow-hidden shadow-2xl mx-auto">
                    <img src={previewUrl} alt="Scanning preview" className="w-full h-full object-cover opacity-60" />
                    
                    {/* Laser line animation */}
                    <motion.div
                      animate={{ top: ['0%', '98%', '0%'] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_12px_rgba(139,92,246,0.95)] z-10"
                    />
                  </div>
                )}

                <div className="relative flex items-center justify-center h-16 w-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border border-brand-500/20 animate-ping" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400">
                    <Brain className="h-5 w-5 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2 max-w-xs mx-auto">
                  <p className="text-sm font-bold text-white tracking-wide uppercase">
                    {ocrStep === 0 ? 'Analyzing assignment...' :
                     ocrStep === 1 ? 'Extracting deadlines...' :
                     ocrStep === 2 ? 'Structuring tasks...' : 'AI scanning...'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    CampusGenie Gemini 1.5 Flash is mapping tasks, workloads, and study plans from your image flyer.
                  </p>
                </div>
              </motion.div>
            )}

            {status === 'success' && extractedData && (
              <motion.div
                key="success-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ExtractionResult
                  data={extractedData}
                  onCreateAssignment={handleCreateAssignment}
                  onGeneratePlan={handleGeneratePlan}
                  isCreating={isCreating}
                />

                <div className="flex justify-center mt-4">
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground">
                    Clear & Upload Another
                  </Button>
                </div>
              </motion.div>
            )}

            {status === 'error' && ocrError && (
              <motion.div
                key="error-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl border border-rose-500/20 bg-rose-950/10 backdrop-blur-xl p-8 text-center space-y-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto">
                  <AlertCircle className="h-6 w-6" />
                </div>
                
                <div className="space-y-2 max-w-sm mx-auto">
                  <h3 className="text-base font-bold text-white tracking-wide uppercase">{ocrError.category}</h3>
                  <p className="text-xs text-rose-300/80 leading-relaxed">
                    {ocrError.detail}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
                  <Button variant="outline" size="sm" onClick={handleReset} className="border-rose-500/20 hover:bg-rose-500/10 text-rose-300">
                    Try Again
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/assignments')} className="text-muted-foreground hover:text-white">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
