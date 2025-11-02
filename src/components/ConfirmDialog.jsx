import React, { useState, useEffect } from 'react'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  if (!open) return null
  
  const handleConfirm = () => {
    onConfirm(true)
    onClose()
  }

  const handleCancel = () => {
    onConfirm(false)
    onClose()
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCancel()
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="modal-backdrop" onClick={handleCancel}>
      <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <h3 style={{marginBottom: 12}}>{title || 'Confirm'}</h3>
        <p style={{marginBottom: 20, color: '#6B7280'}}>{message}</p>
        <div style={{display: 'flex', gap: 12, justifyContent: 'flex-end'}}>
          <button className="btn muted" onClick={handleCancel}>Cancel</button>
          <button className="btn accent" onClick={handleConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

export function useConfirmDialog() {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState({ title: 'Confirm', message: '', resolve: null })

  const show = (title, message) => {
    return new Promise((resolve) => {
      setConfig({ title, message, resolve })
      setOpen(true)
    })
  }

  const handleConfirm = (result) => {
    if (config.resolve) config.resolve(result)
    setOpen(false)
  }

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      onConfirm={handleConfirm}
      title={config.title}
      message={config.message}
    />
  )

  return { show, ConfirmDialog: ConfirmDialogComponent }
}

