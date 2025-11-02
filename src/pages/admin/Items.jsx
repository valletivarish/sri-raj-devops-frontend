import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext.jsx'
import Table from '../../components/Table'
import { deleteItem, getItems, setApiToken } from '../../services/api'
import { useConfirmDialog } from '../../components/ConfirmDialog'

export default function Items() {
  const [rows, setRows] = useState([])
  const { token } = useAuth()
  const { show, ConfirmDialog } = useConfirmDialog()
  async function load() { try { const d = await getItems(); setRows(d.content||[]) } catch (e) { toast.error('Failed to load items') } }
  useEffect(() => { if (token) { setApiToken(token); load() } }, [token])
  const columns = [
    { key:'id', title: 'ID' },
    { key:'title', title: 'Title' },
    { key:'type', title: 'Type' },
    { key:'status', title: 'Status' },
    { key:'actions', title: 'Actions', render: (r) => (
      <div className="row" style={{gap:8}}>
        <a className="btn" href={`/items/${r.id}`}>View</a>
        <button className="btn muted" onClick={()=> onDelete(r.id)}>Delete</button>
      </div>
    ) },
  ]
  async function onDelete(id) {
    const confirmed = await show('Delete Item', 'Are you sure you want to delete this item?')
    if (!confirmed) return
    try { await deleteItem(id); load(); toast.success('Item deleted successfully') } catch (e) { toast.error('Delete failed') }
  }
  return (
    <>
      <ConfirmDialog />
      <Table columns={columns} rows={rows} />
    </>
  )
}


