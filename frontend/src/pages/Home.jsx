import { useNavigate } from 'react-router-dom'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const STATS = [
  { value: '4.5M', label: 'Units needed daily' },
  { value: '38%', label: 'People eligible to donate' },
  { value: '1 in 7', label: 'Hospital patients need blood' },
  { value: '3 lives', label: 'Saved per donation' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home">
      {/* Hero */}
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
            <button className="btn btn-hero-primary" onClick={() => navigate('/add')}>
              🩸 Register as Donor
            </button>
            <button className="btn btn-hero-secondary" onClick={() => navigate('/donors')}>
              Search Donors →
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="blood-type-wheel">
            {BLOOD_TYPES.map((bt, i) => (
              <div key={bt} className="bt-cell" style={{ '--i': i }}>
                {bt}
              </div>
            ))}
            <div className="bt-center">🩸</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        {STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Cards */}
      <section className="cards-section">
        <div className="feature-card" onClick={() => navigate('/donors')}>
          <div className="feature-icon" style={{ background: '#ebf8ff', color: '#3182ce' }}>🔍</div>
          <h2 className="feature-title">Find a Donor</h2>
          <p className="feature-desc">
            Browse the full registry. Filter by blood type, city, and availability.
            Sort by any column to find the right match fast.
          </p>
          <span className="feature-link">View donor listing →</span>
        </div>

        <div className="feature-card" onClick={() => navigate('/add')}>
          <div className="feature-icon" style={{ background: '#fff5f5', color: '#e53e3e' }}>📋</div>
          <h2 className="feature-title">Become a Donor</h2>
          <p className="feature-desc">
            Join the registry in minutes. Fill in your details and blood type
            to help save lives in your community.
          </p>
          <span className="feature-link">Register now →</span>
        </div>
      </section>

      {/* Blood type info */}
      <section className="blood-info-section">
        <h2 className="section-heading">Blood Type Compatibility</h2>
        <div className="blood-type-list">
          {[
            { type: 'O-',  label: 'Universal Donor',    color: '#276749', desc: 'Can donate to all blood types' },
            { type: 'AB+', label: 'Universal Recipient', color: '#6b46c1', desc: 'Can receive from all blood types' },
            { type: 'O+',  label: 'Most Common',         color: '#38a169', desc: '~38% of the population' },
            { type: 'AB-', label: 'Rarest Type',         color: '#805ad5', desc: 'Only ~1% of the population' },
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
