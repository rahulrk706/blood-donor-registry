import { useState, useEffect } from 'react'
import { getDonations, createDonation, deleteDonation } from '../api/donations'
import ConfirmModal from './ConfirmModal'
import { useConfirm } from '../hooks/useConfirm'

const TYPES = {
  whole_blood:      { label: 'Whole Blood',      days: 56,  color: '#e53e3e' },
  plasma:           { label: 'Plasma',           days: 28,  color: '#3182ce' },
  platelets:        { label: 'Platelets',        days: 7,   color: '#805ad5' },
  double_red_cells: { label: 'Double Red Cells', days: 112, color: '#dd6b20' },
}

const TODAY = new Date().toISOString().split('T')[0]

function daysSince(dateStr) {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function eligibleDate(dateStr, type) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + (TYPES[type]?.days ?? 56))
  return d
}

function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function fmtLong(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function pad(n) { return String(n).padStart(2, '0') }

function getCountdown(targetDate) {
  const diff = targetDate - Date.now()
  if (diff <= 0) return null
  const totalSec = Math.floor(diff / 1000)
  return {
    d: Math.floor(totalSec / 86400),
    h: Math.floor((totalSec % 86400) / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
  }
}

const EMPTY_FORM = { donation_date: '', donation_type: 'whole_blood', blood_bank: '', city: '', notes: '' }

export default function DonationHistory({ donor, onDonationChange, onDonationsLoaded }) {
  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirm()
  const [donations, setDonations]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors]         = useState({})
  const [form, setForm]             = useState({ ...EMPTY_FORM, city: donor?.city || '' })
  const [tick, setTick]             = useState(0)

  useEffect(() => { load() }, [])

  // Live ticker — updates every second for the countdown
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  function load() {
    setLoading(true)
    getDonations()
      .then(r => {
        setDonations(r.data.data)
        onDonationsLoaded?.(r.data.data)
      })
      .catch(() => setDonations([]))
      .finally(() => setLoading(false))
  }

  function field(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setSubmitting(true)
    try {
      await createDonation(form)
      setShowForm(false)
      setForm({ ...EMPTY_FORM, city: donor?.city || '' })
      load()
      onDonationChange?.()
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    const ok = await confirm({
      title: 'Remove Donation',
      message: 'Remove this donation record? This cannot be undone.',
      confirmLabel: 'Yes, Remove',
    })
    if (!ok) return
    await deleteDonation(id)
    load()
    onDonationChange?.()
  }

  // Dashboard calculations (recalculated on every tick)
  const latest       = donations[0]
  const typeInfo     = TYPES[latest?.donation_type] ?? TYPES.whole_blood
  const cooldownDays = typeInfo.days
  const sinceD       = latest ? daysSince(latest.donation_date) : null
  const nextDate     = latest ? eligibleDate(latest.donation_date, latest.donation_type) : null
  const eligible     = nextDate ? nextDate <= new Date() : true
  const daysLeft     = nextDate && !eligible ? Math.ceil((nextDate - Date.now()) / 86400000) : 0
  const countdown    = nextDate && !eligible ? getCountdown(nextDate) : null
  const cooldownPct  = latest
    ? Math.min(100, Math.round(((sinceD ?? 0) / cooldownDays) * 100))
    : 0

  if (loading) {
    return (
      <div className="profile-section-card">
        <div className="center-page" style={{ minHeight: 200 }}><div className="spinner" /></div>
      </div>
    )
  }

  return (
    <div className="profile-section-card">
      <div className="psc-header">
        <div>
          <div className="psc-title">Donation History</div>
          <div className="psc-subtitle">Log and track your blood donations over time</div>
        </div>
        <button
          className={`btn btn-sm ${showForm ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => setShowForm(v => !v)}
        >
          {showForm ? 'Cancel' : '+ Log Donation'}
        </button>
      </div>

      {/* ── Dashboard panel ── */}
      <div className="dh-dashboard">

        {/* Eligibility / Countdown card */}
        <div className={`dh-elig-card ${eligible ? 'dh-elig-ready' : 'dh-elig-waiting'}`}>
          <div className="dh-elig-status">
            {latest
              ? eligible ? '✓ Ready to Donate' : 'Cooldown Active'
              : 'No donations yet'}
          </div>

          <div className="dh-elig-date">
            {nextDate ? fmtLong(nextDate) : '—'}
          </div>

          {countdown && (
            <div className="dh-countdown">
              <div className="dh-cd-unit">
                <span className="dh-cd-val">{pad(countdown.d)}</span>
                <span className="dh-cd-lbl">days</span>
              </div>
              <span className="dh-cd-sep">:</span>
              <div className="dh-cd-unit">
                <span className="dh-cd-val">{pad(countdown.h)}</span>
                <span className="dh-cd-lbl">hrs</span>
              </div>
              <span className="dh-cd-sep">:</span>
              <div className="dh-cd-unit">
                <span className="dh-cd-val">{pad(countdown.m)}</span>
                <span className="dh-cd-lbl">min</span>
              </div>
              <span className="dh-cd-sep">:</span>
              <div className="dh-cd-unit">
                <span className="dh-cd-val">{pad(countdown.s)}</span>
                <span className="dh-cd-lbl">sec</span>
              </div>
            </div>
          )}

          {eligible && latest && (
            <div className="dh-elig-sub">Last donated {fmt(latest.donation_date)}</div>
          )}

          {/* Cooldown progress bar */}
          {latest && (
            <div className="dh-cooldown-bar">
              <div className="dh-cooldown-fill" style={{ width: `${cooldownPct}%` }} />
            </div>
          )}

          {latest && (
            <div className="dh-elig-type">
              {typeInfo.label} · {cooldownDays}-day cooldown · {cooldownPct}% complete
            </div>
          )}
        </div>

        {/* Side stat cards */}
        <div className="dh-side-stats">
          <div className="dh-stat">
            <div className="dh-stat-icon">📅</div>
            <div className="dh-stat-val">{sinceD !== null ? sinceD : '—'}</div>
            <div className="dh-stat-label">Days Since Last Donation</div>
          </div>
          <div className="dh-stat">
            <div className="dh-stat-icon">⏳</div>
            <div className="dh-stat-val" style={{ color: eligible ? '#38a169' : '#dd6b20' }}>
              {!latest ? '—' : eligible ? 'Now' : daysLeft}
            </div>
            <div className="dh-stat-label">Days Until Eligible</div>
          </div>
          <div className="dh-stat">
            <div className="dh-stat-icon">💉</div>
            <div className="dh-stat-val">{donations.length}</div>
            <div className="dh-stat-label">Total Donations</div>
          </div>
          <div className="dh-stat">
            <div className="dh-stat-icon">❤️</div>
            <div className="dh-stat-val" style={{ color: '#e53e3e' }}>{donations.length * 3}</div>
            <div className="dh-stat-label">Lives Helped</div>
          </div>
        </div>

      </div>

      {/* ── Log Form ── */}
      {showForm && (
        <form className="dh-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Donation Date <span className="required">*</span></label>
              <input
                type="date" className="form-input"
                value={form.donation_date} max={TODAY}
                onChange={e => field('donation_date', e.target.value)}
              />
              {errors.donation_date && <div className="field-error">{errors.donation_date[0]}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Donation Type <span className="required">*</span></label>
              <select
                className="form-input"
                value={form.donation_type}
                onChange={e => field('donation_type', e.target.value)}
              >
                {Object.entries(TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label} — {v.days}-day cooldown</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Blood Bank / Hospital</label>
              <input
                type="text" className="form-input" placeholder="e.g. City General Hospital"
                value={form.blood_bank} onChange={e => field('blood_bank', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text" className="form-input" placeholder="City"
                value={form.city} onChange={e => field('city', e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-input" rows={2} placeholder="Any notes about this donation…"
              value={form.notes} onChange={e => field('notes', e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Donation'}
            </button>
          </div>
        </form>
      )}

      {/* ── Timeline ── */}
      {donations.length === 0 ? (
        <div className="profile-empty" style={{ padding: '40px 0' }}>
          <div className="profile-empty-icon">💉</div>
          <p>No donations logged yet.<br />Click <strong>+ Log Donation</strong> to add your first record.</p>
        </div>
      ) : (
        <div className="dh-timeline">
          {donations.map((d, i) => {
            const info = TYPES[d.donation_type]
            const isFirst = i === 0
            return (
              <div key={d.id} className={`dh-item${isFirst ? ' dh-item-latest' : ''}`}>
                <div className="dh-dot" style={{ background: info?.color ?? '#e53e3e' }} />
                <div className="dh-content">
                  <div className="dh-top">
                    <span className="dh-type-badge" style={{ background: info?.color ?? '#e53e3e' }}>
                      {info?.label ?? d.donation_type}
                    </span>
                    {isFirst && <span className="dh-latest-tag">Latest</span>}
                    <span className="dh-date">{fmt(d.donation_date)}</span>
                    <button
                      className="dh-delete-btn"
                      onClick={() => handleDelete(d.id)}
                      title="Remove record"
                    >×</button>
                  </div>
                  {(d.blood_bank || d.city) && (
                    <div className="dh-meta">
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

      <ConfirmModal
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmLabel={options.confirmLabel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  )
}
