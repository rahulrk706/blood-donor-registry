import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getMyDonor } from '../api/donors'
import { useUserAuth } from '../context/UserAuthContext'

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

export default function UserProfile() {
  const navigate           = useNavigate()
  const [searchParams]     = useSearchParams()
  const { user }           = useUserAuth()
  const [donor, setDonor]  = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]      = useState(searchParams.get('tab') === 'blood' ? 'blood' : 'profile')

  useEffect(() => {
    getMyDonor()
      .then((r) => setDonor(r.data.data))
      .catch(() => setDonor(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="page center-page"><div className="spinner large" /></div>
  }

  const color = donor?.blood_type ? (BLOOD_TYPE_COLORS[donor.blood_type] ?? '#e53e3e') : '#e53e3e'

  // No donor record yet
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

      {/* ── Tab switcher ── */}
      <div className="profile-tabs">
        <button className={`profile-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
          My Profile
        </button>
        <button className={`profile-tab ${tab === 'blood' ? 'active' : ''}`} onClick={() => setTab('blood')}>
          Blood Details
        </button>
      </div>

      {tab === 'profile' ? (
        <div className="profile-section-card">
          <div className="psc-header">
            <div>
              <div className="psc-title">My Profile</div>
              <div className="psc-subtitle">Personal and contact information</div>
            </div>
            <button className="btn btn-edit btn-sm" onClick={() => navigate(`/edit/${donor.id}`)}>
              Edit Profile
            </button>
          </div>

          <div className="profile-grid">
            <Field label="Full Name"   value={donor.name} />
            <Field label="Email"       value={donor.email} />
            <Field label="Phone"       value={donor.phone} />
            <Field label="Age"         value={donor.age ? `${donor.age} years` : null} />
            <Field label="Gender"      value={donor.gender ? donor.gender.charAt(0).toUpperCase() + donor.gender.slice(1) : null} />
            <Field label="Weight"      value={donor.weight ? `${donor.weight} kg` : null} />
            <Field label="City"        value={donor.city} />
            {donor.address && <Field label="Address" value={donor.address} fullWidth />}
          </div>
        </div>
      ) : (
        <div className="profile-section-card">
          <div className="psc-header">
            <div>
              <div className="psc-title">Blood Details</div>
              <div className="psc-subtitle">Blood type and donation history</div>
            </div>
            <button className="btn btn-edit btn-sm" onClick={() => navigate(`/edit/${donor.id}`)}>
              Edit Blood Details
            </button>
          </div>

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
              <span className="pf-label">Donation Status</span>
              <span className="pf-value">
                <span className={`status-badge ${donor.is_available ? 'available' : 'unavailable'}`}>
                  {donor.is_available ? 'Available to Donate' : 'Currently Unavailable'}
                </span>
              </span>
            </div>

            <Field label="Last Donation Date" value={formatDate(donor.last_donation_date)} />
            <Field label="City / Location"    value={donor.city} />

            {donor.notes && <Field label="Notes" value={donor.notes} fullWidth />}
          </div>
        </div>
      )}

    </div>
  )
}
