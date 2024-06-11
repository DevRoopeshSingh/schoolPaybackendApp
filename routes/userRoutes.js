// userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const pool = require('../db')
// Get all users
// router.get('/users', async (req, res) => {
//   try {
//     const users = await db.query('SELECT * FROM user_mst;');
//     console.log('db response',users);
//     res.json(users.rows); // Send only the rows to the client
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

router.get('/users', async (req, res) => {
  try {
    const [rows, fields] = await pool.query('SELECT * FROM user_mst;');
    console.log('db response', rows);
    res.json(rows); // Send only the rows to the client
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.query('SELECT * FROM user_mst WHERE user_id = $1', [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new user
router.post('/users', async (req, res) => {
  try {
    const { first_name, middle_name, last_name, email } = req.body;
    
    // Validate request body
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if the user already exists
    const existingUser = await db.query('SELECT * FROM user_mst WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create the new user
    const newUser = await db.query('INSERT INTO user_mst (first_name, middle_name, last_name, email) VALUES ($1, $2, $3, $4) RETURNING *', [first_name, middle_name, last_name, email]);
    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user by ID
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, middle_name, last_name, email } = req.body;

    // Validate request body
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const updatedUser = await db.query('UPDATE user_mst SET first_name = $1, middle_name = $2, last_name = $3, email = $4 WHERE user_id = $5 RETURNING *', [first_name, middle_name, last_name, email, id]);
    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user by ID
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await db.query('DELETE FROM user_mst WHERE user_id = $1 RETURNING *', [id]);
    if (deletedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
