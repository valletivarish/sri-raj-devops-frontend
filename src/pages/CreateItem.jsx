import React from 'react'
import ItemForm from '../components/ItemForm'

export default function CreateItem() {
  return (
    <div className="container">
      <div className="card">
        <h2>Create Item</h2>
        <ItemForm onCreated={(i)=>{ window.location.href = `/items/${i.id}` }} />
      </div>
    </div>
  )
}


