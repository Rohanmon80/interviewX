import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <NavLink to="/dashboard" className="brand-link" title="interviewX — Connecting talent with opportunity.">
        <img
          src="/logo-interviewx.png"
          alt="interviewX — Connecting talent with opportunity."
          className="brand-logo"
          width={180}
          height={48}
        />
      </NavLink>
      <nav className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          Dashboard
        </NavLink>
        <NavLink to="/interview" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Interview
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          History
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Profile
        </NavLink>
      </nav>
      <div className="nav-user">
        <span className="nav-username">{user?.username}</span>
        <button type="button" className="nav-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}

export default Navbar
