import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyDonor, updateDonor } from '../api/donors'
import { changePassword } from '../api/auth'
import { useUserAuth } from '../context/UserAuthContext'
import DonorCard from '../components/DonorCard'

const BLOOD_TYPE_COLORS = {
  'A+': '#e53e3e', 'A-': '#c53030',
  'B+': '#3182ce', 'B-': '#2b6cb0',
  'AB+': '#805ad5', 'AB-': '#6b46c1',
  'O+': '#38a169', 'O-': '#276749',
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function Field({ label, value, fullWidth = false }) {
  return (
    <div className={`profile-field ${fullWidth ? 'full' : ''}`}>
      <span className="pf-label">{label}</span>
      <span className="pf-value">{value || '—'}</span>
    </div>
  )
}

function SuccessBanner({ message }) {
  return (
    <div className="settings-success">
      <span className="settings-success-icon">✓</span> {message}
    </div>
  )
}

export default function UserProfile() {
  const navigate              = useNavigate()
  const { user, token }       = useUserAuth()
  const [donor, setDonor]     = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [showCard, setShowCard] = useState(false)

  // ── Change password state ─────────────────────────────
  const [showPw, setShowPw] = useState(false)
  const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    getMyDonor()
      .then((r) => setDonor(r.data.data))
      .catch(() => setDonor(null))
      .finally(() => setLoading(false))
  }, [])

  async function toggleAvailability() {
    if (!donor || toggling) return
    const next = !donor.is_available
    setToggling(true)
    setDonor(d => ({ ...d, is_available: next }))
    try {
      const res = await updateDonor(donor.id, { is_available: next })
      setDonor(res.data.data)
    } catch {
      setDonor(d => ({ ...d, is_available: !next }))
    } finally {
      setToggling(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordErrors({})
    setPasswordSuccess('')
    setPasswordSaving(true)
    try {
      const res = await changePassword(passwords)
      setPasswordSuccess(res.data.message || 'Password updated successfully.')
      setPasswords({ current_password: '', password: '', password_confirmation: '' })
      setShowPw(false)
    } catch (err) {
      if (err.response?.data?.errors) setPasswordErrors(err.response.data.errors)
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) {
    return <div className="page center-page"><div className="spinner large" /></div>
  }

  const color = donor?.blood_type ? (BLOOD_TYPE_COLORS[donor.blood_type] ?? '#e53e3e') : '#e53e3e'

  if (!donor) {
    return (
      <div className="page form-page">
        <div className="up-hero" style={{ background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)' }}>
          <div className="up-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="up-info">
            <div className="up-name">{user?.name}</div>
            <div className="up-email">{user?.email}</div>
          </div>
        </div>
        <div className="profile-card" style={{ marginTop: 20 }}>
          <div className="profile-empty" style={{ padding: '48px 28px' }}>
            <div className="profile-empty-icon">🩸</div>
            <h3>No donor profile yet</h3>
            <p>Register your blood donor details to appear in the registry and help save lives.</p>
            <button className="btn btn-primary" onClick={() => navigate('/add')}>
              Register as Donor
            </button>
          </div>
        </div>

        {/* Change Password (available even without donor profile) */}
        <div className="profile-section-card" style={{ marginTop: 20 }}>
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
              {showPw ? 'Hide' : 'Change Password'}
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
    )
  }

  return (
    <div className="page form-page">

      {/* Hero */}
      <div className="up-hero" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)` }}>
        <div className="up-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div className="up-info">
          <div className="up-name">{user?.name}</div>
          <div className="up-email">{user?.email}</div>
        </div>
        <div className="up-blood-badge">{donor.blood_type}</div>
      </div>

      {/* Profile info card */}
      <div className="profile-section-card">
        <div className="psc-header">
          <div>
            <div className="psc-title">My Profile</div>
            <div className="psc-subtitle">Personal, contact and blood information</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-edit btn-sm" onClick={() => setShowCard(true)}>
              🖨 Donor Card
            </button>
            <button className="btn btn-edit btn-sm" onClick={() => navigate(`/edit/${donor.id}`)}>
              Edit Profile
            </button>
          </div>
        </div>

        <div className="profile-grid">
          <Field label="Full Name" value={donor.name} />
          <Field label="Email"     value={donor.email} />
          <Field label="Phone"     value={donor.phone} />
          <Field label="Age"       value={donor.age ? `${donor.age} years` : null} />
          <Field label="Gender"    value={donor.gender ? donor.gender.charAt(0).toUpperCase() + donor.gender.slice(1) : null} />
          <Field label="Weight"    value={donor.weight ? `${donor.weight} kg` : null} />
          <Field label="City"      value={donor.city} />
          {donor.address && <Field label="Address" value={donor.address} fullWidth />}
        </div>

        <div className="psc-divider" />

        <div className="psc-section-label">Blood Details</div>
        <div className="profile-grid">
          <div className="profile-field">
            <span className="pf-label">Blood Type</span>
            <span className="pf-value">
              <span className="blood-badge" style={{ background: color, fontSize: 15, padding: '4px 14px' }}>
                {donor.blood_type}
              </span>
            </span>
          </div>
          <div className="profile-field">
            <span className="pf-label">Donation Availability</span>
            <span className="pf-value">
              <button
                className={`ud-avail-toggle ${donor.is_available ? 'ud-avail-on' : 'ud-avail-off'} ${toggling ? 'ud-avail-busy' : ''}`}
                onClick={toggleAvailability}
                disabled={toggling}
                title="Click to toggle your donation availability"
                style={{ marginTop: 2 }}
              >
                <span className="ud-avail-track">
                  <span className="ud-avail-thumb" />
                </span>
                <span className="ud-avail-label">
                  {toggling ? 'Updating…' : donor.is_available ? 'Available to Donate' : 'Unavailable'}
                </span>
              </button>
            </span>
          </div>
          <Field label="Last Donation Date" value={formatDate(donor.last_donation_date)} />
          <Field label="City / Location"    value={donor.city} />
          {donor.notes && <Field label="Notes" value={donor.notes} fullWidth />}
        </div>
      </div>

      {/* Change password card */}
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
            {showPw ? 'Hide' : 'Change Password'}
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

      {showCard && (
        <DonorCard donor={donor} user={user} onClose={() => setShowCard(false)} />
      )}

    </div>
  )
}
