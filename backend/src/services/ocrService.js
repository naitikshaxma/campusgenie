const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
const aiService = require('./ai/aiService')

dayjs.extend(customParseFormat)

/**
 * Parses a date string from OCR text with special support for Indian formats (DD/MM/YY).
 */
function parseDateFromText(text) {
  const lines = text.split('\n')
  const datePatterns = [
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/,
    /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b/i,
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?\s*,\s*\d{2,4}\b/i
  ]

  // 1. Scan date-related lines first
  for (const line of lines) {
    if (/due|submit|deadline|submission|date/i.test(line)) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern)
        if (match) {
          const parsed = cleanAndParseDate(match[0])
          if (parsed) return parsed
        }
      }
    }
  }

  // 2. Scan whole text as fallback
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      const parsed = cleanAndParseDate(match[0])
      if (parsed) return parsed
    }
  }
  return null
}

function cleanAndParseDate(dateStr) {
  const cleaned = dateStr.trim()
  
  // Numeric date format parser (DD/MM/YY or DD/MM/YYYY)
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(cleaned)) {
    const formats = ['DD/MM/YYYY', 'DD/MM/YY', 'DD-MM-YYYY', 'DD-MM-YY', 'D-M-YYYY', 'D-M-YY', 'D/M/YYYY', 'D/M/YY']
    for (const fmt of formats) {
      const d = dayjs(cleaned, fmt, true)
      if (d.isValid()) {
        return d.format('YYYY-MM-DD')
      }
    }
  } else {
    // Textual dates (e.g. "12 April 2026")
    const d = dayjs(cleaned)
    if (d.isValid()) {
      return d.format('YYYY-MM-DD')
    }
  }
  return null
}

/**
 * Deterministic Regex Metadata Extractor.
 */
function extractFieldsRegex(text) {
  const result = {
    title: null,
    subject: null,
    dueDate: null,
    semester: null,
    department: null,
    facultyName: null,
    assignmentNo: null,
  }

  // 1. Subject extraction
  const subjectPatterns = [
    /SUBJECT(?: CODE)?\/SUBJECT NAME:\s*(.+)/i,
    /SUBJECT\s*(?:CODE)?\s*:\s*(.+)/i,
    /COURSE\s*:\s*(.+)/i,
    /SUBJECT NAME\s*:\s*(.+)/i,
    /CLASS\s*:\s*(.+)/i,
  ]

  for (const pattern of subjectPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      result.subject = match[1].split('\n')[0].trim()
      break
    }
  }

  // 2. Assignment / Lab / Project titles
  const assignPatterns = [
    /ASSIGNMENT\s*[-#]?\s*(\d+)/i,
    /ASSIGNMENT\s*NO\.?\s*(\d+)/i,
    /LAB\s*REPORT\s*(?:\d+)?/i,
    /MINI\s*PROJECT/i,
    /PROJECT\s*NO\.?\s*(\d+)/i,
  ]

  for (const pattern of assignPatterns) {
    const match = text.match(pattern)
    if (match) {
      const matchedStr = match[0].toLowerCase()
      if (matchedStr.includes('lab')) {
        result.assignmentNo = 'Lab Report'
      } else if (matchedStr.includes('project')) {
        result.assignmentNo = 'Mini Project'
      } else {
        result.assignmentNo = `Assignment ${match[1]}`
      }
      break
    }
  }

  // 3. Due date
  result.dueDate = parseDateFromText(text)

  // 4. Semester
  const semMatch = text.match(/SEMESTER\s*:\s*([A-Za-z0-9]+)/i) || text.match(/SEM\s*:\s*([A-Za-z0-9]+)/i)
  if (semMatch && semMatch[1]) {
    result.semester = semMatch[1].trim()
  }

  // 5. Department
  const deptMatch = text.match(/DEPARTMENT\s*:\s*(.+)/i) || text.match(/DEPT\s*:\s*(.+)/i)
  if (deptMatch && deptMatch[1]) {
    result.department = deptMatch[1].split('\n')[0].trim()
  }

  // 6. Faculty
  const facultyMatch = text.match(/FACULTY\s*(?:NAME)?\s*:\s*(.+)/i) || text.match(/TEACHER\s*(?:NAME)?\s*:\s*(.+)/i)
  if (facultyMatch && facultyMatch[1]) {
    result.facultyName = facultyMatch[1].split('\n')[0].trim()
  }

  // Form title
  if (result.subject && result.assignmentNo) {
    result.title = `${result.subject} - ${result.assignmentNo}`
  } else if (result.assignmentNo) {
    result.title = result.assignmentNo
  }

  return result
}

/**
 * Dynamic deterministic priority calculation based on days left.
 */
function calculatePriority(dueDateStr) {
  if (!dueDateStr) return 'medium'
  const due = dayjs(dueDateStr)
  const today = dayjs().startOf('day')
  const diffDays = due.diff(today, 'day')
  if (diffDays <= 2) return 'high'
  if (diffDays <= 5) return 'medium'
  return 'low'
}

