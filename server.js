// server.js
const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const feeRoutes = require('./routes/feeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const schedulingRoutes = require('./routes/schedulingRoutes');
const communicationRoutes = require('./routes/communicationRoutes');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the My School App API handling');
});



app.use('/api/user', userRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/attendence', attendanceRoutes);
app.use('/api/scheduling.', schedulingRoutes);
app.use('/api/communication', communicationRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});