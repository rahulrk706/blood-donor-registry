import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyDonor } from '../api/donors'
import DonationHistory from '../components/DonationHistory'

export default function DonationsPage() {
  const navigate              = useNavigate()
  const [donor, setDonor]     = useState(undefined)
  const [loading, setLoading] = useState(true)

  function loadDonor() {
    getMyDonor()
      .then((r) => setDonor(r.data.data))
      .catch(() => setDonor(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadDonor() }, [])

  if (loading) {
    return <div className="page center-page"><div className="spinner large" /></div>
  }

  if (!donor) {
    return (
      <div className="page form-page">
        <div className="profile-section-card">
          <div className="profile-empty" style={{ padding: '48px 28px' }}>
            <div className="profile-empty-icon">🩸</div>
            <h3>No donor profile yet</h3>
            <p>Register as a donor first to track your donation history.</p>
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
      <DonationHistory donor={donor} onDonationChange={loadDonor} />
    </div>
  )
}
