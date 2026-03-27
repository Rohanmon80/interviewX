import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.username.trim() || form.password.length < 6) {
      setError('Enter username and password (minimum 6 characters).')
      return
    }
    try {
      await signIn(form)
      navigate('/dashboard')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <main className="auth-wrapper">
      <form className="card card-glow auth-card" onSubmit={handleSubmit}>
        <h2>Login to CodeViva</h2>
        <input
          placeholder="Username"
          value={form.username}
          onChange={(event) => setForm({ ...form, username: event.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit" className="btn-primary">
          Login
        </button>
        <p>
          New user? <Link to="/signup">Create account</Link>
        </p>
      </form>
    </main>
  )
}

export default LoginPage
