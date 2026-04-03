import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ZONES = ['Zone-A','Zone-B','Zone-C','Zone-D','Zone-E','Zone-F'];
const DEPTS = ['IT & ERP','Electrical','Mechanical','Civil','Procurement','Operations','HR','Finance'];

export default function NewComplaintPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [form, setForm] = useState({
    etlAssetNumber: '',
    ratings: '',
    location: '',
    department: user?.department || '',
    zone: user?.zone || '',
    boqItemDetail: '',
    maxPhone: '',
    mobileNo: user?.phone || '',
    category: '',
    priority: 'medium',
    description: ''
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.etlAssetNumber || !form.location || !form.category || !form.description || !form.mobileNo) {
      toast.error('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/complaints', form);
      setSubmitted(data.complaint);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Header title="Complaint Registered" />
          <div className="page-wrapper" style={{ display:'flex', justifyContent:'center', alignItems:'flex-start', paddingTop:60 }}>
            <div className="card" style={{ maxWidth: 520, width:'100%', textAlign:'center', padding: 48 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontFamily:'var(--font-heading)', fontSize:28, color:'#4ade80', marginBottom:8 }}>Complaint Registered!</h2>
              <p style={{ color:'var(--text-secondary)', marginBottom:24 }}>Your complaint has been successfully submitted to the RINL CMS system.</p>
              <div style={{ background:'var(--bg-elevated)', borderRadius:'var(--radius-lg)', padding:'20px 32px', marginBottom:28, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Ticket ID</div>
                <div style={{ fontFamily:'var(--font-heading)', fontSize:32, fontWeight:700, color:'var(--rinl-gold)', letterSpacing:'0.05em' }}>
                  {submitted.ticketId}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, textAlign:'left', marginBottom:28, fontSize:13, color:'var(--text-secondary)' }}>
                <div><strong style={{color:'var(--text-primary)'}}>Location:</strong> {submitted.location}</div>
                <div><strong style={{color:'var(--text-primary)'}}>Category:</strong> {submitted.category}</div>
                <div><strong style={{color:'var(--text-primary)'}}>Priority:</strong> {submitted.priority}</div>
                <div><strong style={{color:'var(--text-primary)'}}>Status:</strong> {submitted.status}</div>
              </div>
              <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/complaints')}>← All Complaints</button>
                <button className="btn btn-primary" onClick={() => navigate(`/complaints/${submitted._id}`)}>View Ticket →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="New Complaint" />
        <div className="page-wrapper">
          <div className="page-header">
            <div>
              <h1 className="page-title">Raise a Complaint</h1>
              <p className="page-subtitle">Fields marked <span style={{color:'var(--rinl-red)'}}>*</span> are mandatory</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/complaints')}>← Back</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="reg-section-label" style={{borderLeft:'3px solid var(--rinl-steel)',paddingLeft:8,marginBottom:16,fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--rinl-gold)'}}>
                Asset & Location Details
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">ETL Asset Number *</label>
                  <input className="form-input" placeholder="e.g. ETL-2024-001" value={form.etlAssetNumber} onChange={set('etlAssetNumber')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ratings (KVA)</label>
                  <input className="form-input" placeholder="e.g. 10KVA" value={form.ratings} onChange={set('ratings')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="form-input" placeholder="e.g. Server Room B-2" value={form.location} onChange={set('location')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-input" value={form.department} onChange={set('department')} required>
                    <option value="">Select Department</option>
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Zone *</label>
                  <select className="form-input" value={form.zone} onChange={set('zone')} required>
                    <option value="">Select Zone</option>
                    {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div className="form-group form-full">
                  <label className="form-label">BOQ Item Detail</label>
                  <input className="form-input" placeholder="Bill of Quantity item reference" value={form.boqItemDetail} onChange={set('boqItemDetail')} />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="reg-section-label" style={{borderLeft:'3px solid var(--rinl-steel)',paddingLeft:8,marginBottom:16,fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--rinl-gold)'}}>
                Contact & Classification
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Max Phone</label>
                  <input className="form-input" placeholder="Internal extension" value={form.maxPhone} onChange={set('maxPhone')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile No. *</label>
                  <input className="form-input" placeholder="+91 XXXXX XXXXX" value={form.mobileNo} onChange={set('mobileNo')} required />
                </div>
                <div className="form-group"></div>
                <div className="form-group">
                  <label className="form-label">Complaint Category *</label>
                  <select className="form-input" value={form.category} onChange={set('category')} required>
                    <option value="">Select Category</option>
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                    <option value="network">Network</option>
                    <option value="ups_failure">UPS Failure</option>
                    <option value="battery">Battery Issue</option>
                    <option value="power_supply">Power Supply</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority Level *</label>
                  <select className="form-input" value={form.priority} onChange={set('priority')}>
                    <option value="low">🟢 Low (168 hrs SLA)</option>
                    <option value="medium">🟡 Medium (72 hrs SLA)</option>
                    <option value="high">🟠 High (24 hrs SLA)</option>
                    <option value="critical">🔴 Critical (4 hrs SLA)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div className="reg-section-label" style={{borderLeft:'3px solid var(--rinl-steel)',paddingLeft:8,marginBottom:16,fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--rinl-gold)'}}>
                Problem Description
              </div>
              <div className="form-group">
                <label className="form-label">Describe the Issue *</label>
                <textarea className="form-input" rows={5} placeholder="Provide a detailed description of the issue, including symptoms, error messages, when it started..."
                  value={form.description} onChange={set('description')} required style={{ resize:'vertical' }} />
              </div>
              <div className="alert alert-info" style={{ marginTop: 8 }}>
                <span>ℹ</span>
                <span>SLA clock starts from submission. Critical issues escalate automatically if unresolved.</span>
              </div>
            </div>

            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/complaints')}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><span className="spinner-sm" /> Submitting...</> : '✓ Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
