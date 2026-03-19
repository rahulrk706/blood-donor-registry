import { createContext, useContext, useState } from 'react'

const UserAuthContext = createContext(null)
const TOKEN_KEY = 'bdr_user_token'
const USER_KEY  = 'bdr_user_data'

export function UserAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })

  function saveSession(tok, usr) {
    localStorage.setItem(TOKEN_KEY, tok)
    localStorage.setItem(USER_KEY, JSON.stringify(usr))
    setToken(tok)
    setUser(usr)
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <UserAuthContext.Provider value={{ token, user, isLoggedIn: !!token, saveSession, clearSession }}>
      {children}
    </UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  return useContext(UserAuthContext)
}
