import React from 'react'
import { imageUrl } from '../services/api'

export default function ItemCard({ item }) {
  return (
    <div className="card" style={{display:'flex',flexDirection:'column',gap:8}}>
      <div style={{height:160, background:'#e5e7eb', borderRadius:8, overflow:'hidden'}}>
        <img src={imageUrl(item.images?.[0]?.id || item.images?.[0]?.url)} alt={item.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h4 style={{margin:0}}>{item.title}</h4>
        <span className="pill">{item.type}</span>
      </div>
      <div className="row" aria-label="tags">
        {(item.tags||'').split(',').filter(Boolean).map((t,i)=> <span key={i} className="tag">{t.trim()}</span>)}
      </div>
      <div className="space-between">
        <small>{item.location || 'Unknown'}</small>
        <a className="btn ghost" href={`/items/${item.id}`}>View</a>
      </div>
    </div>
  )
}


