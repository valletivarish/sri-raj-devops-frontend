import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext.jsx'
import Table from '../../components/Table'
import Card from '../../components/Card'
import { deleteItem, getMyItems } from '../../services/api'

export default function MyItems() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [filters, setFilters] = useState({ type: '', status: '', q: '' })
  const [loading, setLoading] = useState(false)

  async function load() {
    if (!user?.id) return
    setLoading(true)
    try {
      const params = { ...filters }
      const d = await getMyItems(params)
      setRows(d.content || [])
    } catch (e) {
      toast.error('Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      load()
    }
  }, [user?.id, filters.type, filters.status, filters.q])

  function onChange(e) {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleClear() {
    setFilters({ type: '', status: '', q: '' })
  }

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'title', title: 'Title' },
    { key: 'type', title: 'Type' },
    { key: 'status', title: 'Status' },
    { key: 'actions', title: 'Actions', render: (r) => <a className="btn ghost" href={`/items/${r.id}`}>View</a> },
  ]

  return (
    <div className="grid" style={{ gap: 16 }}>
      <Card>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Filter Items</h3>
        <div className="grid" style={{ gap: 12 }}>
          <div>
            <label htmlFor="q">Search</label>
            <input
              id="q"
              name="q"
              type="text"
              className="input"
              placeholder="Search by title or description..."
              value={filters.q}
              onChange={onChange}
            />
          </div>
          <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                className="input"
                value={filters.type}
                onChange={onChange}
              >
                <option value="">All Types</option>
                <option value="LOST">Lost</option>
                <option value="FOUND">Found</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="input"
                value={filters.status}
                onChange={onChange}
              >
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="CLAIMED">Claimed</option>
                <option value="REMOVED">Removed</option>
              </select>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn ghost" onClick={handleClear} disabled={loading}>
              Clear Filters
            </button>
            {loading && <span className="spinner" aria-label="loading" />}
          </div>
        </div>
      </Card>
      <Table columns={columns} rows={rows} />
      {rows.length === 0 && !loading && (
        <Card>
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
            No items found. {filters.q || filters.type || filters.status ? 'Try adjusting your filters.' : 'Create your first item to get started!'}
          </div>
        </Card>
      )}
    </div>
  )
}


