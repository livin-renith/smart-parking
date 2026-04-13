const express = require('express');
const router = express.Router();
const { getAllSlots, updateSlot } = require('../controllers/slotController');
const verifyToken = require('../middleware/auth');

router.get('/', getAllSlots);
router.put('/:id', verifyToken, updateSlot);

module.exports = router;