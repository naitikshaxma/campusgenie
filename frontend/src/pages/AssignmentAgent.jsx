import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Camera, ArrowLeft, ArrowRight, BookOpen, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UploadZone from '@/components/agent/UploadZone'
import OcrProcessor from '@/components/agent/OcrProcessor'
import ExtractionResult from '@/components/agent/ExtractionResult'
import { extractAssignment } from '@/services/ocr.service'
import { createAssignment } from '@/services/assignments.service'
import { usePlanner } from '@/hooks/usePlanner'

export default function AssignmentAgent() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'uploading' | 'processing' | 'success' | 'error'
  const [ocrStep, setOcrStep] = useState(0)
  const [extractedData, setExtractedData] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  const { add: addPlannerSession, generatePlan } = usePlanner()

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    startOcrWorkflow(selectedFile)
  }

  const startOcrWorkflow = async (selectedFile) => {
    setStatus('processing')
    setOcrStep(0)

    // Increment visual loading steps every 800ms
    const stepInterval = setInterval(() => {
      setOcrStep((prev) => (prev < 3 ? prev + 1 : prev))
    }, 800)

    try {
      // Call actual backend service
      const res = await extractAssignment(selectedFile)
      clearInterval(stepInterval)
      setOcrStep(3)
      setExtractedData(res)
      setStatus('success')
    } catch (err) {
      clearInterval(stepInterval)
      setStatus('error')
      console.error('[AssignmentAgent] OCR extraction error:', err)
    }
  }

  const handleCreateAssignment = async (editedData) => {
    setIsCreating(true)
    try {
      await createAssignment({
        ...editedData,
        status: 'todo', // Default to todo column
      })
      navigate('/assignments')
    } catch (err) {
      console.error('[AssignmentAgent] Create assignment failed:', err)
      alert('Failed to save assignment: ' + (err.message || err))
    } finally {
      setIsCreating(false)
    }
  }

  const handleGeneratePlan = async (editedData) => {
    setIsCreating(true)
    try {
      // Create the study planner recommendation
      await generatePlan({
        assignmentTitle: editedData.title,
        subject: editedData.subject,
        deadline: editedData.dueDate,
        difficulty: editedData.priority,
        availableHours: 2
      })
      navigate('/planner')
    } catch (err) {
      console.error('[AssignmentAgent] Study plan generation failed:', err)
      alert('Failed to generate study plan: ' + (err.message || err))
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
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* ── Top Header ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-400" />
            Assignment Agent
          </h1>
          <p className="text-xs text-muted-foreground">
            Snap a notice, worksheet, or notebook to automatically schedule assignments.
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
              <Camera className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <h3 className="text-sm font-semibold mb-1">Upload Homework Notice</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Take a picture of the whiteboard, select a screenshot from WhatsApp groups, or upload a notice PDF.
              </p>
            </div>

            <UploadZone
              onFileSelect={handleFileSelect}
              label="Select notice image or screenshot"
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
            <OcrProcessor currentStep={ocrStep} label="AI is reading your notice screenshot..." />
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
            <ExtractionResult
              data={extractedData}
              onCreateAssignment={handleCreateAssignment}
              onGeneratePlan={handleGeneratePlan}
              isCreating={isCreating}
            />

            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground">
                Clear & Upload Another
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
              <h3 className="text-sm font-semibold text-destructive">OCR Extraction Failed</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
                Could not read the uploaded image or communicate with the Gemini AI service. Please check your network and image quality, then try again.
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
