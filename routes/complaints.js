const express = require('express');
const router = express.Router();
const Complaint = require('./models/Complaint');
const { protect, authorize } = require('./middleware/auth');

// GET /api/complaints - role aware
router.get('/', protect, async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 15 } = req.query;
    let filter = {};
    if (req.user.role === 'contractor') filter.raisedBy = req.user._id;
    if (req.user.role === 'coordinator' && req.user.zone) filter.zone = req.user.zone;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate('raisedBy', 'name employeeId department')
      .populate('assignedTo', 'name employeeId')
      .populate('resolvedBy', 'name employeeId')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, complaints, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/complaints
router.post('/', protect, async (req, res) => {
  try {
    const complaint = await Complaint.create({
      ...req.body, raisedBy: req.user._id,
      department: req.body.department || req.user.department,
      zone: req.body.zone || req.user.zone
    });
    complaint.timeline.push({ action: 'Complaint Raised', performedBy: req.user._id, note: `Registered by ${req.user.name}` });
    await complaint.save();
    await complaint.populate('raisedBy', 'name employeeId');
    res.status(201).json({ success: true, complaint, message: `Complaint registered! Ticket ID: ${complaint.ticketId}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/complaints/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('raisedBy', 'name employeeId department phone')
      .populate('assignedTo', 'name employeeId')
      .populate('approvedBy', 'name employeeId')
      .populate('resolvedBy', 'name employeeId')
      .populate('timeline.performedBy', 'name employeeId');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
    if (req.user.role === 'contractor' && complaint.raisedBy._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied.' });
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/complaints/:id/resolve
router.put('/:id/resolve', protect, async (req, res) => {
  try {
    const { resolution } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found.' });
    complaint.status = 'resolved';
    complaint.resolution = resolution;
    complaint.resolvedAt = new Date();
    complaint.resolvedBy = req.user._id;
    complaint.timeline.push({ action: 'Resolved', performedBy: req.user._id, note: resolution });
    await complaint.save();
    await complaint.populate('raisedBy', 'name employeeId');
    await complaint.populate('resolvedBy', 'name employeeId');
    res.json({ success: true, complaint, message: 'Complaint marked as resolved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/complaints/:id/assign
router.put('/:id/assign', protect, authorize('coordinator', 'eic', 'admin'), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found.' });
    complaint.assignedTo = assignedTo; complaint.assignedAt = new Date(); complaint.status = 'assigned';
    complaint.timeline.push({ action: 'Assigned', performedBy: req.user._id, note: 'Assigned to technician' });
    await complaint.save();
    res.json({ success: true, complaint, message: 'Assigned.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/complaints/:id/approve
router.put('/:id/approve', protect, authorize('eic', 'admin'), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found.' });
    complaint.approvalStatus = status; complaint.approverRemarks = remarks;
    complaint.approvedBy = req.user._id; complaint.approvedAt = new Date();
    if (status === 'approved') complaint.status = 'closed';
    if (status === 'rejected') complaint.status = 'rejected';
    complaint.timeline.push({ action: `Approval: ${status}`, performedBy: req.user._id, note: remarks });
    await complaint.save();
    await complaint.populate('approvedBy', 'name employeeId');
    res.json({ success: true, complaint, message: `Complaint ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/complaints/:id/feedback
router.post('/:id/feedback', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found.' });
    complaint.feedback = { rating, comment, submittedAt: new Date() };
    await complaint.save();
    res.json({ success: true, message: 'Feedback submitted!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
