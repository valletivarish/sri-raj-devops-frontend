import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ items = [], collapsed = false, onToggle }) {
  const location = useLocation()
  
  return (
    <aside style={{width: collapsed ? 64 : 220}} className={`sidebar card ${collapsed ? 'collapsed' : ''}`}>
      <button className="btn ghost" onClick={onToggle} aria-label="Toggle sidebar" style={{width:'100%', padding: '10px', minHeight: '40px'}}>
        {collapsed ? '›' : '‹'}
      </button>
      <nav className="grid" style={{gap:8, marginTop:8}}>
        {items.map(i => {
          const Icon = i.icon
          const isActive = location.pathname === i.to || location.pathname.startsWith(i.to + '/')
          
          return (
            <Link 
              key={i.to} 
              to={i.to} 
              className={`nav-link ${isActive ? 'active' : ''}`}
              aria-label={i.label} 
              title={collapsed ? i.label : ''}
              style={collapsed ? {justifyContent: 'center', padding: '10px'} : {gap: '10px'}}
            >
              {Icon && <Icon style={{fontSize: '20px', flexShrink: 0}} />}
              {!collapsed && <span>{i.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}


