import { useCallback, useMemo, useState } from 'react'
import { loginUser, signupUser } from '../services/authService'
import { AuthContext } from './AuthStore'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('codeviva_user')
    return saved ? JSON.parse(saved) : null
  })

  const signIn = async (formData) => {
    const response = await loginUser(formData)
    localStorage.setItem('codeviva_user', JSON.stringify(response))
    setUser(response)
    return response
  }

  const signUp = async (formData) => {
    const response = await signupUser(formData)
    localStorage.setItem('codeviva_user', JSON.stringify(response))
    setUser(response)
    return response
  }

  const signOut = () => {
    localStorage.removeItem('codeviva_user')
    setUser(null)
  }

  const mergeSession = useCallback((partial) => {
    setUser((prev) => {
      const base = prev || {}
      const next = { ...base, ...partial }
      localStorage.setItem('codeviva_user', JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ user, signIn, signUp, signOut, mergeSession, isAuthenticated: Boolean(user) }),
    [user, mergeSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
