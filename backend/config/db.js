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
    console.error('❌ Database connection failed!');
    console.error('   Message:', err.message);
    console.error('   Code   :', err.code);
    process.exit(1);
  }
  console.log('✅ Connected to database successfully!');
});

db.on('error', (err) => {
  console.error('⚠️  DB error:', err.code);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' ||
      err.code === 'ECONNRESET' ||
      err.code === 'ETIMEDOUT') {
    db.connect((err2) => {
      if (err2) console.error('Reconnect failed:', err2.message);
      else console.log('✅ Reconnected!');
    });
  }
});

module.exports = db;