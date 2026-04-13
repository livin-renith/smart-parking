const db = require('../config/db');

// Get all slots
exports.getAllSlots = (req, res) => {
  db.query('SELECT * FROM parking_slots ORDER BY slot_number', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Update slot status (admin only)
exports.updateSlot = (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  db.query('UPDATE parking_slots SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✅ Slot updated successfully' });
  });
};