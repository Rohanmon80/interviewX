import mongoose from 'mongoose'

const responseSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    prompt: { type: String, required: true },
    questionType: { type: String, required: true },
    userAnswer: { type: String, default: '' },
    correct: { type: Boolean, required: true },
    feedback: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const examAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    language: { type: String, required: true, trim: true },
    level: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    sessionId: { type: String, required: true },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    questionsSnapshot: { type: mongoose.Schema.Types.Mixed, default: [] },
    responses: [responseSchema],
    score: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    completedAt: { type: Date },
  },
  { timestamps: true },
)

const ExamAttempt = mongoose.model('ExamAttempt', examAttemptSchema)

export default ExamAttempt
