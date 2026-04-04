import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

export function LandingPage() {
  return (
    <div className="landing">
      {/* Top Utility Bar */}
      <div className="landing-topbar">
        <div className="topbar-links">
          <button className="nav-btn">Home</button>
          <button className="nav-btn">Mobile Apps</button>
          <button className="nav-btn">RINL e-Suvidha</button>
          <button className="nav-btn">Retired Employees</button>
          <button className="nav-btn">Internship (PTMS)</button>
        </div>
        <div className="topbar-right">
          <button className="nav-btn">A+</button><button className="nav-btn">A-</button><button className="nav-btn">A</button>
          <button className="nav-btn hindi-link">हिंदी</button>
        </div>
      </div>

      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo-bar">
          <div className="landing-logo-left">
            <img src="/images/logonew.jpg" alt="RINL Logo" className="landing-logo" />
            <div className="landing-org-text">
              <h1>Rashtriya Ispat Nigam Limited</h1>
              <p className="landing-sub">Visakhapatnam Steel Plant</p>
              <p className="landing-govtext">(A Govt. of India Enterprise)</p>
            </div>
          </div>
          <div className="landing-logo-right">
            <img src="/images/betibaacho.png" alt="Beti Bachao" />
            <img src="/images/idy.jpg" alt="Yoga Day" />
          </div>
        </div>
        <nav className="landing-nav">
          <Link to="/login" className="landing-login-btn">🔐 Login to Portal</Link>
          <Link to="/register" className="landing-register-btn">+ Register</Link>
        </nav>
      </header>

      {/* Hero */}
      <div className="landing-hero">
        <img src="/images/industry.jpg" alt="Visakhapatnam Steel Plant" className="landing-hero-img" />
        <div className="landing-hero-overlay">
          <div className="landing-hero-text">
            <div className="hero-badge">IT & ERP Department</div>
            <h2>UPS Contract Management System</h2>
            <p>Digital platform for complaint registration, preventive maintenance tracking, and contract lifecycle management at Visakhapatnam Steel Plant.</p>
            <div className="hero-cta">
              <Link to="/login" className="btn btn-gold btn-lg">Access Portal →</Link>
              <Link to="/register" className="btn btn-secondary btn-lg">New Registration</Link>
            </div>
          </div>
        </div>
      </div>

      {/* About Sections */}
      <main className="landing-main">
        <section className="info-row">
          <div className="info-image">
            <img src="/images/steel_production.webp" alt="Steel Production" />
          </div>
          <div className="info-text">
            <h2>About RINL – Visakhapatnam Steel Plant</h2>
            <p>Rashtriya Ispat Nigam Limited (RINL), the corporate entity of <strong>Visakhapatnam Steel Plant (VSP)</strong>, is a Navratna Company under the <strong>Ministry of Steel, Government of India</strong>. Situated on the east coast of India, RINL is known for world-class infrastructure and technological excellence in steel production.</p>
            <p>Commissioned in 1992, the plant serves diverse sectors including construction, infrastructure, railways, and defense with high-quality steel products.</p>
          </div>
        </section>

        <section className="info-row reverse">
          <div className="info-image">
            <img src="/images/meeting_room.png" alt="IT Meeting Room" />
          </div>
          <div className="info-text">
            <h2>About the IT & ERP Department</h2>
            <p>The IT & ERP Department of RINL is the backbone of digital transformation at Visakhapatnam Steel Plant. This department designs, implements, and maintains all critical digital infrastructure and enterprise systems across the plant, including the UPS Contract Management System.</p>
          </div>
        </section>
      </main>

      {/* Features */}
      <section className="landing-features">
        <div className="features-header">
          <h2>Portal Features</h2>
          <p>Everything you need to manage UPS contracts efficiently</p>
        </div>
        <div className="features-grid">
          {[
            { icon:'📋', title:'Complaint Registration', desc:'Instantly log UPS issues across all RINL zones. Complaints are categorized, prioritized, and tracked with full asset details.' },
            { icon:'🔧', title:'Preventive Maintenance', desc:'Submit monthly PM reports digitally with structured checklists, measurements, battery data, and approval workflows.' },
            { icon:'📊', title:'Real-time Dashboard', desc:'Get live stats, SLA tracking, monthly trends, and role-based analytics — all in a single unified dashboard.' },
            { icon:'✅', title:'Approval Workflows', desc:'Multi-level approval system for coordinators and EICs. Review, approve or reject with remarks and audit trail.' },
            { icon:'💬', title:'AI Assistant (VISHWA)', desc:'Built-in Claude-powered chatbot that guides users through portal operations, SLA policies, and procedures.' },
            { icon:'🔐', title:'Role-Based Access', desc:'Secure, role-based access for Contractors, Coordinators, EICs, and Admins with granular permission control.' },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-links">
          {['VMS','SRM','Kids','Webmail','Medical Services (Employees)','Medical Services (NON-VSP)'].map(l => (
            <button key={l} className="footer-link-btn">{l}</button>
          ))}
        </div>
        <div className="footer-bottom">
          <div className="footer-logos">
            <img src="/images/india_gov.jpg" alt="india.gov.in" />
            <img src="/images/CMMIDEV3-1.png" alt="CMMIDEV3" />
            <img src="/images/climate_action.jpg" alt="Climate Ministry" />
          </div>
          <div className="footer-copy">
            <p>Website Last updated: 2025-06-23 17:39:00</p>
            <p>© 2025 – RINL UPS Contract Management System | IT & ERP Department | All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:20, background:'var(--bg-primary)' }}>
      <div style={{ fontSize:80 }}>🏗</div>
      <h1 style={{ fontFamily:'var(--font-heading)', fontSize:48, color:'var(--rinl-gold)' }}>404</h1>
      <p style={{ fontSize:18, color:'var(--text-secondary)' }}>Page not found.</p>
      <Link to="/" className="btn btn-primary">← Go Home</Link>
    </div>
  );
}

export default LandingPage;
