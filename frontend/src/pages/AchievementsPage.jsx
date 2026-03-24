import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDonations } from '../api/donations'
import BadgeDisplay from '../components/BadgeDisplay'

export default function AchievementsPage() {
  const navigate                  = useNavigate()
  const [donations, setDonations] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    getDonations()
      .then((r) => setDonations(r.data.data))
      .catch(() => setDonations([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="page center-page"><div className="spinner large" /></div>
  }

  return (
    <div className="page form-page">
      <BadgeDisplay donations={donations} />
    </div>
  )
}
