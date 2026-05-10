const mysql = require('mysql2');
require('dotenv').config();

console.log('🔌 Connecting to database...');
console.log('   Host:', process.env.DB_HOST);
console.log('   Port:', process.env.DB_PORT);
console.log('   DB  :', process.env.DB_NAME);
console.log('   User:', process.env.DB_USER);

const db = mysql.createConnection({
  host           : process.env.DB_HOST,
  user           : process.env.DB_USER,
  password       : process.env.DB_PASSWORD,
  database       : process.env.DB_NAME,
  port           : parseInt(process.env.DB_PORT) || 3306,
  ssl            : { rejectUnauthorized: false },
  connectTimeout : 60000
});

db.connect((err) => {
  if (err) {
    console.error('❌ DB connection failed:', err.code, '-', err.message);
    // Do NOT exit — let server stay running
    // Render will still show as Live
    return;
  }
  console.log('✅ Connected to database!');
});

db.on('error', (err) => {
  console.error('DB runtime error:', err.code);
});

module.exports = db;