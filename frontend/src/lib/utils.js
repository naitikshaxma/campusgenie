import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind classes intelligently, resolving conflicts.
 * Used by all Shadcn-style components.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a human-readable string.
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Returns relative time string (e.g., "2 days ago").
 */
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  const intervals = [
    [31536000, 'year'],
    [2592000,  'month'],
    [86400,    'day'],
    [3600,     'hour'],
    [60,       'minute'],
  ]
  for (const [secs, unit] of intervals) {
    const interval = Math.floor(seconds / secs)
    if (interval >= 1) return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
  }
  return 'Just now'
}

/**
 * Truncates a string to a given length.
 */
export function truncate(str, length = 80) {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '…' : str
}

/**
 * Generates a random avatar color from a string (name).
 */
export function getAvatarColor(name = '') {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-pink-500 to-rose-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

/**
 * Priority color maps for assignments.
 */
export const PRIORITY_COLORS = {
  low:    'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  high:   'text-rose-500 bg-rose-500/10 border-rose-500/20',
}

/**
 * Subject color maps for visual coding.
 */
export const SUBJECT_COLORS = {
  Mathematics: { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20',   dot: 'bg-blue-500' },
  Physics:     { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-500' },
  Chemistry:   { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/20',  dot: 'bg-green-500' },
  English:     { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  dot: 'bg-amber-500' },
  History:     { bg: 'bg-rose-500/10',   text: 'text-rose-400',   border: 'border-rose-500/20',   dot: 'bg-rose-500' },
  CS:          { bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   border: 'border-cyan-500/20',   dot: 'bg-cyan-500' },
  Biology:     { bg: 'bg-teal-500/10',   text: 'text-teal-400',   border: 'border-teal-500/20',   dot: 'bg-teal-500' },
}

export function getSubjectColor(subject) {
  return SUBJECT_COLORS[subject] || { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20', dot: 'bg-brand-500' }
}
