import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

export default function Navbar({ token, user, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar mf-navbar">
      <Link to="/" className="nav-brand mf-brand">PropEstateAI</Link>

      <button
        className={`nav-toggle ${open ? 'open' : ''}`}
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span className="hamburger" />
      </button>

      <div className={`nav-links mf-links ${open ? 'open' : ''}`}>
        <Link to="/" className="nav-link mf-link" onClick={() => setOpen(false)}>Home</Link>
        <Link to="/chat" className="nav-link mf-link" onClick={() => setOpen(false)}>Chat</Link>
        <Link to="/gallery" className="nav-link mf-link" onClick={() => setOpen(false)}>Gallery</Link>

        {!token && (
          <>
            <Link to="/login" className="nav-link mf-link" onClick={() => setOpen(false)}>Login</Link>
            <Link to="/register" className="nav-link mf-link" onClick={() => setOpen(false)}>Register</Link>
          </>
        )}

        {token && (
          <button onClick={() => { setOpen(false); onLogout && onLogout(); }} className="logout-btn mf-logout">Logout</button>
        )}
      </div>

      {user && (
        <div className="user-greeting mf-greeting">Welcome, <span>{user.username}</span></div>
      )}
    </nav>
  );
}
