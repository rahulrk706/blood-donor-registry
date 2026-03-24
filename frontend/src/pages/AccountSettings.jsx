import { useState } from 'react'
import { updateProfile, changePassword } from '../api/auth'
import { useUserAuth } from '../context/UserAuthContext'

function SuccessBanner({ message }) {
  return (
    <div className="settings-success">
      <span className="settings-success-icon">✓</span> {message}
    </div>
  )
}

export default function AccountSettings() {
  const { user, token, saveSession } = useUserAuth()

  // ── Update profile state ──────────────────────────────
  const [profile, setProfile]           = useState({ name: user?.name || '', email: user?.email || '' })
  const [profileErrors, setProfileErrors] = useState({})
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileSaving, setProfileSaving]   = useState(false)

  // ── Change password state ─────────────────────────────
  const [passwords, setPasswords]           = useState({ current_password: '', password: '', password_confirmation: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordSaving, setPasswordSaving]   = useState(false)
  const [showPw, setShowPw]                   = useState(false)

  // ── Handlers ──────────────────────────────────────────
  async function handleProfileSubmit(e) {
    e.preventDefault()
    setProfileErrors({})
    setProfileSuccess('')
    setProfileSaving(true)
    try {
      const res = await updateProfile(profile)
      saveSession(token, res.data.user)
      setProfileSuccess('Profile updated successfully.')
    } catch (err) {
      if (err.response?.data?.errors) setProfileErrors(err.response.data.errors)
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordErrors({})
    setPasswordSuccess('')
    setPasswordSaving(true)
    try {
      const res = await changePassword(passwords)
      setPasswordSuccess(res.data.message)
      setPasswords({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      if (err.response?.data?.errors) setPasswordErrors(err.response.data.errors)
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="page form-page">
      <div className="settings-page">

        <div className="settings-header">
          <h2 className="settings-title">Account Settings</h2>
          <p className="settings-subtitle">Manage your login name, email and password</p>
        </div>

        {/* ── Update name / email ── */}
        <div className="profile-section-card">
          <div className="psc-header">
            <div>
              <div className="psc-title">Personal Information</div>
              <div className="psc-subtitle">Update your display name and email address</div>
            </div>
          </div>

          {profileSuccess && <SuccessBanner message={profileSuccess} />}

          <form onSubmit={handleProfileSubmit} className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  className={`form-input ${profileErrors.name ? 'input-error' : ''}`}
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                />
                {profileErrors.name && <div className="field-error">{profileErrors.name[0]}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className={`form-input ${profileErrors.email ? 'input-error' : ''}`}
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                />
                {profileErrors.email && <div className="field-error">{profileErrors.email[0]}</div>}
              </div>
            </div>

            <div className="settings-form-footer">
              <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Change password ── */}
        <div className="profile-section-card">
          <div className="psc-header">
            <div>
              <div className="psc-title">Change Password</div>
              <div className="psc-subtitle">Choose a strong password with at least 8 characters</div>
            </div>
            <button
              type="button"
              className="btn btn-edit btn-sm"
              onClick={() => setShowPw(v => !v)}
            >
              {showPw ? 'Hide' : 'Show'} Fields
            </button>
          </div>

          {passwordSuccess && <SuccessBanner message={passwordSuccess} />}

          {showPw && (
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <div className="form-group">
                <label className="form-label">Current Password <span className="required">*</span></label>
                <input
                  type="password"
                  className={`form-input ${passwordErrors.current_password ? 'input-error' : ''}`}
                  value={passwords.current_password}
                  onChange={e => setPasswords(p => ({ ...p, current_password: e.target.value }))}
                  placeholder="Enter current password"
                />
                {passwordErrors.current_password && <div className="field-error">{passwordErrors.current_password[0]}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Password <span className="required">*</span></label>
                  <input
                    type="password"
                    className={`form-input ${passwordErrors.password ? 'input-error' : ''}`}
                    value={passwords.password}
                    onChange={e => setPasswords(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min 8 characters"
                  />
                  {passwordErrors.password && <div className="field-error">{passwordErrors.password[0]}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password <span className="required">*</span></label>
                  <input
                    type="password"
                    className={`form-input ${passwordErrors.password_confirmation ? 'input-error' : ''}`}
                    value={passwords.password_confirmation}
                    onChange={e => setPasswords(p => ({ ...p, password_confirmation: e.target.value }))}
                    placeholder="Repeat new password"
                  />
                  {passwordErrors.password_confirmation && <div className="field-error">{passwordErrors.password_confirmation[0]}</div>}
                </div>
              </div>

              <div className="settings-form-footer">
                <button type="submit" className="btn btn-primary" disabled={passwordSaving}>
                  {passwordSaving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
