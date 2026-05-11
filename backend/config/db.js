const mysql = require('mysql2');
require('dotenv').config();

console.log('🔌 Connecting to database...');
console.log('   Host:', process.env.DB_HOST);
console.log('   Port:', process.env.DB_PORT);

// Use connection POOL instead of single connection
// Pool automatically reconnects when connection drops
const pool = mysql.createPool({
  host              : process.env.DB_HOST,
  user              : process.env.DB_USER,
  password          : process.env.DB_PASSWORD,
  database          : process.env.DB_NAME,
  port              : parseInt(process.env.DB_PORT),
  ssl               : { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit   : 10,
  queueLimit        : 0,
  connectTimeout    : 60000,
  enableKeepAlive   : true,
  keepAliveInitialDelay: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.code);
    console.error('   Message:', err.message);
    return;
  }
  console.log('✅ Database connected successfully!');
  connection.release();
});

module.exports = pool;