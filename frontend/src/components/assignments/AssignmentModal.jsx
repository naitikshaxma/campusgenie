import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, BookOpen, AlertCircle, FileText } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'CS', 'Biology']
const PRIORITIES = ['low', 'medium', 'high']
const STATUSES = ['todo', 'inprogress', 'done']
const STATUS_LABELS = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' }

const EMPTY = {
  title: '', description: '', subject: 'CS',
  priority: 'medium', dueDate: '', status: 'todo',
}

export default function AssignmentModal({ open, onOpenChange, onSave, initial }) {
  const [form, setForm] = useState(initial || EMPTY)

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }))

  const handleSave = () => {
    if (!form.title.trim() || !form.dueDate) return
    onSave({ ...form, id: initial?.id || String(Date.now()) })
    setForm(EMPTY)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-400" />
            {initial ? 'Edit Assignment' : 'New Assignment'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Title *</label>
            <Input placeholder="e.g. Chapter 5 Problem Set" value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors min-h-[80px]"
              placeholder="Optional details…"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Subject + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> Subject
              </label>
              <select
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
              >
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Priority
              </label>
              <div className="flex gap-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleChange('priority', p)}
                    className={cn(
                      'flex-1 text-xs py-2 rounded-lg border capitalize transition-all',
                      form.priority === p
                        ? p === 'high'   ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                          : p === 'medium' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'border-border text-muted-foreground hover:border-border/80',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due date + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> Due date *
              </label>
              <Input type="date" value={form.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="gradient" onClick={handleSave} disabled={!form.title.trim() || !form.dueDate}>
            {initial ? 'Update' : 'Add Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
