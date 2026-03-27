import { GoogleGenerativeAI } from '@google/generative-ai'
import { questionBank, LEVELS } from './questionBank.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomId() {
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

async function tryGeminiExtras(level, count) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.SECRET_KEY
  if (!apiKey || count < 1) return []

  try {
    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `Generate ${count} short Python interview ${level} difficulty questions.
Mix conceptual (type "text") and small coding (type "code") tasks.
Return ONLY valid JSON array, no markdown. Each item:
{"type":"text"|"code","prompt":"string","expectedKeywords":["k1","k2"] OR for code use "codeEvaluator":"sum_natural"|"is_even"|"reverse_string" and "starterCode":"..."}
For code questions pick codeEvaluator only from: sum_natural, is_even, reverse_string, factorial, max_in_list, count_vowels, fibonacci, binary_search — match prompt to evaluator.`
    const out = await model.generateContent(prompt)
    const text = out.response.text().replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, count).map((item, i) => ({
      ...item,
      bankId: `ai-${level}-${i}`,
      difficulty: level,
      source: 'gemini',
      prompt: item.prompt,
      type: item.type === 'code' ? 'code' : 'text',
      expectedKeywords: item.expectedKeywords || ['concept'],
      starterCode: item.starterCode || '# your code\n',
      codeEvaluator: item.codeEvaluator || 'sum_natural',
    }))
  } catch {
    return []
  }
}

export async function buildSession(level, options = {}) {
  const { questionCount = 5, useAiExtras = true } = options
  if (!LEVELS.includes(level)) {
    throw new Error(`Invalid level. Use one of: ${LEVELS.join(', ')}`)
  }

  const pool = questionBank[level] || []
  const picked = shuffle(pool).slice(0, questionCount)

  let extras = []
  if (useAiExtras) {
    extras = await tryGeminiExtras(level, 1)
  }

  const merged = shuffle([...picked, ...extras]).slice(0, questionCount)

  const sessionId = `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

  const questions = merged.map((q) => ({
    ...q,
    id: randomId(),
    sessionId,
    difficulty: level,
  }))

  return { sessionId, level, questions }
}
