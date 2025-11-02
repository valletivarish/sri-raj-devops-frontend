import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import { getCurrentUser, updateCurrentUser, setApiToken } from '../../services/api'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Profile() {
  const { user, setUser, setToken } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.id) {
      getCurrentUser().then(userData => {
        setData(userData)
        setFormData({
          name: userData.name || '',
          email: userData.email || ''
        })
      }).catch(() => {
        toast.error('Failed to load profile')
      })
    }
  }, [user])

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const emailChanged = data.email !== formData.email
      const updated = await updateCurrentUser(formData)
      
      if (emailChanged) {
        setToken(null)
        setApiToken(null)
        setUser(null)
        setEditing(false)
        toast.success('Email changed successfully. Please login again with your new email.')
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } else {
        setData(updated)
        setUser(updated)
        setEditing(false)
        toast.success('Profile updated successfully')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setFormData({
      name: data?.name || '',
      email: data?.email || ''
    })
    setEditing(false)
  }

  if (!data) {
    return (
      <Card>
        <h3>Profile</h3>
        <div>Loading...</div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="space-between" style={{marginBottom: '16px'}}>
        <h3 style={{margin: 0}}>Profile</h3>
        {!editing && (
          <button className="btn" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="grid" style={{gap: 16}}>
          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row" style={{gap: 8}}>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn ghost" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="grid" style={{gap: 12}}>
          <div>
            <strong>Name:</strong>
            <div style={{marginTop: 4}}>{data.name}</div>
          </div>
          <div>
            <strong>Email:</strong>
            <div style={{marginTop: 4}}>{data.email}</div>
          </div>
          {data.username && (
            <div>
              <strong>Username:</strong>
              <div style={{marginTop: 4}}>{data.username}</div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}


