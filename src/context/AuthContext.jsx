import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'lost_found_token'
const USER_KEY = 'lost_found_user'

export default function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || null
    } catch {
      return null
    }
  })
  const [user, setUserState] = useState(() => {
    try {
      const userStr = sessionStorage.getItem(USER_KEY)
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (token) {
      try {
        sessionStorage.setItem(TOKEN_KEY, token)
      } catch (e) {
        console.error('Failed to save token to sessionStorage', e)
      }
    } else {
      try {
        sessionStorage.removeItem(TOKEN_KEY)
      } catch (e) {
        console.error('Failed to remove token from sessionStorage', e)
      }
    }
  }, [token])

  useEffect(() => {
    if (user) {
      try {
        sessionStorage.setItem(USER_KEY, JSON.stringify(user))
      } catch (e) {
        console.error('Failed to save user to sessionStorage', e)
      }
    } else {
      try {
        sessionStorage.removeItem(USER_KEY)
      } catch (e) {
        console.error('Failed to remove user from sessionStorage', e)
      }
    }
  }, [user])

  const setToken = (newToken) => {
    setTokenState(newToken)
  }

  const setUser = (newUser) => {
    setUserState(newUser)
  }

  const value = useMemo(() => ({ token, setToken, user, setUser }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}


