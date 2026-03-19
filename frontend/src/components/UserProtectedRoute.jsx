import { Navigate, useLocation } from 'react-router-dom'
import { useUserAuth } from '../context/UserAuthContext'

export default function UserProtectedRoute({ children }) {
  const { isLoggedIn } = useUserAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
