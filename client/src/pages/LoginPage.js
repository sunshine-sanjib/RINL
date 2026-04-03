import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ employeeId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const demoUsers = [
    { label: 'Admin', id: 'ADMIN001', pass: 'Admin@1234', color: '#dc2626' },
    { label: 'EIC', id: 'EIC001', pass: 'Eic@1234', color: '#7c3aed' },
    { label: 'Contractor', id: 'ETL001', pass: 'Contractor@123', color: '#16a34a' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId.trim() || !form.password) return;
    setLoading(true);
    const result = await login(form.employeeId.trim(), form.password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  const fillDemo = (user) => setForm({ employeeId: user.id, password: user.pass });

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-visual">
        <div className="login-visual-overlay" />
        <img src="/images/industry.jpg" alt="Visakhapatnam Steel Plant" className="login-bg-img" />
        <div className="login-visual-content">
          <img src="/images/logonew.jpg" alt="RINL Logo" className="login-rinl-logo" />
          <h1 className="login-org-name">Rashtriya Ispat Nigam Limited</h1>
          <p className="login-org-sub">Visakhapatnam Steel Plant</p>
          <p className="login-org-sub2">(A Govt. of India Enterprise)</p>
          <div className="login-badges">
            <img src="/images/betibaacho.png" alt="Beti Bachao" />
            <img src="/images/idy.jpg" alt="Yoga Day" />
            <img src="/images/india_gov.jpg" alt="india.gov.in" />
            <img src="/images/CMMIDEV3-1.png" alt="CMMI" />
          </div>
          <div className="login-tagline">
            <div className="login-tagline-icon">⚙</div>
            <div>
              <strong>UPS Contract Management System</strong>
              <br />IT & ERP Department · Vizag Steel Plant
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-form-panel">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-icon">🔐</div>
            <h2>Portal Login</h2>
            <p>Sign in with your RINL Employee ID</p>
          </div>

          {/* Demo User Buttons */}
          <div className="demo-users">
            <p className="demo-label">Quick Demo Login:</p>
            <div className="demo-btns">
              {demoUsers.map(u => (
                <button
                  key={u.id}
                  className="demo-btn"
                  style={{ borderColor: u.color, color: u.color }}
                  onClick={() => fillDemo(u)}
                  type="button"
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <div className="input-wrap">
                <span className="input-icon">◎</span>
                <input
                  className="form-input with-icon"
                  type="text"
                  placeholder="e.g. ADMIN001, ETL001"
                  value={form.employeeId}
                  onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  className="form-input with-icon"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button" className="show-pass-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-lg login-submit" type="submit" disabled={loading}>
              {loading ? <span className="spinner-sm" /> : '→'}
              {loading ? 'Signing In...' : 'Login to Portal'}
            </button>
          </form>

          <div className="login-footer-links">
            <span>New contractor? <Link to="/register">Register here</Link></span>
          </div>

          <div className="login-security-note">
            <span>🛡</span>
            <span>Secured by RINL IT Security · All sessions are monitored</span>
          </div>
        </div>

        <div className="login-page-footer">
          <img src="/images/climate_action.jpg" alt="Climate" />
          <p>© 2025 RINL – Visakhapatnam Steel Plant. IT & ERP Department.</p>
        </div>
      </div>
    </div>
  );
}
