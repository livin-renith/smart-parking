const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  const hashed = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashed], (err) => {
      if (err) return res.status(400).json({ error: 'Email already exists' });
      res.json({ message: '✅ Registered successfully! Please login.' });
    });
};

// Login
exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  });
};

// Update Profile
exports.updateProfile = async (req, res) => {
  const { name, email, password } = req.body;
  const { id } = req.params;

  if (password && password.trim() !== '') {
    const hashed = await bcrypt.hash(password, 10);
    db.query('UPDATE users SET name=?, email=?, password=? WHERE id=?',
      [name, email, hashed, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: '✅ Profile updated successfully!' });
      });
  } else {
    db.query('UPDATE users SET name=?, email=? WHERE id=?',
      [name, email, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: '✅ Profile updated successfully!' });
      });
  }
};