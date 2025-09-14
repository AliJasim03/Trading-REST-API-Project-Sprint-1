// backend/src/routes/orders.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper to map DB row -> JSON
function rowToOrder(row) {
  return {
    id: row.id,
    stockTicker: row.stockTicker,
    price: Number(row.price),
    volume: row.volume,
    buyOrSell: row.buyOrSell,
    statusCode: row.statusCode,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// GET /orders - list all
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(rows.map(rowToOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /orders/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rowToOrder(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /orders - create
router.post('/', async (req, res) => {
  const { stockTicker, price, volume, buyOrSell } = req.body;
  if (!stockTicker || price == null || volume == null || !buyOrSell) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!['BUY','SELL'].includes(buyOrSell)) {
    return res.status(400).json({ error: 'buyOrSell must be BUY or SELL' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO orders (stockTicker, price, volume, buyOrSell, statusCode) VALUES (?, ?, ?, ?, 0)',
      [stockTicker.toUpperCase(), price, volume, buyOrSell]
    );
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [result.insertId]);
    res.status(201).json(rowToOrder(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /orders/:id - update (partial allowed)
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const fields = {};
  ['stockTicker','price','volume','buyOrSell','statusCode'].forEach(k => {
    if (req.body[k] !== undefined) fields[k] = req.body[k];
  });
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  if (fields.buyOrSell && !['BUY','SELL'].includes(fields.buyOrSell)) {
    return res.status(400).json({ error: 'buyOrSell must be BUY or SELL' });
  }

  const cols = [];
  const vals = [];
  for (const [k, v] of Object.entries(fields)) {
    cols.push(`${k} = ?`);
    vals.push(v);
  }
  vals.push(id);

  try {
    const [result] = await pool.query(`UPDATE orders SET ${cols.join(', ')} WHERE id = ?`, vals);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(rowToOrder(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /orders/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
