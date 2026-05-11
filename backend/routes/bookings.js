const express     = require('express');
const router      = express.Router();
const db          = require('../config/db');
const verifyToken = require('../middleware/auth');

// ── Create booking ──
router.post('/', verifyToken, (req, res) => {
  const { user_id, slot_id, vehicle_number, start_time } = req.body;

  if (!user_id || !slot_id || !vehicle_number || !start_time)
    return res.status(400).json({ error: 'All fields are required' });

  db.query(
    'SELECT * FROM parking_slots WHERE id = ?',
    [slot_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!results || results.length === 0)
        return res.status(404).json({ error: 'Slot not found' });
      if (results[0].status !== 'available')
        return res.status(400).json({ error: 'Slot is not available' });

      db.query(
        'UPDATE parking_slots SET status = ? WHERE id = ?',
        ['occupied', slot_id],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });

          db.query(
            `INSERT INTO bookings
             (user_id, slot_id, vehicle_number, start_time, fee_per_hour, payment_status)
             VALUES (?, ?, ?, ?, 20.00, 'pending')`,
            [user_id, slot_id, vehicle_number, start_time],
            (err3, result) => {
              if (err3) return res.status(500).json({ error: err3.message });
              res.json({
                message     : '✅ Slot booked successfully!',
                bookingId   : result.insertId,
                fee_per_hour: 20
              });
            }
          );
        }
      );
    }
  );
});

// ── Get user bookings ──
router.get('/:userId', verifyToken, (req, res) => {
  const sql = `
    SELECT b.*, p.slot_number, p.floor
    FROM bookings b
    JOIN parking_slots p ON b.slot_id = p.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `;
  db.query(sql, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ── Get single booking ──
router.get('/detail/:id', verifyToken, (req, res) => {
  const sql = `
    SELECT b.*, p.slot_number, p.floor, u.name as user_name, u.email
    FROM bookings b
    JOIN parking_slots p ON b.slot_id = p.id
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results || results.length === 0)
      return res.status(404).json({ error: 'Booking not found' });
    res.json(results[0]);
  });
});

// ── Cancel booking ──
router.put('/cancel/:id', verifyToken, (req, res) => {
  db.query(
    'SELECT slot_id FROM bookings WHERE id = ?',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!results || results.length === 0)
        return res.status(404).json({ error: 'Booking not found' });

      const slot_id = results[0].slot_id;

      db.query(
        'UPDATE parking_slots SET status = ? WHERE id = ?',
        ['available', slot_id],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          db.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            ['cancelled', req.params.id],
            (err3) => {
              if (err3) return res.status(500).json({ error: err3.message });
              res.json({ message: '✅ Booking cancelled' });
            }
          );
        }
      );
    }
  );
});

// ── Pay for booking ──
router.put('/pay/:id', verifyToken, (req, res) => {
  db.query(
    'SELECT * FROM bookings WHERE id = ?',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!results || results.length === 0)
        return res.status(404).json({ error: 'Booking not found' });

      const booking   = results[0];
      const end_time  = new Date();
      const start     = new Date(booking.start_time);
      const diffHrs   = Math.max((end_time - start) / (1000 * 60 * 60), 0.5);
      const total_fee = Math.ceil(diffHrs * booking.fee_per_hour);

      db.query(
        `UPDATE bookings SET
           end_time = ?, total_fee = ?,
           payment_status = ?, payment_time = NOW(), status = ?
         WHERE id = ?`,
        [end_time, total_fee, 'paid', 'completed', req.params.id],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          db.query(
            'UPDATE parking_slots SET status = ? WHERE id = ?',
            ['available', booking.slot_id],
            (err3) => {
              if (err3) return res.status(500).json({ error: err3.message });
              res.json({
                message       : '✅ Payment successful!',
                total_fee,
                end_time,
                duration_hours: diffHrs.toFixed(2)
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;