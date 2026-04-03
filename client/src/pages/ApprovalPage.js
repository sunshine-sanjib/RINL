import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Chatbot from '../components/chatbot/Chatbot';
import { API } from '../context/AuthContext';

export default function ApprovalPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('complaints');
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const [pendingPM, setPendingPM] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get('/complaints?approvalStatus=pending&status=resolved'),
      API.get('/maintenance?approvalStatus=pending')
    ]).then(([c, m]) => {
      setPendingComplaints(c.data.complaints || []);
      setPendingPM(m.data.reports || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = pendingComplaints.length + pendingPM.length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Approvals" />
        <div className="page-wrapper">
          <div className="page-header">
            <div>
              <h1 className="page-title">Approval Center</h1>
              <p className="page-subtitle">{total} items pending your review</p>
            </div>
          </div>

          {total > 0 && (
            <div className="alert alert-warning" style={{ marginBottom: 20 }}>
              <span>⚠</span>
              <span>You have <strong>{total}</strong> item(s) pending approval. Please review and take action.</span>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display:'flex', gap:0, marginBottom:20, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', width:'fit-content' }}>
            {[['complaints',`Complaints (${pendingComplaints.length})`],['maintenance',`PM Reports (${pendingPM.length})`]].map(([key,label]) => (
              <button key={key} onClick={() => setTab(key)} style={{padding:'10px 24px',background:tab===key?'var(--rinl-steel)':'transparent',border:'none',color:tab===key?'#fff':'var(--text-secondary)',fontWeight:600,fontSize:14,cursor:'pointer',transition:'all 0.15s'}}>
                {label}
              </button>
            ))}
          </div>

          {loading ? <div className="app-loading" style={{height:200}}><div className="spinner"/></div>
          : tab === 'complaints' ? (
            pendingComplaints.length === 0 ? (
              <div className="card"><div className="empty-state"><div style={{fontSize:48}}>✅</div><h3>All Clear!</h3><p>No complaints pending approval.</p></div></div>
            ) : (
              <div className="card" style={{padding:0}}>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Asset</th>
                        <th>Location</th>
                        <th>Priority</th>
                        <th>Raised By</th>
                        <th>Resolved By</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingComplaints.map(c => (
                        <tr key={c._id}>
                          <td><code className="ticket-code">{c.ticketId}</code></td>
                          <td>{c.etlAssetNumber}</td>
                          <td>{c.location}</td>
                          <td><span className={`badge badge-${c.priority}`}>{c.priority}</span></td>
                          <td>{c.raisedBy?.name}</td>
                          <td>{c.resolvedBy?.name || '-'}</td>
                          <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                          <td>
                            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/complaints/${c._id}`)}>Review →</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            pendingPM.length === 0 ? (
              <div className="card"><div className="empty-state"><div style={{fontSize:48}}>✅</div><h3>All Clear!</h3><p>No PM reports pending approval.</p></div></div>
            ) : (
              <div className="card" style={{padding:0}}>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Report ID</th>
                        <th>UPS Serial</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>PM Date</th>
                        <th>Done By</th>
                        <th>Submitted By</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPM.map(r => (
                        <tr key={r._id}>
                          <td><code className="ticket-code">{r.reportId}</code></td>
                          <td>{r.etlUpsSn}</td>
                          <td>{r.location}</td>
                          <td style={{textTransform:'capitalize'}}>{r.maintenanceType}</td>
                          <td>{new Date(r.pmDate).toLocaleDateString('en-IN')}</td>
                          <td>{r.pmDoneBy}</td>
                          <td>{r.submittedBy?.name}</td>
                          <td>
                            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/maintenance/${r._id}`)}>Review →</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
