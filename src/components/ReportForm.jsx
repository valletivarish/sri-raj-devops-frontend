import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { createReport } from '../services/api'

export default function ReportForm({ itemId, onCreated }) {
  const [reporterContact, setContact] = useState('')
  const [reason, setReason] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    try {
      const created = await createReport(itemId, { reporterContact, reason })
      onCreated?.(created)
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit report')
    }
  }

  return (
    <form className="grid" onSubmit={onSubmit}>
      <div>
        <label htmlFor="contact">Contact</label>
        <input id="contact" className="input" value={reporterContact} onChange={e=>setContact(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="reason">Reason</label>
        <textarea id="reason" className="input" value={reason} onChange={e=>setReason(e.target.value)} rows={3} />
      </div>
      <button className="btn" type="submit">Submit report</button>
    </form>
  )
}


