const { GoogleGenerativeAI } = require('@google/generative-ai')

/**
 * Gemini Provider
 * Low-level connector for Google Gemini API.
 * Uses lazy-initialization to prevent server crashes on startup if the API key is not yet set.
 */
class GeminiProvider {
  constructor() {
    this.genAI = null
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  }

  /**
   * Initializes the Google Generative AI client.
   * Throws an error if GEMINI_API_KEY is missing or unconfigured.
   */
  init() {
    if (this.genAI) return

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error(
        'GEMINI_API_KEY environment variable is not configured. ' +
        'Please define a valid API key in your backend .env file.'
      )
    }
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  /**
   * Wrapper to enforce a timeout on Generative AI requests.
   * Default timeout is 15 seconds.
   */
  async withTimeout(promise, ms = 15000) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Google Gemini API request timed out after ${ms / 1000} seconds.`)), ms)
    )
    return Promise.race([promise, timeout])
  }

  /**
   * Generates a plain-text response from the LLM.
   * @param {string} prompt - User query or input prompt
   * @param {string} systemInstruction - Developer context or guidelines
   */
  async generateText(prompt, systemInstruction = '') {
    this.init()

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction,
      })

      const result = await this.withTimeout(model.generateContent(prompt))
      const text = result.response.text()
      if (!text) {
        throw new Error('Gemini API returned an empty text response.')
      }
      return text
    } catch (err) {
      console.error('[GeminiProvider] Text generation error:', err.message)
      throw err
    }
  }

  /**
   * Generates a structured JSON response from the LLM.
   * Utilizes Gemini's native responseMimeType configuration.
   * @param {string} prompt - Structured query or request prompt
   * @param {string} systemInstruction - Schema guidance context
   */
  async generateJson(prompt, systemInstruction = '') {
    this.init()

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction,
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })

      const result = await this.withTimeout(model.generateContent(prompt))
      const text = result.response.text()
      
      if (!text) {
        throw new Error('Gemini API returned an empty JSON response.')
      }

      // Try direct parse
      try {
        return JSON.parse(text)
      } catch {
        // Safe regex extraction fallback in case of block wrapping or trailing characters
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
        
        const arrayMatch = text.match(/\[[\s\S]*\]/)
        if (arrayMatch) {
          return JSON.parse(arrayMatch[0])
        }

        throw new Error('Failed to parse response text as valid JSON: ' + text)
      }
    } catch (err) {
      console.error('[GeminiProvider] JSON generation error:', err.message)
      throw err
    }
  }

  /**
   * Generates a response from the LLM with an image input (multimodal).
   * @param {string} prompt - User query or extraction directive
   * @param {string} mimeType - Image MIME type (e.g. image/jpeg)
   * @param {Buffer} buffer - Image file buffer
   * @param {string} systemInstruction - Developer context or guidelines
   * @param {string} responseMimeType - Optional response type constraint (e.g. 'application/json')
   */
  async generateMultimodal(prompt, mimeType, buffer, systemInstruction = '', responseMimeType = null) {
    this.init()

    try {
      const config = {}
      if (responseMimeType) {
        config.responseMimeType = responseMimeType
      }

      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction,
        generationConfig: config
      })

      const imagePart = {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType
        }
      }

      const result = await this.withTimeout(model.generateContent([prompt, imagePart]))
      const text = result.response.text()
      
      if (!text) {
        throw new Error('Gemini Multimodal API returned an empty response.')
      }
      return text
    } catch (err) {
      console.error('[GeminiProvider] Multimodal generation error:', err.message)
      throw err
    }
  }

  /**
   * Generates a plain-text multimodal response.
   */
  async generateMultimodalText(prompt, mimeType, buffer, systemInstruction = '') {
    return this.generateMultimodal(prompt, mimeType, buffer, systemInstruction)
  }

  /**
   * Generates a structured JSON multimodal response.
   */
  async generateMultimodalJson(prompt, mimeType, buffer, systemInstruction = '') {
    const text = await this.generateMultimodal(prompt, mimeType, buffer, systemInstruction, 'application/json')
    try {
      return JSON.parse(text)
    } catch {
      // Regex extraction fallback
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      const arrayMatch = text.match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0])
      }
      
      throw new Error('Failed to parse multimodal response text as valid JSON: ' + text)
    }
  }
}

module.exports = new GeminiProvider()
