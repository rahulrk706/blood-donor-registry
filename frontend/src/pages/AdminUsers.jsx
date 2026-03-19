import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminUsers } from '../api/admin'

const BLOOD_TYPE_COLORS = {
  'A+': '#e53e3e', 'A-': '#c53030',
  'B+': '#3182ce', 'B-': '#2b6cb0',
  'AB+': '#805ad5', 'AB-': '#6b46c1',
  'O+': '#38a169', 'O-': '#276749',
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminUsers() {
  const navigate = useNavigate()
  const [users, setUsers]     = useState([])
  const [meta, setMeta]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [hasDonor, setHasDonor] = useState('')
  const [page, setPage]       = useState(1)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 15 }
      if (search)   params.search    = search
      if (hasDonor) params.has_donor = hasDonor
      const res = await getAdminUsers(params)
      setUsers(res.data.data)
      setMeta(res.data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [search, hasDonor, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { setPage(1) }, [search, hasDonor])

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Registered Users</h1>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          className="filter-input search-input"
          type="text"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="filter-input" value={hasDonor} onChange={(e) => setHasDonor(e.target.value)}>
          <option value="">All Users</option>
          <option value="true">With Donor Profile</option>
          <option value="false">No Donor Profile</option>
        </select>
        <button className="btn btn-secondary" onClick={() => { setSearch(''); setHasDonor('') }}>Clear</button>
      </div>

      {meta && (
        <div className="stats-bar">
          <span className="stats-item"><strong>{meta.total}</strong> user{meta.total !== 1 ? 's' : ''}</span>
          <span className="stats-item">Page <strong>{meta.current_page}</strong> of <strong>{meta.last_page}</strong></span>
        </div>
      )}

      <div className="table-wrapper">
        <table className="donor-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Registered</th>
              <th>Donor Profile</th>
              <th>Blood Type</th>
              <th>City</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="td-center"><div className="spinner" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="7" className="td-center td-empty">No users found.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="donor-row">
                <td className="td-name">
                  <div className="donor-avatar" style={{ background: '#e2e8f0', color: '#4a5568' }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="donor-name">{u.name}</div>
                    <div className="donor-email">{u.email}</div>
                  </div>
                </td>
                <td>{formatDate(u.created_at)}</td>
                <td>
                  {u.donor ? (
                    <span className="account-badge linked">Linked</span>
                  ) : (
                    <span className="account-badge no-account">None</span>
                  )}
                </td>
                <td>
                  {u.donor?.blood_type ? (
                    <span className="blood-badge" style={{ background: BLOOD_TYPE_COLORS[u.donor.blood_type] }}>
                      {u.donor.blood_type}
                    </span>
                  ) : '—'}
                </td>
                <td>{u.donor?.city || '—'}</td>
                <td>
                  {u.donor ? (
                    <span className={`status-badge ${u.donor.is_available ? 'available' : 'unavailable'}`}>
                      {u.donor.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  {u.donor && (
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => navigate(`/admin/donors/edit/${u.donor.id}`)}
                    >
                      View Donor
                    </button>
                  )}
                </td>
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
    </div>
  )
}
