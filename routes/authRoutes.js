// routes/authRoutes.js
var bcrypt = require('bcryptjs');
var express = require('express');
var jwt = require('jsonwebtoken');
var db = require('../db'); // Import the MySQL connection

var router = express.Router();
var secretKey = process.env.JWT_SECRET || 'your_secret_key';

console.log('Showing Token',secretKey);

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
// POST /login
router.post('/login', async (req, res) => {
  try {
    console.log('req body:', req.body);
    const { email_id, user_pwd } = req.body;

    // Validate inputs (basic example)
    if (!email_id || !user_pwd) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Query the database to find the user:', email_id);

    // Query the database to find the user
    const query = 'SELECT * FROM user_mst WHERE email_id = ?';
    const [user] = await db.query(query, [email_id]);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('user INFO',user)

    // Compare password using bcrypt
    // const isMatch = await bcrypt.compare(user_pwd, user.user_pwd);
    // if (!isMatch) {
    //   return res.status(401).json({ message: 'Invalid email or password' });
    // }

    console.log('User found:', user);
    const token = jwt.sign({ id: user.id, email: user.email_id }, secretKey, { expiresIn: '1h' });

    res.json({ token,user});
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
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
