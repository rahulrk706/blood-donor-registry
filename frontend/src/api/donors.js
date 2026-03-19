import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

function authHeaders() {
  const token = localStorage.getItem('bdr_user_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getDonors    = (params)     => api.get('/donors', { params })
export const getDonor     = (id)         => api.get(`/donors/${id}`)
export const createDonor  = (data)       => api.post('/donors', data,          { headers: authHeaders() })
export const updateDonor  = (id, data)   => api.put(`/donors/${id}`, data,     { headers: authHeaders() })
export const deleteDonor  = (id)         => api.delete(`/donors/${id}`,        { headers: authHeaders() })
export const getMyDonor   = ()           => api.get('/auth/my-donor',          { headers: authHeaders() })
