import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

export const submitContact   = (data)     => api.post('/contact', data)
export const getContacts     = (params)   => api.get('/admin/contacts', { params })
export const getContact      = (id)       => api.get(`/admin/contacts/${id}`)
export const updateContact   = (id, data) => api.put(`/admin/contacts/${id}`, data)
export const deleteContact   = (id)       => api.delete(`/admin/contacts/${id}`)
export const getUnreadCount  = ()         => api.get('/admin/contacts/unread-count')
