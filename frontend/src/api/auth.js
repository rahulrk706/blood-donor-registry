import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

function authHeaders() {
  const token = localStorage.getItem('bdr_user_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const registerUser    = (data)  => api.post('/auth/register', data)
export const loginUser       = (data)  => api.post('/auth/login', data)
export const logoutUser      = (token) => api.post('/auth/logout', {}, {
  headers: { Authorization: `Bearer ${token}` },
})
export const forgotPassword  = (data)  => api.post('/auth/forgot-password', data)
export const resetPassword   = (data)  => api.post('/auth/reset-password', data)
export const updateProfile   = (data)  => api.put('/auth/profile',          data, { headers: authHeaders() })
export const changePassword  = (data)  => api.put('/auth/change-password',  data, { headers: authHeaders() })
