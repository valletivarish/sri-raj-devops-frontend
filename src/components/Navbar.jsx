import React from 'react'

export default function Navbar({ title, right }) {
  return (
    <header className="card" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',position:'sticky',top:0}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontWeight:700}}>{title}</span>
      </div>
      <div className="row">{right}</div>
    </header>
  )
}


