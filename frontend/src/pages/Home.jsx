import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserAuth } from '../context/UserAuthContext'
import { getMyDonor, updateDonor } from '../api/donors'
import { getDonations } from '../api/donations'
import { computeBadges } from '../utils/badges'

// ── Shared constants ────────────────────────────────────
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const BLOOD_TYPE_COLORS = {
  'A+': '#e53e3e', 'A-': '#c53030',
  'B+': '#3182ce', 'B-': '#2b6cb0',
  'AB+': '#805ad5', 'AB-': '#6b46c1',
  'O+': '#38a169', 'O-': '#276749',
}

const DONATION_TYPE_COLORS = {
  whole_blood: '#e53e3e', plasma: '#3182ce',
  platelets: '#805ad5', double_red_cells: '#dd6b20',
}
const DONATION_TYPE_LABELS = {
  whole_blood: 'Whole Blood', plasma: 'Plasma',
  platelets: 'Platelets', double_red_cells: 'Double Red Cells',
}

const COOLDOWN_DAYS = { whole_blood: 56, plasma: 28, platelets: 7, double_red_cells: 112 }

const STATS = [
  { value: '4.5M', label: 'Units needed daily' },
  { value: '38%',  label: 'People eligible to donate' },
  { value: '1 in 7', label: 'Hospital patients need blood' },
  { value: '3 lives', label: 'Saved per donation' },
]

