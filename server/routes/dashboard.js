const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Maintenance = require('../models/Maintenance');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    let cFilter = role === 'contractor' ? { raisedBy: userId } : {};
    let mFilter = role === 'contractor' ? { submittedBy: userId } : {};

    const [
      totalComplaints, openComplaints, resolvedComplaints, criticalComplaints,
      totalPM, pendingPM, approvedPM,
      recentComplaints, recentPM
    ] = await Promise.all([
      Complaint.countDocuments(cFilter),
      Complaint.countDocuments({ ...cFilter, status: 'open' }),
      Complaint.countDocuments({ ...cFilter, status: 'resolved' }),
      Complaint.countDocuments({ ...cFilter, priority: 'critical', status: { $ne: 'resolved' } }),
      Maintenance.countDocuments(mFilter),
      Maintenance.countDocuments({ ...mFilter, approvalStatus: 'pending' }),
      Maintenance.countDocuments({ ...mFilter, approvalStatus: 'approved' }),
      Complaint.find(cFilter).sort({ createdAt: -1 }).limit(5)
        .populate('raisedBy', 'name employeeId').select('ticketId status priority category createdAt location'),
      Maintenance.find(mFilter).sort({ createdAt: -1 }).limit(5)
        .populate('submittedBy', 'name employeeId').select('reportId approvalStatus maintenanceType pmDate location')
    ]);

    const slaBreached = await Complaint.countDocuments({ ...cFilter, slaDeadline: { $lt: new Date() }, status: { $nin: ['resolved', 'closed'] } });

    const monthlyTrend = await Complaint.aggregate([
      { $match: { ...cFilter, createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        complaints: { total: totalComplaints, open: openComplaints, resolved: resolvedComplaints, critical: criticalComplaints, slaBreached },
        maintenance: { total: totalPM, pending: pendingPM, approved: approvedPM },
        recentComplaints, recentPM, monthlyTrend
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
