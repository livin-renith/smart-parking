const mysql = require('mysql2');
require('dotenv').config();

const config = {
  host           : process.env.DB_HOST,
  user           : process.env.DB_USER,
  password       : process.env.DB_PASSWORD,
  database       : process.env.DB_NAME,
  port           : parseInt(process.env.DB_PORT) || 3306,
  ssl            : { rejectUnauthorized: false },
  connectTimeout : 60000
};

console.log('🔌 Connecting to:', config.host + ':' + config.port);

const db = mysql.createConnection(config);

db.connect((err) => {
  if (err) {
    console.error('❌ Failed:', err.message, '| Code:', err.code);
    process.exit(1);
  }
  console.log('✅ Connected to Railway MySQL!');
});

module.exports = db;