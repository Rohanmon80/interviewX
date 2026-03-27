import api from './api'

export async function createExam(payload) {
  const { data } = await api.post('/exams', payload)
  return data
}

export async function appendExamResponse(examId, payload) {
  const { data } = await api.patch(`/exams/${examId}/response`, payload)
  return data
}

export async function completeExam(examId, payload) {
  const { data } = await api.patch(`/exams/${examId}/complete`, payload)
  return data
}

export async function getMyExams() {
  const { data } = await api.get('/exams/mine')
  return data
}

export async function getExamById(examId) {
  const { data } = await api.get(`/exams/${examId}`)
  return data
}
