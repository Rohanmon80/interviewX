import mongoose from 'mongoose'

function atlasHint(message) {
  const lower = message.toLowerCase()
  if (
    lower.includes('whitelist') ||
    lower.includes('serverselection') ||
    lower.includes('ec50057') ||
    lower.includes('timed out')
  ) {
    return [
      'Atlas blocked the connection (network). In MongoDB Atlas:',
      '  1. Network Access → Add IP Address → “Add Current IP Address”,',
      '     or for local/dev only: 0.0.0.0/0 (allow from anywhere).',
      '  2. Wait ~1–2 minutes after saving, then run npm run server again.',
      'If the password has @ # / etc., URL-encode it inside MONGO_URI.',
    ].join('\n')
  }
  return ''
}

export async function connectDatabase() {
  const raw = process.env.MONGO_URI
  if (!raw || !String(raw).trim()) {
    throw new Error(
      'MONGO_URI is missing in .env. Use key exactly: MONGO_URI=... (no quotes needed unless value has spaces).',
    )
  }

  const mongoUri = String(raw).trim().replace(/^\uFEFF/, '')
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    })
    console.log('MongoDB connected')
  } catch (err) {
    const msg = err?.message || String(err)
    const extra = atlasHint(msg)
    throw new Error(extra ? `${msg}\n\n${extra}` : msg)
  }
}
