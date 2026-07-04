const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/UserAccount');

// REGISTER — creates a new user (admin or patient)
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ success: true, message: 'User created successfully' });
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
      role: user.role,
      name: user.firstName + ' ' + user.lastName
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;