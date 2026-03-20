import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createDonor, getDonor, updateDonor } from '../api/donors'
import { createAdminDonor, updateAdminDonor, getAdminUsers } from '../api/admin'
import { useUserAuth } from '../context/UserAuthContext'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  blood_type: '',
  age: '',
  gender: '',
  city: '',
  address: '',
  weight: '',
  last_donation_date: '',
  is_available: true,
  notes: '',
}

function UserLinker({ linkedUser, onLink, onUnlink }) {
  const [search, setSearch]     = useState('')
  const [results, setResults]   = useState([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen]         = useState(false)
  const debounceRef             = useRef(null)
  const wrapperRef              = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearchChange(e) {
    const val = e.target.value
    setSearch(val)
    setOpen(true)
    clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await getAdminUsers({ search: val, per_page: 8 })
        setResults(res.data.data ?? res.data)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
  }

  function handleSelect(user) {
    onLink(user)
    setSearch('')
    setResults([])
    setOpen(false)
  }

  return (
    <section className="form-section">
      <h2 className="section-title">Link User Account</h2>
      <div className="form-grid">
        {linkedUser ? (
          <div className="form-group full-width">
            <label>Linked Account</label>
            <div className="linked-user-card">
              <div className="linked-user-info">
                <span className="linked-user-name">{linkedUser.name}</span>
                <span className="linked-user-email">{linkedUser.email}</span>
              </div>
              <button type="button" className="btn btn-sm btn-delete" onClick={onUnlink}>
                Unlink
              </button>
            </div>
          </div>
        ) : (
          <div className="form-group full-width" ref={wrapperRef} style={{ position: 'relative' }}>
            <label>Search &amp; Link a User Account <span className="optional">(optional)</span></label>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Type name or email to search users…"
              autoComplete="off"
            />
            {open && (search.trim() || searching) && (
              <div className="user-search-dropdown">
                {searching ? (
                  <div className="user-search-item user-search-empty">Searching…</div>
                ) : results.length === 0 ? (
                  <div className="user-search-item user-search-empty">No users found</div>
                ) : results.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className={`user-search-item ${u.donor ? 'user-has-donor' : ''}`}
                    onClick={() => !u.donor && handleSelect(u)}
                    disabled={!!u.donor}
                    title={u.donor ? 'This user already has a donor profile' : ''}
                  >
                    <span className="user-search-name">{u.name}</span>
                    <span className="user-search-email">{u.email}</span>
                    {u.donor && <span className="user-search-badge">Has donor</span>}
                  </button>
                ))}
              </div>
            )}
            <p className="form-hint">Link this donor record to a registered user account. Users with an existing donor profile are disabled.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default function DonorForm({ isAdmin = false }) {
  const navigate   = useNavigate()
  const { id }     = useParams()
  const isEdit     = Boolean(id)
  const backPath   = isAdmin ? '/admin/donors' : '/my-profile'
  const { user }   = useUserAuth()

  const [form, setForm]           = useState(() => {
    if (!isAdmin && !id && user) {
      return { ...INITIAL_FORM, name: user.name ?? '', email: user.email ?? '' }
    }
    return INITIAL_FORM
  })
  const [linkedUser, setLinkedUser] = useState(null)
  const [errors, setErrors]       = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading]     = useState(isEdit)
  const [success, setSuccess]     = useState(false)

  useEffect(() => {
    if (!isEdit) return
    getDonor(id)
      .then((res) => {
        const d = res.data
        setForm({
          name: d.name ?? '',
          email: d.email ?? '',
          phone: d.phone ?? '',
          blood_type: d.blood_type ?? '',
          age: d.age ?? '',
          gender: d.gender ?? '',
          city: d.city ?? '',
          address: d.address ?? '',
          weight: d.weight ?? '',
          last_donation_date: d.last_donation_date ?? '',
          is_available: d.is_available ?? true,
          notes: d.notes ?? '',
        })
        if (isAdmin && d.user) {
          setLinkedUser(d.user)
        }
      })
      .catch(() => alert('Could not load donor data.'))
      .finally(() => setLoading(false))
  }, [id, isEdit, isAdmin])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setErrors((err) => ({ ...err, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    const payload = { ...form }
    if (payload.weight === '') payload.weight = null
    if (payload.last_donation_date === '') payload.last_donation_date = null
    if (payload.address === '') payload.address = null
    if (payload.notes === '') payload.notes = null

    if (isAdmin) {
      payload.user_id = linkedUser ? linkedUser.id : null
    }

    try {
      if (isEdit) {
        isAdmin ? await updateAdminDonor(id, payload) : await updateDonor(id, payload)
      } else {
        isAdmin ? await createAdminDonor(payload) : await createDonor(payload)
      }
      setSuccess(true)
      setTimeout(() => navigate(backPath), 1500)
    } catch (err) {
      if (err.response?.status === 422) {
        const apiErrors = err.response.data.errors ?? {}
        setErrors(apiErrors)
      } else {
        alert('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page center-page">
        <div className="spinner large" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="page center-page">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>{isEdit ? 'Donor Updated!' : 'Donor Registered!'}</h2>
          <p>Redirecting to the registry…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page form-page">
      <div className="form-card">
        <div className="form-card-header">
          <button className="back-btn" onClick={() => navigate(backPath)}>← Back</button>
          <h1 className="form-title">
            {isEdit ? 'Edit Donor' : 'Register New Donor'}
          </h1>
          <p className="form-subtitle">
            {isEdit
              ? "Update the donor's information below."
              : 'Fill in the details to add a new blood donor to the registry.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Personal Information */}
          <section className="form-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="error-msg">{errors.name[0]}</span>}
              </div>

              <div className="form-group">
                <label>Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="error-msg">{errors.email[0]}</span>}
              </div>

              <div className="form-group">
                <label>Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 555-0100"
                  className={errors.phone ? 'input-error' : ''}
                />
                {errors.phone && <span className="error-msg">{errors.phone[0]}</span>}
              </div>

              <div className="form-group">
                <label>Age <span className="required">*</span></label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  min="18"
                  max="65"
                  placeholder="18 – 65"
                  className={errors.age ? 'input-error' : ''}
                />
                {errors.age && <span className="error-msg">{errors.age[0]}</span>}
              </div>

              <div className="form-group">
                <label>Gender <span className="required">*</span></label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={errors.gender ? 'input-error' : ''}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-msg">{errors.gender[0]}</span>}
              </div>

              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  min="45"
                  max="200"
                  step="0.1"
                  placeholder="e.g. 70"
                  className={errors.weight ? 'input-error' : ''}
                />
                {errors.weight && <span className="error-msg">{errors.weight[0]}</span>}
              </div>
            </div>
          </section>

          {/* Blood & Medical */}
          <section className="form-section">
            <h2 className="section-title">Blood &amp; Medical</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Blood Type <span className="required">*</span></label>
                <div className="blood-type-grid">
                  {BLOOD_TYPES.map((bt) => (
                    <label key={bt} className={`blood-type-btn ${form.blood_type === bt ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="blood_type"
                        value={bt}
                        checked={form.blood_type === bt}
                        onChange={handleChange}
                        hidden
                      />
                      {bt}
                    </label>
                  ))}
                </div>
                {errors.blood_type && <span className="error-msg">{errors.blood_type[0]}</span>}
              </div>

              <div className="form-group">
                <label>Last Donation Date</label>
                <input
                  type="date"
                  name="last_donation_date"
                  value={form.last_donation_date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={errors.last_donation_date ? 'input-error' : ''}
                />
                {errors.last_donation_date && <span className="error-msg">{errors.last_donation_date[0]}</span>}
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="form-section">
            <h2 className="section-title">Location</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>City <span className="required">*</span></label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. New York"
                  className={errors.city ? 'input-error' : ''}
                />
                {errors.city && <span className="error-msg">{errors.city[0]}</span>}
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Street address (optional)"
                  className={errors.address ? 'input-error' : ''}
                />
                {errors.address && <span className="error-msg">{errors.address[0]}</span>}
              </div>
            </div>
          </section>

          {/* Availability & Notes */}
          <section className="form-section">
            <h2 className="section-title">Availability &amp; Notes</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={form.is_available}
                    onChange={handleChange}
                    className="checkbox"
                  />
                  <span>Available for donation</span>
                </label>
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional information about the donor (optional)"
                  className={errors.notes ? 'input-error' : ''}
                />
                {errors.notes && <span className="error-msg">{errors.notes[0]}</span>}
              </div>
            </div>
          </section>

          {/* Link User Account (admin only) */}
          {isAdmin && (
            <UserLinker
              linkedUser={linkedUser}
              onLink={setLinkedUser}
              onUnlink={() => setLinkedUser(null)}
            />
          )}
          {isAdmin && errors.user_id && (
            <p className="error-msg" style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>{errors.user_id[0]}</p>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(backPath)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Update Donor' : 'Register Donor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
