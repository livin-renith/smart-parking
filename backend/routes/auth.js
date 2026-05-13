const express     = require('express');
const router      = express.Router();
const db          = require('../config/db');
const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');
require('dotenv').config();

// ── Register ──
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed],
      (err) => {
        if (err) return res.status(400).json({ error: 'Email already exists' });
        res.json({ message: '✅ Registered successfully! Please login.' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Login ──
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!results || results.length === 0)
        return res.status(401).json({ error: 'Invalid email or password' });

      const user  = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({ error: 'Invalid email or password' });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id   : user.id,
          name : user.name,
          email: user.email,
          role : user.role
        }
      });
    }
  );
});

// ── Update profile ──
router.put('/profile/:id', verifyToken, async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: 'Name and email are required' });

  try {
    if (password && password.trim() !== '') {
      const hashed = await bcrypt.hash(password, 10);
      db.query(
        'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
        [name, email, hashed, req.params.id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: '✅ Profile updated!' });
        }
      );
    } else {
      db.query(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, req.params.id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: '✅ Profile updated!' });
        }
      );
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;