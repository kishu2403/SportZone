const express = require('express');
const router  = express.Router();
const User    = require('../models/User');

/* ── POST /api/auth/signup ── */
router.post('/signup', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });
  if (password !== confirmPassword)
    return res.status(400).json({ error: 'Passwords do not match.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  try {
    if (await User.findOne({ email }))
      return res.status(409).json({ error: 'Email already registered.' });
    await User.create({ name, email, password });
    res.json({ success: true, message: 'Account created! You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

/* ── POST /api/auth/login ── */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password.' });
    req.session.user = { id: user._id, name: user.name, email: user.email };
    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

/* ── GET /api/auth/logout ── */
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

/* ── GET /api/auth/me ── */
router.get('/me', (req, res) => {
  if (req.session.user)
    return res.json({ loggedIn: true, user: req.session.user });
  res.json({ loggedIn: false });
});

module.exports = router;
