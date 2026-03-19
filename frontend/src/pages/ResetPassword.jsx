import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [form, setForm] = useState({ password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((err) => ({ ...err, [e.target.name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await resetPassword({ token, email, ...form })
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {})
      } else {
        setErrors({ password: ['Something went wrong. Please try again.'] })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">🩸</div>
            <h1 className="login-title">Invalid Link</h1>
            <p className="login-subtitle">This password reset link is invalid or has expired.</p>
          </div>
          <button className="btn btn-primary login-btn" onClick={() => navigate('/login')}>
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="success-icon" style={{ fontSize: 40, marginBottom: 8 }}>✓</div>
            <h1 className="login-title">Password Reset!</h1>
            <p className="login-subtitle">Your password has been updated. Redirecting to sign in…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🩸</div>
          <h1 className="login-title">Reset Password</h1>
          <p className="login-subtitle">Enter a new password for <strong>{email}</strong></p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="login-form">
          <div className="form-group">
            <label>New Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="Min. 8 characters" autoFocus
              className={errors.password ? 'input-error' : ''} />
            {errors.password && <span className="error-msg">{errors.password[0]}</span>}
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" name="password_confirmation" value={form.password_confirmation}
              onChange={handleChange} placeholder="Repeat password"
              className={errors.password_confirmation ? 'input-error' : ''} />
            {errors.password_confirmation && <span className="error-msg">{errors.password_confirmation[0]}</span>}
          </div>

          {errors.email && <p className="error-msg">{errors.email[0]}</p>}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
