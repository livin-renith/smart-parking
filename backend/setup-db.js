require('dotenv').config();
const mysql  = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
  host           : process.env.DB_HOST,
  user           : process.env.DB_USER,
  password       : process.env.DB_PASSWORD,
  database       : process.env.DB_NAME,
  port           : parseInt(process.env.DB_PORT) || 3306,
  ssl            : { rejectUnauthorized: false },
  connectTimeout : 60000
});

db.connect(async (err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database!');

  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin','user') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS locations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      type ENUM('mall','hospital','hotel','restaurant','park','other') NOT NULL,
      address TEXT NOT NULL,
      latitude DECIMAL(10,8) NOT NULL,
      longitude DECIMAL(11,8) NOT NULL,
      photo_url VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS parking_slots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slot_number VARCHAR(10) NOT NULL,
      floor VARCHAR(20),
      status ENUM('available','occupied','reserved') DEFAULT 'available',
      location_id INT,
      FOREIGN KEY (location_id) REFERENCES locations(id)
    )`,
    `CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      slot_id INT NOT NULL,
      vehicle_number VARCHAR(20),
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      status ENUM('active','completed','cancelled') DEFAULT 'active',
      fee_per_hour DECIMAL(10,2) DEFAULT 20.00,
      total_fee DECIMAL(10,2) DEFAULT 0.00,
      payment_status ENUM('pending','paid') DEFAULT 'pending',
      payment_time DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (slot_id) REFERENCES parking_slots(id)
    )`,
    `CREATE TABLE IF NOT EXISTS vehicles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      vehicle_number VARCHAR(20) NOT NULL,
      vehicle_name VARCHAR(50),
      vehicle_type ENUM('car','bike','truck') DEFAULT 'car',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `INSERT IGNORE INTO locations (name,type,address,latitude,longitude,description) VALUES
      ('Cauvery Complex Mall','mall','Singarathope, Tiruchirappalli',10.8050,78.6856,'Popular shopping mall'),
      ('Mahatma Gandhi Memorial Hospital','hospital','Puthur, Tiruchirappalli',10.8299,78.6898,'Government hospital'),
      ('Hotel Sangam','hotel','Collector Office Road, Tiruchirappalli',10.8134,78.6912,'Popular hotel'),
      ('Rockfort Temple','park','Rockfort, Tiruchirappalli',10.8231,78.6872,'Famous rock fort temple'),
      ('Srirangam Temple','park','Srirangam, Tiruchirappalli',10.8653,78.6870,'Famous temple complex')`,
    `INSERT IGNORE INTO parking_slots (slot_number,floor,location_id) VALUES
      ('A1','Ground Floor',1),('A2','Ground Floor',1),('A3','Ground Floor',1),
      ('A4','First Floor',1),('A5','First Floor',1),
      ('B1','Ground Floor',2),('B2','Ground Floor',2),('B3','First Floor',2),
      ('C1','Ground Floor',3),('C2','Ground Floor',3),
      ('D1','Ground Floor',4),('D2','Ground Floor',4),
      ('E1','Ground Floor',5),('E2','Ground Floor',5)`
  ];

  for (const q of queries) {
    await new Promise((resolve) => {
      db.query(q, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.log('⚠️ Query note:', err.message.substring(0,60));
        } else {
          console.log('✅', q.substring(7,40).trim() + '...');
        }
        resolve();
      });
    });
  }

  // Create admin user
  const hash = await bcrypt.hash('admin123', 10);
  await new Promise((resolve) => {
    db.query(
      `INSERT INTO users (name,email,password,role)
       VALUES ('Admin','admin@parking.com',?,'admin')
       ON DUPLICATE KEY UPDATE password=?, role='admin'`,
      [hash, hash],
      (err) => {
        if (err) console.log('Admin note:', err.message);
        else console.log('✅ Admin user ready — admin@parking.com / admin123');
        resolve();
      }
    );
  });

  console.log('\n🎉 Database setup complete!');
  db.end();
  process.exit(0);
});