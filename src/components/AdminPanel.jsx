import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { deleteItem, deleteUser, getReports, getUsers } from '../services/api'
import { useConfirmDialog } from './ConfirmDialog'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState({ content: [], totalElements: 0 })
  const { show, ConfirmDialog } = useConfirmDialog()

  async function refresh() {
    try {
      const u = await getUsers()
      setUsers(u)
    } catch (e) {
      console.error('Users fetch failed', e)
    }
    try {
      const r = await getReports()
      setReports(r)
    } catch (e) {
      console.error('Reports fetch failed', e)
    }
  }

  useEffect(() => { refresh() }, [])

  async function onDeleteUser(id) {
    const confirmed = await show('Delete User', 'Are you sure you want to delete this user?')
    if (!confirmed) return
    try { await deleteUser(id); refresh(); toast.success('User deleted successfully') } catch (e) { toast.error('Delete failed') }
  }

  async function onRemoveItem(id) {
    const confirmed = await show('Remove Item', 'Are you sure you want to remove this item?')
    if (!confirmed) return
    try { await deleteItem(id); refresh(); toast.success('Item removed successfully') } catch (e) { toast.error('Remove failed') }
  }

  return (
    <>
      <ConfirmDialog />
      <div className="grid">
        <section className="card">
          <h3>Reports</h3>
        <div className="grid" style={{gap:8}}>
          {(reports.content || []).map(r => (
            <div key={r.id} className="row" style={{justifyContent:'space-between'}}>
              <div>
                <div><strong>Item:</strong> {r.item?.title} (#{r.item?.id})</div>
                <div><strong>Contact:</strong> {r.reporterContact}</div>
                <div><strong>Reason:</strong> {r.reason}</div>
              </div>
              <div className="row">
                <a className="btn ghost" href={`/items/${r.item?.id}`}>View item</a>
                <button className="btn accent" onClick={()=>onRemoveItem(r.item?.id)}>Remove item</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Users</h3>
        <div className="grid" style={{gap:8}}>
          {users.map(u => (
            <div key={u.id} className="space-between">
              <div>{u.name} — {u.email}</div>
              <button className="btn muted" onClick={()=>onDeleteUser(u.id)}>Delete</button>
            </div>
          ))}
        </div>
      </section>
    </div>
    </>
  )
}


