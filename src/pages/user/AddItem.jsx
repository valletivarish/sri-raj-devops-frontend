import React from 'react'
import ItemForm from '../../components/ItemForm'

export default function AddItem() {
  return (
    <div className="card">
      <h3>Add New Item</h3>
      <ItemForm onCreated={(i)=> window.location.href=`/items/${i.id}`} />
    </div>
  )
}


