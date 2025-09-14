import React from 'react';

export default function OrdersList({ orders, onEdit, onDelete }) {
  if (!orders || orders.length === 0) return <p>No orders yet.</p>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>#</th><th>Ticker</th><th>Price</th><th>Volume</th><th>Side</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(o => (
          <tr key={o.id} style={{ borderTop: '1px solid #eee' }}>
            <td>{o.id}</td>
            <td>{o.stockTicker}</td>
            <td>{o.price}</td>
            <td>{o.volume}</td>
            <td>{o.buyOrSell}</td>
            <td>{o.statusCode}</td>
            <td>
              <button onClick={() => onEdit(o)}>Edit</button>
              <button onClick={() => onDelete(o.id)} style={{ marginLeft: 6 }}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
