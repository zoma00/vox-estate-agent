import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import SpeakChat from './SpeakChat';
import Navbar from './Navbar';

// Dummy JWT decode (for demo, parse payload)
function decodeJWT(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    // Example: { sub: "admin", role: "admin" }
    return { username: decoded.sub, role: decoded.role || 'user' };
  } catch {
    return null;
  }
}

function ProtectedRoute({ token, children }) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppAuthDemo() {
  const [token, setToken] = useState(null);
  const user = decodeJWT(token);

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <Router>
      <Navbar token={token} user={user} onLogout={handleLogout} />
      <Routes>
  <Route path="/" element={<div style={{ padding: 32 }}><h1>Welcome to PropEstateAI</h1></div>} />
        <Route path="/login" element={<Login onLogin={setToken} />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute token={token}>
              <SpeakChat token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute token={token}>
              {user?.role === 'admin' ? (
                <div style={{ padding: 32 }}><h2>Admin Dashboard</h2><p>Admin features go here.</p></div>
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute token={token}>
              <div style={{ padding: 32 }}><h2>Property Gallery</h2><p>Gallery content goes here.</p></div>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default AppAuthDemo;
