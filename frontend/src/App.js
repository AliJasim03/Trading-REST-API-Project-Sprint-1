import React, { useEffect, useState } from 'react';
import OrdersList from './components/OrdersList';
import OrderForm from './components/OrderForm';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

function App() {
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);

  async function fetchOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    const data = await res.json();
    setOrders(data);
  }

  useEffect(() => { fetchOrders(); }, []);

  async function handleCreate(payload) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const created = await res.json();
      setOrders(prev => [created, ...prev]);
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'unknown'));
    }
  }

  async function handleUpdate(id, payload) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      setEditing(null);
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'unknown'));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete order #' + id + '?')) return;
    const res = await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
    if (res.status === 204) {
      setOrders(prev => prev.filter(o => o.id !== id));
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'unknown'));
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Trading Orders — Sprint 1</h1>
      <OrderForm
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        editing={editing}
        onCancel={() => setEditing(null)}
      />
      <OrdersList
        orders={orders}
        onEdit={(order) => setEditing(order)}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default App;
