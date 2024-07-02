const express = require('express');
const router = express.Router();
const pool = require('../db') 


// Get all classes
router.get('/classesAll',  async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM classes');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Get a single class by ID
router.get('/classes/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM classes WHERE class_id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Class not found' });
      }
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }});

// Create a new class
router.post('/classes/', async (req, res) => {
    const { class_name, class_description, school_id, class_teacher_id, created_by, modified_by } = req.body;
    try {
      const [result] = await pool.query(
        'INSERT INTO classes (class_name, class_description, school_id, class_teacher_id, created_by, modified_by) VALUES (?, ?, ?, ?, ?, ?)',
        [class_name, class_description, school_id, class_teacher_id, created_by, modified_by]
      );
      res.status(201).json({ message: 'Class created', class_id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Update a class by ID
router.put('/classes/:id', async (req, res) => {
    const { id } = req.params;
    const { class_name, class_description, school_id, class_teacher_id, modified_by, is_active } = req.body;
    try {
      const [result] = await pool.query(
        'UPDATE classes SET class_name = ?, class_description = ?, school_id = ?, class_teacher_id = ?, modified_by = ?, is_active = ? WHERE class_id = ?',
        [class_name, class_description, school_id, class_teacher_id, modified_by, is_active, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Class not found' });
      }
      res.json({ message: 'Class updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// Delete a class by ID
router.delete('/classes/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await pool.query('DELETE FROM classes WHERE class_id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Class not found' });
      }
      res.json({ message: 'Class deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;