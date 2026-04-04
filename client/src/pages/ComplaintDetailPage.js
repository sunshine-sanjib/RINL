import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isEIC, isCoordinator } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState('');
  const [approveRemarks, setApproveRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaint = () => {
    setLoading(true);
    API.get(`/complaints/${id}`)
      .then(r => setComplaint(r.data.complaint))
      .catch(() => toast.error('Failed to load complaint'))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchComplaint(); }, [id]);

  const handleResolve = async () => {
    if (!resolution.trim()) { toast.error('Please enter resolution details.'); return; }
    setSubmitting(true);
    try {
      await API.put(`/complaints/${id}/resolve`, { resolution });
      toast.success('Marked as resolved!'); fetchComplaint();
    } catch(e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  const handleApproval = async (status) => {
    setSubmitting(true);
    try {
      await API.put(`/complaints/${id}/approve`, { status, remarks: approveRemarks });
      toast.success(`Complaint ${status}!`); fetchComplaint();
    } catch(e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  const statusColor = { open:'#60a5fa', assigned:'#fbbf24', in_progress:'#fb923c', resolved:'#4ade80', closed:'#94a3b8', rejected:'#f87171' };
  const priorityColor = { critical:'#f87171', high:'#fb923c', medium:'#fbbf24', low:'#4ade80' };

  if (loading) return <div className="app-layout"><Sidebar /><div className="main-content"><div className="app-loading"><div className="spinner"/></div></div></div>;
  if (!complaint) return <div className="app-layout"><Sidebar /><div className="main-content"><div className="page-wrapper"><div className="alert alert-danger">Complaint not found.</div></div></div></div>;

  const isOwner = complaint.raisedBy?._id === user?._id;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title={`Complaint: ${complaint.ticketId}`} />
        <div className="page-wrapper">
          <div className="page-header">
            <div>
              <h1 className="page-title">Ticket Details</h1>
              <p className="page-subtitle">
                <code style={{background:'var(--bg-elevated)',padding:'2px 8px',borderRadius:4,color:'var(--rinl-gold)'}}>{complaint.ticketId}</code>
                {' '} · Raised on {new Date(complaint.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/complaints')}>← Back</button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:20, alignItems:'flex-start' }}>
            {/* Main Panel */}
            <div>
              {/* Status Bar */}
              <div className="card" style={{ marginBottom:20, padding:'16px 24px' }}>
                <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Status</div>
                    <span className={`badge badge-${complaint.status}`} style={{ marginTop:4 }}>{complaint.status?.replace('_',' ')}</span>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Priority</div>
                    <span className={`badge badge-${complaint.priority}`} style={{ marginTop:4 }}>{complaint.priority}</span>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Approval</div>
                    <span className={`badge badge-${complaint.approvalStatus}`} style={{ marginTop:4 }}>{complaint.approvalStatus}</span>
                  </div>
                  {complaint.slaDeadline && (
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>SLA Deadline</div>
                      <div style={{ fontSize:13, marginTop:4, color: new Date(complaint.slaDeadline) < new Date() ? '#f87171':'#4ade80' }}>
                        {new Date(complaint.slaDeadline).toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="card" style={{ marginBottom:20 }}>
                <h3 style={{ fontFamily:'var(--font-heading)', fontSize:16, marginBottom:16, color:'var(--rinl-gold)' }}>📋 Complaint Information</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 24px', fontSize:14 }}>
                  {[
                    ['ETL Asset', complaint.etlAssetNumber],
                    ['Ratings', complaint.ratings || '-'],
                    ['Location', complaint.location],
                    ['Department', complaint.department],
                    ['Zone', complaint.zone],
                    ['Category', complaint.category?.replace('_',' ')],
                    ['Max Phone', complaint.maxPhone || '-'],
                    ['Mobile', complaint.mobileNo],
                    ['Raised By', complaint.raisedBy?.name + ' (' + complaint.raisedBy?.employeeId + ')'],
                    ['BOQ Item', complaint.boqItemDetail || '-'],
                  ].map(([k,v]) => (
                    <div key={k}>
                      <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>{k}</div>
                      <div style={{ color:'var(--text-primary)', fontWeight:500, textTransform:'capitalize' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Description</div>
                  <p style={{ fontSize:14, color:'var(--text-primary)', lineHeight:1.7, background:'var(--bg-input)', padding:'12px 16px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
                    {complaint.description}
                  </p>
                </div>
              </div>

              {/* Resolution */}
              {complaint.resolution && (
                <div className="card" style={{ marginBottom:20, borderColor:'rgba(22,163,74,0.3)', background:'rgba(22,163,74,0.04)' }}>
                  <h3 style={{ fontFamily:'var(--font-heading)', fontSize:16, marginBottom:12, color:'#4ade80' }}>✅ Resolution</h3>
                  <p style={{ fontSize:14, color:'var(--text-primary)', lineHeight:1.7 }}>{complaint.resolution}</p>
                  {complaint.resolvedBy && <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:8 }}>Resolved by: {complaint.resolvedBy.name} · {new Date(complaint.resolvedAt).toLocaleString('en-IN')}</p>}
                </div>
              )}

              {/* Resolve Action */}
              {['open','assigned','in_progress'].includes(complaint.status) && (
                <div className="card" style={{ marginBottom:20 }}>
                  <h3 style={{ fontFamily:'var(--font-heading)', fontSize:16, marginBottom:12 }}>🔧 Mark as Resolved</h3>
                  <div className="form-group">
                    <label className="form-label">Resolution Details *</label>
                    <textarea className="form-input" rows={3} placeholder="Describe what was done to resolve this issue..."
                      value={resolution} onChange={e => setResolution(e.target.value)} style={{ resize:'vertical' }} />
                  </div>
                  <button className="btn btn-success" onClick={handleResolve} disabled={submitting}>
                    {submitting ? 'Updating...' : '✓ Mark Resolved'}
                  </button>
                </div>
              )}

              {/* Approval Panel for EIC */}
              {isEIC && complaint.status === 'resolved' && complaint.approvalStatus === 'pending' && (
                <div className="card" style={{ borderColor:'rgba(124,58,237,0.4)', background:'rgba(124,58,237,0.04)' }}>
                  <h3 style={{ fontFamily:'var(--font-heading)', fontSize:16, marginBottom:12, color:'#a78bfa' }}>🔐 EIC Approval</h3>
                  <div className="form-group">
                    <label className="form-label">Remarks</label>
                    <textarea className="form-input" rows={3} placeholder="Add approval remarks..."
                      value={approveRemarks} onChange={e => setApproveRemarks(e.target.value)} style={{ resize:'vertical' }} />
                  </div>
                  <div style={{ display:'flex', gap:12 }}>
                    <button className="btn btn-success" onClick={() => handleApproval('approved')} disabled={submitting}>✓ Approve</button>
                    <button className="btn btn-danger" onClick={() => handleApproval('rejected')} disabled={submitting}>✗ Reject</button>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <div className="card">
                <h3 style={{ fontFamily:'var(--font-heading)', fontSize:16, marginBottom:20, color:'var(--rinl-gold)' }}>📅 Timeline</h3>
                <div className="timeline">
                  {complaint.timeline?.length > 0 ? complaint.timeline.map((t, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="timeline-action">{t.action}</div>
                        {t.note && <div className="timeline-note">{t.note}</div>}
                        <div className="timeline-time">{new Date(t.timestamp).toLocaleString('en-IN')}</div>
                        {t.performedBy && <div className="timeline-by">by {t.performedBy.name}</div>}
                      </div>
                    </div>
                  )) : <div style={{ color:'var(--text-muted)', fontSize:13 }}>No activity yet</div>}
                </div>
              </div>

              {/* Approver Info */}
              {complaint.approvedBy && (
                <div className="card" style={{ marginTop:16, borderColor:'rgba(22,163,74,0.3)' }}>
                  <h3 style={{ fontFamily:'var(--font-heading)', fontSize:14, marginBottom:12, color:'#4ade80' }}>✅ Approval Info</h3>
                  <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.8 }}>
                    <div>By: <span style={{color:'var(--text-primary)'}}>{complaint.approvedBy.name}</span></div>
                    <div>At: {new Date(complaint.approvedAt).toLocaleString('en-IN')}</div>
                    {complaint.approverRemarks && <div style={{marginTop:8,padding:'8px 12px',background:'var(--bg-input)',borderRadius:'var(--radius-sm)',color:'var(--text-primary)'}}>{complaint.approverRemarks}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
