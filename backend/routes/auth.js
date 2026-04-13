const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.put('/profile/:id', verifyToken, updateProfile);

module.exports = router;