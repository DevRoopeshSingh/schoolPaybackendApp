// userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const pool = require('../db')


// Get all users
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user_mst;');
    // console.log('db response', rows);
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
    
    console.log('User ID:', id); // Log the ID

    // Ensure ID is a valid number
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const [rows] = await pool.query('SELECT * FROM user_mst WHERE user_id = ?', [id]);
    console.log('Query Result:', rows); // Log the query result


    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Create a new user
router.post('/users', async (req, res) => {
  try {
    console.log('request body', req.body);

    const {
      first_name,
      middle_name,
      last_name,
      email_id,
      user_pwd,
      user_role_id,
      is_active,
      phone_no,
      permanent_address,
      current_address,
      dob,
      gender,
      created_by,
      modified_by
    } = req.body;

    // Validate required fields
    console.log('validate required fields');
    if (!first_name || !last_name || !email_id || !user_pwd || user_role_id === undefined || is_active === undefined || !phone_no || !dob || !gender || !created_by || !modified_by) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if the user already exists
    console.log('Check if the user already exists');
    const [existingUser] = await pool.query('SELECT * FROM user_mst WHERE email_id = ?', [email_id]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    console.log('after Checking if the user already exists');

    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO user_mst (first_name, middle_name, last_name, email_id, user_pwd, user_role_id, is_active, phone_no, permanent_address, current_address, dob, gender, created_by, modified_by, created_date, modified_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [first_name, middle_name, last_name, email_id, user_pwd, user_role_id, is_active, phone_no, permanent_address, current_address, dob, gender, created_by, modified_by]
    );

    console.log('Create New User');

    const [newUser] = await pool.query('SELECT * FROM user_mst WHERE user_id = ?', [result.insertId]);
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Update user by ID
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('id',id);
    const { first_name, middle_name, last_name, email } = req.body;

    console.log('request Body',req.body);

    // Validate request body
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [result] = await pool.query('UPDATE user_mst SET first_name = ?, middle_name = ?, last_name = ?, email_id = ? WHERE user_id = ?', [first_name, middle_name, last_name, email, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const [updatedUser] = await pool.query('SELECT * FROM user_mst WHERE user_id = ?', [id]);
    res.json(updatedUser[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user by ID
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM user_mst WHERE user_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
