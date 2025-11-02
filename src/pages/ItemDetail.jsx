import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { createClaimRequest, deleteItem, getItemById, imageUrl, updateItemStatus } from '../services/api'
import ClaimRequestsPanel from '../components/ClaimRequestsPanel'
import ReportForm from '../components/ReportForm'
import { useAuth } from '../context/AuthContext.jsx'
import { useConfirmDialog } from '../components/ConfirmDialog'
import { usePromptModal } from '../components/PromptModal'

export default function ItemDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const { token, user } = useAuth()
  const { show: showConfirm, ConfirmDialog } = useConfirmDialog()
  const { show: showPrompt, PromptModal } = usePromptModal()

  async function load() { try { setItem(await getItemById(id)) } catch(e) { toast.error('Failed to load item') } }
  useEffect(() => { if (id) load() }, [id])

  async function onUpdate(status) {
    try { 
      await updateItemStatus(id, status)
      await load()
      toast.success('Status updated successfully')
    } catch (e) { 
      console.error('Failed to update status:', e)
      toast.error('Update failed')
      await load()
    }
  }
  
  async function onDelete() {
    const confirmed = await showConfirm('Delete Item', 'Are you sure you want to delete this item?')
    if (!confirmed) return
    try { await deleteItem(id); toast.success('Item deleted successfully'); window.location.href='/' } catch(e){ toast.error('Delete failed') }
  }

  if (!item) return <div className="container">Loading…</div>
  const images = item.images || []

  async function onClaim() {
    if (!item) {
      toast.error('Item not loaded')
      return
    }
    
    if (item.status === 'CLAIMED') {
      toast.error('Item is already claimed')
      return
    }
    
    if (item.status === 'REMOVED') {
      toast.error('Item has been removed')
      return
    }
    
    if (item.softDeleted) {
      toast.error('Item has been deleted')
      return
    }
    
    const message = await showPrompt('Claim Request', 'Add a message for the owner (optional):', '') || ''
    
    try {
      const latestItem = await getItemById(id)
      if (latestItem.status === 'CLAIMED') {
        toast.error('Item is already claimed')
        await load()
        return
      }
      if (latestItem.status === 'REMOVED') {
        toast.error('Item has been removed')
        await load()
        return
      }
      
      await createClaimRequest(id, message)
      await load()
      toast.success('Claim request submitted')
    } catch(e) {
      const errorMessage = e.response?.data?.message || e.message || 'Failed to create claim request'
      toast.error(errorMessage)
      await load()
    }
  }

  const isOwner = user && item?.postedBy && (user.id === item.postedBy.id)
  const isAdmin = (user?.roles||[]).some(r => r.name === 'ROLE_ADMIN')
  const isOwnerOrAdmin = !!(isOwner || isAdmin)
  const isClaimed = item?.status === 'CLAIMED'
  const isRemoved = item?.status === 'REMOVED'
  const canClaim = !isClaimed && !isRemoved && !item?.softDeleted

  return (
    <>
      <ConfirmDialog />
      <PromptModal />
      <div className="container grid" style={{gap:16}}>
        <div className="card grid" style={{gap:12}}>
        <h2 style={{margin:0}}>{item.title}</h2>
        <div className="row" style={{gap:8}}>
          {images.length ? images.map((img,i)=>(
            <img key={i} src={imageUrl(img.id || img.url)} alt={item.title} style={{height:160,borderRadius:10}} />
          )) : <div className="pill">No images</div>}
        </div>
        <div className="row"><span className="pill">{item.type}</span><span className="pill">{item.status}</span></div>
        <div>{item.description || 'No description'}</div>
        <div className="row" style={{gap:8}}>
          {token && <button className="btn" onClick={()=>setShowReport(true)}>Report</button>}
          {token && !isOwnerOrAdmin && canClaim && (
            <button className="btn accent" onClick={onClaim}>Request Claim</button>
          )}
          {token && !isOwnerOrAdmin && isClaimed && (
            <span className="pill" style={{backgroundColor:'#FFE8E0', color:'#B93815'}}>Already Claimed</span>
          )}
          {token && isOwnerOrAdmin && (
            <>
              {item.status !== 'CLAIMED' && (
                <button className="btn ghost" onClick={()=>onUpdate('CLAIMED')}>Mark Claimed</button>
              )}
              {item.status === 'CLAIMED' && (
                <span className="pill" style={{backgroundColor:'#FFE8E0', color:'#B93815'}}>Claimed</span>
              )}
              <button className="btn muted" onClick={onDelete}>Delete</button>
            </>
          )}
        </div>
        {showReport && <ReportForm itemId={id} onCreated={()=>{setShowReport(false); toast.success('Report submitted')}} />}
      </div>
      {isOwnerOrAdmin && (
        <ClaimRequestsPanel itemId={id} isOwnerOrAdmin={isOwnerOrAdmin} onItemUpdated={load} />
      )}
    </div>
    </>
  )
}


