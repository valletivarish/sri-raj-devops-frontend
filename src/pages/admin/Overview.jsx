import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import Card from '../../components/Card'
import { getItems, getReports, getUsers } from '../../services/api'

export default function Overview() {
  const [stats, setStats] = useState({ users: 0, items: 0, reports: 0 })
  const { token } = useAuth()
  useEffect(() => {
    if (!token) return
    (async () => {
      try {
        const [u, i, r] = await Promise.allSettled([getUsers(), getItems(), getReports()])
        setStats({
          users: u.status==='fulfilled' ? u.value.length : 0,
          items: i.status==='fulfilled' ? (i.value.totalElements || (i.value.content||[]).length) : 0,
          reports: r.status==='fulfilled' ? (r.value.totalElements || (r.value.content||[]).length) : 0,
        })
      } catch {}
    })()
  }, [token])
  return (
    <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16}}>
      <Card><h3>Users</h3><div style={{fontSize:28,fontWeight:700}}>{stats.users}</div></Card>
      <Card><h3>Items</h3><div style={{fontSize:28,fontWeight:700}}>{stats.items}</div></Card>
      <Card><h3>Reports</h3><div style={{fontSize:28,fontWeight:700}}>{stats.reports}</div></Card>
    </div>
  )
}


