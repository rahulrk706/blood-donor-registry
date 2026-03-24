import { useState, useEffect } from 'react'
import { getAdminDonorDonations } from '../api/admin'
import { computeBadges } from '../utils/badges'

const BLOOD_TYPE_COLORS = {
  'A+': '#e53e3e', 'A-': '#c53030',
  'B+': '#3182ce', 'B-': '#2b6cb0',
  'AB+': '#805ad5', 'AB-': '#6b46c1',
  'O+': '#38a169', 'O-': '#276749',
}

const TYPES = {
  whole_blood:      { label: 'Whole Blood',      color: '#e53e3e' },
  plasma:           { label: 'Plasma',           color: '#3182ce' },
  platelets:        { label: 'Platelets',        color: '#805ad5' },
  double_red_cells: { label: 'Double Red Cells', color: '#dd6b20' },
}

function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminDonorDrawer({ donor, onClose }) {
  const [donations, setDonations] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!donor) return
    setLoading(true)
    getAdminDonorDonations(donor.id)
      .then(r => setDonations(r.data.data))
      .catch(() => setDonations([]))
      .finally(() => setLoading(false))
  }, [donor?.id])

  if (!donor) return null

  const color        = BLOOD_TYPE_COLORS[donor.blood_type] ?? '#e53e3e'
  const badges       = computeBadges(donations)
  const earnedBadges = badges.filter(b => b.earned)
  const lockedBadges = badges.filter(b => !b.earned)

  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="drawer-panel">

        {/* Header */}
        <div className="drawer-header" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)` }}>
          <div className="drawer-donor-info">
            <div className="drawer-avatar">{donor.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="drawer-donor-name">{donor.name}</div>
              <div className="drawer-donor-meta">{donor.email} · {donor.city}</div>
            </div>
          </div>
          <div className="drawer-header-right">
            <div className="drawer-blood-badge">{donor.blood_type}</div>
            <button className="drawer-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="drawer-body">

          {loading ? (
            <div className="center-page" style={{ minHeight: 200 }}><div className="spinner" /></div>
          ) : (
            <>
              {/* ── Stats strip ── */}
              <div className="drawer-stats">
                <div className="drawer-stat">
                  <div className="drawer-stat-val">{donations.length}</div>
                  <div className="drawer-stat-lbl">Total Donations</div>
                </div>
                <div className="drawer-stat">
                  <div className="drawer-stat-val" style={{ color: '#e53e3e' }}>{donations.length * 3}</div>
                  <div className="drawer-stat-lbl">Lives Helped</div>
                </div>
                <div className="drawer-stat">
                  <div className="drawer-stat-val">{earnedBadges.length}<span style={{ fontSize: 14, color: 'var(--gray-400)', fontWeight: 600 }}>/{badges.length}</span></div>
                  <div className="drawer-stat-lbl">Badges Earned</div>
                </div>
              </div>

              {/* ── Donation History ── */}
              <div className="drawer-section-title">Donation History</div>

              {donations.length === 0 ? (
                <div className="drawer-empty">No donations recorded for this donor.</div>
              ) : (
                <div className="drawer-timeline">
                  {donations.map((d, i) => {
                    const info = TYPES[d.donation_type]
                    return (
                      <div key={d.id} className="drawer-timeline-item">
                        <div className="drawer-tl-dot" style={{ background: info?.color ?? '#e53e3e' }} />
                        <div className="drawer-tl-content">
                          <div className="drawer-tl-top">
                            <span className="drawer-tl-badge" style={{ background: info?.color ?? '#e53e3e' }}>
                              {info?.label ?? d.donation_type}
                            </span>
                            {i === 0 && <span className="dh-latest-tag">Latest</span>}
                            <span className="drawer-tl-date">{fmt(d.donation_date)}</span>
                          </div>
                          {(d.blood_bank || d.city) && (
                            <div className="drawer-tl-meta">
                              {[d.blood_bank, d.city].filter(Boolean).join(' · ')}
                            </div>
                          )}
                          {d.notes && <div className="dh-notes">{d.notes}</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ── Achievements ── */}
              <div className="drawer-section-title" style={{ marginTop: 28 }}>
                Achievements
                <span className="drawer-badge-count">{earnedBadges.length}/{badges.length}</span>
              </div>

              {/* Progress bar */}
              <div className="up-badge-progress" style={{ marginBottom: 16 }}>
                <div
                  className="up-badge-progress-fill"
                  style={{ width: `${Math.round((earnedBadges.length / badges.length) * 100)}%` }}
                />
              </div>

              {earnedBadges.length > 0 && (
                <>
                  <div className="badge-section-label">Earned</div>
                  <div className="badge-grid" style={{ marginBottom: 16 }}>
                    {earnedBadges.map(b => (
                      <div key={b.id} className="badge-card badge-earned">
                        <div className="badge-icon">{b.icon}</div>
                        <div className="badge-name">{b.name}</div>
                        <div className="badge-desc">{b.description}</div>
                        <div className="badge-check">✓</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {lockedBadges.length > 0 && (
                <>
                  <div className="badge-section-label">Locked</div>
                  <div className="badge-grid">
                    {lockedBadges.map(b => (
                      <div key={b.id} className="badge-card badge-locked">
                        <div className="badge-icon">{b.icon}</div>
                        <div className="badge-name">{b.name}</div>
                        <div className="badge-desc">{b.description}</div>
                        <div className="badge-lock">🔒</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
