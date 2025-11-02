import React, { useState, useEffect, useRef } from 'react'

export default function PromptModal({ open, onClose, onConfirm, title, message, defaultValue }) {
  const [value, setValue] = useState(defaultValue || '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
    if (open) setValue(defaultValue || '')
  }, [open, defaultValue])

  const handleConfirm = () => {
    onConfirm(value)
    onClose()
  }

  const handleCancel = () => {
    onConfirm('')
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') handleCancel()
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={handleCancel}>
      <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <h3 style={{marginBottom: 12}}>{title || 'Enter Information'}</h3>
        <p style={{marginBottom: 12, color: '#6B7280'}}>{message}</p>
        <input
          ref={inputRef}
          type="text"
          className="input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          style={{marginBottom: 20}}
        />
        <div style={{display: 'flex', gap: 12, justifyContent: 'flex-end'}}>
          <button className="btn muted" onClick={handleCancel}>Cancel</button>
          <button className="btn accent" onClick={handleConfirm}>OK</button>
        </div>
      </div>
    </div>
  )
}

export function usePromptModal() {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState({ 
    title: 'Enter Information', 
    message: '', 
    defaultValue: '',
    resolve: null 
  })

  const show = (title, message, defaultValue = '') => {
    return new Promise((resolve) => {
      setConfig({ title, message, defaultValue, resolve })
      setOpen(true)
    })
  }

  const handleConfirm = (result) => {
    if (config.resolve) config.resolve(result)
    setOpen(false)
  }

  const PromptModalComponent = () => (
    <PromptModal
      open={open}
      onClose={() => setOpen(false)}
      onConfirm={handleConfirm}
      title={config.title}
      message={config.message}
      defaultValue={config.defaultValue}
    />
  )

  return { show, PromptModal: PromptModalComponent }
}

