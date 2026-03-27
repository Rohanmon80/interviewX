import api from './api'

export async function startInterviewSession(level, questionCount = 5) {
  const { data } = await api.post('/interview/session', { level, questionCount })
  return data
}

export async function evaluateAnswer(question, answer) {
  const payload =
    question.type === 'code' ? { question, code: answer } : { question, answer }
  const { data } = await api.post('/interview/evaluate', payload)
  return data
}
