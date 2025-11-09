import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Card from '../../components/Card'
import ItemForm from '../../components/ItemForm'
import { getItemById } from '../../services/api'

export default function EditItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getItemById(id)
        setItem(data)
      } catch (e) {
        toast.error('Unable to load item')
        navigate('/user/items', { replace: true })
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      load()
    }
  }, [id, navigate])

  function handleUpdated(updated) {
    setItem(updated)
    navigate(`/items/${updated.id}`)
  }

  if (loading) {
    return (
      <Card>
        <div style={{ padding: 20 }}>Loading item…</div>
      </Card>
    )
  }

  if (!item) {
    return null
  }

  return (
    <Card>
      <h2 style={{marginTop:0}}>Edit Item</h2>
      <ItemForm
        mode="edit"
        itemId={item.id}
        initialData={item}
        onUpdated={handleUpdated}
      />
    </Card>
  )
}
