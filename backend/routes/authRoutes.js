const express = require('express');
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/UserAccount');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// REGISTER ADMIN — Only administrators can create new administrator accounts.
router.post('/register/first-admin', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(403).json({
        error: 'An administrator account already exists. Use the authenticated register route.'
      });
    }
    const user = new User({
      firstName: req.body.firstName,
      lastName:  req.body.lastName,
      username:  req.body.username,
      password:  req.body.password,
      role:      'admin'
    });
    await user.save();
    res.json({ success: true, message: 'First administrator account created successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// REGISTER ADMIN — requires existing admin token
router.post('/register', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = new User({
      firstName: req.body.firstName,
      lastName:  req.body.lastName,
      username:  req.body.username,
      password:  req.body.password,
      role:      'admin'
    });
    await user.save();
    res.json({ success: true, message: 'Administrator account created successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LOGIN — returns a JWT token + role
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      role:       user.role,
      name:       user.firstName + ' ' + user.lastName,
      residentId: user.residentId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
