const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    default: () => 'PM-' + Date.now().toString().slice(-6)
  },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  etlUpsSn: { type: String, required: true },
  location: { type: String, required: true },
  pmDate: { type: Date, required: true },
  pmDoneBy: { type: String, required: true },
  boqItem: { type: String },
  ratings: { type: String },
  maintenanceType: {
    type: String,
    enum: ['preventive', 'corrective', 'breakdown', 'annual'],
    default: 'preventive'
  },
  checklist: {
    visualInspection: { type: Boolean, default: false },
    cleaningDone: { type: Boolean, default: false },
    connectionsTight: { type: Boolean, default: false },
    batteryCheck: { type: Boolean, default: false },
    fanOperation: { type: Boolean, default: false },
    bypassTest: { type: Boolean, default: false },
    earthingCheck: { type: Boolean, default: false },
    loadTest: { type: Boolean, default: false }
  },
  measurements: {
    acInputVolts: { r: String, y: String, b: String },
    acInputCurrent: { r: String, y: String, b: String },
    inputFreq: String,
    dcRectifier: String,
    dcSmps: String,
    acSmps: String,
    acOutputVolt: { r: String, y: String, b: String },
    acOutputCurrent: { r: String, y: String, b: String }
  },
  batteryData: [{
    bankNo: String,
    voltage: String,
    current: String,
    condition: { type: String, enum: ['good', 'fair', 'replace'], default: 'good' }
  }],
  sparesReplaced: { type: String },
  remarks: { type: String },
  attachments: [{ filename: String, path: String }],
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  approverRemarks: { type: String },
  nextScheduledDate: { type: Date },
  aiInsights: {
    healthScore: Number,
    recommendations: [String],
    alertFlags: [String]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
