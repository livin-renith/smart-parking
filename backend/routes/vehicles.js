const express     = require('express');
const router      = express.Router();
const db          = require('../config/db');
const verifyToken = require('../middleware/auth');

// ── Get vehicles for user ──
router.get('/:userId', verifyToken, (req, res) => {
  db.query(
    'SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC',
    [req.params.userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// ── Add vehicle ──
router.post('/', verifyToken, (req, res) => {
  const { user_id, vehicle_number, vehicle_name, vehicle_type } = req.body;
  if (!user_id || !vehicle_number)
    return res.status(400).json({ error: 'Vehicle number is required' });

  db.query(
    'INSERT INTO vehicles (user_id, vehicle_number, vehicle_name, vehicle_type) VALUES (?, ?, ?, ?)',
    [user_id, vehicle_number, vehicle_name || null, vehicle_type || 'car'],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: '✅ Vehicle added!', id: result.insertId });
    }
  );
});

// ── Delete vehicle ──
router.delete('/:id', verifyToken, (req, res) => {
  db.query(
    'DELETE FROM vehicles WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: '✅ Vehicle removed!' });
    }
  );
});

module.exports = router;