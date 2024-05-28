// schedulingRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all schedules
router.get('/schedules', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM schedules');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get schedule by ID
router.get('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM schedules WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add a new schedule
router.post('/schedules', async (req, res) => {
  try {
    const { date, time, description } = req.body;
    const { rows } = await db.query('INSERT INTO schedules (date, time, description) VALUES ($1, $2, $3) RETURNING *', [date, time, description]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update schedule by ID
router.put('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, description } = req.body;
    const { rows } = await db.query('UPDATE schedules SET date = $1, time = $2, description = $3 WHERE id = $4 RETURNING *', [date, time, description, id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete schedule by ID
router.delete('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM schedules WHERE id = $1', [id]);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
