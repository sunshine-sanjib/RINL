import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Chatbot from '../components/chatbot/Chatbot';
import { API } from '../context/AuthContext';

export default function MaintenancePage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status:'', type:'' });

  useEffect(() => {
    const q = new URLSearchParams();
    if (filter.status) q.set('approvalStatus', filter.status);
    if (filter.type) q.set('maintenanceType', filter.type);
    API.get(`/maintenance?${q}`)
      .then(r => setReports(r.data.reports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Maintenance" />
        <div className="page-wrapper">
          <div className="page-header">
            <div>
              <h1 className="page-title">Preventive Maintenance</h1>
              <p className="page-subtitle">{reports.length} reports found</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/maintenance/new')}>+ New PM Report</button>
          </div>

          <div className="card card-sm" style={{ marginBottom:20 }}>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <select className="form-input" style={{ maxWidth:180 }} value={filter.status} onChange={e => setFilter(f=>({...f,status:e.target.value}))}>
                <option value="">All Approvals</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select className="form-input" style={{ maxWidth:180 }} value={filter.type} onChange={e => setFilter(f=>({...f,type:e.target.value}))}>
                <option value="">All Types</option>
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
                <option value="breakdown">Breakdown</option>
                <option value="annual">Annual</option>
              </select>
              <button className="btn btn-secondary btn-sm" onClick={() => setFilter({status:'',type:''})}>Clear</button>
            </div>
          </div>

          {loading ? <div className="app-loading" style={{height:200}}><div className="spinner"/></div>
          : reports.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div style={{fontSize:48}}>🔧</div>
                <h3>No PM Reports Found</h3>
                <p>Submit your first preventive maintenance report.</p>
                <button className="btn btn-primary btn-sm" style={{marginTop:16}} onClick={() => navigate('/maintenance/new')}>+ New PM Report</button>
              </div>
            </div>
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
                      <th>Approval</th>
                      <th>Submitted</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r._id} className="clickable-row">
                        <td><code className="ticket-code">{r.reportId}</code></td>
                        <td>{r.etlUpsSn}</td>
                        <td>{r.location}</td>
                        <td style={{textTransform:'capitalize'}}>{r.maintenanceType}</td>
                        <td>{new Date(r.pmDate).toLocaleDateString('en-IN')}</td>
                        <td>{r.pmDoneBy}</td>
                        <td><span className={`badge badge-${r.approvalStatus}`}>{r.approvalStatus}</span></td>
                        <td>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                        <td><button className="btn btn-secondary btn-sm" onClick={() => navigate(`/maintenance/${r._id}`)}>View →</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
