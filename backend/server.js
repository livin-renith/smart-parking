const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// ── CORS Fix — allow all origins ──
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
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
  res.json({
    message : '🅿️ Smart Parking API is running!',
    status  : 'online',
    version : '1.0.0'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});