import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

function authHeaders() {
  const token = localStorage.getItem('bdr_user_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getDonations   = ()     => api.get('/donations',           { headers: authHeaders() })
export const createDonation = (data) => api.post('/donations', data,    { headers: authHeaders() })
export const deleteDonation = (id)   => api.delete(`/donations/${id}`,  { headers: authHeaders() })
