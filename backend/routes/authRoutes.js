const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/UserAccount');

// REGISTER — disabled
router.post('/register', (req, res) => {
  return res.status(403).json({
    error: 'Public registration is disabled. Resident accounts are created by the administrator.'
  });
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
      role: user.role,
      name: user.firstName + ' ' + user.lastName,
      residentId: user.residentId
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;