import React from 'react'

export default function Table({ columns = [], rows = [] }) {
  return (
    <div className="card" style={{overflowX:'auto'}}>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr>
            {columns.map(c => <th key={c.key} style={{textAlign:'left', padding:'8px 12px', borderBottom:'1px solid #e5e7eb'}}>{c.title}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              {columns.map(c => <td key={c.key} style={{padding:'10px 12px', borderBottom:'1px solid #f3f4f6'}}>{c.render? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


