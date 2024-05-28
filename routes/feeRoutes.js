// feeRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all fees
router.get('/fees', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM fees');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get fee by ID
router.get('/fees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM fees WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add a new fee
router.post('/fees', async (req, res) => {
  try {
    const { amount, description } = req.body;
    const { rows } = await db.query('INSERT INTO fees (amount, description) VALUES ($1, $2) RETURNING *', [amount, description]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update fee by ID
router.put('/fees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;
    const { rows } = await db.query('UPDATE fees SET amount = $1, description = $2 WHERE id = $3 RETURNING *', [amount, description, id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete fee by ID
router.delete('/fees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM fees WHERE id = $1', [id]);
    res.json({ message: 'Fee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
