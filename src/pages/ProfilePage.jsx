import { useEffect, useState } from 'react'
import StreakCalendar from '../components/StreakCalendar'
import { useAuth } from '../hooks/useAuth'
import { fetchMe, updatePassword, updateProfile } from '../services/authService'
import { getMyExams } from '../services/examService'

function ProfilePage() {
  const { mergeSession, user: sessionUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [exams, setExams] = useState([])
  const [form, setForm] = useState({ username: '', email: '' })
  const [pw, setPw] = useState({ current: '', next: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [me, list] = await Promise.all([fetchMe(), getMyExams()])
        setProfile(me)
        setForm({ username: me.username, email: me.email })
        setExams(list.filter((e) => e.status === 'completed'))
      } catch {
        setErr('Could not load profile.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const completedDates = exams.map((e) => e.completedAt || e.updatedAt).filter(Boolean)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      const data = await updateProfile({ username: form.username, email: form.email })
      mergeSession({ token: data.token, username: data.username, email: data.email, userId: data.userId })
      setMsg('Profile updated.')
    } catch (er) {
      setErr(er?.response?.data?.message || 'Update failed')
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      await updatePassword({ currentPassword: pw.current, newPassword: pw.next })
      setPw({ current: '', next: '' })
      setMsg('Password updated.')
    } catch (er) {
      setErr(er?.response?.data?.message || 'Password update failed')
    }
  }

  if (loading) {
    return (
      <div className="layout">
        <p className="dashboard-empty">Loading profile…</p>
      </div>
    )
  }

  return (
    <div className="profile-page layout">
      <header className="profile-hero">
        <h1 className="page-title">Profile</h1>
        <p className="page-lead">Manage your account and view your practice streak.</p>
      </header>

      {err ? <p className="error-text">{err}</p> : null}
      {msg ? <p className="profile-msg">{msg}</p> : null}

      <div className="profile-grid">
        <section className="card card-glow profile-card">
          <h2 className="section-title">Account</h2>
          <p className="profile-id mono">ID: {profile?._id || sessionUser?.userId || '—'}</p>
          <form className="profile-form" onSubmit={handleProfileSave}>
            <label className="profile-label">
              Username
              <input
                value={form.username}
                onChange={(ev) => setForm({ ...form, username: ev.target.value })}
                required
              />
            </label>
            <label className="profile-label">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(ev) => setForm({ ...form, email: ev.target.value })}
                required
              />
            </label>
            <button type="submit" className="btn-primary">
              Save profile
            </button>
          </form>
        </section>

        <section className="card card-glow profile-card">
          <h2 className="section-title">Password</h2>
          <form className="profile-form" onSubmit={handlePasswordSave}>
            <label className="profile-label">
              Current password
              <input
                type="password"
                value={pw.current}
                onChange={(ev) => setPw({ ...pw, current: ev.target.value })}
                required
              />
            </label>
            <label className="profile-label">
              New password
              <input
                type="password"
                value={pw.next}
                onChange={(ev) => setPw({ ...pw, next: ev.target.value })}
                minLength={6}
                required
              />
            </label>
            <button type="submit" className="btn-secondary">
              Update password
            </button>
          </form>
        </section>

        <section className="card card-glow profile-card profile-card-wide">
          <h2 className="section-title">Monthly streak</h2>
          <StreakCalendar completedDates={completedDates} />
        </section>
      </div>
    </div>
  )
}

export default ProfilePage
