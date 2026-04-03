import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:20, background:'var(--bg-primary)' }}>
      <div style={{ fontSize:80 }}>🏗</div>
      <h1 style={{ fontFamily:'var(--font-heading)', fontSize:48, color:'var(--rinl-gold)' }}>404</h1>
      <p style={{ fontSize:18, color:'var(--text-secondary)' }}>Page not found — you may have taken a wrong turn at the blast furnace.</p>
      <Link to="/" className="btn btn-primary">← Return to Home</Link>
    </div>
  );
}
