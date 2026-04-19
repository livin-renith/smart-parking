const db = require('../config/db');

// Get dashboard stats
exports.getStats = (req, res) => {
  const stats = {};
  db.query('SELECT COUNT(*) as total FROM users WHERE role = "user"', (err, r1) => {
    stats.totalUsers = r1[0].total;
    db.query('SELECT COUNT(*) as total FROM parking_slots', (err, r2) => {
      stats.totalSlots = r2[0].total;
      db.query('SELECT COUNT(*) as total FROM parking_slots WHERE status = "available"', (err, r3) => {
        stats.availableSlots = r3[0].total;
        db.query('SELECT COUNT(*) as total FROM parking_slots WHERE status = "occupied"', (err, r4) => {
          stats.occupiedSlots = r4[0].total;
          db.query('SELECT COUNT(*) as total FROM bookings WHERE status = "active"', (err, r5) => {
            stats.activeBookings = r5[0].total;
            db.query('SELECT COUNT(*) as total FROM bookings', (err, r6) => {
              stats.totalBookings = r6[0].total;
              db.query('SELECT COALESCE(SUM(total_fee),0) as revenue FROM bookings WHERE payment_status="paid"', (err, r7) => {
                stats.totalRevenue = r7[0].revenue;
                res.json(stats);
              });
            });
          });
        });
      });
    });
  });
};
// Get all users with booking count
exports.getAllUsers = (req, res) => {
  const sql = `
    SELECT u.id, u.name, u.email, u.role, u.created_at,
           COUNT(b.id) as total_bookings
    FROM users u
    LEFT JOIN bookings b ON u.id = b.user_id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get all bookings with user and slot info
exports.getAllBookings = (req, res) => {
  const sql = `
    SELECT b.*, u.name as user_name, u.email,
           p.slot_number, p.floor
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN parking_slots p ON b.slot_id = p.id
    ORDER BY b.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get bookings per day (last 7 days) for chart
exports.getBookingsChart = (req, res) => {
  const sql = `
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM bookings
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Add a new parking slot
exports.addSlot = (req, res) => {
  const { slot_number, floor, location_id } = req.body;
  if (!slot_number || !floor)
    return res.status(400).json({ error: 'Slot number and floor are required' });

  db.query(
    'INSERT INTO parking_slots (slot_number, floor, location_id) VALUES (?, ?, ?)',
    [slot_number, floor, location_id || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Slot number already exists' });
      res.json({ message: '✅ Slot added successfully!', id: result.insertId });
    }
  );
};

// Delete a slot
exports.deleteSlot = (req, res) => {
  db.query('DELETE FROM parking_slots WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✅ Slot deleted successfully!' });
  });
};

// Update slot status
exports.updateSlotStatus = (req, res) => {
  const { status } = req.body;
  db.query('UPDATE parking_slots SET status = ? WHERE id = ?',
    [status, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: '✅ Slot updated successfully!' });
    });
};

// Cancel any booking (admin)
exports.cancelBooking = (req, res) => {
  const { id } = req.params;
  db.query('SELECT slot_id FROM bookings WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ error: 'Booking not found' });
    const slot_id = results[0].slot_id;
    db.query('UPDATE parking_slots SET status = "available" WHERE id = ?', [slot_id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      db.query('UPDATE bookings SET status = "cancelled" WHERE id = ?', [id], (err3) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json({ message: '✅ Booking cancelled successfully!' });
      });
    });
  });
};