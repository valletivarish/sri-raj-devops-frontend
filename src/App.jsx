import React, { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import TopBar from './components/TopBar'
import { useAuth } from './context/AuthContext.jsx'
import { setApiToken } from './services/api'

export default function App() {
  const { token, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => { setApiToken(token) }, [token])

  useEffect(() => {
    const onAdmin = location.pathname.startsWith('/admin')
    const onUserDash = location.pathname.startsWith('/user')
    const onCreate = location.pathname === '/create'
    const isAdmin = (user?.roles||[]).some(r => r.name === 'ROLE_ADMIN')
    
    // Protect admin routes
    if (onAdmin && (!token || !isAdmin)) {
      navigate('/')
    }
    
    // Protect user dashboard and create routes - require authentication
    if ((onUserDash || onCreate) && !token) {
      navigate('/')
    }
  }, [location, token, user])

  return (
    <div>
      <TopBar />
      <Outlet />
    </div>
  )
}


