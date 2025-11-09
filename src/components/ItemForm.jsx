import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { createItem, uploadImage, getItemById } from '../services/api'

export default function ItemForm({ onCreated }) {
  const [form, setForm] = useState({ title:'', description:'', type:'LOST', tags:'', location:'' })
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState({})

  function onChange(e) { 
    const { name, value } = e.target
    const trimmed = typeof value === 'string' ? value.slice(0, e.target.maxLength || value.length) : value

    setForm(prev => ({...prev, [name]: trimmed}))

    setErrors(prev => {
      const newErrors = { ...prev }

      const removeError = () => {
        delete newErrors[name]
      }

      if (name === 'title') {
        const t = trimmed?.trim() || ''
        if (!t) {
          newErrors.title = 'Title is required'
        } else if (t.length < 3) {
          newErrors.title = 'Title must be between 3 and 200 characters'
        } else {
          removeError()
        }
      } else if (name === 'description') {
        const d = trimmed?.trim() || ''
        if (!d) {
          newErrors.description = 'Description is required'
        } else if (d.length < 3) {
          newErrors.description = 'Description must be between 3 and 2000 characters'
        } else if (d.length > 2000) {
          newErrors.description = 'Description must be between 3 and 2000 characters'
        } else {
          removeError()
        }
      } else if (name === 'tags') {
        if (trimmed && trimmed.length > 500) {
          newErrors.tags = 'Tags must not exceed 500 characters'
        } else {
          removeError()
        }
      } else if (name === 'location') {
        const loc = trimmed?.trim() || ''
        if (!loc) {
          newErrors.location = 'Location is required'
        } else if (loc.length < 3) {
          newErrors.location = 'Location must be between 3 and 200 characters'
        } else if (loc.length > 200) {
          newErrors.location = 'Location must be between 3 and 200 characters'
        } else {
          removeError()
        }
      } else {
        removeError()
      }

      return newErrors
    })
  }

  function validateForm() {
    const newErrors = {}
    
    if (!form.title || !form.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (form.title.trim().length < 3 || form.title.trim().length > 200) {
      newErrors.title = 'Title must be between 3 and 200 characters'
    }
    
    if (!form.description || !form.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (form.description.trim().length < 3 || form.description.trim().length > 2000) {
      newErrors.description = 'Description must be between 3 and 2000 characters'
    }
    
    if (!form.type) {
      newErrors.type = 'Type is required'
    } else if (!['LOST', 'FOUND'].includes(form.type)) {
      newErrors.type = 'Type must be either LOST or FOUND'
    }
    
    if (form.tags && form.tags.length > 500) {
      newErrors.tags = 'Tags must not exceed 500 characters'
    }
    
    if (!form.location || !form.location.trim()) {
      newErrors.location = 'Location is required'
    } else if (form.location.trim().length < 3 || form.location.trim().length > 200) {
      newErrors.location = 'Location must be between 3 and 200 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function validateFiles() {
    if (files.length === 0) return true
    
    const maxFileSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    
    for (const file of files) {
      if (file.size > maxFileSize) {
        toast.error(`File "${file.name}" exceeds maximum size of 5MB`)
        return false
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File "${file.name}" must be an image (JPEG, PNG, GIF, or WebP)`)
        return false
      }
    }
    return true
  }

  function renameFile(file, title, index, total) {
    if (!title || !title.trim()) {
      return file
    }
    
    const sanitizedTitle = title.trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]+/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    if (!sanitizedTitle || sanitizedTitle.length === 0) {
      return file
    }
    
    const finalTitle = sanitizedTitle.substring(0, 50)
    const extension = file.name.split('.').pop() || 'jpg'
    const suffix = total > 1 ? `-${index + 1}` : ''
    const newName = `${finalTitle}${suffix}.${extension}`
    
    if (!newName || newName.length === 0 || newName === `.${extension}`) {
      return file
    }
    
    return new File([file], newName, {
      type: file.type,
      lastModified: file.lastModified
    })
  }

  async function onSubmit(e) {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix validation errors')
      return
    }
    
    if (!validateFiles()) {
      return
    }
    
    try {
      setUploading(true)
      const itemData = {
        title: form.title.trim(),
        description: form.description ? form.description.trim() : null,
        type: form.type,
        tags: form.tags ? form.tags.trim() : null,
        location: form.location ? form.location.trim() : null
      }
      const created = await createItem(itemData)
      
      if (files.length > 0) {
        const renamedFiles = files.map((file, index) => 
          renameFile(file, form.title, index, files.length)
        )
        
        for (const f of renamedFiles) {
          await uploadImage(f, created.id)
        }
        const updated = await getItemById(created.id)
        onCreated?.(updated)
      } else {
        onCreated?.(created)
      }
      setUploading(false)
    } catch (err) {
      setUploading(false)
      if (err.response?.data?.errors) {
        const validationErrors = {}
        err.response.data.errors.forEach(error => {
          validationErrors[error.field] = error.message
        })
        setErrors(validationErrors)
        toast.error('Please fix validation errors')
      } else {
        toast.error(err.response?.data?.message || 'Failed to create item')
      }
      console.error(err)
    }
  }

  return (
    <form className="grid" onSubmit={onSubmit}>
      <div>
        <label htmlFor="title">Title *</label>
        <input 
          id="title" 
          name="title" 
          className={`input ${errors.title ? 'error' : ''}`} 
          value={form.title} 
          onChange={onChange}
          maxLength={200}
        />
        {errors.title && <div style={{color: 'var(--accent)', fontSize: '14px', marginTop: '4px'}}>{errors.title}</div>}
        <div style={{color: 'var(--muted)', fontSize: '12px', marginTop: '4px'}}>3-200 characters</div>
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea 
          id="description" 
          name="description" 
          className={`input ${errors.description ? 'error' : ''}`} 
          value={form.description} 
          onChange={onChange} 
          rows={4}
          maxLength={2000}
        />
        {errors.description && <div style={{color: 'var(--accent)', fontSize: '14px', marginTop: '4px'}}>{errors.description}</div>}
        <div style={{color: 'var(--muted)', fontSize: '12px', marginTop: '4px'}}>3-2000 characters</div>
      </div>
      <div className="row">
        <div style={{flex:1}}>
          <label>Type</label>
          <select name="type" className="input" value={form.type} onChange={onChange}>
            <option value="LOST">LOST</option>
            <option value="FOUND">FOUND</option>
          </select>
        </div>
        <div style={{flex:2}}>
          <label htmlFor="tags">Tags (comma separated)</label>
          <input 
            id="tags" 
            name="tags" 
            className={`input ${errors.tags ? 'error' : ''}`} 
            value={form.tags} 
            onChange={onChange} 
            placeholder="wallet,black"
            maxLength={500}
          />
          {errors.tags && <div style={{color: 'var(--accent)', fontSize: '14px', marginTop: '4px'}}>{errors.tags}</div>}
          <div style={{color: 'var(--muted)', fontSize: '12px', marginTop: '4px'}}>Max 500 characters</div>
        </div>
      </div>
      <div>
        <label htmlFor="location">Location</label>
        <input 
          id="location" 
          name="location" 
          className={`input ${errors.location ? 'error' : ''}`} 
          value={form.location} 
          onChange={onChange}
          maxLength={200}
        />
        {errors.location && <div style={{color: 'var(--accent)', fontSize: '14px', marginTop: '4px'}}>{errors.location}</div>}
        <div style={{color: 'var(--muted)', fontSize: '12px', marginTop: '4px'}}>3-200 characters</div>
      </div>
      <div>
        <label htmlFor="images">Images</label>
        <input 
          id="images"
          type="file" 
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" 
          multiple 
          className="input"
          onChange={(e)=> setFiles(Array.from(e.target.files||[]))} 
        />
        <div style={{color: 'var(--muted)', fontSize: '12px', marginTop: '4px'}}>JPEG, PNG, GIF, or WebP. Max 5MB per file</div>
      </div>
      <div className="row">
        <button 
          className="btn" 
          disabled={uploading || Object.keys(errors).length > 0} 
          type="submit"
        >
          {uploading ? 'Uploading…' : 'Create'}
        </button>
      </div>
    </form>
  )
}


