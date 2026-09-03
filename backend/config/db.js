// config/db.js
const mysql = require('mysql2/promise'); // mysql2/promise gives us async/await support instead of old-style callbacks
require('dotenv').config(); // reads backend/.env and loads values into process.env

const pool = mysql.createPool({
  // a "pool" keeps several ready-made DB connections open so each request doesn't wait to open a fresh one
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,   // if all connections are busy, new requests wait in line instead of erroring
  connectionLimit: 10,        // max 10 open connections at once — enough to comfortably handle ~100 near-simultaneous requests queuing through it
  queueLimit: 0                // 0 = unlimited queue length for waiting requests
});

module.exports = pool; // any file can now `require('../config/db')` to run SQL queries