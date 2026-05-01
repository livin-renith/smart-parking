const express = require('express');
const https   = require('https');
require('dotenv').config();

const app = express();

// ── CORS ──
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.use(express.json());

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/slots',     require('./routes/slots'));
app.use('/api/bookings',  require('./routes/bookings'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/vehicles',  require('./routes/vehicles'));
app.use('/api/locations', require('./routes/locations'));

app.get('/', (req, res) => {
  res.json({ message: '🅿️ Smart Parking API is running!', status: 'online' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// ── Keep Render awake ──
const BACKEND_URL = 'https://smart-parking-backend-4lx3.onrender.com/health';
function keepAlive() {
  https.get(BACKEND_URL, (res) => {
    console.log(`🔄 Keep-alive OK — ${new Date().toLocaleTimeString()}`);
  }).on('error', () => {});
}
setTimeout(() => {
  keepAlive();
  setInterval(keepAlive, 10 * 60 * 1000);
}, 60000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});