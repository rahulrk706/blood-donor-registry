import { computeBadges } from '../utils/badges'

export default function BadgeDisplay({ donations }) {
  const badges  = computeBadges(donations)
  const earned  = badges.filter((b) => b.earned)
  const locked  = badges.filter((b) => !b.earned)

  return (
    <div className="profile-section-card">
      <div className="psc-header">
        <div>
          <div className="psc-title">Achievements</div>
          <div className="psc-subtitle">
            {earned.length} of {badges.length} badges earned
          </div>
        </div>
        <div className="badge-progress-pill">
          <div
            className="badge-progress-fill"
            style={{ width: `${Math.round((earned.length / badges.length) * 100)}%` }}
          />
          <span className="badge-progress-label">
            {Math.round((earned.length / badges.length) * 100)}%
          </span>
        </div>
      </div>

      {earned.length > 0 && (
        <>
          <div className="badge-section-label">Earned</div>
          <div className="badge-grid">
            {earned.map((b) => (
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

      {locked.length > 0 && (
        <>
          <div className="badge-section-label" style={{ marginTop: earned.length > 0 ? 24 : 0 }}>
            Locked
          </div>
          <div className="badge-grid">
            {locked.map((b) => (
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
    </div>
  )
}
