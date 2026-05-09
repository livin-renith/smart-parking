const mysql = require('mysql2');
const fs    = require('fs');
const path  = require('path');
require('dotenv').config();

console.log('🔌 Connecting to Aiven MySQL...');
console.log('   Host:', process.env.DB_HOST);
console.log('   Port:', process.env.DB_PORT);

// SSL configuration for Aiven
let sslConfig = { rejectUnauthorized: false };

// If CA cert file exists locally use it
const caPath = path.join(__dirname, '../ca.pem');
if (fs.existsSync(caPath)) {
  sslConfig = {
    rejectUnauthorized: true,
    ca: fs.readFileSync(caPath).toString()
  };
  console.log('   SSL: Using CA certificate');
} else {
  console.log('   SSL: Using rejectUnauthorized=false');
}

const db = mysql.createConnection({
  host           : process.env.DB_HOST,
  user           : process.env.DB_USER,
  password       : process.env.DB_PASSWORD,
  database       : process.env.DB_NAME,
  port           : parseInt(process.env.DB_PORT) || 3306,
  ssl            : sslConfig,
  connectTimeout : 60000
});

db.connect((err) => {
  if (err) {
    console.error('❌ Failed:', err.message);
    console.error('   Code:', err.code);
    process.exit(1);
  }
  console.log('✅ Connected to Aiven MySQL!');
});

db.on('error', (err) => {
  console.error('DB error:', err.code);
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