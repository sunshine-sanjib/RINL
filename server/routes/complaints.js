const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/complaints - Get complaints (filtered by role)
router.get('/', protect, async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 10, search } = req.query;
    let filter = {};

    if (req.user.role === 'contractor') filter.raisedBy = req.user._id;
    if (req.user.role === 'coordinator') filter.zone = req.user.zone;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) filter.$or = [
      { ticketId: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];

    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate('raisedBy', 'name employeeId department')
      .populate('assignedTo', 'name employeeId')
      .populate('resolvedBy', 'name employeeId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: complaints, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/complaints - Raise new complaint
router.post('/', protect, async (req, res) => {
  try {
    const complaint = await Complaint.create({ ...req.body, raisedBy: req.user._id });
    await complaint.populate('raisedBy', 'name employeeId');
    res.status(201).json({ success: true, data: complaint, message: `Complaint registered! Ticket ID: ${complaint.ticketId}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @GET /api/complaints/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('raisedBy', 'name employeeId department phone')
      .populate('assignedTo', 'name employeeId')
      .populate('approvedBy', 'name employeeId')
      .populate('resolvedBy', 'name employeeId')
      .populate('timeline.performedBy', 'name employeeId');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/complaints/:id/status - Update status (coordinator/eic/admin)
router.put('/:id/status', protect, authorize('coordinator', 'eic', 'admin'), async (req, res) => {
  try {
    const { status, resolution, assignedTo } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found.' });

    complaint.status = status;
    if (resolution) complaint.resolution = resolution;
    if (assignedTo) { complaint.assignedTo = assignedTo; complaint.assignedAt = new Date(); }
    if (status === 'resolved') { complaint.resolvedAt = new Date(); complaint.resolvedBy = req.user._id; }

    complaint.timeline.push({ action: `Status changed to ${status}`, performedBy: req.user._id, note: resolution });
    await complaint.save();
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/complaints/:id/approve
router.put('/:id/approve', protect, authorize('eic', 'admin'), async (req, res) => {
  try {
    const { approvalStatus, approverRemarks } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, {
      approvalStatus, approverRemarks,
      approvedBy: req.user._id, approvedAt: new Date(),
      $push: { timeline: { action: `Complaint ${approvalStatus}`, performedBy: req.user._id, note: approverRemarks } }
    }, { new: true }).populate('raisedBy', 'name employeeId');
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/complaints/:id/feedback
router.post('/:id/feedback', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found.' });
    if (complaint.raisedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only complaint owner can submit feedback.' });
    }
    complaint.feedback = { rating, comment, submittedAt: new Date() };
    await complaint.save();
    res.json({ success: true, message: 'Feedback submitted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/complaints/stats/summary
router.get('/stats/summary', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'contractor') filter.raisedBy = req.user._id;

    const [total, open, inProgress, resolved, critical] = await Promise.all([
      Complaint.countDocuments(filter),
      Complaint.countDocuments({ ...filter, status: 'open' }),
      Complaint.countDocuments({ ...filter, status: 'in_progress' }),
      Complaint.countDocuments({ ...filter, status: 'resolved' }),
      Complaint.countDocuments({ ...filter, priority: 'critical' })
    ]);

    const byCategory = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const recentTrend = await Complaint.aggregate([
      { $match: { ...filter, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: { total, open, inProgress, resolved, critical, byCategory, recentTrend } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
