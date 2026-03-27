import express from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import Result from '../models/Result.js'

const router = express.Router()

router.post('/', requireAuth, async (req, res) => {
  try {
    const { score, correctCount, incorrectCount, strengths, weaknesses, level, sessionId } = req.body
    const result = await Result.create({
      userId: req.user.id,
      level: level || 'Medium',
      sessionId: sessionId || '',
      score,
      correctCount,
      incorrectCount,
      strengths: strengths || [],
      weaknesses: weaknesses || [],
    })
    res.status(201).json(result)
  } catch (err) {
    console.error('[results] create failed', err.message)
    res.status(400).json({ message: err.message || 'Could not save result' })
  }
})

router.get('/mine', requireAuth, async (req, res) => {
  const history = await Result.find({ userId: req.user.id }).sort({ createdAt: 1 }).lean()
  res.json(history)
})

export default router
