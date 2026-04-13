const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/slots',    require('./routes/slots'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/vehicles', require('./routes/vehicles'));

app.get('/', (req, res) => {
  res.json({ message: '🅿️ Smart Parking API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});