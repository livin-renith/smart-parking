const express = require('express');
const router  = express.Router();
const verifyToken = require('../middleware/auth');
const db = require('../config/db');

// Get ALL slots (no location filter)
router.get('/', (req, res) => {
  db.query('SELECT * FROM parking_slots ORDER BY slot_number', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get slots by location
router.get('/location/:locationId', (req, res) => {
  db.query(
    'SELECT * FROM parking_slots WHERE location_id = ? ORDER BY slot_number',
    [req.params.locationId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Update slot status
router.put('/:id', verifyToken, (req, res) => {
  const { status } = req.body;
  db.query('UPDATE parking_slots SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✅ Slot updated successfully' });
  });
});

module.exports = router;