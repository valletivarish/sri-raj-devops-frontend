import React, { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { getItems } from '../services/api'
import ItemCard from '../components/ItemCard'
import { useAuth } from '../context/AuthContext.jsx'

export default function Home() {
  const { token } = useAuth()
  const [items, setItems] = useState({ content: [] })
  const [filters, setFilters] = useState({ type:'', status:'', q:'', tags:'' })
  const itemsLoadRef = useRef(false) // Prevent duplicate calls in same mount cycle

  async function load() {
    try {
      const data = await getItems({ ...filters })
      setItems(data)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load items')
    }
  }

  useEffect(() => {
    // Prevent duplicate calls only during React StrictMode double-invoke
    if (itemsLoadRef.current) {
      // Already called in this mount cycle, skip duplicate
      return
    }
    itemsLoadRef.current = true
    
    let isMounted = true
    
    const fetchItems = async () => {
      try {
        const data = await getItems({ ...filters })
        // Only update state if component is still mounted
        if (isMounted) {
          setItems(data)
        }
      } catch (e) {
        if (isMounted) {
          console.error(e)
          toast.error('Failed to load items')
        }
      }
    }
    
    fetchItems()
    
    return () => {
      isMounted = false
      // Reset ref after a delay to allow page reload on navigation
      // But long enough delay to avoid StrictMode cancellation
      setTimeout(() => {
        itemsLoadRef.current = false
      }, 500)
    }
  }, [])

  function onChange(e) { setFilters(prev => ({...prev, [e.target.name]: e.target.value})) }

  return (
    <div className="container grid" style={{gap:16}}>
      <div className="card">
        <div className="row">
          <select name="type" className="input" value={filters.type} onChange={onChange}>
            <option value="">All Types</option>
            <option value="LOST">LOST</option>
            <option value="FOUND">FOUND</option>
          </select>
          <select name="status" className="input" value={filters.status} onChange={onChange}>
            <option value="">Any Status</option>
            <option value="OPEN">OPEN</option>
            <option value="CLAIMED">CLAIMED</option>
            <option value="REMOVED">REMOVED</option>
          </select>
          <input name="q" className="input" placeholder="Search..." value={filters.q} onChange={onChange} />
          <button className="btn" onClick={load}>Apply</button>
          {token && <a className="btn accent" href="/create">Create</a>}
        </div>
      </div>
      <div className="grid cards">
        {(items.content||[]).map(item => <ItemCard key={item.id} item={item} />)}
      </div>
    </div>
  )
}


