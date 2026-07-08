const express  = require('express');
const router   = express.Router();
const Resident = require('../models/Resident');
const UserAccount = require('../models/UserAccount');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

async function generateUsername(firstName, lastName) {
  const firstParts = firstName.trim().split(/\s+/);

  let initials = '';

  firstParts.forEach(part => {
    initials += part[0];
  });

  const baseUsername = (initials + lastName)
    .replace(/\s+/g, '')
    .toLowerCase();

  let username = baseUsername;
  let counter = 2;

  while (await UserAccount.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
}

function generateTemporaryPassword(birthdate) {
  if (!birthdate) return 'healthbase2026';
  const date = new Date(birthdate);
  if (isNaN(date.getTime())) return 'healthbase2026';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  const year  = date.getFullYear();
  return `${month}${day}${year}`;
}

// POST — save new resident
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {

    // Save Resident
    const resident = new Resident(req.body);
    const savedResident = await resident.save();

    // Generate credentials
    const username = await generateUsername(
      savedResident.firstName,
      savedResident.lastName
    );

    const tempPassword = generateTemporaryPassword(
      savedResident.birthdate
    );

    // Create User Account
    const user = new UserAccount({
      firstName: savedResident.firstName,
      lastName: savedResident.lastName,
      username: username,
      password: tempPassword,
      role: 'patient',
      residentId: savedResident._id
    });

    await user.save();

    res.json({
      success: true,
      resident: savedResident,
      credentials: {
        username,
        password: tempPassword
      }
    });

  } catch (err) {
  console.error(err);

  res.status(500).json({
    error: err.message
  });
}
});

// GET — search all residents (optional name filter)
router.get('/', async (req, res) => {
  try {
    let query = {};

    if (req.query.name) {
      query.$or = [
        { firstName: { $regex: req.query.name, $options: 'i' } },
        { lastName:  { $regex: req.query.name, $options: 'i' } }
      ];
    }

    const residents = await Resident.find(query).sort({ createdAt: -1 });
    res.json(residents);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET — single resident by ID
router.get('/:id', async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    res.json(resident);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
