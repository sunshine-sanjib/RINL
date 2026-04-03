import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard', roles: ['contractor','coordinator','eic','admin'] },
  { to: '/complaints', icon: '⚠', label: 'Complaints', roles: ['contractor','coordinator','eic','admin'] },
  { to: '/maintenance', icon: '🔧', label: 'Maintenance', roles: ['contractor','coordinator','eic','admin'] },
  { to: '/approvals', icon: '✓', label: 'Approvals', roles: ['coordinator','eic','admin'] },
  { to: '/admin', icon: '⚙', label: 'Admin Panel', roles: ['admin'] },
  { to: '/profile', icon: '◎', label: 'My Profile', roles: ['contractor','coordinator','eic','admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  const roleColors = {
    admin: '#dc2626',
    eic: '#7c3aed',
    coordinator: '#2563eb',
    contractor: '#16a34a'
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <img src="/images/logonew.jpg" alt="RINL" className="sidebar-logo-img" />
        {!collapsed && (
          <div className="sidebar-logo-text">
            <span className="sidebar-brand">RINL</span>
            <span className="sidebar-subbrand">Vizag Steel</span>
          </div>
        )}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} title="Toggle sidebar">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* User Card */}
      {!collapsed && (
        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ background: `${roleColors[user?.role]}22`, border: `2px solid ${roleColors[user?.role]}` }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name}</span>
            <span className="sidebar-user-role" style={{ color: roleColors[user?.role] }}>
              {user?.role?.toUpperCase()}
            </span>
            <span className="sidebar-user-id">{user?.employeeId}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-label">NAVIGATION</div>}
        {filteredNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="sidebar-quick">
          <div className="nav-section-label">QUICK ACTIONS</div>
          <button className="quick-btn" onClick={() => navigate('/complaints/new')}>
            <span>+</span> New Complaint
          </button>
          <button className="quick-btn" onClick={() => navigate('/maintenance/new')}>
            <span>+</span> New PM Report
          </button>
        </div>
      )}

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout} title={collapsed ? 'Logout' : ''}>
          <span className="nav-icon">⏻</span>
          {!collapsed && <span>Logout</span>}
        </button>
        {!collapsed && (
          <div className="sidebar-version">RINL CMS v1.0</div>
        )}
      </div>
    </aside>
  );
}
