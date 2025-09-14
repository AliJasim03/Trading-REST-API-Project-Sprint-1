import React, { useEffect, useState } from 'react';

export default function OrderForm({ onCreate, onUpdate, editing, onCancel }) {
  const [form, setForm] = useState({
    stockTicker: '',
    price: '',
    volume: '',
    buyOrSell: 'BUY',
  });

  useEffect(() => {
    if (editing) {
      setForm({
        stockTicker: editing.stockTicker || '',
        price: editing.price || '',
        volume: editing.volume || '',
        buyOrSell: editing.buyOrSell || 'BUY'
      });
    } else {
      setForm({ stockTicker: '', price: '', volume: '', buyOrSell: 'BUY' });
    }
  }, [editing]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      stockTicker: form.stockTicker.trim().toUpperCase(),
      price: parseFloat(form.price),
      volume: parseInt(form.volume, 10),
      buyOrSell: form.buyOrSell
    };

    if (!payload.stockTicker || Number.isNaN(payload.price) || Number.isNaN(payload.volume)) {
      alert('Please fill in all fields correctly.');
      return;
    }

    if (editing) {
      onUpdate(editing.id, payload);
    } else {
      onCreate(payload);
    }
    setForm({ stockTicker: '', price: '', volume: '', buyOrSell: 'BUY' });
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20, padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
      <h3>{editing ? `Edit Order #${editing.id}` : 'Create New Order'}</h3>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input name="stockTicker" placeholder="Ticker (AAPL)" value={form.stockTicker} onChange={handleChange} />
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />
        <input name="volume" placeholder="Volume" value={form.volume} onChange={handleChange} />
        <select name="buyOrSell" value={form.buyOrSell} onChange={handleChange}>
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" onClick={onCancel}>Cancel</button>}
        </div>
      </div>
    </form>
  );
}
