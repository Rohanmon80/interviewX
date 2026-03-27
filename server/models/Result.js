import mongoose from 'mongoose'

const resultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    level: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    sessionId: { type: String, default: '' },
    score: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    incorrectCount: { type: Number, required: true },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
  },
  { timestamps: true },
)

const Result = mongoose.model('Result', resultSchema)

export default Result
