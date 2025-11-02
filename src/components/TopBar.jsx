import React, { useEffect, useMemo, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import Modal from './Modal'
import { getUsers, login, autoLogin, getCurrentUser, baseURL } from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'
import { setApiToken } from '../services/api'

export default function TopBar() {
  const { token, setToken, user, setUser } = useAuth()
  const navigate = useNavigate()
  const [loginOpen, setLoginOpen] = useState(false)
  const [devMode, setDevMode] = useState(false)
  const devModeCheckRef = useRef(false) // Prevent double calls
  const [adminOpen, setAdminOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  
  const filtered = useMemo(() => users.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())), [users, query])
  const nonAdminFiltered = useMemo(() => filtered.filter(u => !(u.roles||[]).some(r => r.name === 'ROLE_ADMIN') && u.email !== 'admin@lostfound.com'), [filtered])

  const adminEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL || 'admin@lostfound.com'
  const adminPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD || 'admin123'
  
  useEffect(() => {
    console.log('devMode state changed to:', devMode)
  }, [devMode])
  
  useEffect(() => {
    if (devModeCheckRef.current) {
      console.log('Dev mode check skipped - already in progress')
      return
    }
    
    const checkDevMode = async () => {
      devModeCheckRef.current = true
      console.log('Checking dev mode...')
      
      try {
        const response = await fetch(`${baseURL}/api/auth/auto-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 999 })
        })
        
        console.log('Auto-login response status:', response.status)
        
        if (response.status === 200) {
          try {
            const data = await response.json()
            const mode = data.mode === 'dev'
            console.log('Dev mode from 200 response:', data.mode, 'Setting devMode to:', mode)
            setDevMode(mode)
          } catch (e) {
            console.log('JSON parse failed for 200, assuming dev mode')
            setDevMode(true)
          }
        } else if (response.status === 404) {
          console.log('404 response - prod mode')
          setDevMode(false)
        } else {
          try {
            const data = await response.json()
            console.log('Error response data:', data)
            const modeValue = data.mode?.toString().toLowerCase()
            const mode = modeValue === 'dev'
            console.log('Dev mode from error response - mode value:', modeValue, 'Setting devMode to:', mode)
            setDevMode(mode)
            console.log('Dev mode state updated to:', mode)
          } catch (e) {
            console.error('Failed to parse error response:', e)
            if (response.status === 400) {
              console.log('400 error with parse failure - assuming dev mode')
              setDevMode(true)
            } else {
              setDevMode(false)
            }
          }
        }
      } catch (error) {
        console.error('Dev mode check error:', error)
        if (error.name !== 'AbortError') {
          console.log('Setting devMode to false due to error')
          setDevMode(false)
        }
      }
    }
    
    checkDevMode()
    
    return () => {
    }
  }, [])

  async function handleProductionLogin(e) {
    e.preventDefault()
    setLoggingIn(true)
    try {
      const auth = await login({ usernameOrEmail: email, password })
      setToken(auth.accessToken)
      setApiToken(auth.accessToken)
      
      const userInfo = await getCurrentUser()
      setUser(userInfo)
      setLoginOpen(false)
      setEmail('')
      setPassword('')
      toast.success('Login successful')
      
      const isAdmin = (userInfo.roles || []).some(r => r.name === 'ROLE_ADMIN')
      navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard')
    } catch (e) {
      toast.error('Login failed')
      console.error('Login failed', e)
    } finally {
      setLoggingIn(false)
    }
  }

  async function openAdmin() {
    try {
      const auth = await login({ usernameOrEmail: adminEmail, password: adminPassword })
      setToken(auth.accessToken)
      setApiToken(auth.accessToken)
      setUser({ id: 0, name: 'Admin', email: 'admin@lostfound.com', roles: [{ name: 'ROLE_ADMIN' }] })
      navigate('/admin/dashboard')
    } catch (e) {
      console.error('Admin bootstrap failed', e)
      toast.error('Admin sign-in failed')
    }
  }

  async function openUser() {
    try {
      const auth = await login({ usernameOrEmail: adminEmail, password: adminPassword })
      setApiToken(auth.accessToken)
      const list = await getUsers()
      setApiToken(null)
      setUsers(list)
      setUserOpen(true)
    } catch (e) {
      console.error('Load users failed', e)
      toast.error('Failed to load users')
    }
  }

  async function continueAsSelectedUser() {
    const chosen = users.find(u => String(u.id) === String(selected))
    if (!chosen) return
    try {
      const dev = await autoLogin(chosen.id)
      if (dev && dev.accessToken) {
        setToken(dev.accessToken)
        setApiToken(dev.accessToken)
        setUser(chosen)
        setUserOpen(false)
        navigate('/user/dashboard')
      } else {
        toast.error('Failed to get access token')
      }
    } catch (e) {
      console.error('User login failed', e)
      toast.error('Failed to login user')
    }
  }

  return (
    <div className="topbar">
      <div className="container space-between" style={{padding:'12px 16px'}}>
        <Link to={token && user ? ((user.roles || []).some(r => r.name === 'ROLE_ADMIN') ? '/admin/dashboard' : '/user/dashboard') : '/'} style={{fontWeight:600, textDecoration:'none', color:'inherit'}}>Lost & Found</Link>
        <div className="row">
          {!(token || user) && (
            <>
              {(() => {
                console.log('TopBar render - devMode:', devMode, 'token:', token, 'user:', user)
                return devMode ? (
                  <>
                    <button className="btn" onClick={openAdmin}>Continue as Admin</button>
                    <button className="btn ghost" onClick={openUser}>Continue as User</button>
                  </>
                ) : (
                  <button className="btn" onClick={() => setLoginOpen(true)}>Login</button>
                )
              })()}
            </>
          )}
          {(token || user) && (
            <button
              className="btn muted"
              onClick={() => {
                setToken(null)
                setApiToken(null)
                setUser(null)
                window.location.href = '/'
              }}
            >Logout</button>
          )}
        </div>
      </div>

      {/* Production Login Modal */}
      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title="Login">
        <form onSubmit={handleProductionLogin} className="grid" style={{gap:12}}>
          <div>
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email"
              className="input" 
              value={email} 
              onChange={e=>setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password"
              className="input" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <div className="row">
            <button className="btn" type="submit" disabled={loggingIn}>{loggingIn ? 'Logging in...' : 'Login'}</button>
            <button className="btn muted" type="button" onClick={()=>setLoginOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Dev Mode User Selection Modal */}
      <Modal open={userOpen} onClose={() => setUserOpen(false)} title="Continue as User">
        <div className="grid" style={{gap:12}}>
          <input className="input" placeholder="Search users" value={query} onChange={e=>setQuery(e.target.value)} />
          <select className="input" value={selected} onChange={e=>setSelected(e.target.value)}>
            <option value="">Select user…</option>
            {nonAdminFiltered.map(u => (
              <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
            ))}
          </select>
          <div className="row">
            <button className="btn" onClick={continueAsSelectedUser} disabled={!selected}>Continue</button>
            <button className="btn muted" onClick={()=>setUserOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


