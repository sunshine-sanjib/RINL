import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = ['contractor','coordinator','eic','admin'];
const ROLE_COLORS = { admin:'#dc2626', eic:'#7c3aed', coordinator:'#2563eb', contractor:'#16a34a' };

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    API.get('/users')
      .then(r => setUsers(r.data.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdate = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await API.put(`/users/${editUser._id}`, editUser);
      toast.success('User updated!');
      setEditUser(null);
      fetchUsers();
    } catch(e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      toast.success('User deactivated.');
      fetchUsers();
    } catch(e) { toast.error('Error deactivating user.'); }
  };

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Admin Panel" />
        <div className="page-wrapper">
          <div className="page-header">
            <div>
              <h1 className="page-title">User Management</h1>
              <p className="page-subtitle">{users.length} total users registered</p>
            </div>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:24 }}>
            {ROLES.map(role => (
              <div key={role} className="stat-card" style={{ borderLeft:`3px solid ${ROLE_COLORS[role]}` }}>
                <div className="stat-icon" style={{ background:`${ROLE_COLORS[role]}22` }}>
                  <span style={{ fontSize:20 }}>{role==='admin'?'👑':role==='eic'?'🎖':role==='coordinator'?'📋':'🔧'}</span>
                </div>
                <div>
                  <div className="stat-label" style={{ textTransform:'uppercase' }}>{role}</div>
                  <div className="stat-value">{users.filter(u=>u.role===role).length}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card card-sm" style={{ marginBottom:16 }}>
            <input className="form-input" placeholder="🔍 Search by name, employee ID or email..."
              value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:400 }} />
          </div>

          {loading ? <div className="app-loading" style={{height:200}}><div className="spinner"/></div>
          : (
            <div className="card" style={{padding:0}}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Zone</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u._id}>
                        <td><code className="ticket-code">{u.employeeId}</code></td>
                        <td style={{ fontWeight:500 }}>{u.name}</td>
                        <td style={{ color:'var(--text-secondary)', fontSize:13 }}>{u.email}</td>
                        <td>
                          <span style={{ color:ROLE_COLORS[u.role], background:`${ROLE_COLORS[u.role]}22`, border:`1px solid ${ROLE_COLORS[u.role]}44`, padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, textTransform:'uppercase' }}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.department || '-'}</td>
                        <td>{u.zone || '-'}</td>
                        <td>
                          <span className={`badge ${u.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize:12, color:'var(--text-muted)' }}>
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                        </td>
                        <td>
                          <div style={{ display:'flex', gap:6 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditUser({...u})}>Edit</button>
                            {u.isActive && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(u._id)}>Disable</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div className="card" style={{ width:'100%', maxWidth:520, maxHeight:'90vh', overflow:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontFamily:'var(--font-heading)', fontSize:20 }}>Edit User: {editUser.employeeId}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditUser(null)}>✕</button>
            </div>
            <div className="form-grid-2">
              {[['name','Full Name','text'],['email','Email','email'],['designation','Designation','text'],['phone','Phone','tel'],['department','Department','text'],['zone','Zone','text']].map(([k,l,t]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" type={t} value={editUser[k]||''} onChange={e=>setEditUser(u=>({...u,[k]:e.target.value}))} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={editUser.role} onChange={e=>setEditUser(u=>({...u,role:e.target.value}))}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={String(editUser.isActive)} onChange={e=>setEditUser(u=>({...u,isActive:e.target.value==='true'}))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:16, justifyContent:'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setEditUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
                {saving ? 'Saving...' : '✓ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
