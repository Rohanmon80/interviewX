import express from 'express'
import { evaluateQuestionPayload } from '../utils/evaluateQuestion.js'
import { buildSession } from '../utils/sessionGenerator.js'

const router = express.Router()

router.post('/session', async (req, res) => {
  try {
    const { level, questionCount } = req.body
    if (!level) return res.status(400).json({ message: 'level is required (Easy, Medium, Hard)' })
    const session = await buildSession(level, {
      questionCount: Math.min(Number(questionCount) || 5, 10),
      useAiExtras: true,
    })
    res.json(session)
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not build session' })
  }
})

router.post('/evaluate', async (req, res) => {
  const { question, answer, code } = req.body
  if (!question) return res.status(400).json({ message: 'question object is required' })
  try {
    const result = await evaluateQuestionPayload(question, { answer, code })
    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Evaluation failed' })
  }
})

export default router