// ── Helpers ─────────────────────────────────────────────
function daysSince(dateStr) {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function daysUntilEligible(donation) {
  if (!donation) return null
  const cooldown = COOLDOWN_DAYS[donation.donation_type] ?? 56
  const eligible = new Date(donation.donation_date)
  eligible.setDate(eligible.getDate() + cooldown)
  const diff = Math.ceil((eligible - Date.now()) / 86400000)
  return Math.max(0, diff)
}

function fmtShort(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Public home ─────────────────────────────────────────
function PublicHome() {
  const navigate = useNavigate()
  const { isLoggedIn } = useUserAuth()
  const [hasDonor, setHasDonor] = useState(null) // null = loading, false = no profile, true = has profile

  useEffect(() => {
    if (!isLoggedIn) { setHasDonor(false); return }
    getMyDonor()
      .then(() => setHasDonor(true))
      .catch(() => setHasDonor(false))
  }, [isLoggedIn])

  const showRegister = !isLoggedIn || hasDonor === false

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🩸 Blood Donor Registry</div>
          <h1 className="hero-title">
            Every Drop Counts.<br />
            <span className="hero-highlight">Be a Lifesaver.</span>
          </h1>
          <p className="hero-desc">
            Connect blood donors with those in need. Register as a donor or
            find available donors in your area — quickly and easily.
          </p>
          <div className="hero-actions">
            {showRegister && (
              <button className="btn btn-hero-primary" onClick={() => navigate('/add')}>
                🩸 Register as Donor
              </button>
            )}
            <button className="btn btn-hero-secondary" onClick={() => navigate('/donors')}>
              Search Donors →
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="blood-type-wheel">
            {BLOOD_TYPES.map((bt, i) => (
              <div key={bt} className="bt-cell" style={{ '--i': i }}>{bt}</div>
            ))}
            <div className="bt-center">🩸</div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        {STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="cards-section">
        <div className="feature-card" onClick={() => navigate('/donors')}>
          <div className="feature-icon" style={{ background: '#ebf8ff', color: '#3182ce' }}>🔍</div>
          <h2 className="feature-title">Find a Donor</h2>
          <p className="feature-desc">
            Browse the full registry. Filter by blood type, city, and availability.
          </p>
          <span className="feature-link">View donor listing →</span>
        </div>
        {showRegister && (
          <div className="feature-card" onClick={() => navigate('/add')}>
            <div className="feature-icon" style={{ background: '#fff5f5', color: '#e53e3e' }}>📋</div>
            <h2 className="feature-title">Become a Donor</h2>
            <p className="feature-desc">
              Join the registry in minutes. Fill in your details and blood type to help save lives.
            </p>
            <span className="feature-link">Register now →</span>
          </div>
        )}
      </section>

      <section className="blood-info-section">
        <h2 className="section-heading">Blood Type Compatibility</h2>
        <div className="blood-type-list">
          {[
            { type: 'O-',  label: 'Universal Donor',     color: '#276749', desc: 'Can donate to all blood types' },
            { type: 'AB+', label: 'Universal Recipient',  color: '#6b46c1', desc: 'Can receive from all blood types' },
            { type: 'O+',  label: 'Most Common',          color: '#38a169', desc: '~38% of the population' },
            { type: 'AB-', label: 'Rarest Type',          color: '#805ad5', desc: 'Only ~1% of the population' },
          ].map((item) => (
            <div key={item.type} className="blood-info-card">
              <div className="bi-badge" style={{ background: item.color }}>{item.type}</div>
              <div className="bi-label">{item.label}</div>
              <div className="bi-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ── Logged-in dashboard ─────────────────────────────────
function UserDashboard({ user }) {
  const navigate = useNavigate()
  const [donor,     setDonor]     = useState(undefined)
  const [donations, setDonations] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [toggling,  setToggling]  = useState(false)

  useEffect(() => {
    Promise.all([
      getMyDonor().then(r => r.data.data).catch(() => null),
      getDonations().then(r => r.data.data).catch(() => []),
    ]).then(([d, dn]) => { setDonor(d); setDonations(dn) })
      .finally(() => setLoading(false))
  }, [])

  async function toggleAvailability() {
    if (!donor || toggling) return
    const next = !donor.is_available
    setToggling(true)
    setDonor(d => ({ ...d, is_available: next }))           // optimistic
    try {
      const res = await updateDonor(donor.id, { is_available: next })
      setDonor(res.data.data)
    } catch {
      setDonor(d => ({ ...d, is_available: !next }))        // revert on error
    } finally {
      setToggling(false)
    }
  }

  const color        = donor?.blood_type ? (BLOOD_TYPE_COLORS[donor.blood_type] ?? '#e53e3e') : '#e53e3e'
  const latest       = donations[0]
  const sinceD       = latest ? daysSince(latest.donation_date) : null
  const daysLeft     = daysUntilEligible(latest)
  const eligible     = daysLeft === 0
  const badges       = computeBadges(donations)
  const earnedBadges = badges.filter(b => b.earned)
  const recent       = donations.slice(0, 3)

  const QUICK_ACTIONS = [
    { icon: '💉', label: 'Log Donation',   sub: 'Record a new donation',         path: '/donations',    color: '#e53e3e' },
    { icon: '👤', label: 'My Profile',     sub: 'View & edit your details',       path: '/my-profile',   color: '#3182ce' },
    { icon: '🏆', label: 'Achievements',   sub: `${earnedBadges.length} badges earned`, path: '/achievements', color: '#805ad5' },
    { icon: '🔍', label: 'Browse Donors',  sub: 'Find donors near you',           path: '/donors',       color: '#38a169' },
  ]

  return (
    <div className="home ud-home">

      {/* ── Greeting hero ── */}
      <section className="ud-hero" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)` }}>
        <div className="ud-hero-left">
          <div className="ud-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="ud-greeting">Welcome back,</div>
            <div className="ud-name">{user?.name}</div>
            <div className="ud-email">{user?.email}</div>
          </div>
        </div>
        <div className="ud-hero-right">
          {donor?.blood_type && (
            <div className="ud-blood-badge">{donor.blood_type}</div>
          )}
          {donor && (
            <button
              className={`ud-avail-toggle ${donor.is_available ? 'ud-avail-on' : 'ud-avail-off'} ${toggling ? 'ud-avail-busy' : ''}`}
              onClick={toggleAvailability}
              disabled={toggling}
              title="Click to toggle your donation availability"
            >
              <span className="ud-avail-track">
                <span className="ud-avail-thumb" />
              </span>
              <span className="ud-avail-label">
                {toggling ? 'Updating…' : donor.is_available ? 'Available to Donate' : 'Unavailable'}
              </span>
            </button>
          )}
        </div>
      </section>

      {loading ? (
        <div className="center-page" style={{ minHeight: 200 }}><div className="spinner large" /></div>
      ) : (
        <>
          {/* ── Eligibility banner ── */}
          {donor && (
            <div className={`ud-elig-banner ${eligible ? 'ud-elig-green' : latest ? 'ud-elig-amber' : 'ud-elig-neutral'}`}>
              <div className="ud-elig-icon">{eligible ? '✓' : latest ? '⏳' : '💉'}</div>
              <div className="ud-elig-text">
                {!latest
                  ? 'No donations logged yet — log your first donation to start tracking.'
                  : eligible
                  ? 'You are eligible to donate blood right now!'
                  : `Next eligible to donate in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} · Last donated ${fmtShort(latest.donation_date)}`}
              </div>
              <button
                className="ud-elig-btn"
                onClick={() => navigate(eligible ? '/donations' : '/donations')}
              >
                {eligible ? 'Log Donation →' : 'View Details →'}
              </button>
            </div>
          )}

          {/* ── Stat strip ── */}
          {donor && (
            <div className="ud-stats">
              <div className="ud-stat">
                <div className="ud-stat-val">{donations.length}</div>
                <div className="ud-stat-lbl">Total Donations</div>
              </div>
              <div className="ud-stat">
                <div className="ud-stat-val">{sinceD !== null ? sinceD : '—'}</div>
                <div className="ud-stat-lbl">Days Since Last</div>
              </div>
              <div className="ud-stat">
                <div className="ud-stat-val" style={{ color: eligible ? '#38a169' : '#dd6b20' }}>
                  {!latest ? '—' : eligible ? 'Now' : daysLeft}
                </div>
                <div className="ud-stat-lbl">Days Until Eligible</div>
              </div>
              <div className="ud-stat">
                <div className="ud-stat-val" style={{ color: '#e53e3e' }}>{donations.length * 3}</div>
                <div className="ud-stat-lbl">Lives Helped</div>
              </div>
              <div className="ud-stat">
                <div className="ud-stat-val">{earnedBadges.length}<span className="ud-stat-of">/{badges.length}</span></div>
                <div className="ud-stat-lbl">Badges Earned</div>
              </div>
            </div>
          )}

          {/* ── Content grid ── */}
          <div className="ud-grid">

            {/* Recent donations */}
            <div className="profile-section-card">
              <div className="psc-header">
                <div>
                  <div className="psc-title">Recent Donations</div>
                  <div className="psc-subtitle">{donations.length} total · {donations.length * 3} lives helped</div>
                </div>
                <button className="up-summary-link" onClick={() => navigate('/donations')}>View All →</button>
              </div>

              {recent.length === 0 ? (
                <div className="ud-empty">
                  <div className="ud-empty-icon">💉</div>
                  <p>No donations logged yet.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/donations')}>
                    + Log First Donation
                  </button>
                </div>
              ) : (
                <div className="up-dh-list">
                  {recent.map(d => (
                    <div key={d.id} className="up-dh-row">
                      <span className="up-dh-type" style={{ background: DONATION_TYPE_COLORS[d.donation_type] ?? '#e53e3e' }}>
                        {DONATION_TYPE_LABELS[d.donation_type] ?? d.donation_type}
                      </span>
                      <span className="up-dh-date">{fmtShort(d.donation_date)}</span>
                      {d.blood_bank && <span className="up-dh-place">{d.blood_bank}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="profile-section-card">
              <div className="psc-header">
                <div>
                  <div className="psc-title">Achievements</div>
                  <div className="psc-subtitle">{earnedBadges.length} of {badges.length} badges earned</div>
                </div>
                <button className="up-summary-link" onClick={() => navigate('/achievements')}>View All →</button>
              </div>

              <div className="up-badge-progress" style={{ marginBottom: 4 }}>
                <div
                  className="up-badge-progress-fill"
                  style={{ width: `${Math.round((earnedBadges.length / badges.length) * 100)}%` }}
                />
              </div>
              <div className="up-badge-pct">{Math.round((earnedBadges.length / badges.length) * 100)}% complete</div>

              {earnedBadges.length === 0 ? (
                <div className="ud-empty">
                  <div className="ud-empty-icon">🏆</div>
                  <p>Earn your first badge by logging a donation.</p>
                </div>
              ) : (
                <div className="up-badge-chips">
                  {earnedBadges.slice(0, 6).map(b => (
                    <div key={b.id} className="up-badge-chip" title={b.description}>
                      <span className="up-badge-chip-icon">{b.icon}</span>
                      <span className="up-badge-chip-name">{b.name}</span>
                    </div>
                  ))}
                  {earnedBadges.length > 6 && (
                    <div className="up-badge-chip up-badge-chip-more" onClick={() => navigate('/achievements')}>
                      +{earnedBadges.length - 6} more
                    </div>
                  )}
                </div>
              )}

              {earnedBadges.length < badges.length && (
                <div className="up-badge-locked-peek" style={{ marginTop: 14 }}>
                  {badges.filter(b => !b.earned).slice(0, 3).map(b => (
                    <span key={b.id} className="up-badge-locked-chip" title={b.description}>
                      {b.icon} {b.name}
                    </span>
                  ))}
                  <span className="up-badge-locked-label">— unlock next</span>
                </div>
              )}
            </div>

          </div>

          {/* ── Quick actions ── */}
          <div className="ud-actions">
            {QUICK_ACTIONS.map(a => (
              <div key={a.label} className="ud-action-card" onClick={() => navigate(a.path)}>
                <div className="ud-action-icon" style={{ background: a.color + '18', color: a.color }}>{a.icon}</div>
                <div className="ud-action-label">{a.label}</div>
                <div className="ud-action-sub">{a.sub}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Root export ─────────────────────────────────────────
export default function Home() {
  return <PublicHome />
}
