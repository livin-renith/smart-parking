const db = require('../config/db');

const FEE_PER_HOUR = 20; // ₹20 per hour

// Create a new booking
exports.createBooking = (req, res) => {
  const { user_id, slot_id, vehicle_number, start_time } = req.body;

  if (!user_id || !slot_id || !vehicle_number || !start_time)
    return res.status(400).json({ error: 'All fields are required' });

  // Check slot is available
  db.query('SELECT status FROM parking_slots WHERE id = ?', [slot_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results[0].status !== 'available')
      return res.status(400).json({ error: 'Slot is not available' });

    // Mark slot as occupied
    db.query('UPDATE parking_slots SET status = "occupied" WHERE id = ?', [slot_id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const sql = `INSERT INTO bookings 
        (user_id, slot_id, vehicle_number, start_time, fee_per_hour, payment_status) 
        VALUES (?, ?, ?, ?, ?, 'pending')`;

      db.query(sql, [user_id, slot_id, vehicle_number, start_time, FEE_PER_HOUR], (err3, result) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json({
          message: '✅ Slot booked successfully!',
          bookingId: result.insertId,
          fee_per_hour: FEE_PER_HOUR
        });
      });
    });
  });
};

// Get bookings for a user
exports.getUserBookings = (req, res) => {
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
};

// Get single booking by id
exports.getBooking = (req, res) => {
  const sql = `
    SELECT b.*, p.slot_number, p.floor, u.name as user_name, u.email
    FROM bookings b
    JOIN parking_slots p ON b.slot_id = p.id
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(results[0]);
  });
};

// Cancel a booking
exports.cancelBooking = (req, res) => {
  const { id } = req.params;
  db.query('SELECT slot_id FROM bookings WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const slot_id = results[0].slot_id;
    db.query('UPDATE parking_slots SET status = "available" WHERE id = ?', [slot_id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      db.query('UPDATE bookings SET status = "cancelled" WHERE id = ?', [id], (err3) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json({ message: '✅ Booking cancelled successfully' });
      });
    });
  });
};

// Pay for a booking — calculates final fee
exports.payBooking = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM bookings WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const booking = results[0];
    if (booking.payment_status === 'paid')
      return res.status(400).json({ error: 'Already paid' });

    const end_time  = new Date();
    const start     = new Date(booking.start_time);
    const diffMs    = end_time - start;
    const diffHours = Math.max(diffMs / (1000 * 60 * 60), 0.5); // minimum 30 mins
    const total_fee = Math.ceil(diffHours * booking.fee_per_hour);

    const sql = `UPDATE bookings 
      SET end_time=?, total_fee=?, payment_status='paid', 
          payment_time=NOW(), status='completed'
      WHERE id=?`;

    db.query(sql, [end_time, total_fee, id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      // Free the slot
      db.query('UPDATE parking_slots SET status="available" WHERE id=?',
        [booking.slot_id], (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json({
            message: '✅ Payment successful!',
            total_fee,
            end_time,
            duration_hours: diffHours.toFixed(2)
          });
        });
    });
  });
};