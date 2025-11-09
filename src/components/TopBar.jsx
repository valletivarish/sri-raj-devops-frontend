import React, { useEffect, useMemo, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import Modal from './Modal'
import { getUsers, login, autoLogin, getCurrentUser, baseURL, register as registerApi } from '../services/api'
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
  const [loginErrors, setLoginErrors] = useState({})
  const [registerOpen, setRegisterOpen] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  })
  const [registerErrors, setRegisterErrors] = useState({})
  
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

  function validateLogin() {
    const newErrors = {}
    
    if (!email || !email.trim()) {
      newErrors.email = 'Username or email is required'
    } else if (email.trim().length < 3 || email.trim().length > 100) {
      newErrors.email = 'Username or email must be between 3 and 100 characters'
    }
    
    if (!password || !password.trim()) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6 || password.length > 100) {
      newErrors.password = 'Password must be between 6 and 100 characters'
    }
    
    setLoginErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleProductionLogin(e) {
    e.preventDefault()
    
    if (!validateLogin()) {
      toast.error('Please fix validation errors')
      return
    }
    
    setLoggingIn(true)
    try {
      const auth = await login({ usernameOrEmail: email.trim(), password })
      setToken(auth.accessToken)
      setApiToken(auth.accessToken)
      
      const userInfo = await getCurrentUser()
      setUser(userInfo)
      setLoginOpen(false)
      setEmail('')
      setPassword('')
      setLoginErrors({})
      toast.success('Login successful')
      
      const isAdmin = (userInfo.roles || []).some(r => r.name === 'ROLE_ADMIN')
      navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard')
    } catch (e) {
      if (e.response?.data?.errors) {
        const validationErrors = {}
        e.response.data.errors.forEach(error => {
          validationErrors[error.field] = error.message
        })
        setLoginErrors(validationErrors)
        toast.error('Please fix validation errors')
      } else {
        toast.error(e.response?.data?.message || 'Login failed')
      }
      console.error('Login failed', e)
    } finally {
      setLoggingIn(false)
    }
  }

  function validateRegister() {
    const errs = {}
    const { name, username, email, password } = registerForm

    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      errs.name = 'Name must be between 2 and 100 characters'
    }

    if (!username || username.trim().length < 3 || username.trim().length > 50) {
      errs.username = 'Username must be between 3 and 50 characters'
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
      errs.username = 'Username can only contain letters, numbers, underscores, and hyphens'
    }

    if (!email || email.trim().length === 0) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Email must be valid'
    } else if (email.trim().length > 255) {
      errs.email = 'Email must not exceed 255 characters'
    }

    if (!password || password.length < 6 || password.length > 100) {
      errs.password = 'Password must be between 6 and 100 characters'
    }

    setRegisterErrors(errs)
    return Object.keys(errs).length === 0
  }

  function onRegisterChange(e) {
    const { name, value } = e.target
    setRegisterForm(prev => ({ ...prev, [name]: value }))
    if (registerErrors[name]) {
      setRegisterErrors(prev => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!validateRegister()) {
      toast.error('Please fix validation errors')
      return
    }
    try {
      setRegistering(true)
      await registerApi({
        name: registerForm.name.trim(),
        username: registerForm.username.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password
      })
      toast.success('Account created. You can now log in.')
      setRegistering(false)
      setRegisterOpen(false)
      setRegisterForm({ name: '', username: '', email: '', password: '' })
      setRegisterErrors({})
      setLoginOpen(true)
    } catch (err) {
      setRegistering(false)
      if (err.response?.data?.message) {
        toast.error(err.response.data.message)
      } else if (Array.isArray(err.response?.data?.errors)) {
        const errs = {}
        err.response.data.errors.forEach((er) => {
          errs[er.field] = er.message
        })
        setRegisterErrors(errs)
        toast.error('Please fix validation errors')
      } else {
        toast.error('Failed to register')
      }
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
            (() => {
              console.log('TopBar render - devMode:', devMode, 'token:', token, 'user:', user)
              if (devMode) {
                return (
                  <>
                    <button className="btn" onClick={openAdmin}>Continue as Admin</button>
                    <button className="btn ghost" onClick={openUser}>Continue as User</button>
                    <button className="btn" style={{marginLeft: 8}} onClick={() => setRegisterOpen(true)}>Register</button>
                  </>
                )
              }
              return (
                <>
                  <button className="btn" onClick={() => setLoginOpen(true)}>Login</button>
                  <button className="btn ghost" style={{marginLeft: 8}} onClick={() => setRegisterOpen(true)}>Register</button>
                </>
              )
            })()
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
      <Modal open={loginOpen} onClose={() => {setLoginOpen(false); setLoginErrors({})}} title="Login">
        <form onSubmit={handleProductionLogin} className="grid" style={{gap:12}}>
          <div>
            <label htmlFor="email">Username or Email *</label>
            <input 
              id="email"
              type="text"
              className={`input ${loginErrors.email || loginErrors.usernameOrEmail ? 'error' : ''}`}
              value={email} 
              onChange={e=>{
                setEmail(e.target.value)
                if (loginErrors.email || loginErrors.usernameOrEmail) {
                  setLoginErrors({})
                }
              }}
              placeholder="username or user@example.com"
              maxLength={100}
            />
            {(loginErrors.email || loginErrors.usernameOrEmail) && (
              <div style={{color: 'var(--accent)', fontSize: '14px', marginTop: '4px'}}>
                {loginErrors.email || loginErrors.usernameOrEmail}
              </div>
            )}
            <div style={{color: 'var(--muted)', fontSize: '12px', marginTop: '4px'}}>3-100 characters</div>
          </div>
          <div>
            <label htmlFor="password">Password *</label>
            <input 
              id="password"
              type="password"
              className={`input ${loginErrors.password ? 'error' : ''}`}
              value={password} 
              onChange={e=>{
                setPassword(e.target.value)
                if (loginErrors.password) {
                  setLoginErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors.password
                    return newErrors
                  })
                }
              }}
              placeholder="Enter password"
              maxLength={100}
            />
            {loginErrors.password && (
              <div style={{color: 'var(--accent)', fontSize: '14px', marginTop: '4px'}}>{loginErrors.password}</div>
            )}
            <div style={{color: 'var(--muted)', fontSize: '12px', marginTop: '4px'}}>6-100 characters</div>
          </div>
          <div className="row">
            <button 
              className="btn" 
              type="submit" 
              disabled={loggingIn || Object.keys(loginErrors).length > 0}
            >
              {loggingIn ? 'Logging in...' : 'Login'}
            </button>
            <button 
              className="btn muted" 
              type="button" 
              onClick={()=>{
                setLoginOpen(false)
                setLoginErrors({})
              }}
            >
              Cancel
            </button>
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

      {/* Registration Modal */}
      <Modal open={registerOpen} onClose={() => {setRegisterOpen(false); setRegisterErrors({}); setRegistering(false)}} title="Create Account">
        <form className="grid" style={{gap:12}} onSubmit={handleRegister}>
          <div>
            <label htmlFor="reg-name">Name *</label>
            <input
              id="reg-name"
              name="name"
              className={`input ${registerErrors.name ? 'error' : ''}`}
              value={registerForm.name}
              onChange={onRegisterChange}
              maxLength={100}
              placeholder="Full name"
            />
            {registerErrors.name && <div style={{color: 'var(--accent)', fontSize: 14, marginTop:4}}>{registerErrors.name}</div>}
            <div style={{color:'var(--muted)', fontSize:12, marginTop:4}}>2-100 characters</div>
          </div>
          <div>
            <label htmlFor="reg-username">Username *</label>
            <input
              id="reg-username"
              name="username"
              className={`input ${registerErrors.username ? 'error' : ''}`}
              value={registerForm.username}
              onChange={onRegisterChange}
              maxLength={50}
              placeholder="username"
            />
            {registerErrors.username && <div style={{color: 'var(--accent)', fontSize: 14, marginTop:4}}>{registerErrors.username}</div>}
            <div style={{color:'var(--muted)', fontSize:12, marginTop:4}}>Letters, numbers, _ or - (3-50 characters)</div>
          </div>
          <div>
            <label htmlFor="reg-email">Email *</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className={`input ${registerErrors.email ? 'error' : ''}`}
              value={registerForm.email}
              onChange={onRegisterChange}
              maxLength={255}
              placeholder="user@example.com"
            />
            {registerErrors.email && <div style={{color: 'var(--accent)', fontSize: 14, marginTop:4}}>{registerErrors.email}</div>}
          </div>
          <div>
            <label htmlFor="reg-password">Password *</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className={`input ${registerErrors.password ? 'error' : ''}`}
              value={registerForm.password}
              onChange={onRegisterChange}
              maxLength={100}
              placeholder="••••••"
            />
            {registerErrors.password && <div style={{color: 'var(--accent)', fontSize: 14, marginTop:4}}>{registerErrors.password}</div>}
            <div style={{color:'var(--muted)', fontSize:12, marginTop:4}}>6-100 characters</div>
          </div>
          <div className="row">
            <button className="btn" type="submit" disabled={registering}>{registering ? 'Creating…' : 'Register'}</button>
            <button className="btn muted" type="button" onClick={() => {setRegisterOpen(false); setRegisterErrors({})}}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}


