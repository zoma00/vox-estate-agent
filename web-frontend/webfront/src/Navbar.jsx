import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ token, user, onLogout }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#2c3e50', padding: '12px 32px', color: '#fff', boxShadow: '0 2px 8px #0002' }}>
      <div style={{ fontWeight: 'bold', fontSize: 22 }}>
        Vox Estate Agent
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
        <Link to="/chat" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Chat</Link>
        <Link to="/gallery" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Gallery</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Admin Dashboard</Link>
        )}
        {!token && <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Login</Link>}
        {!token && <Link to="/register" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Register</Link>}
        {token && <button onClick={onLogout} style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>Logout</button>}
      </div>
      {user && (
        <div style={{ marginLeft: 24, fontSize: 15 }}>
          Welcome, <span style={{ fontWeight: 'bold' }}>{user.username}</span> ({user.role})
        </div>
      )}
    </nav>
  );
}

export default Navbar;
