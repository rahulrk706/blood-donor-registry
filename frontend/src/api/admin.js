import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

export const getAdminUsers            = (params)  => api.get('/admin/users', { params })
export const createAdminDonor         = (data)    => api.post('/admin/donors', data)
export const updateAdminDonor         = (id, data) => api.put(`/admin/donors/${id}`, data)
export const deleteAdminDonor         = (id)      => api.delete(`/admin/donors/${id}`)
export const getAdminDonorDonations   = (id)      => api.get(`/admin/donors/${id}/donations`)
