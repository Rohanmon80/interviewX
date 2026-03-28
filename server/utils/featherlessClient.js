import OpenAI from 'openai'

/**
 * Featherless.ai — OpenAI-compatible Chat Completions API.
 * Env: FEATHERLESS_API_KEY (required), FEATHERLESS_BASE_URL (optional),
 *      FEATHERLESS_MODEL (optional, default Qwen/Qwen2.5-7B-Instruct)
 */
export function isFeatherlessConfigured() {
  return Boolean(process.env.FEATHERLESS_API_KEY?.trim())
}

export function createFeatherlessClient() {
  if (!isFeatherlessConfigured()) return null
  return new OpenAI({
    apiKey: process.env.FEATHERLESS_API_KEY,
    baseURL: process.env.FEATHERLESS_BASE_URL || 'https://api.featherless.ai/v1',
  })
}

export function featherlessModel() {
  return process.env.FEATHERLESS_MODEL || 'Qwen/Qwen2.5-7B-Instruct'
}

/**
 * @param {string} userContent
 * @param {string | null} systemContent
 * @returns {Promise<string | null>} assistant text or null if unavailable / failed
 */
export async function featherlessComplete(userContent, systemContent = null) {
  const client = createFeatherlessClient()
  if (!client) return null
  const messages = []
  if (systemContent) {
    messages.push({ role: 'system', content: systemContent })
  }
  messages.push({ role: 'user', content: userContent })
  const response = await client.chat.completions.create({
    model: featherlessModel(),
    messages,
    temperature: 0.35,
  })
  const text = response.choices[0]?.message?.content
  return typeof text === 'string' ? text.trim() : null
}