/**
 * Main Hybrid OCR Extraction pipeline.
 */
async function extractAssignment(buffer, mimeType) {
  if (!buffer || buffer.length === 0) {
    const err = new Error('Empty file buffer uploaded.')
    err.statusCode = 422
    throw err
  }

  // Step 1: Transcribe text from image using OCR engine (Raw OCR)
  let rawText = ''
  try {
    const textRes = await aiService.extractTextFromImage(buffer, mimeType)
    rawText = textRes.rawText || ''
  } catch (err) {
    const error = new Error('OCR text transcription failed: ' + err.message)
    error.statusCode = 422
    throw error
  }

  if (!rawText.trim()) {
    console.warn('[ocrService] OCR text transcription was empty. Proceeding with fallback details.');
    rawText = 'Unreadable scanned notice board worksheet.';
  }

  // Step 2: Rule-Based Field Extraction
  const parsedFields = extractFieldsRegex(rawText)

  // Step 3: AI Enrichment (AI assistant processes suggestions, workload & handles fallbacks)
  let enriched = {}
  try {
    enriched = await aiService.enrichAssignmentWithAi(rawText, parsedFields)
  } catch (err) {
    console.warn('[ocrService] AI enrichment failed, using fallbacks', err.message)
    enriched = {
      title: parsedFields.title || 'Untitled Assignment',
      subject: parsedFields.subject || 'General',
      dueDate: parsedFields.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      estimatedStudyHours: 2.5,
      studySuggestions: 'Review textbook concepts and outline key goals before starting.',
      difficulty: 'medium',
      summary: 'Scanned worksheet'
    }
  }

  // Step 4: Validation, Normalization & Confidence calculation
  // DETERMINISTIC LOCK: regex values always override AI for critical fields
  const finalTitle   = parsedFields.title   || 'Untitled Assignment'
  const finalSubject = parsedFields.subject  || 'General'
  const finalDueDate = parsedFields.dueDate  || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  // Calculate priority deterministically — AI MUST NOT touch this
  const finalPriority = calculatePriority(finalDueDate)

  // Per-field source tracking for frontend confidence display
  const fieldSources = {
    title:   parsedFields.title   ? 'regex' : 'fallback',
    subject: parsedFields.subject ? 'regex' : 'fallback',
    dueDate: parsedFields.dueDate ? 'regex' : 'fallback',
    priority: 'deterministic',
  }

  // Confidence scores: regex = high, AI-guessed = lower, fallback = lowest
  const titleConfidence      = parsedFields.title   ? 0.97 : 0.55
  const subjectConfidence    = parsedFields.subject  ? 0.97 : 0.52
  const dueDateConfidence    = parsedFields.dueDate  ? 0.97 : 0.50
  const aiSuggestionConfidence = 0.80

  // Validation layer
  const fieldErrors = {}
  if (!finalTitle || finalTitle === 'Untitled Assignment') {
    fieldErrors.title = 'Title could not be extracted — please review and edit.'
  }
  if (!parsedFields.subject) {
    fieldErrors.subject = 'Subject not detected in image — please select manually.'
  }
  if (!parsedFields.dueDate) {
    fieldErrors.dueDate = 'Due date not found — please verify and set manually.'
  }

  // Build description from AI summary + extra metadata tags
  let extraDesc = ''
  if (parsedFields.semester)    extraDesc += `Semester: ${parsedFields.semester}\n`
  if (parsedFields.department)  extraDesc += `Department: ${parsedFields.department}\n`
  if (parsedFields.facultyName) extraDesc += `Faculty: ${parsedFields.facultyName}\n`

  const finalDescription = enriched.summary
    ? `${enriched.summary}\n\n${extraDesc}`.trim()
    : extraDesc.trim()

  return {
    title:                 finalTitle,
    subject:               finalSubject,
    description:           finalDescription,
    dueDate:               finalDueDate,
    priority:              finalPriority,
    estimatedStudyHours:   enriched.estimatedStudyHours || 2.5,
    studySuggestions:      enriched.studySuggestions || 'Focus on class slides and practice problems.',
    difficulty:            enriched.difficulty || 'medium',
    // Confidence per field
    confidence:            (titleConfidence + subjectConfidence + dueDateConfidence) / 3,
    titleConfidence,
    subjectConfidence,
    dueDateConfidence,
    aiSuggestionConfidence,
    // Metadata
    fieldSources,
    fieldErrors:           Object.keys(fieldErrors).length > 0 ? fieldErrors : null,
    rawText,
    aiGenerated:           true,
  }
}

/**
 * Notice OCR extraction forwarder
 */
async function extractNotice(buffer, mimeType) {
  return aiService.extractNoticeFromImage(buffer, mimeType)
}

/**
 * General transcription forwarder
 */
async function extractText(buffer, mimeType) {
  return aiService.extractTextFromImage(buffer, mimeType)
}

module.exports = {
  extractAssignment,
  extractNotice,
  extractText,
}
