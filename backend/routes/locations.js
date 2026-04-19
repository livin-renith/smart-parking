const express = require('express');
const router  = express.Router();
const verifyToken = require('../middleware/auth');
const db = require('../config/db');

// Get all locations with live slot availability
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      l.*,
      COUNT(p.id) as total_slots,
      SUM(CASE WHEN p.status = 'available' THEN 1 ELSE 0 END) as available_slots,
      SUM(CASE WHEN p.status = 'occupied'  THEN 1 ELSE 0 END) as occupied_slots
    FROM locations l
    LEFT JOIN parking_slots p ON p.location_id = l.id
    GROUP BY l.id
    ORDER BY l.name ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get single location
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM locations WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Location not found' });
    res.json(results[0]);
  });
});

// Get slots for a specific location
router.get('/:id/slots', (req, res) => {
  db.query(
    'SELECT * FROM parking_slots WHERE location_id = ? ORDER BY slot_number',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Add a new location (admin only)
router.post('/', verifyToken, (req, res) => {
  const { name, type, address, latitude, longitude, photo_url, description } = req.body;
  if (!name || !type || !address || !latitude || !longitude)
    return res.status(400).json({ error: 'Name, type, address and coordinates are required' });

  db.query(
    'INSERT INTO locations (name, type, address, latitude, longitude, photo_url, description) VALUES (?,?,?,?,?,?,?)',
    [name, type, address, latitude, longitude, photo_url || null, description || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: '✅ Location added successfully!', id: result.insertId });
    }
  );
});

// Delete a location (admin only)
router.delete('/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM locations WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✅ Location deleted!' });
  });
});

module.exports = router;