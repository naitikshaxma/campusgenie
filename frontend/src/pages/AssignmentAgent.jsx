import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Camera, ArrowLeft, Brain, CheckCircle, AlertCircle, FileSearch, HelpCircle, FileText, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UploadZone from '@/components/agent/UploadZone'
import ExtractionResult from '@/components/agent/ExtractionResult'
import { extractAssignment } from '@/services/ocr.service'
import { createAssignment } from '@/services/assignments.service'
import { usePlanner } from '@/hooks/usePlanner'
import { cn } from '@/lib/utils'
import { isDemoMode } from '@/lib/demoData'

const WORKFLOW_STEPS = [
  { label: 'Uploading image notice', key: 'upload' },
  { label: 'OCR scanning notice text', key: 'ocr' },
  { label: 'Detecting assignment title', key: 'title' },
  { label: 'Parsing calendar due date', key: 'date' },
  { label: 'Detecting course subject', key: 'subj' },
  { label: 'Estimating workload hours', key: 'workload' },
  { label: 'Generating study suggestions', key: 'suggestions' },
  { label: 'Ready for review & save', key: 'ready' }
]

export default function AssignmentAgent() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'processing' | 'success' | 'error'
  const [ocrStep, setOcrStep] = useState(0)
  const [extractedData, setExtractedData] = useState(null)
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

  const handleFileSelect = (selectedFile) => {
    // In demo mode, if we don't have a real file, just pass a dummy to trigger the flow
    if (!selectedFile && isDemoMode()) {
      setFile(new File([""], "demo-syllabus.jpg", { type: "image/jpeg" }))
    } else {
      setFile(selectedFile)
    }
    startOcrWorkflow(selectedFile || new File([""], "demo-syllabus.jpg", { type: "image/jpeg" }))
  }

  const startOcrWorkflow = async (selectedFile) => {
    setStatus('processing')
    setOcrStep(0)

    // Increment visual loading steps to simulate stages of Gemini parser
    const stepInterval = setInterval(() => {
      setOcrStep((prev) => (prev < 6 ? prev + 1 : prev))
    }, 600)

    try {
      let res;
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 4000)); // Cinematic delay
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        res = {
          title: "Operating Systems Memory Management Project",
          subject: "CS",
          dueDate: tomorrow.toISOString(),
          priority: "high",
          estimatedStudyHours: 4,
          description: "Implement paging and segmentation algorithms in C. Focus on LRU and FIFO page replacement.",
          confidence: 96
        };
      } else {
        res = await extractAssignment(selectedFile)
      }
      
      clearInterval(stepInterval)
      setOcrStep(7)

      // Merge API response — preserve all confidence/fieldErrors/rawText fields
      const enrichedData = {
        studySuggestions: 'Review key terms, complete basic exercises first, and budget focused 45-minute study intervals.',
        ...res,
      }

      setExtractedData(enrichedData)
      setStatus('success')

      // Surface field warnings in toast if any fields need review
      if (res.fieldErrors && Object.keys(res.fieldErrors).length > 0) {
        addToast('Some fields need manual review — see highlighted warnings.', 'warn')
      } else {
        addToast('Assignment structured successfully!')
      }
    } catch (err) {
      clearInterval(stepInterval)
      setStatus('error')
      addToast('OCR extraction failed. Try another image.', 'error')
      console.error('[AssignmentAgent] OCR extraction error:', err)
    }
  }

  const handleCreateAssignment = async (editedData) => {
    setIsCreating(true)
    try {
      await createAssignment({
        ...editedData,
        status: 'todo', // Default to todo column
        aiGenerated: true
      })
      addToast('Assignment created on Kanban board!', 'success')
      setTimeout(() => {
        navigate('/assignments')
      }, 1000)
    } catch (err) {
      console.error('[AssignmentAgent] Create assignment failed:', err)
      addToast('Failed to save assignment details.', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleGeneratePlan = async (editedData) => {
    setIsCreating(true)
    try {
      await generatePlan({
        assignmentTitle: editedData.title,
        subject: editedData.subject,
        deadline: editedData.dueDate,
        difficulty: editedData.priority,
        availableHours: editedData.estimatedStudyHours || 2
      })
      addToast('Study roadmap sessions built!', 'success')
      setTimeout(() => {
        navigate('/planner')
      }, 1000)
    } catch (err) {
      console.error('[AssignmentAgent] Study plan generation failed:', err)
      addToast('Failed to build study planner sessions.', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setStatus('idle')
    setOcrStep(0)
    setExtractedData(null)
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
          <h1 className="text-xl font-bold flex items-center gap-2 tracking-tight">
            <Sparkles className="h-5 w-5 text-brand-400 fill-brand-400/10" />
            AI Assignment Scanner
          </h1>
          <p className="text-xs text-muted-foreground">
            Convert assignment notice images, whiteboard snapshots, or class flyers into structured Kanban tasks instantly.
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
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Add an image notice or screenshot to let Gemini vision structure your assignments.
              </p>
            </div>

            <UploadZone
              onFileSelect={handleFileSelect}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              disabled={status === 'processing'}
              status={status}
              label="Upload syllabus or assignment"
            />

            <div className="pt-2 text-left space-y-1.5 border-t border-border/30 text-[10px] text-muted-foreground font-semibold">
              <p className="uppercase tracking-wider">Supported format details:</p>
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
                <h3 className="text-xs font-bold uppercase tracking-wider">Cognitive workflow status</h3>
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
                    Upload your class homework flyer. Once processed, the editable AI structured preview will display here in real-time.
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
                className="rounded-2xl border border-border bg-card/45 backdrop-blur-md p-10 text-center min-h-[400px] flex flex-col items-center justify-center space-y-6"
              >
                <div className="relative flex items-center justify-center h-20 w-20">
                  {/* Pulsing ring guides */}
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border border-brand-500/30"
                      animate={{ scale: [1, 1.4 + i * 0.15, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
                    />
                  ))}
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-cyan shadow-xl">
                    <Brain className="h-6 w-6 text-white animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">AI parsing in progress...</p>
                  <p className="text-xs text-muted-foreground">Gemini vision is analyzing image worksheets & deadlines</p>
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

            {status === 'error' && (
              <motion.div
                key="error-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-destructive/25 bg-destructive/10 p-8 text-center space-y-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive mx-auto">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-destructive">Notice Parse Failed</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Could not analyze the flyer screenshot or communicate with Gemini AI. Please check your file format and try again.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset} className="border-destructive/20 text-foreground">
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
