const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const { protect, authorize } = require('../middleware/auth');

// GET all - role-aware
router.get('/', protect, async (req, res) => {
  try {
    const { approvalStatus, maintenanceType, page = 1, limit = 20 } = req.query;
    let filter = {};
    if (req.user.role === 'contractor') filter.submittedBy = req.user._id;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (maintenanceType) filter.maintenanceType = maintenanceType;

    const total = await Maintenance.countDocuments(filter);
    const reports = await Maintenance.find(filter)
      .populate('submittedBy', 'name employeeId department')
      .populate('approvedBy', 'name employeeId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, reports, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - submit new PM report
router.post('/', protect, async (req, res) => {
  try {
    const report = await Maintenance.create({ ...req.body, submittedBy: req.user._id });
    await report.populate('submittedBy', 'name employeeId');
    res.status(201).json({ success: true, report, message: `PM Report submitted! ID: ${report.reportId}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET single
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Maintenance.findById(req.params.id)
      .populate('submittedBy', 'name employeeId department')
      .populate('approvedBy', 'name employeeId');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    // Contractor can only see own
    if (req.user.role === 'contractor' && report.submittedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT approve/reject
router.put('/:id/approve', protect, authorize('eic', 'admin', 'coordinator'), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const report = await Maintenance.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Not found.' });

    report.approvalStatus = status;
    report.approverRemarks = remarks;
    report.approvedBy = req.user._id;
    report.approvedAt = new Date();
    await report.save();
    await report.populate('submittedBy', 'name employeeId');
    await report.populate('approvedBy', 'name employeeId');

    res.json({ success: true, report, message: `Report ${status} successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
