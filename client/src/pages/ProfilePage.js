// ProfilePage.js
import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name:user?.name||'', email:user?.email||'', phone:user?.phone||'', designation:user?.designation||'', department:user?.department||'', zone:user?.zone||'' });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/users/${user._id}`, form);
      updateUser({ ...user, ...form });
      toast.success('Profile updated!');
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match.'); return; }
    setChangingPw(true);
    try {
      await API.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch(e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setChangingPw(false); }
  };

  const roleColors = { admin:'#dc2626', eic:'#7c3aed', coordinator:'#2563eb', contractor:'#16a34a' };

  return (
    <div className="app-layout">
      <Sidebar/>
      <div className="main-content">
        <Header title="My Profile"/>
        <div className="page-wrapper">
          <div className="page-header">
            <h1 className="page-title">My Profile</h1>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:20,alignItems:'flex-start'}}>
            {/* Profile Card */}
            <div className="card" style={{textAlign:'center',padding:32}}>
              <div style={{width:80,height:80,borderRadius:'50%',background:`${roleColors[user?.role]}22`,border:`3px solid ${roleColors[user?.role]}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontFamily:'var(--font-heading)',fontSize:36,fontWeight:700,color:'var(--text-primary)'}}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <h2 style={{fontFamily:'var(--font-heading)',fontSize:22,marginBottom:6}}>{user?.name}</h2>
              <span style={{color:roleColors[user?.role],background:`${roleColors[user?.role]}22`,border:`1px solid ${roleColors[user?.role]}44`,padding:'3px 14px',borderRadius:20,fontSize:12,fontWeight:700,textTransform:'uppercase'}}>
                {user?.role}
              </span>
              <div style={{marginTop:20,padding:16,background:'var(--bg-input)',borderRadius:'var(--radius-md)',textAlign:'left'}}>
                <div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:12}}>Account Details</div>
                {[['Employee ID',user?.employeeId],['Department',user?.department||'-'],['Zone',user?.zone||'-'],['Designation',user?.designation||'-']].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:8,paddingBottom:8,borderBottom:'1px solid var(--border)'}}>
                    <span style={{color:'var(--text-muted)'}}>{k}</span>
                    <span style={{color:'var(--text-primary)',fontWeight:500}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {/* Edit Profile */}
              <div className="card" style={{marginBottom:20}}>
                <h3 style={{fontFamily:'var(--font-heading)',fontSize:18,marginBottom:20}}>✏ Edit Profile</h3>
                <form onSubmit={handleUpdate}>
                  <div className="form-grid-2">
                    {[['name','Full Name','text'],['email','Email','email'],['phone','Phone','tel'],['designation','Designation','text'],['department','Department','text'],['zone','Zone','text']].map(([k,l,t])=>(
                      <div key={k} className="form-group">
                        <label className="form-label">{l}</label>
                        <input className="form-input" type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
                      </div>
                    ))}
                  </div>
                  <div style={{textAlign:'right',marginTop:8}}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':'✓ Save Profile'}</button>
                  </div>
                </form>
              </div>

              {/* Change Password */}
              <div className="card">
                <h3 style={{fontFamily:'var(--font-heading)',fontSize:18,marginBottom:20}}>🔒 Change Password</h3>
                <form onSubmit={handlePwChange}>
                  <div className="form-grid-2">
                    <div className="form-group form-full">
                      <label className="form-label">Current Password</label>
                      <input className="form-input" type="password" value={pwForm.currentPassword} onChange={e=>setPwForm(p=>({...p,currentPassword:e.target.value}))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input className="form-input" type="password" value={pwForm.newPassword} onChange={e=>setPwForm(p=>({...p,newPassword:e.target.value}))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <input className="form-input" type="password" value={pwForm.confirmPassword} onChange={e=>setPwForm(p=>({...p,confirmPassword:e.target.value}))} required />
                    </div>
                  </div>
                  <div style={{textAlign:'right',marginTop:8}}>
                    <button type="submit" className="btn btn-primary" disabled={changingPw}>{changingPw?'Updating...':'✓ Update Password'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
