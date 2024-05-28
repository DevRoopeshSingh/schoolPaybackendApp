// communicationRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all communication messages
router.get('/communication', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM communication');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get communication message by ID
router.get('/communication/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM communication WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add a new communication message
router.post('/communication', async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    const { rows } = await db.query('INSERT INTO communication (sender, receiver, message) VALUES ($1, $2, $3) RETURNING *', [sender, receiver, message]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update communication message by ID
router.put('/communication/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sender, receiver, message } = req.body;
    const { rows } = await db.query('UPDATE communication SET sender = $1, receiver = $2, message = $3 WHERE id = $4 RETURNING *', [sender, receiver, message, id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete communication message by ID
router.delete('/communication/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM communication WHERE id = $1', [id]);
    res.json({ message: 'Communication message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
