import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { createReport } from '../services/api'

export default function ReportForm({ itemId, onCreated }) {
  const [reporterContact, setContact] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState({})

  function onChange(field, value) {
    if (field === 'contact') {
      setContact(value)
      if (errors.contact) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.contact
          return newErrors
        })
      }
    } else if (field === 'reason') {
      setReason(value)
      if (errors.reason) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.reason
          return newErrors
        })
      }
    }
  }

  function validateForm() {
    const newErrors = {}
    
    if (!reporterContact || !reporterContact.trim()) {
      newErrors.contact = 'Contact is required'
    } else if (reporterContact.trim().length < 3 || reporterContact.trim().length > 100) {
      newErrors.contact = 'Contact must be between 3 and 100 characters'
    } else if (!/^[a-zA-Z0-9@.\s\-+()]+$/.test(reporterContact.trim())) {
      newErrors.contact = 'Contact contains invalid characters'
    }
    
    if (reason && reason.length > 1000) {
      newErrors.reason = 'Reason must not exceed 1000 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function onSubmit(e) {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix validation errors')
      return
    }
    
    try {
      const reportData = {
        reporterContact: reporterContact.trim(),
        reason: reason ? reason.trim() : null
      }
      const created = await createReport(itemId, reportData)
      onCreated?.(created)
      setContact('')
      setReason('')
      setErrors({})
    } catch (err) {
      console.error(err)
      if (err.response?.data?.errors) {
        const validationErrors = {}
        err.response.data.errors.forEach(error => {
          validationErrors[error.field] = error.message
        })
        setErrors(validationErrors)
        toast.error('Please fix validation errors')
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit report')
      }
    }
  }

  return (
    <form className="grid" onSubmit={onSubmit}>
      <div>
        <label htmlFor="contact">Contact *</label>
        <input 
          id="contact" 
          className={`input ${errors.contact ? 'error' : ''}`} 
          value={reporterContact} 
          onChange={e=>onChange('contact', e.target.value)}
          maxLength={100}
        />
        {errors.contact && <div style={{color: 'var(--accent)', fontSize: '14px', marginTop: '4px'}}>{errors.contact}</div>}
        <div style={{color: 'var(--muted)', fontSize: '12px', marginTop: '4px'}}>3-100 characters (letters, numbers, @, ., spaces, -, +, (),)</div>
      </div>
      <div>
        <label htmlFor="reason">Reason</label>
        <textarea 
          id="reason" 
          className={`input ${errors.reason ? 'error' : ''}`} 
          value={reason} 
          onChange={e=>onChange('reason', e.target.value)} 
          rows={3}
          maxLength={1000}
        />
        {errors.reason && <div style={{color: 'var(--accent)', fontSize: '14px', marginTop: '4px'}}>{errors.reason}</div>}
        <div style={{color: 'var(--muted)', fontSize: '12px', marginTop: '4px'}}>Max 1000 characters</div>
      </div>
      <button 
        className="btn" 
        type="submit"
        disabled={Object.keys(errors).length > 0}
      >
        Submit report
      </button>
    </form>
  )
}


