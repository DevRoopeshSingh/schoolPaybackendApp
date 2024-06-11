// routes/authRoutes.js
var express = require('express');
var jwt = require('jsonwebtoken');
var db = require('../db'); // Import the MySQL connection

var router = express.Router();
var secretKey = process.env.SECRET_KEY || 'your_secret_key';

// Sign-up endpoint
router.post('/signup', function(req, res) {
  var userEmail = req.body.email_id;
  var password = req.body.user_pwd;

  // Check if the user already exists
  db.query('SELECT * FROM user_mst WHERE email_id = ?', [userEmail], function(error, results) {
    if (error) {
      return res.status(500).json({ message: 'Database query error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Insert the new user into the database
    db.query('INSERT INTO user_mst (email_id, user_pwd) VALUES (?, ?)', [userEmail, password], function(error, results) {
      if (error) {
        return res.status(500).json({ message: 'Database insertion error' });
      }

      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});


//Login Endpoint
router.post('/login', function(req, res) {
    console.log('req body:-----------', req.body);
    var userEmail = req.body.email_id;
    var password = req.body.user_pwd;
    
    // Query the database to find the user
    db.query('SELECT * FROM user_mst WHERE email_id = ? AND user_pwd = ?', [userEmail, password], function(error, results) {
      if (error) {
        console.error('Database query error:', error);
        return res.status(500).json({ message: 'Database query error' });
      }
  
      console.log('Database query executed successfully');
      console.log('Query results:', results);
  
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      console.log('User found:', results[0]);
      var user = results[0];
      var token = jwt.sign({ id: user.id, email: user.email_id }, secretKey, { expiresIn: '1h' });
  
      res.json({ token: token });
    });
  });
  
// Middleware to verify JWT token
function verifyToken(req, res, next) {
  var token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, secretKey, function(err, decoded) {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    req.user = decoded;
    next();
  });
}

module.exports = router;
