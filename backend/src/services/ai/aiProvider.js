const fallbackProvider = require('./fallbackProvider')

/**
 * Base AI Provider Client
 * Orchestrates calls to OpenRouter, Groq, Ollama, or Mock Fallback.
 * Handles timeouts, retries, exponential backoff, and model fallbacks.
 */
class AiProvider {
  constructor() {
    this.openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions'
    this.groqUrl = 'https://api.groq.com/openai/v1/chat/completions'
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/v1/chat/completions'
  }

  /**
   * Safe JSON Parser
   * Strips markdown code blocks, cleans malformed brackets/commas, and parses safely.
   */
  safeParseAIJSON(text) {
    if (!text) return null
    let cleaned = text.trim()

    // 1. Remove markdown code fences if present
    cleaned = cleaned.replace(/^```json\s*/i, '')
    cleaned = cleaned.replace(/^```\s*/i, '')
    cleaned = cleaned.replace(/\s*```$/, '')
    cleaned = cleaned.trim()

    // 2. Locate first '{' or '[' and last '}' or ']' to isolate JSON block
    const firstBrace = cleaned.search(/[\{\[]/)
    const lastBrace = cleaned.match(/[\}\]][^]*$/)
    
    if (firstBrace !== -1 && lastBrace) {
      cleaned = cleaned.substring(firstBrace, cleaned.length - (lastBrace[0].length - 1))
    }

    // 3. Fix typical malformed JSON issues
    // Remove trailing commas before closing braces/brackets
    cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1')

    try {
      return JSON.parse(cleaned)
    } catch (err) {
      console.warn('[safeParseAIJSON] Initial JSON.parse failed. Retrying aggressive fix.', err.message)
      
      // Try to recover from missing quotes on keys
      try {
        const relaxedJson = cleaned
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
          .replace(/:\s*['"]([^'"]*)['"]/g, ':"$1"')
        return JSON.parse(relaxedJson)
      } catch (relaxErr) {
        console.error('[safeParseAIJSON] Aggressive JSON recovery failed:', relaxErr.message)
        throw new Error('AI output was not in a valid JSON format.')
      }
    }
  }

  /**
   * Helper to perform fetch calls with a timeout.
   */
  async fetchWithTimeout(url, options, timeoutMs = 12000) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(id)
      return response
    } catch (err) {
      clearTimeout(id)
      throw err
    }
  }

  /**
   * Retries a function with exponential backoff.
   */
  async retryWithBackoff(fn, retries = 2, delay = 1000) {
    try {
      return await fn()
    } catch (err) {
      const isRateLimit = err.status === 429 || err.message?.includes('429')
      const isServerErr = err.status >= 500 || err.message?.includes('503') || err.message?.includes('500')
      
      if ((isRateLimit || isServerErr) && retries > 0) {
        console.warn(`[AiProvider] Transient error: ${err.message}. Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.retryWithBackoff(fn, retries - 1, delay * 2)
      }
      throw err
    }
  }

  /**
   * Orchestrates LLM Completion with fallbacks
   */
  async generateCompletion(prompt, systemInstruction = '', formatJson = false, feature = 'chat') {
    const providers = [
      { name: 'openrouter', fn: () => this.callOpenRouter(prompt, systemInstruction) },
      { name: 'groq', fn: () => this.callGroq(prompt, systemInstruction) },
      { name: 'ollama', fn: () => this.callOllama(prompt, systemInstruction) }
    ]

    for (const provider of providers) {
      try {
        console.log(`[AiProvider] Attempting AI generation via: ${provider.name}`)
        const responseText = await this.retryWithBackoff(() => provider.fn())
        
        if (!responseText) {
          throw new Error('Empty response received.')
        }

        if (formatJson) {
          return this.safeParseAIJSON(responseText)
        }
        return responseText
      } catch (err) {
        console.warn(`[AiProvider] Provider ${provider.name} failed:`, err.message)
      }
    }

    // ── Ultimate Offline Mock Fallback ──
    console.error('[AiProvider] All active AI providers failed. Deploying ultimate fallback data.')
    return fallbackProvider.getFallbackForFeature(feature, prompt)
  }

  /**
   * OpenRouter API Call
   */
  async callOpenRouter(prompt, systemInstruction) {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured.')

    const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat'
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://campusgenie.vercel.app',
      'X-Title': 'CampusGenie App'
    }

    const body = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemInstruction || 'You are a concise academic assistant.' },
        { role: 'user', content: prompt }
      ]
    })

    const res = await this.fetchWithTimeout(this.openRouterUrl, {
      method: 'POST',
      headers,
      body
    })

    if (!res.ok) {
      throw new Error(`OpenRouter API error: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    return data?.choices?.[0]?.message?.content || ''
  }

  /**
   * Groq API Call
   */
  async callGroq(prompt, systemInstruction) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error('GROQ_API_KEY is not configured.')

    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }

    const body = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemInstruction || 'You are a concise academic assistant.' },
        { role: 'user', content: prompt }
      ]
    })

    const res = await this.fetchWithTimeout(this.groqUrl, {
      method: 'POST',
      headers,
      body
    })

    if (!res.ok) {
      throw new Error(`Groq API error: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    return data?.choices?.[0]?.message?.content || ''
  }

  /**
   * Ollama Local Call
   */
  async callOllama(prompt, systemInstruction) {
    const headers = {
      'Content-Type': 'application/json'
    }

    const body = JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'llama3.1',
      messages: [
        { role: 'system', content: systemInstruction || 'You are a concise academic assistant.' },
        { role: 'user', content: prompt }
      ],
      stream: false
    })

    const res = await this.fetchWithTimeout(this.ollamaUrl, {
      method: 'POST',
      headers,
      body
    }, 5000) // Lower timeout for local model check

    if (!res.ok) {
      throw new Error(`Ollama local error: ${res.status}`)
    }

    const data = await res.json()
    return data?.message?.content || ''
  }
}

module.exports = new AiProvider()
