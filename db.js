const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'schoolpay',
  port: process.env.DB_PORT || 3306 // Default MySQL port
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit the application if unable to connect to the database
  }
  console.log('Connected to the database as ID', connection.threadId);
  connection.release();
});

module.exports = pool;
