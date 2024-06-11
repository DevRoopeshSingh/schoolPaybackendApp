// server.js
const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/userRoutes');
const feeRoutes = require('./routes/feeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const schedulingRoutes = require('./routes/schedulingRoutes');
const communicationRoutes = require('./routes/communicationRoutes');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY || 'your_secret_key';

// Middleware to parse JSON bodies
app.use(express.json());

// Dummy user data (replace with your database)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' }
];

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the My School App API handling');
});

// Login endpoint
app.post('/login', (req, res) => {
  console.log('req body:-----------', req.body);
  const { username, password } = req.body;
  
  // Dummy authentication (replace with your actual authentication logic)
  const user = users.find(user => user.username === username && user.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Generate JWT token
  const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });

  res.json({ token });
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    req.user = decoded;
    next();
  });
}

// Use routes
app.use('/api/user', userRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/attendance', attendanceRoutes); // Fixed spelling from 'attendence' to 'attendance'
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/communication', communicationRoutes);

// Protected route
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Protected route accessed successfully', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
