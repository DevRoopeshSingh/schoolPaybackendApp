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
  res.send('Welcome to the My School App API');
});

app.get('/api', (req, res) => {
  res.json({
      first_name:'Roopesh',last_name:'Singh',class:'BST IT',roll_no:'42',year:'2024'
    });
});

app.use('/api', userRoutes);
app.use('/api', feeRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', schedulingRoutes);
app.use('/api', communicationRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
