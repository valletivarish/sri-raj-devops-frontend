import React, { useEffect, useRef } from 'react'

export default function Modal({ open, onClose, title, children }) {
  const ref = useRef(null)
  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <div className="space-between" style={{marginBottom: 8}}>
          <h3>{title}</h3>
          <button className="btn ghost" onClick={onClose} ref={ref}>Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}


