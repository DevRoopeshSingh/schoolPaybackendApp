// testDbConnection.js
const db = require('./db');

async function testConnection() {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('Connected to MySQL database:', res);
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

testConnection();
