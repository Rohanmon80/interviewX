import { GoogleGenerativeAI } from '@google/generative-ai'
import { evaluateCodeByEvaluator, evaluateTextKeywords } from './codeEvaluators.js'

export async function evaluateQuestionPayload(question, { answer, code }) {
  if (!question || typeof question !== 'object') {
    return { correct: false, output: '', feedback: 'Invalid question payload.' }
  }

  if (question.type === 'code') {
    const submitted = String(code || answer || '')
    const evaluator = question.codeEvaluator || 'sum_natural'
    const ok = evaluateCodeByEvaluator(evaluator, submitted)
    return {
      correct: ok,
      output: ok ? String(question.expectedOutput || 'ok') : 'Incorrect output',
      feedback: ok
        ? 'Your code matches the expected pattern for this task.'
        : 'Refine your solution so it follows the required function name and logic.',
    }
  }

  const textAnswer = String(answer || '').trim()
  if (!textAnswer) {
    return { correct: false, output: '', feedback: 'Answer is required.' }
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.SECRET_KEY
  const keywords = question.expectedKeywords || []

  if (apiKey && keywords.length > 0) {
    try {
      const client = new GoogleGenerativeAI(apiKey)
      const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const prompt = `Grade this interview answer briefly.
Question: ${question.prompt}
Expected concepts (keywords): ${keywords.join(', ')}
Candidate answer: ${textAnswer}
Return ONLY valid JSON: {"correct":true/false,"feedback":"short string"}`
      const output = await model.generateContent(prompt)
      const raw = output.response.text().replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(raw)
      return {
        correct: Boolean(parsed.correct),
        output: '',
        feedback: parsed.feedback || 'Graded.',
      }
    } catch {
      // fall through
    }
  }

  const fallback = evaluateTextKeywords(question, textAnswer)
  return { correct: fallback.correct, output: '', feedback: fallback.feedback }
}
