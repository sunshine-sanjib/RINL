const express = require('express');
const router = express.Router();
const Announcement = require('./models/Announcement');
const { protect, authorize } = require('./middleware/auth');

// GET active announcements (used by Header)
router.get('/active', protect, async (req, res) => {
  try {
    const now = new Date();
    const items = await Announcement.find({
      isActive: true,
      $or: [{ expiresAt: { $gt: now } }, { expiresAt: null }]
    }).sort({ createdAt: -1 }).limit(5);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all (admin)
router.get('/', protect, authorize('admin', 'eic'), async (req, res) => {
  try {
    const items = await Announcement.find({})
      .populate('createdBy', 'name employeeId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create
router.post('/', protect, authorize('admin', 'eic'), async (req, res) => {
  try {
    const item = await Announcement.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
