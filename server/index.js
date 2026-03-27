import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { connectDatabase } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import examRoutes from './routes/examRoutes.js'
import interviewRoutes from './routes/interviewRoutes.js'
import resultRoutes from './routes/resultRoutes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env')
const envResult = dotenv.config({ path: envPath })
if (envResult.error) {
  if (!existsSync(envPath)) {
    console.warn(`[env] No file at ${envPath} — create .env next to package.json`)
  } else {
    console.warn(`[env] Could not parse .env: ${envResult.error.message}`)
  }
} else if (envResult.parsed) {
  console.log(`[env] Loaded ${Object.keys(envResult.parsed).length} variable(s) from ${envPath}`)
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/interview', interviewRoutes)
app.use('/api/exams', examRoutes)
app.use('/api/results', resultRoutes)

app.use((err, _req, res) => {
  console.error(err)
  res.status(500).json({ message: 'Server error' })
})

const port = process.env.PORT || 5000
connectDatabase()
  .then(() => {
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  })
