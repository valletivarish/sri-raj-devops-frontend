import React, { useState } from 'react'
import { HiOutlineViewGrid, HiOutlineCube, HiOutlinePlusCircle, HiOutlineDocumentReport, HiOutlineUser } from 'react-icons/hi'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'

export default function UserLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const items = [
    { to: '/user/dashboard', label: 'My Overview', icon: HiOutlineViewGrid },
    { to: '/user/items', label: 'My Items', icon: HiOutlineCube },
    { to: '/user/add-item', label: 'Add New Item', icon: HiOutlinePlusCircle },
    { to: '/user/reports', label: 'My Reports', icon: HiOutlineDocumentReport },
    { to: '/user/profile', label: 'Profile', icon: HiOutlineUser },
  ]
  return (
    <div className="container" style={{display:'grid', gridTemplateColumns: 'auto 1fr', gap:16}}>
      <Sidebar items={items} collapsed={collapsed} onToggle={()=>setCollapsed(!collapsed)} />
      <div className="grid" style={{gap:16}}>
        <Navbar title="User Dashboard" />
        <div>{children || <Outlet />}</div>
      </div>
    </div>
  )
}


