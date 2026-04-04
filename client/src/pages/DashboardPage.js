import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Chatbot from '../components/chatbot/Chatbot';
import { useAuth } from '../context/AuthContext';
import { API } from '../context/AuthContext';
import './DashboardPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const chartDefaults = { color: '#94a3c8', borderColor: '#1e3258' };

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (s) => <span className={`badge badge-${s}`}>{s.replace('_', ' ')}</span>;
  const priorityBadge = (p) => <span className={`badge badge-${p}`}>{p}</span>;

  const barData = {
    labels: data?.monthlyTrend?.map(t => t._id) || [],
    datasets: [{
      label: 'Complaints',
      data: data?.monthlyTrend?.map(t => t.count) || [],
      backgroundColor: 'rgba(37,99,235,0.6)',
      borderColor: '#2563eb',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };

  const doughnutData = {
    labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
    datasets: [{
      data: [
        data?.complaints?.open || 0,
        (data?.complaints?.total || 0) - (data?.complaints?.open || 0) - (data?.complaints?.resolved || 0),
        data?.complaints?.resolved || 0,
        (data?.complaints?.total || 0) - (data?.complaints?.open || 0) - (data?.complaints?.resolved || 0)
      ],
      backgroundColor: ['rgba(37,99,235,0.8)', 'rgba(234,88,12,0.8)', 'rgba(22,163,74,0.8)', 'rgba(100,116,139,0.6)'],
      borderColor: ['#2563eb', '#ea580c', '#16a34a', '#64748b'],
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3c8', font: { size: 12 } } } },
    scales: {
      x: { ticks: { color: '#94a3c8' }, grid: { color: '#1e3258' } },
      y: { ticks: { color: '#94a3c8' }, grid: { color: '#1e3258' } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#94a3c8', padding: 12, font: { size: 12 } } } }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="app-loading"><div className="spinner" /></div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Dashboard" />
        <div className="page-wrapper">

          {/* Welcome Banner */}
          <div className="welcome-banner">
            <div className="welcome-left">
              <div className="welcome-steel-img">
                <img src="/images/steel_production.webp" alt="Steel" />
                <div className="welcome-img-overlay" />
              </div>
              <div className="welcome-text">
                <p className="welcome-greeting">{greeting()},</p>
                <h2 className="welcome-name">{user?.name}</h2>
                <p className="welcome-meta">
                  <span className="role-pill">{user?.role?.toUpperCase()}</span>
                  {user?.department && <span>{user.department}</span>}
                  {user?.zone && <span>· {user.zone}</span>}
                  <span>· ID: {user?.employeeId}</span>
                </p>
              </div>
            </div>
            <div className="welcome-rinl-logo-wrap">
              <img src="/images/logonew.jpg" alt="RINL" className="welcome-rinl-logo" />
              <div>
                <div className="welcome-plant">Vizag Steel Plant</div>
                <div className="welcome-cms">UPS Contract Mgmt System</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card" onClick={() => navigate('/complaints')}>
              <div className="stat-icon" style={{ background: 'rgba(37,99,235,0.15)' }}>
                <span style={{ fontSize: 24 }}>📋</span>
              </div>
              <div>
                <div className="stat-label">Total Complaints</div>
                <div className="stat-value">{data?.complaints?.total ?? 0}</div>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigate('/complaints?status=open')}>
              <div className="stat-icon" style={{ background: 'rgba(234,88,12,0.15)' }}>
                <span style={{ fontSize: 24 }}>🔴</span>
              </div>
              <div>
                <div className="stat-label">Open Tickets</div>
                <div className="stat-value" style={{ color: '#fb923c' }}>{data?.complaints?.open ?? 0}</div>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigate('/complaints?status=resolved')}>
              <div className="stat-icon" style={{ background: 'rgba(22,163,74,0.15)' }}>
                <span style={{ fontSize: 24 }}>✅</span>
              </div>
              <div>
                <div className="stat-label">Resolved</div>
                <div className="stat-value" style={{ color: '#4ade80' }}>{data?.complaints?.resolved ?? 0}</div>
              </div>
            </div>
            <div className="stat-card critical-stat">
              <div className="stat-icon" style={{ background: 'rgba(220,38,38,0.15)' }}>
                <span style={{ fontSize: 24 }}>🚨</span>
              </div>
              <div>
                <div className="stat-label">Critical Open</div>
                <div className="stat-value" style={{ color: '#f87171' }}>{data?.complaints?.critical ?? 0}</div>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigate('/maintenance')}>
              <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.15)' }}>
                <span style={{ fontSize: 24 }}>🔧</span>
              </div>
              <div>
                <div className="stat-label">PM Reports</div>
                <div className="stat-value">{data?.maintenance?.total ?? 0}</div>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigate('/approvals')}>
              <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
                <span style={{ fontSize: 24 }}>⏳</span>
              </div>
              <div>
                <div className="stat-label">Pending Approval</div>
                <div className="stat-value" style={{ color: '#fbbf24' }}>{data?.maintenance?.pending ?? 0}</div>
              </div>
            </div>
            {data?.complaints?.slaBreached > 0 && (
              <div className="stat-card sla-breach-card">
                <div className="stat-icon" style={{ background: 'rgba(220,38,38,0.2)' }}>
                  <span style={{ fontSize: 24 }}>⚠</span>
                </div>
                <div>
                  <div className="stat-label">SLA Breached</div>
                  <div className="stat-value" style={{ color: '#f87171' }}>{data?.complaints?.slaBreached}</div>
                </div>
              </div>
            )}
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            <div className="card chart-card">
              <h3 className="chart-title">📈 Monthly Complaint Trend</h3>
              <div className="chart-wrap">
                {data?.monthlyTrend?.length > 0
                  ? <Bar data={barData} options={chartOptions} />
                  : <div className="empty-state"><p>No trend data yet</p></div>
                }
              </div>
            </div>
            <div className="card chart-card chart-card-sm">
              <h3 className="chart-title">🍩 Status Breakdown</h3>
              <div className="chart-wrap">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-row">
            <div className="card">
              <div className="section-header">
                <h3>🕐 Recent Complaints</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/complaints')}>View All</button>
              </div>
              {data?.recentComplaints?.length > 0 ? (
                <div className="table-wrapper" style={{ marginTop: 16 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentComplaints.map(c => (
                        <tr key={c._id} className="clickable-row" onClick={() => navigate(`/complaints/${c._id}`)}>
                          <td><code className="ticket-code">{c.ticketId}</code></td>
                          <td>{c.category?.replace('_', ' ')}</td>
                          <td>{c.location}</td>
                          <td>{priorityBadge(c.priority)}</td>
                          <td>{statusBadge(c.status)}</td>
                          <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No complaints yet</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/complaints/new')}>
                    + Raise First Complaint
                  </button>
                </div>
              )}
            </div>

            <div className="card">
              <div className="section-header">
                <h3>🔧 Recent PM Reports</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/maintenance')}>View All</button>
              </div>
              {data?.recentPM?.length > 0 ? (
                <div className="table-wrapper" style={{ marginTop: 16 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Report ID</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>PM Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentPM.map(m => (
                        <tr key={m._id} className="clickable-row" onClick={() => navigate(`/maintenance/${m._id}`)}>
                          <td><code className="ticket-code">{m.reportId}</code></td>
                          <td>{m.maintenanceType}</td>
                          <td>{m.location}</td>
                          <td>{new Date(m.pmDate).toLocaleDateString('en-IN')}</td>
                          <td>{statusBadge(m.approvalStatus)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No PM reports yet</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/maintenance/new')}>
                    + Submit PM Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links Footer */}
          <div className="quick-links-bar">
            {['VMS','SRM','Webmail','Medical Services (VSP)','Medical Services (Non-VSP)'].map(l => (
              <span key={l} className="quick-link-tag">{l}</span>
            ))}
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
