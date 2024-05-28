// attendanceRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all attendance records
router.get('/attendance', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM attendance');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get attendance record by ID
router.get('/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM attendance WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add a new attendance record
router.post('/attendance', async (req, res) => {
  try {
    const { student_id, date, status } = req.body;
    const { rows } = await db.query('INSERT INTO attendance (student_id, date, status) VALUES ($1, $2, $3) RETURNING *', [student_id, date, status]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update attendance record by ID
router.put('/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, date, status } = req.body;
    const { rows } = await db.query('UPDATE attendance SET student_id = $1, date = $2, status = $3 WHERE id = $4 RETURNING *', [student_id, date, status, id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete attendance record by ID
router.delete('/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM attendance WHERE id = $1', [id]);
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
