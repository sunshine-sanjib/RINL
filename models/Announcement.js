const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['info', 'warning', 'alert', 'maintenance'],
    default: 'info'
  },
  targetRoles: [{
    type: String,
    enum: ['contractor', 'coordinator', 'eic', 'admin', 'all']
  }],
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
