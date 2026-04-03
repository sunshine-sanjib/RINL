import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../context/AuthContext';
import './Header.css';

export default function Header({ title }) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    API.get('/announcements/active').then(r => setAnnouncements(r.data.data || [])).catch(() => {});
    return () => clearInterval(t);
  }, []);

  const formatTime = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const activeTicker = announcements.find(a => a.type === 'alert' || a.type === 'warning');

  return (
    <header className="top-header">
      {/* Ticker for announcements */}
      {activeTicker && (
        <div className={`announcement-ticker ticker-${activeTicker.type}`}>
          <span className="ticker-label">
            {activeTicker.type === 'alert' ? '🚨 ALERT' : '⚠ NOTICE'}
          </span>
          <span className="ticker-text">{activeTicker.title}: {activeTicker.content}</span>
        </div>
      )}

      <div className="header-inner">
        <div className="header-left">
          <div className="header-rinl-bar">
            <img src="/images/logonew.jpg" alt="RINL" className="header-logo" />
            <div>
              <div className="header-org">Rashtriya Ispat Nigam Limited</div>
              <div className="header-sub">Visakhapatnam Steel Plant · IT & ERP Department</div>
            </div>
          </div>
          {title && <h1 className="header-page-title">{title}</h1>}
        </div>

        <div className="header-right">
          <div className="header-badges">
            <img src="/images/betibaacho.png" alt="Beti Bachao" className="gov-badge" title="Beti Bachao Beti Padhao" />
            <img src="/images/india_gov.jpg" alt="india.gov.in" className="gov-badge" title="india.gov.in" />
          </div>
          <div className="header-time">
            <div className="time-display">{formatTime(time)}</div>
            <div className="date-display">{formatDate(time)}</div>
          </div>
          <div className="header-user-chip">
            <div className="user-chip-avatar">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div className="user-chip-name">{user?.name}</div>
              <div className="user-chip-role">{user?.department || user?.role}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
