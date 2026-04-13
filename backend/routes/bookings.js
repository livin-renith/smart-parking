const express = require('express');
const router  = express.Router();
const verifyToken = require('../middleware/auth');
const {
  createBooking, getUserBookings,
  getBooking, cancelBooking, payBooking
} = require('../controllers/bookingController');

router.post('/',              verifyToken, createBooking);
router.get('/detail/:id',     verifyToken, getBooking);
router.get('/:userId',        verifyToken, getUserBookings);
router.put('/cancel/:id',     verifyToken, cancelBooking);
router.put('/pay/:id',        verifyToken, payBooking);

module.exports = router;