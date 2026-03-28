import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function SignupPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.username.trim() || !form.email.includes('@') || form.password.length < 6) {
      setError('Provide valid username, email, and 6+ character password.')
      return
    }
    try {
      await signUp(form)
      navigate('/dashboard')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <main className="auth-wrapper">
      <form className="card card-glow auth-card" onSubmit={handleSubmit}>
        <h2>Create interviewX Account</h2>
        <input
          placeholder="Username"
          value={form.username}
          onChange={(event) => setForm({ ...form, username: event.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit" className="btn-primary">
          Signup
        </button>
        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  )
}

export default SignupPage
