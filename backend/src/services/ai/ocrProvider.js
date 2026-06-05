const { GoogleGenerativeAI } = require('@google/generative-ai')
const { systemInstructions, templates } = require('./promptTemplates')

class OcrProvider {
  constructor() {
    this.genAI = null
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  }

  init() {
    if (this.genAI) return
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY is not configured.')
    }
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async withTimeout(promise, ms = 25000) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Google Gemini Vision API request timed out after ${ms / 1000} seconds.`)), ms)
    )
    return Promise.race([promise, timeout])
  }

  async retryCall(fn, retries = 2, delay = 1500) {
    try {
      return await fn()
    } catch (err) {
      const isTransient =
        err.message.includes('503') ||
        err.message.includes('demand') ||
        err.message.includes('429') ||
        err.message.includes('quota') ||
        err.message.includes('timeout') ||
        err.message.toLowerCase().includes('rate limit') ||
        err.message.includes('Service Unavailable')

      if (isTransient && retries > 0) {
        console.warn(`[OcrProvider] Gemini transient error: ${err.message}. Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.retryCall(fn, retries - 1, delay * 2)
      }
      throw err
    }
  }

  /**
   * Transcribes all text from an image buffer using Google Gemini Vision (multimodal).
   */
  async extractText(buffer, mimeType) {
    if (!buffer || buffer.length === 0) {
      throw new Error('Invalid or empty image buffer.')
    }
    
    this.init()
    const activeMime = mimeType || 'image/png'

    try {
      console.log('[OcrProvider] Running text extraction via Google Gemini Vision...')
      
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: systemInstructions.textExtraction,
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })

      const imagePart = {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: activeMime
        }
      }

      const prompt = templates.textExtractionImage()

      const result = await this.retryCall(() => 
        this.withTimeout(model.generateContent([prompt, imagePart]))
      )

      const text = result.response.text()
      if (!text) {
        throw new Error('Gemini Vision returned an empty response.')
      }

      // Parse JSON from Gemini response MimeType structure
      let parsed = {}
      try {
        parsed = JSON.parse(text)
      } catch (e) {
        // Fallback JSON match regex
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('Failed to parse Gemini response as valid JSON: ' + text)
        }
      }

      const rawText = parsed.rawText || ''
      if (rawText.trim().length > 0) {
        console.log('[OcrProvider] Google Gemini Vision extraction successful!')
        return rawText
      }

      throw new Error('Gemini Vision returned empty rawText.')
    } catch (err) {
      console.error('[OcrProvider] Gemini Vision extraction failed:', err.message)
      throw new Error('Failed to transcribe image using Google Gemini Vision: ' + err.message)
    }
  }
}

module.exports = new OcrProvider()
