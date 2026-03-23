import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDonors, getMyDonor } from '../api/donors'
import { useUserAuth } from '../context/UserAuthContext'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const BLOOD_TYPE_COLORS = {
  'A+': '#e53e3e', 'A-': '#c53030',
  'B+': '#3182ce', 'B-': '#2b6cb0',
  'AB+': '#805ad5', 'AB-': '#6b46c1',
  'O+': '#38a169', 'O-': '#276749',
}

function SortIcon({ field, currentSort, currentDir }) {
  if (currentSort !== field) return <span className="sort-icon neutral">⇅</span>
  return <span className="sort-icon active">{currentDir === 'asc' ? '↑' : '↓'}</span>
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── My Profile tab ────────────────────────────────────
function MyProfile({ user }) {
  const navigate = useNavigate()
  const [donor, setDonor]     = useState(undefined) // undefined = loading
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyDonor()
      .then((r) => setDonor(r.data.data))
      .catch(() => setDonor(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="profile-loading"><div className="spinner" /></div>

  if (!donor) {
    return (
      <div className="profile-empty">
        <div className="profile-empty-icon">🩸</div>
        <h3>No donor record found</h3>
        <p>You haven't registered as a donor yet. Add your details to appear in the registry.</p>
        <button className="btn btn-primary" onClick={() => navigate('/add')}>
          Register as Donor
        </button>
      </div>
    )
  }

  const color = BLOOD_TYPE_COLORS[donor.blood_type]

  return (
    <div className="profile-card">
      {/* Header */}
      <div className="profile-header" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}>
        <div className="profile-avatar">{donor.name.charAt(0).toUpperCase()}</div>
        <div>
          <div className="profile-name">{donor.name}</div>
          <div className="profile-email">{donor.email}</div>
        </div>
        <span className="blood-badge profile-blood" style={{ background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.6)' }}>
          {donor.blood_type}
        </span>
      </div>

      {/* Details grid */}
      <div className="profile-body">
        <div className="profile-section-title">Personal Details</div>
        <div className="profile-grid">
          <div className="profile-field">
            <span className="pf-label">Full Name</span>
            <span className="pf-value">{donor.name}</span>
          </div>
          <div className="profile-field">
            <span className="pf-label">Email</span>
            <span className="pf-value">{donor.email}</span>
          </div>
          <div className="profile-field">
            <span className="pf-label">Phone</span>
            <span className="pf-value">{donor.phone}</span>
          </div>
          <div className="profile-field">
            <span className="pf-label">Age</span>
            <span className="pf-value">{donor.age} yrs</span>
          </div>
          <div className="profile-field">
            <span className="pf-label">Gender</span>
            <span className="pf-value capitalize">{donor.gender}</span>
          </div>
          <div className="profile-field">
            <span className="pf-label">Weight</span>
            <span className="pf-value">{donor.weight ? `${donor.weight} kg` : '—'}</span>
          </div>
        </div>

        <div className="profile-section-title" style={{ marginTop: 20 }}>Blood Details</div>
        <div className="profile-grid">
          <div className="profile-field">
            <span className="pf-label">Blood Type</span>
            <span className="pf-value">
              <span className="blood-badge" style={{ background: color }}>{donor.blood_type}</span>
            </span>
          </div>
          <div className="profile-field">
            <span className="pf-label">Last Donation</span>
            <span className="pf-value">{formatDate(donor.last_donation_date)}</span>
          </div>
          <div className="profile-field">
            <span className="pf-label">Availability</span>
            <span className="pf-value">
              <span className={`status-badge ${donor.is_available ? 'available' : 'unavailable'}`}>
                {donor.is_available ? 'Available' : 'Unavailable'}
              </span>
            </span>
          </div>
          <div className="profile-field">
            <span className="pf-label">City</span>
            <span className="pf-value">{donor.city}</span>
          </div>
          {donor.address && (
            <div className="profile-field full">
              <span className="pf-label">Address</span>
              <span className="pf-value">{donor.address}</span>
            </div>
          )}
          {donor.notes && (
            <div className="profile-field full">
              <span className="pf-label">Notes</span>
              <span className="pf-value">{donor.notes}</span>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/edit/${donor.id}`)}>
            Edit My Details
          </button>
        </div>
      </div>
    </div>
  )
}

// ── All Donors tab ────────────────────────────────────
function AllDonors({ isLoggedIn }) {
  const navigate = useNavigate()
  const [donors, setDonors] = useState([])
  const [meta, setMeta]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const [filters, setFilters] = useState({ search: '', blood_type: '', is_available: '', gender: '', city: '' })
  const [sort, setSort]     = useState({ sort_by: 'created_at', sort_dir: 'desc' })
  const [page, setPage]     = useState(1)

  const fetchDonors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { ...filters, ...sort, page, per_page: 8 }
      Object.keys(params).forEach((k) => params[k] === '' && delete params[k])
      const res = await getDonors(params)
      setDonors(res.data.data)
      setMeta(res.data)
    } catch {
      setError('Failed to load donors. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [filters, sort, page])

  useEffect(() => { fetchDonors() }, [fetchDonors])
  useEffect(() => { setPage(1) }, [filters, sort])

  function handleFilterChange(e) {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSort(field) {
    setSort((s) => ({
      sort_by: field,
      sort_dir: s.sort_by === field && s.sort_dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  return (
    <>
      <div className="filter-bar">
        <input className="filter-input search-input" type="text" name="search" placeholder="Search by name, email, phone…" value={filters.search} onChange={handleFilterChange} />
        <select className="filter-input" name="blood_type" value={filters.blood_type} onChange={handleFilterChange}>
          <option value="">All Blood Types</option>
          {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
        </select>
        <select className="filter-input" name="gender" value={filters.gender} onChange={handleFilterChange}>
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select className="filter-input" name="is_available" value={filters.is_available} onChange={handleFilterChange}>
          <option value="">Any Availability</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <input className="filter-input" type="text" name="city" placeholder="Filter by city…" value={filters.city} onChange={handleFilterChange} />
        <button className="btn btn-secondary" onClick={() => setFilters({ search: '', blood_type: '', is_available: '', gender: '', city: '' })}>Clear</button>
      </div>

      {meta && (
        <div className="stats-bar">
          <span className="stats-item"><strong>{meta.total}</strong> donor{meta.total !== 1 ? 's' : ''} found</span>
          <span className="stats-item">Page <strong>{meta.current_page}</strong> of <strong>{meta.last_page}</strong></span>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrapper">
        <table className="donor-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">Name <SortIcon field="name" currentSort={sort.sort_by} currentDir={sort.sort_dir} /></th>
              <th onClick={() => handleSort('blood_type')} className="sortable">Blood Type <SortIcon field="blood_type" currentSort={sort.sort_by} currentDir={sort.sort_dir} /></th>
              <th onClick={() => handleSort('age')} className="sortable">Age <SortIcon field="age" currentSort={sort.sort_by} currentDir={sort.sort_dir} /></th>
              <th>Gender</th>
              <th onClick={() => handleSort('city')} className="sortable">City <SortIcon field="city" currentSort={sort.sort_by} currentDir={sort.sort_dir} /></th>
              <th>Phone</th>
              <th onClick={() => handleSort('last_donation_date')} className="sortable">Last Donation <SortIcon field="last_donation_date" currentSort={sort.sort_by} currentDir={sort.sort_dir} /></th>
              <th onClick={() => handleSort('is_available')} className="sortable">Status <SortIcon field="is_available" currentSort={sort.sort_by} currentDir={sort.sort_dir} /></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="td-center"><div className="spinner" /></td></tr>
            ) : donors.length === 0 ? (
              <tr><td colSpan="8" className="td-center td-empty">No donors found matching your filters.</td></tr>
            ) : donors.map((donor) => (
              <tr key={donor.id} className="donor-row">
                <td className="td-name">
                  <div className="donor-avatar" style={{ background: BLOOD_TYPE_COLORS[donor.blood_type] + '22', color: BLOOD_TYPE_COLORS[donor.blood_type] }}>
                    {donor.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="donor-name">{donor.name}</div>
                    <div className="donor-email">{donor.email}</div>
                  </div>
                </td>
                <td><span className="blood-badge" style={{ background: BLOOD_TYPE_COLORS[donor.blood_type] }}>{donor.blood_type}</span></td>
                <td>{donor.age}</td>
                <td className="capitalize">{donor.gender}</td>
                <td>{donor.city}</td>
                <td><span className="contact-info">{donor.phone}</span></td>
                <td>{formatDate(donor.last_donation_date)}</td>
                <td><span className={`status-badge ${donor.is_available ? 'available' : 'unavailable'}`}>{donor.is_available ? 'Available' : 'Unavailable'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="pagination">
          <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <div className="page-numbers">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`btn page-btn ${p === page ? 'active' : 'btn-secondary'}`} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
          <button className="btn btn-secondary" disabled={page === meta.last_page} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </>
  )
}

// ── Main DonorList page ───────────────────────────────
export default function DonorList() {
  const navigate = useNavigate()
  const { isLoggedIn } = useUserAuth()
  const [hasDonor, setHasDonor] = useState(null)

  useEffect(() => {
    if (!isLoggedIn) return
    getMyDonor()
      .then((r) => setHasDonor(!!r.data.data))
      .catch(() => setHasDonor(false))
  }, [isLoggedIn])

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Donor Registry</h1>
        {!isLoggedIn && (
          <button className="btn btn-primary" onClick={() => navigate('/login', { state: { from: '/add' } })}>Login to Register</button>
        )}
        {isLoggedIn && hasDonor === false && (
          <button className="btn btn-primary" onClick={() => navigate('/add')}>+ Register as Donor</button>
        )}
      </div>

      <AllDonors isLoggedIn={isLoggedIn} />
    </div>
  )
}
