const express = require('express');
const router = express.Router();
const User = require('./models/User');
const { protect, authorize } = require('./middleware/auth');

// GET all users (coordinators+)
router.get('/', protect, authorize('admin', 'eic', 'coordinator'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update — admin can update anyone; any user can update their own profile
router.put('/:id', protect, async (req, res) => {
  try {
    const isSelf = req.params.id === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this user.' });
    }

    const allowed = ['name', 'email', 'phone', 'designation', 'department', 'zone'];
    const adminOnly = ['role', 'isActive'];
    const fields = {};

    allowed.forEach(k => { if (req.body[k] !== undefined) fields[k] = req.body[k]; });
    if (isAdmin) {
      adminOnly.forEach(k => { if (req.body[k] !== undefined) fields[k] = req.body[k]; });
    }

    const user = await User.findByIdAndUpdate(req.params.id, fields, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, data: user, message: 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE / deactivate (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'User deactivated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
