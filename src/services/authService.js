import api from './api'

export async function loginUser(payload) {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export async function signupUser(payload) {
  const { data } = await api.post('/auth/signup', payload)
  return data
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.patch('/auth/profile', payload)
  return data
}

export async function updatePassword(payload) {
  const { data } = await api.patch('/auth/password', payload)
  return data
}
