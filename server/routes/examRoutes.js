import express from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import ExamAttempt from '../models/ExamAttempt.js'
import { buildDisplayResponses } from '../utils/examDisplayResponses.js'

const router = express.Router()

async function getOwnedExam(id, userId) {
  const exam = await ExamAttempt.findById(id)
  if (!exam) return null
  if (exam.userId.toString() !== userId) return null
  return exam
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const { language, level, sessionId, questions } = req.body
    if (!language || !level || !sessionId) {
      return res.status(400).json({ message: 'language, level, and sessionId are required' })
    }
    const exam = await ExamAttempt.create({
      userId: req.user.id,
      language: String(language).trim(),
      level,
      sessionId,
      questionsSnapshot: Array.isArray(questions) ? questions : [],
      responses: [],
      status: 'in_progress',
    })
    res.status(201).json(exam)
  } catch (err) {
    console.error('[exam] create', err.message)
    res.status(400).json({ message: err.message || 'Could not create exam' })
  }
})

router.patch('/:id/response', requireAuth, async (req, res) => {
  try {
    const exam = await getOwnedExam(req.params.id, req.user.id)
    if (!exam) return res.status(404).json({ message: 'Exam not found' })
    if (exam.status === 'completed') {
      return res.status(400).json({ message: 'Exam already completed' })
    }
    const { questionId, prompt, questionType, userAnswer, correct, feedback } = req.body
    if (!questionId || !prompt || !questionType) {
      return res.status(400).json({ message: 'questionId, prompt, questionType required' })
    }
    const entry = {
      questionId,
      prompt,
      questionType,
      userAnswer: userAnswer ?? '',
      correct: Boolean(correct),
      feedback: feedback ?? '',
      submittedAt: new Date(),
    }
    const existingIdx = exam.responses.findIndex((r) => r.questionId === questionId)
    if (existingIdx >= 0) {
      exam.responses[existingIdx] = entry
    } else {
      exam.responses.push(entry)
    }
    await exam.save()
    const plain = exam.toObject()
    res.json({ ...plain, responses: buildDisplayResponses(plain) })
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not save response' })
  }
})

router.patch('/:id/complete', requireAuth, async (req, res) => {
  try {
    const exam = await getOwnedExam(req.params.id, req.user.id)
    if (!exam) return res.status(404).json({ message: 'Exam not found' })
    const { score, correctCount, incorrectCount, strengths, weaknesses } = req.body
    exam.status = 'completed'
    exam.score = Number(score) || 0
    exam.correctCount = Number(correctCount) || 0
    exam.incorrectCount = Number(incorrectCount) || 0
    exam.strengths = strengths || []
    exam.weaknesses = weaknesses || []
    exam.completedAt = new Date()
    await exam.save()
    const plain = exam.toObject()
    res.json({ ...plain, responses: buildDisplayResponses(plain) })
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not complete exam' })
  }
})

router.get('/mine', requireAuth, async (req, res) => {
  const list = await ExamAttempt.find({ userId: req.user.id })
    .sort({ updatedAt: -1 })
    .select('-questionsSnapshot')
    .lean()
  res.json(list)
})

router.get('/:id', requireAuth, async (req, res) => {
  const exam = await ExamAttempt.findById(req.params.id).lean()
  if (!exam) return res.status(404).json({ message: 'Not found' })
  if (exam.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
  res.json({
    ...exam,
    responses: buildDisplayResponses(exam),
  })
})

export default router
