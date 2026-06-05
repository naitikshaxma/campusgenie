const aiProvider = require('./ai/aiProvider')
const Assignment = require('../models/Assignment')
const PlannerSession = require('../models/PlannerSession')

/**
 * Intelligent Academic Auto-Planner Service
 * Utilizes the AI provider to solve scheduling constraints.
 */
class PlannerAiService {
  /**
   * Generates a study plan based on user topic constraints or specific assignments.
   */
  async generateAdvancedPlan(userId, payload) {
    const {
      topic = '',
      preferredFocus = 'morning',
      intensity = 'balanced',
      allowWeekends = false,
      assignmentTitle = '',
      subject = '',
      deadline = '',
      difficulty = 'medium',
      availableHours = 2
    } = payload

    // 1. Fetch pending assignments for context
    const assignments = await Assignment.find({ createdBy: userId, status: { $ne: 'done' } })
    
    // 2. Fetch existing sessions to prevent collisions
    const startOfWeek = new Date()
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000)
    
    const existing = await PlannerSession.find({
      createdBy: userId,
      date: { $gte: startOfWeek, $lte: endOfWeek }
    })

    // 3. Define the prompt context
    const isSpecificAssignment = !!assignmentTitle || !!subject
    const focusTimeDescription = this._getFocusTimeDesc(preferredFocus)
    
    const systemInstruction = `You are a high-level academic scheduling operating system.
Your job is to generate a realistic, high-fidelity study schedule that optimizes cognitive load, balances fatigue, and applies spaced repetition.
You MUST return a valid JSON OBJECT fitting this exact schema:

{
  "reasoning": "Detailed explanation of why subjects were placed at certain times (e.g., matching difficulty to peak energy hours), how spaced repetition was applied, and fatigue prevention logic. Be strategic and sound like a premium AI executive assistant.",
  "sessions": [
    {
      "subject": "Subject name (e.g. DBMS, Math, CS, Chemistry, Physics, History)",
      "topic": "Actionable focus topic / task (e.g. Indexing Optimization Practice)",
      "duration": 1.5, // Float hours (0.5 to 2.5)
      "date": "YYYY-MM-DD format (within the next 7 days, from tomorrow)",
      "startTime": "HH:MM format (24-hour style, e.g. 09:30 or 15:00)",
      "endTime": "HH:MM format",
      "notes": "Actionable notes on what to study / solve"
    }
  ]
}

CRITICAL AUTO-PLANNING RULES:
1. FATIGUE PREVENTION: Never schedule more than 2.5 continuous hours of study.
2. MANDATORY BREAKS: Leave at least 30 minutes of free space between sessions on the same day.
3. PREFERRED FOCUS: Place hard subjects or key tasks during the user's preferred focus hours: ${focusTimeDescription}.
4. NO LATE-NIGHT OVERLOAD: Do not schedule study sessions after midnight (00:00) or before 06:00.
5. WEEKEND STUDY: ${allowWeekends ? 'You are allowed to schedule blocks on weekends.' : 'Avoid scheduling blocks on Saturday and Sunday unless absolutely required.'}
6. SPACED REPETITION: For active assignments, split study into learning, practice, and revision blocks spread across different days instead of stacking everything on a single day.
7. BALANCED WORKLOAD: Distribute sessions naturally over the 7-day period. Maximum 4 hours of total study sessions on any single day (intensity: ${intensity}).
8. OVERLAP PREVENTION: Do not schedule sessions at times that collide with existing commitments.
Output MUST be raw JSON object only. Do not wrap in markdown code blocks.`

    let userPrompt = ''
    if (isSpecificAssignment) {
      userPrompt = `Generate a dedicated, multi-day spaced repetition study plan to prepare for this specific assignment:
Assignment Title: ${assignmentTitle}
Subject: ${subject}
Deadline/Due Date: ${deadline}
Difficulty: ${difficulty}
Target Prep Workload: ${availableHours} hours total

Active Academic Context (Other assignments to balance):
${assignments.map(a => `- ${a.subject}: ${a.title} (Due: ${a.dueDate?.toISOString().slice(0, 10)}, Priority: ${a.priority})`).join('\n')}

Existing Commitments (Do not collide with these slots):
${existing.map(e => `- ${e.subject} on ${e.date?.toISOString().slice(0, 10)} from ${e.startTime} to ${e.endTime}`).join('\n')}
`
    } else {
      userPrompt = `Generate a balanced weekly study plan.
Target Topics/Exams to schedule: "${topic}"

Active Assignments (Prioritize these due dates and estimated prep hours):
${assignments.map(a => `- ${a.subject}: ${a.title} (Due: ${a.dueDate?.toISOString().slice(0, 10)}, Difficulty: ${a.priority}, Est. Hours: ${a.estimatedStudyHours || 2.5})`).join('\n')}

Existing Commitments (Do not collide with these slots):
${existing.map(e => `- ${e.subject} on ${e.date?.toISOString().slice(0, 10)} from ${e.startTime} to ${e.endTime}`).join('\n')}
`
    }

    try {
      const parsedOutput = await aiProvider.generateCompletion(userPrompt, systemInstruction, true, 'planner')
      
      let parsedSessions = []
      let reasoning = "Your intelligent study plan has been generated based on current workload and peak focus availability."
      
      if (Array.isArray(parsedOutput)) {
        parsedSessions = parsedOutput
      } else if (parsedOutput && Array.isArray(parsedOutput.sessions)) {
        parsedSessions = parsedOutput.sessions
        if (parsedOutput.reasoning) reasoning = parsedOutput.reasoning
      } else {
        throw new Error('AI output did not return a valid scheduling schema.')
      }

      // Convert times and validate session schema
      const sessionsToInsert = parsedSessions.map((session) => {
        const duration = Math.max(0.5, Math.min(Number(session.duration) || 1, 2.5))
        return {
          subject: session.subject || subject || 'CS',
          topic: session.topic || session.notes || 'Review session',
          duration,
          date: session.date ? new Date(session.date) : new Date(Date.now() + 86400000),
          startTime: session.startTime || '09:00',
          endTime: session.endTime || '10:30',
          notes: session.notes || 'AI generated study session.',
          generatedByAI: true,
          status: 'pending',
          createdBy: userId
        }
      })

      const inserted = await PlannerSession.insertMany(sessionsToInsert)
      return { sessions: inserted, reasoning }
    } catch (err) {
      console.error('[PlannerAiService] generateAdvancedPlan error:', err.message)
      throw new Error('AI Scheduler failed to calculate study plan: ' + err.message)
    }
  }

  _getFocusTimeDesc(pref) {
    if (pref === 'morning') return 'Morning (08:00 - 12:00)'
    if (pref === 'afternoon') return 'Afternoon (13:00 - 17:00)'
    if (pref === 'evening') return 'Evening (18:00 - 21:00)'
    if (pref === 'night') return 'Night (21:00 - 00:00)'
    return 'Balanced split'
  }
}

module.exports = new PlannerAiService()
