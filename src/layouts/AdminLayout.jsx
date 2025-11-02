import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { HiOutlineViewGrid, HiOutlineUsers, HiOutlineCube, HiOutlineDocumentReport, HiOutlineCog } from 'react-icons/hi'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const items = [
    { to: '/admin/dashboard', label: 'Overview', icon: HiOutlineViewGrid },
    { to: '/admin/users', label: 'Manage Users', icon: HiOutlineUsers },
    { to: '/admin/items', label: 'Manage Items', icon: HiOutlineCube },
    { to: '/admin/reports', label: 'Reports Center', icon: HiOutlineDocumentReport },
    { to: '/admin/settings', label: 'Settings', icon: HiOutlineCog },
  ]
  return (
    <div className="container" style={{display:'grid', gridTemplateColumns: 'auto 1fr', gap:16}}>
      <Sidebar items={items} collapsed={collapsed} onToggle={()=>setCollapsed(!collapsed)} />
      <div className="grid" style={{gap:16}}>
        <Navbar title="Admin Dashboard" />
        <div>{children || <Outlet />}</div>
      </div>
    </div>
  )
}


