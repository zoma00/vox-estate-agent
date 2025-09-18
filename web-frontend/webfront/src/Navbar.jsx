import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ token, user, onLogout }) {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        Vox Estate Agent
      </Link>
      
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/chat" className="nav-link">Chat</Link>
        <Link to="/gallery" className="nav-link">Gallery</Link>
        
        {user?.role === 'admin' && (
          <Link to="/admin" className="nav-link">Admin Dashboard</Link>
        )}
        
        {!token && (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
        
        {token && (
          <button 
            onClick={onLogout} 
            className="logout-btn"
            aria-label="Logout"
          >
            Logout
          </button>
        )}
      </div>
      
      {user && (
        <div className="user-greeting">
          Welcome, <span>{user.username}</span> ({user.role})
        </div>
      )}
    </nav>
  );
}

export default Navbar;
