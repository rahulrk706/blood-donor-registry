import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const { login, authed } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from ?? '/admin/inbox'

  // Hooks must always be called before any early return
  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in — go straight to inbox
  if (authed) return <Navigate to="/admin/inbox" replace />

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const ok = login(form.username, form.password)
    if (ok) {
      navigate(from, { replace: true })
    } else {
      setError('Invalid username or password.')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🩸</div>
          <h1 className="login-title">Admin Access</h1>
          <p className="login-subtitle">Sign in to manage the inbox</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="login-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="admin"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
