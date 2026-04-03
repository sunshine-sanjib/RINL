const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    if (!employeeId || !password) {
      return res.status(400).json({ success: false, message: 'Please provide Employee ID and Password.' });
    }
    const user = await User.findOne({ employeeId: employeeId.toUpperCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }
    // Update login history
    user.lastLogin = new Date();
    user.loginHistory.push({ timestamp: new Date(), ip: req.ip });
    if (user.loginHistory.length > 20) user.loginHistory = user.loginHistory.slice(-20);
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        zone: user.zone,
        designation: user.designation,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// @POST /api/auth/register (admin only or self-register as contractor)
router.post('/register', async (req, res) => {
  try {
    const { employeeId, name, email, password, role, department, zone, phone, designation } = req.body;
    const existing = await User.findOne({ $or: [{ employeeId: employeeId?.toUpperCase() }, { email }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Employee ID or Email already registered.' });
    }
    const user = await User.create({
      employeeId: employeeId.toUpperCase(),
      name, email, password,
      role: role || 'contractor',
      department, zone, phone, designation
    });
    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token: generateToken(user._id),
      user: { _id: user._id, employeeId: user.employeeId, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// @PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
