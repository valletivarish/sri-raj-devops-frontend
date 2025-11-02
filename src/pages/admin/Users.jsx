import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext.jsx'
import Table from '../../components/Table'
import { deleteUser, getUsers, setApiToken } from '../../services/api'
import { useConfirmDialog } from '../../components/ConfirmDialog'

export default function Users() {
  const [rows, setRows] = useState([])
  const { token } = useAuth()
  const { show, ConfirmDialog } = useConfirmDialog()
  async function load() { try { setRows(await getUsers()) } catch (e) { toast.error('Failed to load users') } }
  useEffect(() => { if (token) { setApiToken(token); load() } }, [token])
  const columns = [
    { key:'id', title: 'ID' },
    { key:'name', title: 'Name' },
    { key:'email', title: 'Email' },
    { key:'actions', title: 'Actions', render: (r) => <button className="btn muted" onClick={()=> onDelete(r.id)}>Delete</button> },
  ]
  async function onDelete(id) {
    const confirmed = await show('Delete User', 'Are you sure you want to delete this user?')
    if (!confirmed) return
    try { await deleteUser(id); load(); toast.success('User deleted successfully') } catch (e) { toast.error('Delete failed') }
  }
  return (
    <>
      <ConfirmDialog />
      <Table columns={columns} rows={rows} />
    </>
  )
}


