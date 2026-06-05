import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, BookOpen, Calendar, AlertCircle, Sparkles, Edit2, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, getSubjectColor, PRIORITY_COLORS } from '@/lib/utils'

/**
 * ExtractionResult — shows OCR-extracted assignment details.
 * User can edit fields before creating the assignment.
 */
export default function ExtractionResult({ data, onCreateAssignment, onGeneratePlan, isCreating }) {
  const [edited, setEdited] = useState(data)
  const [editing, setEditing] = useState(null) // field being edited

  const subjectColor = getSubjectColor(edited.subject)
  const priorityClass = PRIORITY_COLORS[edited.priority] || PRIORITY_COLORS.medium

  const update = (field, value) => setEdited((p) => ({ ...p, [field]: value }))

  const SUBJECTS  = ['Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'CS', 'Biology']
  const PRIORITIES = ['low', 'medium', 'high']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-emerald-500/20 bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500/5 border-b border-emerald-500/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-400">Extraction complete</p>
          <p className="text-[10px] text-muted-foreground">
            {data.confidence ? `${Math.round(data.confidence * 100)}% confidence` : 'Review and confirm'}
          </p>
        </div>
      </div>

      {/* Extracted fields */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <EditableField
          label="Assignment Title"
          value={edited.title}
          editing={editing === 'title'}
          onEdit={() => setEditing('title')}
          onBlur={() => setEditing(null)}
          onChange={(v) => update('title', v)}
          icon={<Edit2 className="h-3.5 w-3.5" />}
        />

        {/* Subject + Priority row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> Subject
            </label>
            <select
              value={edited.subject}
              onChange={(e) => update('subject', e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Priority
            </label>
            <div className="flex gap-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => update('priority', p)}
                  className={cn(
                    'flex-1 text-[10px] py-1.5 rounded-lg border capitalize transition-all',
                    edited.priority === p
                      ? p === 'high' ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                        : p === 'medium' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                        : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Due date */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Due Date
          </label>
          <Input
            type="date"
            value={edited.dueDate || ''}
            onChange={(e) => update('dueDate', e.target.value)}
            className="text-sm h-9"
          />
        </div>

        {/* Description */}
        {edited.description && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Description</label>
            <p className="text-xs text-foreground/80 bg-muted/40 rounded-lg p-3 leading-relaxed">
              {edited.description}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 px-5 pb-5">
        <Button
          variant="gradient"
          className="flex-1"
          onClick={() => onCreateAssignment(edited)}
          disabled={!edited.title || isCreating}
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <><Plus className="h-4 w-4" /> Create Assignment</>
          )}
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-brand-500/30 text-brand-400 hover:bg-brand-500/10"
          onClick={() => onGeneratePlan(edited)}
          disabled={isCreating}
        >
          <Sparkles className="h-4 w-4" />
          Study Plan
        </Button>
      </div>
    </motion.div>
  )
}

function EditableField({ label, value, editing, onEdit, onBlur, onChange, icon }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {editing ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoFocus
          className="text-sm"
        />
      ) : (
        <button
          onClick={onEdit}
          className="group flex w-full items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-left hover:border-brand-500/30 transition-colors"
        >
          <span className="text-sm font-medium truncate">{value || 'Not detected'}</span>
          <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
            {icon}
          </span>
        </button>
      )}
    </div>
  )
}
