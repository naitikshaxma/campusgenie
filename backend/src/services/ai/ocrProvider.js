const Tesseract = require('tesseract.js')
const { Jimp, JimpMime } = require('jimp')
const path = require('path')

class OcrProvider {
  constructor() {
    this.ocrSpaceUrl = 'https://api.ocr.space/parse/image'
  }

  /**
   * Cleans and normalizes OCR output
   */
  cleanOcrText(text) {
    if (!text) return ''
    let cleaned = text
    
    // Remove invalid/weird unicode characters
    cleaned = cleaned.replace(/[^\x20-\x7E\r\n]/g, ' ')
    
    // Remove repeated spaces
    cleaned = cleaned.replace(/[ \t]+/g, ' ')
    
    // Split into lines and filter out tiny non-alphanumeric junk lines
    const lines = cleaned.split(/\r?\n/)
    const cleanedLines = lines
      .map(line => line.trim())
      .filter(line => line.length > 2 || /[A-Za-z0-9]/.test(line))
    
    // Merge broken multiline sentence fragments
    let mergedText = ''
    for (let i = 0; i < cleanedLines.length; i++) {
      const currentLine = cleanedLines[i]
      if (i > 0) {
        const prevLine = cleanedLines[i - 1]
        // Merge with space if previous line doesn't end with standard punctuation
        if (prevLine && !/[.!?:]$/.test(prevLine)) {
          mergedText += ' ' + currentLine
        } else {
          mergedText += '\n' + currentLine
        }
      } else {
        mergedText += currentLine
      }
    }

    return mergedText.trim()
  }

  /**
   * Preprocess image buffer using Jimp
   */
  async preprocessImage(buffer) {
    try {
      console.log('[OcrProvider] Preprocessing image buffer (grayscale, contrast, resize)...')
      const image = await Jimp.read(buffer)
      
      // Grayscale
      image.greyscale()
      
      // Enhance contrast
      image.contrast(0.25)
      
      // Resize if too large (>1600px width)
      if (image.bitmap.width > 1600) {
        image.resize({ w: 1600 })
      }
      
      const processed = await image.getBuffer(JimpMime.png)
      console.log(`[OcrProvider] Preprocessing done. Size: ${processed.length} bytes`)
      return processed
    } catch (err) {
      console.warn('[OcrProvider] Image preprocessing failed, using raw buffer:', err.message)
      return buffer
    }
  }

  /**
   * Transcribes all text from an image buffer.
   * Uses OCR.space (cloud) as primary and Tesseract.js (local) as fallback.
   */
  async extractText(buffer, mimeType) {
    if (!buffer || buffer.length === 0) {
      return {
        success: false,
        rawText: '',
        error: 'Invalid or empty image buffer'
      }
    }

    let processedBuffer = buffer
    try {
      processedBuffer = await this.preprocessImage(buffer)
    } catch (preprocessErr) {
      console.warn('[OcrProvider] Preprocessing warning:', preprocessErr.message)
    }

    // Try OCR.space Cloud First
    try {
      console.log('[OcrProvider] Attempting cloud OCR via OCR.space...')
      const rawText = await this.callOcrSpaceWithRetry(processedBuffer, 'image/png')
      const cleaned = this.cleanOcrText(rawText)
      
      if (cleaned.length > 0) {
        console.log('[OcrProvider] OCR.space cloud extraction successful!')
        return {
          success: true,
          rawText: cleaned,
          error: null
        }
      }
      throw new Error('OCR.space returned empty text.')
    } catch (err) {
      console.warn('[OcrProvider] OCR.space extraction failed. Falling back to Tesseract.js...', err.message)
      
      // Fallback to local offline Tesseract.js
      try {
        console.log('[OcrProvider] Attempting local offline OCR via Tesseract.js...')
        const rawText = await this.callTesseract(processedBuffer)
        const cleaned = this.cleanOcrText(rawText)
        
        if (cleaned.length > 0) {
          console.log('[OcrProvider] Local Tesseract.js extraction successful!')
          return {
            success: true,
            rawText: cleaned,
            error: null
          }
        }
        throw new Error('Tesseract.js returned empty text.')
      } catch (tessErr) {
        console.error('[OcrProvider] Both cloud and local OCR failed:', tessErr.message)
        return {
          success: false,
          rawText: '',
          error: 'OCR extraction failed: ' + tessErr.message
        }
      }
    }
  }

  /**
   * OCR.space call wrapper with retry logic
   */
  async callOcrSpaceWithRetry(buffer, mimeType, retries = 2, delay = 1000) {
    try {
      return await this.callOcrSpace(buffer, mimeType)
    } catch (err) {
      const isRateLimit = err.status === 429 || err.message?.includes('429') || err.message?.includes('limit')
      if (isRateLimit && retries > 0) {
        console.warn(`[OcrProvider] OCR.space rate limit or server issue. Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.callOcrSpaceWithRetry(buffer, mimeType, retries - 1, delay * 2)
      }
      throw err
    }
  }

  /**
   * OCR.space API Client
   */
  async callOcrSpace(buffer, mimeType) {
    const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld'
    
    // Construct base64 payload
    const base64Str = buffer.toString('base64')
    const activeMime = mimeType || 'image/png'
    const dataUri = `data:${activeMime};base64,${base64Str}`
    
    const formData = new URLSearchParams()
    formData.append('apikey', apiKey)
    formData.append('base64Image', dataUri)
    formData.append('language', 'eng')
    formData.append('isOverlayRequired', 'false')

    // Fetch call with timeout of 10s
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 10000)

    try {
      const res = await fetch(this.ocrSpaceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData,
        signal: controller.signal
      })
      
      clearTimeout(id)

      if (!res.ok) {
        throw new Error(`OCR.space API error: Status ${res.status}`)
      }

      const data = await res.json()
      
      if (data.IsErroredOnProcessing) {
        throw new Error(`OCR.space processing error: ${data.ErrorMessage?.[0] || 'Unknown'}`)
      }

      const parsedResults = data.ParsedResults
      if (Array.isArray(parsedResults) && parsedResults[0]) {
        return parsedResults[0].ParsedText || ''
      }
      return ''
    } catch (err) {
      clearTimeout(id)
      throw err
    }
  }

  /**
   * Tesseract.js offline worker client
   */
  async callTesseract(buffer) {
    const langPath = path.resolve(__dirname, '../../..')
    
    // Create worker pointing to local eng.traineddata
    const worker = await Tesseract.createWorker('eng', 1, {
      langPath,
      gzip: false,
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`[Tesseract] Progress: ${Math.round(m.progress * 100)}%`)
        }
      }
    })

    try {
      // Wrap the recognition in a timeout of 20 seconds
      const ocrPromise = (async () => {
        const { data: { text } } = await worker.recognize(buffer)
        return text || ''
      })()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Tesseract local execution timed out (20s)')), 20000)
      )

      const result = await Promise.race([ocrPromise, timeoutPromise])
      await worker.terminate()
      return result
    } catch (err) {
      await worker.terminate().catch(() => {})
      throw err
    }
  }
}

module.exports = new OcrProvider()
