import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Table from '../../components/Table'
import { listMyReports } from '../../services/api'

export default function MyReports() {
  const [rows, setRows] = useState([])
  async function load() { try { const r = await listMyReports(); setRows(r.content||[]) } catch (e) { toast.error('Failed to load reports') } }
  useEffect(() => { load() }, [])
  const columns = [
    { key:'id', title: 'ID' },
    { key:'item', title: 'Item', render: r=> r.item?.title },
    { key:'reporterContact', title: 'Contact' },
    { key:'reason', title: 'Reason' },
  ]
  return (
    <Table columns={columns} rows={rows} />
  )
}


