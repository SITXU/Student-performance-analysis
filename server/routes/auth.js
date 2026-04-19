const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findOne, readCollection, writeCollection } = require('../db');
const { auth, SECRET } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  const user = findOne('users', u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const payload = { id: user.id, username: user.username, name: user.name, role: user.role, reg: user.reg || null };
  const token = jwt.sign(payload, SECRET, { expiresIn: '8h' });

  // Audit log
  const audit = readCollection('audit');
  audit.push({ action: 'LOGIN', user: user.username, role: user.role, time: new Date().toISOString() });
  writeCollection('audit', audit.slice(-500));

  res.json({ token, user: payload });
});

router.get('/me', auth(), (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', auth(), (req, res) => {
  const audit = readCollection('audit');
  audit.push({ action: 'LOGOUT', user: req.user.username, role: req.user.role, time: new Date().toISOString() });
  writeCollection('audit', audit.slice(-500));
  res.json({ message: 'Logged out' });
});

module.exports = router;
