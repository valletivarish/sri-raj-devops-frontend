import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { createItem, uploadImage, getItemById } from '../services/api'

export default function ItemForm({ onCreated }) {
  const [form, setForm] = useState({ title:'', description:'', type:'LOST', tags:'', location:'' })
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  function onChange(e) { setForm(prev => ({...prev, [e.target.name]: e.target.value})) }

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
    try {
      setUploading(true)
      const created = await createItem(form)
      
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
      toast.error('Failed to create item')
      console.error(err)
    }
  }

  return (
    <form className="grid" onSubmit={onSubmit}>
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" className="input" value={form.title} onChange={onChange} required />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" className="input" value={form.description} onChange={onChange} rows={4} />
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
          <input id="tags" name="tags" className="input" value={form.tags} onChange={onChange} placeholder="wallet,black" />
        </div>
      </div>
      <div>
        <label htmlFor="location">Location</label>
        <input id="location" name="location" className="input" value={form.location} onChange={onChange} />
      </div>
      <div>
        <label htmlFor="images">Images</label>
        <input 
          id="images"
          type="file" 
          accept="image/*" 
          multiple 
          className="input"
          onChange={(e)=> setFiles(Array.from(e.target.files||[]))} 
        />
      </div>
      <div className="row">
        <button className="btn" disabled={uploading} type="submit">{uploading ? 'Uploading…' : 'Create'}</button>
      </div>
    </form>
  )
}


