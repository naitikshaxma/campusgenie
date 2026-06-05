import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, BookOpen, Calendar, AlertTriangle, Sparkles,
  Plus, Loader2, Clock, Lightbulb, ChevronDown, ChevronUp,
  FileText, Shield, AlertCircle, ThumbsUp, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// ── Helpers ──────────────────────────────────────────────────────────────────

function ConfidenceBadge({ score, label }) {
  const pct = Math.round((score || 0) * 100)
  const color =
    pct >= 85 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
    : pct >= 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/25'
    : 'text-rose-400 bg-rose-500/10 border-rose-500/25'

  return (
    <span className={cn('inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border', color)}>
      <Shield className="h-2 w-2" />
      {pct}%{label ? ` ${label}` : ''}
    </span>
  )
}

function FieldWarning({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-1.5 mt-1 px-2 py-1.5 rounded-lg bg-amber-500/8 border border-amber-500/20">
      <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
      <span className="text-[10px] text-amber-400 leading-relaxed">{message}</span>
    </div>
  )
}

function SourceTag({ source }) {
  if (!source) return null
  const map = {
    regex:         { label: 'Regex extracted', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    deterministic: { label: 'Calculated', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    fallback:      { label: 'Needs review', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  }
  const { label, color } = map[source] || map.fallback
  return (
    <span className={cn('inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border', color)}>
      <Zap className="h-2 w-2" />
      {label}
    </span>
  )
}

// ── Known academic subjects ───────────────────────────────────────────────────
const KNOWN_SUBJECTS = [
  'Database Management System',
  'Data Structures & Algorithms',
  'Operating Systems',
  'Computer Networks',
  'Software Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'English',
  'History',
  'Computer Science',
  'Biology',
  'Economics',
  'Electronics',
  'Machine Learning',
  'Artificial Intelligence',
]

const PRIORITIES = ['low', 'medium', 'high']
const PRIORITY_STYLES = {
  high:   'bg-rose-500/20 border-rose-500/30 text-rose-400',
  medium: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  low:    'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ExtractionResult({ data, onCreateAssignment, onGeneratePlan, isCreating }) {
  const [edited, setEdited] = useState(buildDefaults(data))
  const [rawExpanded, setRawExpanded] = useState(false)
  const [subjectMode, setSubjectMode] = useState('select') // 'select' | 'text'

  useEffect(() => {
    setEdited(buildDefaults(data))
    // Auto-switch to free-text subject if the extracted value isn't in our list
    if (data?.subject && !KNOWN_SUBJECTS.includes(data.subject)) {
      setSubjectMode('text')
    }
  }, [data])

  function buildDefaults(d = {}) {
    return {
      title:               '',
      subject:             'Computer Science',
      description:         '',
      dueDate:             '',
      priority:            'medium',
      estimatedStudyHours: 2.5,
      confidence:          0.88,
      studySuggestions:    'Review class notes and practice past problems.',
      ...d,
    }
  }

  const update = (field, value) => setEdited(p => ({ ...p, [field]: value }))

  // Per-field data
  const fe       = data?.fieldErrors    || {}
  const fs       = data?.fieldSources   || {}
  const titleC   = data?.titleConfidence    ?? 0.88
  const subjectC = data?.subjectConfidence  ?? 0.88
  const dateC    = data?.dueDateConfidence  ?? 0.88

  // Overall confidence badge
  const overallPct   = Math.round((edited.confidence || 0.88) * 100)
  const overallColor =
    overallPct >= 85 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : overallPct >= 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-rose-400 bg-rose-500/10 border-rose-500/20'

  const hasWarnings = Object.keys(fe).length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-brand-500/20 bg-card overflow-hidden shadow-2xl relative"
    >
      {/* Decorative orb */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 bg-brand-500/5 border-b border-border/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15 border border-brand-500/20">
            <Sparkles className="h-4 w-4 text-brand-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-400">AI Extraction Review</p>
            <p className="text-[10px] text-muted-foreground">Verify fields before saving to Kanban</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasWarnings && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-2.5 w-2.5" />
              {Object.keys(fe).length} field{Object.keys(fe).length > 1 ? 's' : ''} need review
            </span>
          )}
          <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', overallColor)}>
            <ThumbsUp className="h-2.5 w-2.5" />
            {overallPct}% Match
          </span>
        </div>
      </div>

      {/* ── Fields ── */}
      <motion.div 
        className="p-5 space-y-4 text-left"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >

        {/* Title */}
        <motion.div variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
              Assignment Title
            </label>
            <div className="flex items-center gap-1.5">
              <SourceTag source={fs.title} />
              <ConfidenceBadge score={titleC} />
            </div>
          </div>
          <Input
            value={edited.title}
            onChange={e => update('title', e.target.value)}
            className="text-xs bg-secondary/15 border-border/60 focus:border-brand-500/50"
            placeholder="e.g. Database Management System - Assignment 2"
          />
          <FieldWarning message={fe.title} />
        </motion.div>

        {/* Subject + Priority row */}
        <motion.div variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Subject */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-brand-400" /> Subject
              </label>
              <div className="flex items-center gap-1.5">
                <SourceTag source={fs.subject} />
                <ConfidenceBadge score={subjectC} />
              </div>
            </div>

            {subjectMode === 'select' ? (
              <div className="flex gap-1">
                <select
                  value={KNOWN_SUBJECTS.includes(edited.subject) ? edited.subject : ''}
                  onChange={e => update('subject', e.target.value)}
                  className="flex-1 rounded-lg border border-border/60 bg-secondary/15 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-foreground"
                >
                  <option value="">-- Select subject --</option>
                  {KNOWN_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setSubjectMode('text')}
                  className="text-[10px] px-2 rounded-lg border border-border/60 bg-secondary/10 text-muted-foreground hover:text-foreground transition-colors"
                  title="Type a custom subject"
                >
                  Other
                </button>
              </div>
            ) : (
              <div className="flex gap-1">
                <Input
                  value={edited.subject}
                  onChange={e => update('subject', e.target.value)}
                  className="flex-1 text-xs bg-secondary/15 border-border/60 focus:border-brand-500/50"
                  placeholder="e.g. Database Management System"
                />
                <button
                  type="button"
                  onClick={() => setSubjectMode('select')}
                  className="text-[10px] px-2 rounded-lg border border-border/60 bg-secondary/10 text-muted-foreground hover:text-foreground transition-colors"
                  title="Pick from list"
                >
                  List
                </button>
              </div>
            )}
            <FieldWarning message={fe.subject} />
          </div>

          {/* Priority — read-only (deterministically calculated) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-brand-400" /> Priority
              </label>
              <SourceTag source="deterministic" />
            </div>
            <div className="flex gap-1">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => update('priority', p)}
                  className={cn(
                    'flex-1 text-[10px] font-bold py-1.5 rounded-lg border capitalize transition-all',
                    edited.priority === p
                      ? PRIORITY_STYLES[p]
                      : 'border-border/60 text-muted-foreground bg-secondary/10 hover:bg-secondary/20',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-muted-foreground/60">
              Expected workload based on priority.
            </p>
          </div>
        </motion.div>

        {/* Due Date + Study Hours row */}
        <motion.div variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Calendar className="h-3 w-3 text-brand-400" /> Due Date
              </label>
              <div className="flex items-center gap-1.5">
                <SourceTag source={fs.dueDate} />
                <ConfidenceBadge score={dateC} />
              </div>
            </div>
            <Input
              type="date"
              value={edited.dueDate || ''}
              onChange={e => update('dueDate', e.target.value)}
              className="text-xs bg-secondary/15 border-border/60 focus:border-brand-500/50"
            />
            <FieldWarning message={fe.dueDate} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Clock className="h-3 w-3 text-brand-400" /> Study Hours (AI estimate)
            </label>
            <Input
              type="number"
              step="0.5"
              min="0.5"
              max="20"
              value={edited.estimatedStudyHours || 2.5}
              onChange={e => update('estimatedStudyHours', parseFloat(e.target.value) || 1)}
              className="text-xs bg-secondary/15 border-border/60 focus:border-brand-500/50"
            />
          </div>
        </motion.div>

        {/* Description */}
        <motion.div variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }} className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
            Context / Description
          </label>
          <textarea
            value={edited.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Add assignment specifics, chapters, or scanned worksheet tasks…"
            rows={3}
            className="flex w-full rounded-lg border border-border/60 bg-secondary/15 px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground resize-none"
          />
        </div>

        {/* AI Study Suggestions */}
        <div className="space-y-1.5 p-3.5 rounded-xl border border-brand-500/10 bg-brand-500/5 relative">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-brand-400 uppercase tracking-wide flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-brand-400 fill-brand-400/20" />
              AI Study Guide
            </label>
            <ConfidenceBadge score={data?.aiSuggestionConfidence ?? 0.80} label="AI" />
          </div>
          <textarea
            value={edited.studySuggestions}
            onChange={e => update('studySuggestions', e.target.value)}
            className="w-full bg-transparent resize-none border-none p-0 text-[11px] leading-relaxed text-brand-300 focus:outline-none min-h-[46px]"
          />
        </div>

        {/* Raw OCR text — collapsible */}
        {data?.rawText && (
          <div className="rounded-xl border border-border/40 overflow-hidden">
            <button
              type="button"
              onClick={() => setRawExpanded(p => !p)}
              className="w-full flex items-center justify-between px-3 py-2 bg-secondary/10 hover:bg-secondary/20 transition-colors text-left"
            >
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <FileText className="h-3 w-3" />
                Raw OCR transcript
              </span>
              {rawExpanded
                ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {rawExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <pre className="px-3 py-2.5 text-[10px] text-muted-foreground/80 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto bg-secondary/5 max-h-48 overflow-y-auto">
                    {data.rawText}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col gap-3 px-5 pb-5 border-t border-border/30 pt-4 bg-secondary/10">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="gradient"
            className="flex-1 font-semibold h-11 sm:h-9 shadow-[0_4px_20px_rgba(139,92,246,0.3)] text-sm sm:text-xs rounded-xl"
            onClick={() => onCreateAssignment(edited)}
            disabled={!edited.title || isCreating}
          >
            {isCreating ? (
              <Loader2 className="h-5 w-5 sm:h-4 sm:w-4 animate-spin mr-2 sm:mr-1.5" />
            ) : (
              <><Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2 sm:mr-1.5" /> Save Assignment</>
            )}
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-brand-500/30 text-brand-400 hover:bg-brand-500/10 font-semibold h-11 sm:h-9 text-sm sm:text-xs rounded-xl"
            onClick={() => onGeneratePlan(edited)}
            disabled={isCreating}
          >
            <Sparkles className="h-5 w-5 sm:h-4 sm:w-4 mr-2 sm:mr-1.5" />
            Build AI Plan
          </Button>
        </div>
        
        {/* Mobile Handoff button */}
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground h-11 text-sm rounded-xl mt-2 md:hidden bg-secondary/20"
          onClick={() => window.location.href = '/handoff'}
          disabled={isCreating}
        >
          Continue on Laptop →
        </Button>
      </div>
    </motion.div>
  )
}
