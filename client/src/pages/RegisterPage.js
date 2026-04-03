import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

const ZONES = ['Zone-A','Zone-B','Zone-C','Zone-D','Zone-E','Zone-F','All'];
const DEPTS = ['UPS Maintenance','IT & ERP','Electrical','Mechanical','Civil','Procurement','Operations','HR','Finance','Other'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeId: '', name: '', email: '', password: '', confirmPassword: '',
    role: 'contractor', department: '', zone: '', phone: '', designation: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.employeeId.trim()) e.employeeId = 'Employee ID is required';
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.department) e.department = 'Department required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { confirmPassword, ...payload } = form;
    const result = await register(payload);
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }));
  };

  return (
    <div className="register-page">
      <div className="register-header">
        <img src="/images/logonew.jpg" alt="RINL" className="reg-logo" />
        <div>
          <h1>Rashtriya Ispat Nigam Limited</h1>
          <p>Contract Management System — New User Registration</p>
        </div>
        <div className="reg-header-right">
          <img src="/images/betibaacho.png" alt="" />
          <img src="/images/idy.jpg" alt="" />
        </div>
      </div>

      <div className="register-body">
        <div className="register-card">
          <div className="register-card-title">
            <span className="register-icon">📋</span>
            <div>
              <h2>Create Your Account</h2>
              <p>All fields marked <span style={{color:'var(--rinl-red)'}}>*</span> are required</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="reg-section-label">Account Credentials</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Employee ID *</label>
                <input className={`form-input ${errors.employeeId ? 'input-error' : ''}`}
                  placeholder="e.g. ETL002, VSP123"
                  value={form.employeeId} onChange={set('employeeId')} />
                {errors.employeeId && <span className="field-error">{errors.employeeId}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="As per RINL records"
                  value={form.name} onChange={set('name')} />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className={`form-input ${errors.email ? 'input-error' : ''}`}
                  type="email" placeholder="official@email.com"
                  value={form.email} onChange={set('email')} />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={set('role')}>
                  <option value="contractor">Contractor</option>
                  <option value="coordinator">Coordinator</option>
                </select>
                <span className="field-hint">EIC/Admin roles are assigned by Admin</span>
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className={`form-input ${errors.password ? 'input-error' : ''}`}
                  type="password" placeholder="Min 6 characters"
                  value={form.password} onChange={set('password')} />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  type="password" placeholder="Re-enter password"
                  value={form.confirmPassword} onChange={set('confirmPassword')} />
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="reg-section-label" style={{marginTop:16}}>Work Details</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select className={`form-input ${errors.department ? 'input-error' : ''}`}
                  value={form.department} onChange={set('department')}>
                  <option value="">Select Department</option>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <span className="field-error">{errors.department}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Zone</label>
                <select className="form-input" value={form.zone} onChange={set('zone')}>
                  <option value="">Select Zone</option>
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input className="form-input" type="tel" placeholder="+91 XXXXX XXXXX"
                  value={form.phone} onChange={set('phone')} />
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input className="form-input" placeholder="e.g. UPS Technician"
                  value={form.designation} onChange={set('designation')} />
              </div>
            </div>

            <div className="register-terms">
              <span>🔒</span>
              By registering, you agree to RINL's IT Security Policy and acknowledge that all system activities are logged and monitored.
            </div>

            <button className="btn btn-primary btn-lg reg-submit" type="submit" disabled={loading}>
              {loading ? <><span className="spinner-sm" /> Creating Account...</> : <>✓ Create Account</>}
            </button>
          </form>

          <p className="reg-login-link">Already registered? <Link to="/login">Login here</Link></p>
        </div>
      </div>

      <div className="register-footer">
        <p>© 2025 RINL – Visakhapatnam Steel Plant · IT & ERP Department</p>
      </div>
    </div>
  );
}
