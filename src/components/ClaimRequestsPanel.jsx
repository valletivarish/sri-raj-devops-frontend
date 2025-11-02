import React, { useEffect, useState } from 'react'
import { approveClaimRequest, listClaimRequestsForItem, rejectClaimRequest } from '../services/api'

export default function ClaimRequestsPanel({ itemId, isOwnerOrAdmin, onItemUpdated }) {
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [data, setData] = useState({ content: [], totalElements: 0 })
  const [loading, setLoading] = useState(false)

  async function load() {
    if (!itemId) return
    setLoading(true)
    try {
      const res = await listClaimRequestsForItem(itemId, { page, size })
      setData(res)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [itemId, page])

  async function handleDecision(id, accept) {
    if (!isOwnerOrAdmin) return
    try {
      if (accept) {
        await approveClaimRequest(itemId, id)
        await load()
        if (onItemUpdated) onItemUpdated()
      } else {
        await rejectClaimRequest(itemId, id)
        await load()
      }
    } catch (error) {
      console.error('Failed to handle claim request decision:', error)
    }
  }

  return (
    <div className="card" style={{marginTop: 16}}>
      <div className="space-between" style={{marginBottom: 16, alignItems: 'center'}}>
        <h3 style={{margin: 0}}>Claim Requests</h3>
        {loading && <span className="spinner" aria-label="loading" />}
      </div>
      {data.content.length > 0 ? (
        <div className="grid" style={{gap: 12}}>
          {data.content.map(cr => (
            <div key={cr.id} style={{paddingBottom: 12, borderBottom: '1px solid #e5e7eb'}}>
              <div className="space-between" style={{alignItems: 'flex-start', gap: 16}}>
                <div className="grid" style={{gap: 8, flex: 1}}>
                  <div style={{color: 'var(--muted)'}}>{cr.claimant?.email}</div>
                  <div style={{color: 'var(--muted)', fontSize: '14px'}}>
                    {cr.message || 'No message provided'}
                  </div>
                  {isOwnerOrAdmin && cr.status === 'PENDING' && (
                    <div className="row" style={{gap: 8, marginTop: 8}}>
                      <button className="btn" onClick={() => handleDecision(cr.id, true)}>Approve</button>
                      <button className="btn ghost" onClick={() => handleDecision(cr.id, false)}>Reject</button>
                    </div>
                  )}
                </div>
                <div style={{alignSelf: 'flex-start', flexShrink: 0}}>
                  <span className={`badge ${cr.status?.toLowerCase?.() || ''}`} style={{
                    display: 'inline-flex',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontWeight: 600,
                    fontSize: '12px',
                    letterSpacing: '0.2px',
                    whiteSpace: 'nowrap'
                  }}>{cr.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div style={{padding: '20px', textAlign: 'center', color: 'var(--muted)'}}>
          No claim requests yet.
        </div>
      )}
    </div>
  )
}


