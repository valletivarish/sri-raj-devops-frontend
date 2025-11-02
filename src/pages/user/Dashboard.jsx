import React from 'react'
import Card from '../../components/Card'

export default function Dashboard() {
  return (
    <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16}}>
      <Card><h3>Welcome</h3><p>Browse items or add your own lost/found.</p></Card>
      <Card><h3>Tips</h3><p>Use tags and details to help others identify items.</p></Card>
    </div>
  )
}


