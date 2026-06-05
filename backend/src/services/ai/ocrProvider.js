const Tesseract = require('tesseract.js')

class OcrProvider {
  constructor() {
    this.ocrSpaceUrl = 'https://api.ocr.space/parse/image'
  }

  /**
   * Transcribes all text from an image buffer using OCR.space (cloud) or Tesseract.js (local fallback).
   */
  async extractText(buffer, mimeType) {
    if (!buffer || buffer.length === 0) {
      throw new Error('Invalid or empty image buffer.')
    }

    try {
      console.log('[OcrProvider] Attempting cloud text extraction via OCR.space...')
      const text = await this.callOcrSpace(buffer, mimeType)
      if (text && text.trim().length > 0) {
        console.log('[OcrProvider] Cloud extraction successful!')
        return text
      }
      throw new Error('OCR.space returned empty text.')
    } catch (err) {
      console.warn('[OcrProvider] OCR.space cloud extraction failed. Falling back to local Tesseract.js...', err.message)
      
      try {
        const text = await this.callTesseract(buffer)
        if (text && text.trim().length > 0) {
          console.log('[OcrProvider] Local Tesseract.js extraction successful!')
          return text
        }
        throw new Error('Tesseract.js returned empty text.')
      } catch (tessErr) {
        console.error('[OcrProvider] Local Tesseract.js failed:', tessErr.message)
        throw new Error('Failed to transcribe image. Both OCR.space and Tesseract.js failed: ' + tessErr.message)
      }
    }
  }

  /**
   * OCR.space API client
   */
  async callOcrSpace(buffer, mimeType) {
    const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld'
    
    // Construct base64 payload
    const base64Str = buffer.toString('base64')
    const dataUri = `data:${mimeType};base64,${base64Str}`
    
    const formData = new URLSearchParams()
    formData.append('apikey', apiKey)
    formData.append('base64Image', dataUri)
    formData.append('language', 'eng')
    formData.append('isOverlayRequired', 'false')

    // Fetch call with timeout of 8s
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 8000)

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
   * Tesseract.js local client
   */
  async callTesseract(buffer) {
    // Wrap Tesseract.recognize in a timeout of 15 seconds
    const ocrPromise = Tesseract.recognize(
      buffer,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`[Tesseract] Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      }
    )

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tesseract local execution timed out (15s)')), 15000)
    )

    const result = await Promise.race([ocrPromise, timeoutPromise])
    return result?.data?.text || ''
  }
}

module.exports = new OcrProvider()
