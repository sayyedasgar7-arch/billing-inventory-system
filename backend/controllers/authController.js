// controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    // bcrypt.hash scrambles the password irreversibly; "10" = salt rounds, how many times it re-scrambles (higher = slower but harder to crack)
    await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
    res.status(201).json({ message: 'User registered' });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' }); // 401 = "Unauthorized"

    const match = await bcrypt.compare(password, user.password);
    // compares the plain-text password typed at login against the stored hash — never decrypts the hash, just re-checks it
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    // jwt.sign creates a signed "ticket" proving who logged in; the frontend stores this and sends it back on every future request

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};