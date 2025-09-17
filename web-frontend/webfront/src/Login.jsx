import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      const response = await axios.post('http://localhost:8000/token', params);
      const token = response.data.access_token;
      onLogin(token);
    } catch (err) {
      setError('Login failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: 32 }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            style={{ width: '100%', padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            disabled={loading}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            style={{ width: '100%', padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            disabled={loading}
            required
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px 0', fontSize: 16, borderRadius: 4, background: '#3498db', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      </form>
    </div>
  );
}

export default Login;
