import { Navigate, useLocation } from 'react-router-dom'

const SESSION_KEY = 'bdr_admin_auth'

export default function ProtectedRoute({ children }) {
  const location = useLocation()

  // Read sessionStorage directly — it is set synchronously by login()
  // so it is always up-to-date even before React re-renders the AuthContext
  const isAuthed = sessionStorage.getItem(SESSION_KEY) === 'true'

  if (!isAuthed) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  return children
}
