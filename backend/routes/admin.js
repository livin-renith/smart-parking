const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const {
  getStats, getAllUsers, getAllBookings,
  getBookingsChart, addSlot, deleteSlot,
  updateSlotStatus, cancelBooking
} = require('../controllers/adminController');

router.get('/stats',            verifyToken, getStats);
router.get('/users',            verifyToken, getAllUsers);
router.get('/bookings',         verifyToken, getAllBookings);
router.get('/chart/bookings',   verifyToken, getBookingsChart);
router.post('/slots',           verifyToken, addSlot);
router.delete('/slots/:id',     verifyToken, deleteSlot);
router.put('/slots/:id',        verifyToken, updateSlotStatus);
router.put('/bookings/cancel/:id', verifyToken, cancelBooking);

module.exports = router;