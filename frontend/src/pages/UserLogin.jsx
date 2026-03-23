import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { loginUser, registerUser, forgotPassword } from '../api/auth'
import { useUserAuth } from '../context/UserAuthContext'

export default function UserLogin() {
  const { saveSession, isLoggedIn } = useUserAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from     = location.state?.from ?? '/'

  const [tab, setTab] = useState(location.state?.tab ?? 'login')

  // Login state
  const [loginForm, setLoginForm]     = useState({ email: '', password: '' })
  const [loginErrors, setLoginErrors] = useState({})
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [regForm, setRegForm]     = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [regErrors, setRegErrors] = useState({})
  const [regLoading, setRegLoading] = useState(false)

  // Forgot password state
  const [fpEmail, setFpEmail]     = useState('')
  const [fpError, setFpError]     = useState('')
  const [fpLoading, setFpLoading] = useState(false)
  const [fpSent, setFpSent]       = useState(false)

  async function handleForgotSubmit(e) {
    e.preventDefault()
    setFpLoading(true)
    setFpError('')
    try {
      await forgotPassword({ email: fpEmail })
      setFpSent(true)
    } catch (err) {
      setFpError(err.response?.data?.errors?.email?.[0] ?? 'Something went wrong. Please try again.')
    } finally {
      setFpLoading(false)
    }
  }

  if (isLoggedIn) return <Navigate to="/" replace />

  // ── Login ──
  function handleLoginChange(e) {
    setLoginForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setLoginErrors((err) => ({ ...err, [e.target.name]: undefined }))
  }

  async function handleLoginSubmit(e) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginErrors({})
    try {
      const res = await loginUser(loginForm)
      saveSession(res.data.token, res.data.user)
      navigate(from, { replace: true })
    } catch (err) {
      if (err.response?.status === 422) {
        setLoginErrors(err.response.data.errors ?? {})
      } else {
        setLoginErrors({ email: ['Invalid email or password.'] })
      }
    } finally {
      setLoginLoading(false)
    }
  }

  // ── Register ──
  function handleRegChange(e) {
    setRegForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setRegErrors((err) => ({ ...err, [e.target.name]: undefined }))
  }

  async function handleRegSubmit(e) {
    e.preventDefault()
    setRegLoading(true)
    setRegErrors({})
    try {
      const res = await registerUser(regForm)
      saveSession(res.data.token, res.data.user)
      navigate('/add', { replace: true })
    } catch (err) {
      if (err.response?.status === 422) {
        setRegErrors(err.response.data.errors ?? {})
      } else {
        setRegErrors({ name: ['Something went wrong. Please try again.'] })
      }
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card login-card-wide">
        <div className="login-header">
          <div className="login-logo">🩸</div>
          <h1 className="login-title">Blood Donor Registry</h1>
          <p className="login-subtitle">Sign in or create an account to manage your donor profile</p>
        </div>

        {/* Tab switcher */}
        <div className="login-tabs">
          <button className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
            Sign In
          </button>
          <button className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
            Register as Donor
          </button>
        </div>

        {tab === 'forgot' && (
          <button className="login-back-btn" onClick={() => { setTab('login'); setFpSent(false); setFpError(''); setFpEmail('') }}>
            ← Back to Sign In
          </button>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} noValidate className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={loginForm.email} onChange={handleLoginChange}
                placeholder="you@example.com" autoComplete="email" autoFocus
                className={loginErrors.email ? 'input-error' : ''} />
              {loginErrors.email && <span className="error-msg">{loginErrors.email[0]}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={loginForm.password} onChange={handleLoginChange}
                placeholder="••••••••" autoComplete="current-password"
                className={loginErrors.password ? 'input-error' : ''} />
              {loginErrors.password && <span className="error-msg">{loginErrors.password[0]}</span>}
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loginLoading}>
              {loginLoading ? 'Signing in…' : 'Sign In'}
            </button>

            <p className="login-footer-text">
              <button type="button" className="login-link-btn" onClick={() => { setTab('forgot'); setFpSent(false); setFpError(''); setFpEmail('') }}>
                Forgot your password?
              </button>
            </p>

            <p className="login-footer-text">
              New donor?{' '}
              <button type="button" className="login-link-btn" onClick={() => setTab('register')}>
                Create an account
              </button>
            </p>
          </form>
        ) : tab === 'register' ? (
          <form onSubmit={handleRegSubmit} noValidate className="login-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={regForm.name} onChange={handleRegChange}
                placeholder="Jane Doe" autoFocus
                className={regErrors.name ? 'input-error' : ''} />
              {regErrors.name && <span className="error-msg">{regErrors.name[0]}</span>}
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={regForm.email} onChange={handleRegChange}
                placeholder="you@example.com"
                className={regErrors.email ? 'input-error' : ''} />
              {regErrors.email && <span className="error-msg">{regErrors.email[0]}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={regForm.password} onChange={handleRegChange}
                placeholder="Min. 8 characters"
                className={regErrors.password ? 'input-error' : ''} />
              {regErrors.password && <span className="error-msg">{regErrors.password[0]}</span>}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="password_confirmation" value={regForm.password_confirmation}
                onChange={handleRegChange} placeholder="Repeat password"
                className={regErrors.password_confirmation ? 'input-error' : ''} />
              {regErrors.password_confirmation && <span className="error-msg">{regErrors.password_confirmation[0]}</span>}
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={regLoading}>
              {regLoading ? 'Creating account…' : 'Create Account & Continue'}
            </button>

            <p className="login-footer-text">
              Already have an account?{' '}
              <button type="button" className="login-link-btn" onClick={() => setTab('login')}>
                Sign in
              </button>
            </p>
          </form>
        ) : (
          /* ── Forgot password ── */
          fpSent ? (
            <div className="fp-sent">
              <div className="success-icon" style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
              <h3>Check your email</h3>
              <p>A password reset link has been sent to <strong>{fpEmail}</strong>.</p>
              <p className="login-footer-text" style={{ marginTop: 16 }}>
                <button type="button" className="login-link-btn" onClick={() => { setTab('login'); setFpSent(false) }}>
                  Back to Sign In
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} noValidate className="login-form">
              <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 16 }}>
                Enter your account email and we will send you a link to reset your password.
              </p>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={fpEmail} onChange={(e) => { setFpEmail(e.target.value); setFpError('') }}
                  placeholder="you@example.com" autoFocus
                  className={fpError ? 'input-error' : ''} />
                {fpError && <span className="error-msg">{fpError}</span>}
              </div>
              <button type="submit" className="btn btn-primary login-btn" disabled={fpLoading}>
                {fpLoading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  )
}
