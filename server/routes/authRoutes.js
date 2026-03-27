import bcrypt from 'bcryptjs'
import express from 'express'
import jwt from 'jsonwebtoken'
import { requireAuth } from '../middleware/authMiddleware.js'
import User from '../models/User.js'

const router = express.Router()

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash').lean()
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

router.patch('/profile', requireAuth, async (req, res) => {
  const { username, email } = req.body
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })

  if (email !== undefined) {
    const normalized = String(email).trim().toLowerCase()
    if (!normalized.includes('@')) return res.status(400).json({ message: 'Invalid email' })
    const taken = await User.findOne({ email: normalized, _id: { $ne: user._id } })
    if (taken) return res.status(409).json({ message: 'Email already in use' })
    user.email = normalized
  }
  if (username !== undefined) {
    const un = String(username).trim()
    if (un.length < 2) return res.status(400).json({ message: 'Username too short' })
    const taken = await User.findOne({ username: un, _id: { $ne: user._id } })
    if (taken) return res.status(409).json({ message: 'Username already taken' })
    user.username = un
  }
  await user.save()

  const token = jwt.sign(
    { id: user._id.toString(), username: user.username },
    process.env.JWT_SECRET || 'codeviva-dev-secret',
    { expiresIn: '7d' },
  )
  res.json({
    token,
    username: user.username,
    email: user.email,
    userId: user._id,
  })
})

router.patch('/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Current password and new password (6+ chars) required' })
  }
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  const ok = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'Current password incorrect' })
  user.passwordHash = await bcrypt.hash(newPassword, 10)
  await user.save()
  res.json({ message: 'Password updated' })
})

router.post('/signup', async (req, res) => {
  const { username, password } = req.body
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase()
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const existing = await User.findOne({ $or: [{ username }, { email }] })
  if (existing) return res.status(409).json({ message: 'User already exists' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ username, email, passwordHash })
  const token = jwt.sign(
    { id: user._id.toString(), username: user.username },
    process.env.JWT_SECRET || 'codeviva-dev-secret',
    { expiresIn: '7d' },
  )

  return res.status(201).json({ token, username: user.username, email: user.email, userId: user._id })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  const user = await User.findOne({ username })
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const isMatch = await bcrypt.compare(password, user.passwordHash)
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

  const token = jwt.sign(
    { id: user._id.toString(), username: user.username },
    process.env.JWT_SECRET || 'codeviva-dev-secret',
    { expiresIn: '7d' },
  )

  return res.json({ token, username: user.username, email: user.email, userId: user._id })
})

export default router
