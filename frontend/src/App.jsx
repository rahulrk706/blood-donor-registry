import { Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { UserAuthProvider, useUserAuth } from './context/UserAuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import UserProtectedRoute from './components/UserProtectedRoute'
import Home from './pages/Home'
import DonorList from './pages/DonorList'
import DonorForm from './pages/DonorForm'
import Contact from './pages/Contact'
import UserLogin from './pages/UserLogin'
import ResetPassword from './pages/ResetPassword'
import UserProfile from './pages/UserProfile'
import AdminLogin from './pages/AdminLogin'
import AdminInbox from './pages/AdminInbox'
import AdminDonors from './pages/AdminDonors'
import AdminUsers from './pages/AdminUsers'
import { getUnreadCount } from './api/contacts'
import './App.css'

function Layout() {
  const navigate           = useNavigate()
  const location           = useLocation()
  const { authed, logout } = useAuth()
  const { isLoggedIn, user, clearSession } = useUserAuth()
  const [unread, setUnread] = useState(0)

  const isAdminArea = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (!authed) { setUnread(0); return }
    getUnreadCount().then((r) => setUnread(r.data.count)).catch(() => {})
    const id = setInterval(() => {
      getUnreadCount().then((r) => setUnread(r.data.count)).catch(() => {})
    }, 30000)
    return () => clearInterval(id)
  }, [authed])

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => navigate(isLoggedIn ? '/my-profile' : '/')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">🩸</span>
            <span className="logo-text">Blood Donor Registry</span>
          </div>

          <nav className="nav">
            {isAdminArea ? (
              /* ── Admin nav ── */
              authed ? (
                <>
                  <NavLink to="/admin/donors" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Donors</NavLink>
                  <NavLink to="/admin/users"  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Users</NavLink>
                  <NavLink to="/admin/inbox"  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Inbox {unread > 0 && <span className="nav-badge">{unread}</span>}
                  </NavLink>
                  <button className="nav-link nav-logout" onClick={() => { logout(); navigate('/') }}>Logout</button>
                </>
              ) : (
                <span className="nav-admin-label">Admin Login</span>
              )
            ) : isLoggedIn ? (
              /* ── Logged-in user nav ── */
              <>
                <NavLink to="/my-profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>👤 {user?.name}</NavLink>
                <NavLink to="/donors"  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Donors</NavLink>
                <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Contact</NavLink>
                <button className="nav-link nav-logout" onClick={() => { clearSession(); navigate('/') }}>Logout</button>
              </>
            ) : (
              /* ── Public nav ── */
              <>
                <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
                <NavLink to="/donors"  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Donors</NavLink>
                <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Contact</NavLink>
                <NavLink to="/login"   className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Sign In / Sign Up</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main">
        <Routes>
          {/* Public */}
          <Route path="/"        element={<Home />} />
          <Route path="/donors"  element={<DonorList />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login"          element={<UserLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* /register always goes to login (register tab) */}
          <Route path="/register" element={<Navigate to="/login" state={{ tab: 'register' }} replace />} />

          {/* User protected */}
          <Route path="/my-profile" element={<UserProtectedRoute><UserProfile /></UserProtectedRoute>} />
          <Route path="/add"        element={<UserProtectedRoute><DonorForm /></UserProtectedRoute>} />
          <Route path="/edit/:id"   element={<UserProtectedRoute><DonorForm /></UserProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"              element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login"        element={<AdminLogin />} />
          <Route path="/admin/donors"       element={<ProtectedRoute><AdminDonors /></ProtectedRoute>} />
          <Route path="/admin/donors/add"   element={<ProtectedRoute><DonorForm isAdmin /></ProtectedRoute>} />
          <Route path="/admin/donors/edit/:id" element={<ProtectedRoute><DonorForm isAdmin /></ProtectedRoute>} />
          <Route path="/admin/users"        element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/inbox"        element={<ProtectedRoute><AdminInbox /></ProtectedRoute>} />
          <Route path="/admin/*"            element={<ProtectedRoute><Navigate to="/admin/donors" replace /></ProtectedRoute>} />
        </Routes>
      </main>

      <footer className="footer">
        <p>Blood Donor Registry &mdash; Saving Lives Together</p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <UserAuthProvider>
        <Layout />
      </UserAuthProvider>
    </AuthProvider>
  )
}
