import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext.jsx'
import Table from '../../components/Table'
import { getReports, setApiToken } from '../../services/api'

export default function Reports() {
  const [rows, setRows] = useState([])
  const { token } = useAuth()
  async function load() { try { const r = await getReports(); setRows(r.content||[]) } catch (e) { toast.error('Failed to load reports') } }
  useEffect(() => { if (token) { setApiToken(token); load() } }, [token])
  const columns = [
    { key:'id', title: 'ID' },
    { key:'item', title: 'Item', render: r => r.item?.title },
    { key:'reporterContact', title: 'Contact' },
    { key:'reason', title: 'Reason' },
  ]
  return (
    <Table columns={columns} rows={rows} />
  )
}


