const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const complaintSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    default: () => 'COMP-' + Date.now().toString().slice(-6) + Math.floor(Math.random()*100)
  },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  complaintDate: { type: Date, default: Date.now },
  etlAssetNumber: { type: String, required: true, trim: true },
  ratings: { type: String, trim: true },
  location: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  zone: { type: String, required: true, trim: true },
  boqItemDetail: { type: String, trim: true },
  maxPhone: { type: String, trim: true },
  mobileNo: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['hardware', 'software', 'network', 'ups_failure', 'battery', 'power_supply', 'other']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  description: { type: String, required: true },
  attachments: [{ filename: String, path: String, uploadedAt: Date }],
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'open'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  resolution: { type: String },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  approverRemarks: { type: String },
  timeline: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  aiAnalysis: {
    suggestedPriority: String,
    estimatedResolutionTime: String,
    similarTickets: [String],
    rootCauseAnalysis: String
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date
  },
  slaDeadline: { type: Date },
  isSlaBreached: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Auto-set SLA deadline based on priority
complaintSchema.pre('save', function(next) {
  if (this.isNew) {
    const slaHours = { critical: 4, high: 24, medium: 72, low: 168 };
    const hours = slaHours[this.priority] || 72;
    this.slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
