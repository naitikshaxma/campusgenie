const PlannerSession = require('../models/PlannerSession')

const DEFAULT_DAILY_START = 18
const FALLBACK_START = 8

function roundToHalf(hours) {
  return Math.round(hours * 2) / 2
}

function parseNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (!value) return null
  const match = String(value).match(/\d+(\.\d+)?/)
  return match ? Number.parseFloat(match[0]) : null
}

function formatTime(hourValue) {
  const totalMinutes = Math.round(hourValue * 60)
  const hours = Math.floor(totalMinutes / 60) % 24
  const minutes = totalMinutes % 60
  const hh = String((hours + 24) % 24).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  return `${hh}:${mm}`
}

function buildSessionsForDay({
  dayDate,
  dayHours,
  subject,
  topic,
  notes,
  linkedAssignment,
}) {
  const sessions = []
  let remaining = roundToHalf(dayHours)
  let slotIndex = 0

  while (remaining >= 0.5) {
    const duration = remaining >= 1.5 ? 1.5 : remaining
    const startHour = DEFAULT_DAILY_START + slotIndex * 2
    const useFallback = startHour >= 22
    const baseHour = useFallback ? FALLBACK_START + slotIndex * 2 : startHour
    const startTime = formatTime(baseHour)
    const endTime = formatTime(baseHour + duration)

    sessions.push({
      subject,
      topic,
      duration,
      date: dayDate,
      startTime,
      endTime,
      status: 'pending',
      generatedByAI: false,
      linkedAssignment,
      notes,
    })

    remaining = roundToHalf(remaining - duration)
    slotIndex += 1
  }

  return sessions
}

function getDifficultyBaseHours(difficulty) {
  const normalized = String(difficulty || '').toLowerCase()
  if (normalized === 'easy') return 3
  if (normalized === 'hard') return 8
  return 5
}

function getDateOnly(dateInput) {
  const date = new Date(dateInput)
  date.setHours(0, 0, 0, 0)
  return date
}

async function createSession(userId, payload) {
  const noteText = payload.notes ?? payload.note ?? ''
  const session = await PlannerSession.create({
    subject: payload.subject,
    topic: payload.topic,
    duration: payload.duration,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    status: payload.status,
    generatedByAI: payload.generatedByAI,
    linkedAssignment: payload.linkedAssignment,
    notes: noteText,
    createdBy: userId,
  })
  return session
}

async function getSessions(userId) {
  return PlannerSession.find({ createdBy: userId }).sort({ date: 1, startTime: 1 })
}

async function updateSession(userId, sessionId, payload) {
  const noteText = payload.notes ?? payload.note
  const session = await PlannerSession.findOneAndUpdate(
    { _id: sessionId, createdBy: userId },
    {
      subject: payload.subject,
      topic: payload.topic,
      duration: payload.duration,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      status: payload.status,
      generatedByAI: payload.generatedByAI,
      linkedAssignment: payload.linkedAssignment,
      notes: typeof noteText === 'undefined' ? payload.notes : noteText,
    },
    { new: true, runValidators: true }
  )

  if (!session) {
    const err = new Error('Planner session not found.')
    err.statusCode = 404
    throw err
  }

  return session
}

async function deleteSession(userId, sessionId) {
  const deleted = await PlannerSession.findOneAndDelete({ _id: sessionId, createdBy: userId })
  if (!deleted) {
    const err = new Error('Planner session not found.')
    err.statusCode = 404
    throw err
  }
  return deleted
}

async function getStreak(userId) {
  const today = getDateOnly(new Date())
  const sessions = await PlannerSession.find({
    createdBy: userId,
    status: 'completed',
    date: { $lte: today },
  }).select('date status')

  if (!sessions.length) return { streak: 0 }

  const daySet = new Set(
    sessions.map((s) => getDateOnly(s.date).toISOString().slice(0, 10))
  )

  let streak = 0
  const cursor = new Date(today)
  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return { streak }
}

async function generateStudyPlan(userId, payload) {
  const subject = payload.subject || 'General'
  const assignmentTitle = payload.assignmentTitle || ''
  const topic = assignmentTitle || payload.topic || subject
  const difficulty = payload.difficulty || 'medium'
  const deadline = payload.deadline ? new Date(payload.deadline) : null
  const availablePerDay = parseNumber(payload.availableHours) || 2
  const linkedAssignment = payload.linkedAssignment || null
  const baseHours = getDifficultyBaseHours(difficulty)

  const startDate = getDateOnly(new Date())
  const endDate = deadline ? getDateOnly(deadline) : new Date(startDate.getTime() + 7 * 86400000)
  const totalDays = Math.max(1, Math.ceil((endDate - startDate) / 86400000) + 1)

  const totalAvailable = roundToHalf(availablePerDay * totalDays)
  const targetHours = Math.max(1, Math.min(totalAvailable, baseHours + totalDays * 0.5))

  const sessions = []
  let remaining = roundToHalf(targetHours)

  for (let i = 0; i < totalDays; i += 1) {
    if (remaining < 0.5) break
    const dayDate = new Date(startDate)
    dayDate.setDate(startDate.getDate() + i)

    const remainingDays = totalDays - i
    const suggested = roundToHalf(remaining / remainingDays)
    const dayHours = Math.min(availablePerDay, suggested)

    sessions.push(
      ...buildSessionsForDay({
        dayDate,
        dayHours,
        subject,
        topic,
        linkedAssignment,
        notes: assignmentTitle
          ? `Plan for ${assignmentTitle}`
          : `Plan for ${subject}`,
      })
    )

    remaining = roundToHalf(remaining - dayHours)
  }

  const created = await PlannerSession.insertMany(
    sessions.map((session) => ({ ...session, createdBy: userId }))
  )

  return created
}

module.exports = {
  createSession,
  getSessions,
  updateSession,
  deleteSession,
  getStreak,
  generateStudyPlan,
}
