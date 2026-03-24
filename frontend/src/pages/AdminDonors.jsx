import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDonors } from '../api/donors'
import { deleteAdminDonor } from '../api/admin'
import ConfirmModal from '../components/ConfirmModal'
import AdminDonorDrawer from '../components/AdminDonorDrawer'
import { useConfirm } from '../hooks/useConfirm'

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

export default function AdminDonors() {
  const navigate = useNavigate()
  const [donors, setDonors]   = useState([])
  const [meta, setMeta]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting]       = useState(null)
  const [viewDonor, setViewDonor]     = useState(null)

  const [filters, setFilters] = useState({ search: '', blood_type: '', is_available: '', gender: '', city: '' })
  const [sort, setSort]       = useState({ sort_by: 'created_at', sort_dir: 'desc' })
  const [page, setPage]       = useState(1)

  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirm()

  const fetchDonors = useCallback(async () => {
    setLoading(true)
    try {
      const params = { ...filters, ...sort, page, per_page: 10 }
      Object.keys(params).forEach((k) => params[k] === '' && delete params[k])
      const res = await getDonors(params)
      setDonors(res.data.data)
      setMeta(res.data)
    } catch {
      // silently fail
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

  async function handleDelete(id, name) {
    const ok = await confirm({
      title: 'Remove Donor',
      message: `Remove ${name} from the registry? This cannot be undone.`,
      confirmLabel: 'Yes, Remove',
    })
    if (!ok) return
    setDeleting(id)
    try {
      await deleteAdminDonor(id)
      fetchDonors()
    } finally {
      setDeleting(null)
    }
  }

  function formatDate(date) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Donor Management</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/donors/add')}>
          + Add New Donor
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input className="filter-input search-input" type="text" name="search" placeholder="Search name, email, phone…" value={filters.search} onChange={handleFilterChange} />
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
          <span className="stats-item"><strong>{meta.total}</strong> donor{meta.total !== 1 ? 's' : ''}</span>
          <span className="stats-item">Page <strong>{meta.current_page}</strong> of <strong>{meta.last_page}</strong></span>
        </div>
      )}

      <div className="table-wrapper">
        <table className="donor-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">Name <SortIcon field="name" currentSort={sort.sort_by} currentDir={sort.sort_dir} /></th>
              <th onClick={() => handleSort('blood_type')} className="sortable">Blood Type <SortIcon field="blood_type" currentSort={sort.sort_by} currentDir={sort.sort_dir} /></th>
              <th onClick={() => handleSort('age')} className="sortable">Age <SortIcon field="age" currentSort={sort.sort_by} currentDir={sort.sort_dir} /></th>
              <th>Gender</th>
              <th onClick={() => handleSort('city')} className="sortable">City <SortIcon field="city" currentSort={sort.sort_by} currentDir={sort.sort_dir} /></th>
              <th>Contact</th>
              <th onClick={() => handleSort('last_donation_date')} className="sortable">Last Donation <SortIcon field="last_donation_date" currentSort={sort.sort_by} currentDir={sort.sort_dir} /></th>
              <th onClick={() => handleSort('is_available')} className="sortable">Status <SortIcon field="is_available" currentSort={sort.sort_by} currentDir={sort.sort_dir} /></th>
              <th>Account</th>
              <th>Actions</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="11" className="td-center"><div className="spinner" /></td></tr>
            ) : donors.length === 0 ? (
              <tr><td colSpan="11" className="td-center td-empty">No donors found.</td></tr>
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
                <td><div className="contact-info"><span>{donor.phone}</span></div></td>
                <td>{formatDate(donor.last_donation_date)}</td>
                <td><span className={`status-badge ${donor.is_available ? 'available' : 'unavailable'}`}>{donor.is_available ? 'Available' : 'Unavailable'}</span></td>
                <td>
                  {donor.user ? (
                    <div className="linked-account">
                      <span className="account-badge linked">Linked</span>
                      <span className="linked-email">{donor.user.email}</span>
                    </div>
                  ) : (
                    <span className="account-badge no-account">No Account</span>
                  )}
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn btn-sm btn-edit" onClick={() => navigate(`/admin/donors/edit/${donor.id}`)}>Edit</button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(donor.id, donor.name)} disabled={deleting === donor.id}>
                      {deleting === donor.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </td>
                <td>
                  <button className="btn btn-sm btn-secondary" onClick={() => setViewDonor(donor)}>
                    View
                  </button>
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

      <ConfirmModal isOpen={isOpen} title={options.title} message={options.message} confirmLabel={options.confirmLabel} onConfirm={handleConfirm} onCancel={handleCancel} />
      <AdminDonorDrawer donor={viewDonor} onClose={() => setViewDonor(null)} />
    </div>
  )
}
