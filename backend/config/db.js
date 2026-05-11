const mysql = require('mysql2');
require('dotenv').config();

console.log('🔌 DB Config:');
console.log('   Host:', process.env.DB_HOST);
console.log('   Port:', process.env.DB_PORT);
console.log('   Name:', process.env.DB_NAME);
console.log('   User:', process.env.DB_USER);

const db = mysql.createConnection({
  host           : process.env.DB_HOST,
  user           : process.env.DB_USER,
  password       : process.env.DB_PASSWORD,
  database       : process.env.DB_NAME,
  port           : parseInt(process.env.DB_PORT),
  ssl            : { rejectUnauthorized: false },
  connectTimeout : 60000
});

db.connect((err) => {
  if (err) {
    console.error('❌ DB Error:', err.code);
    console.error('   Message:', err.message);
    return;
  }
  console.log('✅ Database connected!');
});

module.exports = db;