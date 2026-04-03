import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Chatbot from '../components/chatbot/Chatbot';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

export default function ComplaintsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isCoordinator } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: params.get('status') || '',
    priority: '',
    category: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchComplaints = () => {
    setLoading(true);
    const q = new URLSearchParams({ page, limit: 15 });
    if (filters.status) q.set('status', filters.status);
    if (filters.priority) q.set('priority', filters.priority);
    if (filters.category) q.set('category', filters.category);
    API.get(`/complaints?${q}`)
      .then(r => { setComplaints(r.data.complaints); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, [filters.status, filters.priority, filters.category, page]);

  const filtered = complaints.filter(c =>
    !filters.search ||
    c.ticketId?.toLowerCase().includes(filters.search.toLowerCase()) ||
    c.location?.toLowerCase().includes(filters.search.toLowerCase()) ||
    c.description?.toLowerCase().includes(filters.search.toLowerCase())
  );

  const statusBadge = (s) => <span className={`badge badge-${s}`}>{s.replace('_', ' ')}</span>;
  const priorityBadge = (p) => <span className={`badge badge-${p}`}>{p}</span>;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Complaints" />
        <div className="page-wrapper">
          <div className="page-header">
            <div>
              <h1 className="page-title">Complaint Management</h1>
              <p className="page-subtitle">Total: {total} records</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>
              + New Complaint
            </button>
          </div>

          {/* Filters */}
          <div className="card card-sm" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 2, minWidth: 200 }}>
                <input className="form-input" placeholder="🔍 Search by ticket ID, location..." value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <select className="form-input" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 130 }}>
                <select className="form-input" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
                  <option value="">All Priority</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <select className="form-input" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                  <option value="">All Categories</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="network">Network</option>
                  <option value="ups_failure">UPS Failure</option>
                  <option value="battery">Battery</option>
                  <option value="power_supply">Power Supply</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ status:'',priority:'',category:'',search:'' })}>
                Clear
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="app-loading" style={{ height: 200 }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div style={{ fontSize: 48 }}>📋</div>
                <h3>No Complaints Found</h3>
                <p>No records match your current filters.</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/complaints/new')}>
                  + Raise a Complaint
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Asset No.</th>
                      <th>Location</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      {isCoordinator && <th>Raised By</th>}
                      <th>SLA</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => {
                      const slaOk = c.slaDeadline ? new Date(c.slaDeadline) > new Date() : true;
                      const breached = !slaOk && !['resolved','closed'].includes(c.status);
                      return (
                        <tr key={c._id} className={`clickable-row ${breached ? 'sla-row' : ''}`}>
                          <td><code className="ticket-code">{c.ticketId}</code></td>
                          <td>{c.etlAssetNumber}</td>
                          <td>{c.location}</td>
                          <td style={{ textTransform: 'capitalize' }}>{c.category?.replace('_', ' ')}</td>
                          <td>{priorityBadge(c.priority)}</td>
                          <td>{statusBadge(c.status)}</td>
                          {isCoordinator && <td>{c.raisedBy?.name || '-'}</td>}
                          <td>
                            {breached
                              ? <span className="badge badge-critical">⚠ BREACH</span>
                              : <span className="badge badge-approved">✓ OK</span>}
                          </td>
                          <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                          <td>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/complaints/${c._id}`)}>
                              View →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > 15 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16 }}>
                  <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14, padding: '6px 12px' }}>
                    Page {page} of {Math.ceil(total / 15)}
                  </span>
                  <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
