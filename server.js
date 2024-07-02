// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Import the new authRoutes
const userRoutes = require('./routes/userRoutes');
const feeRoutes = require('./routes/feeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const schedulingRoutes = require('./routes/schedulingRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const schoolRoutes = require('./routes/schoolRoutes')
const authenticateJWT = require('./middleware/auth'); // Import the authentication middleware
const classRoutes = require("./routes/classRoutes");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));

app.get('/', (req, res) => {
  res.send('Welcome to the My School App API handling');
});

app.use('/auth', authRoutes); // Use the new authRoutes for authentication
app.use('/api/user',authenticateJWT, userRoutes);
app.use('/api/fees',authenticateJWT, feeRoutes);
app.use('/api/school',authenticateJWT,schoolRoutes);
app.use('/api/class',authenticateJWT,classRoutes);
app.use('/api/attendance',authenticateJWT, attendanceRoutes);
app.use('/api/scheduling',authenticateJWT, schedulingRoutes);
app.use('/api/communication',authenticateJWT, communicationRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
