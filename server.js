// server.js
const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // Import the new authRoutes
const userRoutes = require('./routes/userRoutes');
const feeRoutes = require('./routes/feeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const schedulingRoutes = require('./routes/schedulingRoutes');
const communicationRoutes = require('./routes/communicationRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the My School App API handling');
});

app.use('/auth', authRoutes); // Use the new authRoutes for authentication
app.use('/api/user', userRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/communication', communicationRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
