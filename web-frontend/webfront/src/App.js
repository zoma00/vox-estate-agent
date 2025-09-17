
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import Navbar from './Navbar';
import SpeakChat from './SpeakChat';
import Gallery from './Gallery';
import Register from './Register';

const TTS_API_URL = 'http://localhost:8000/api/tts'; // Update as needed
const OPENAI_API_URL = 'http://localhost:8000/api/openai_chat'; // Update as needed

const agentImg = 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png'; // Robot agent image
const homeBg = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'; // Real estate background

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const audioRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setMessages([...messages, { text: input, sender: 'user' }]);
    try {
      // Get OpenAI chat response
      const chatRes = await axios.post(OPENAI_API_URL, { text: input });
      const agentText = chatRes.data.response || 'No response';
      setMessages(msgs => [...msgs, { text: agentText, sender: 'agent' }]);
      // Get TTS audio for agent response
      const ttsRes = await axios.post(TTS_API_URL, { text: agentText }, { responseType: 'blob' });
      const url = URL.createObjectURL(ttsRes.data);
      setMessages(msgs => {
        const updated = [...msgs];
        updated[updated.length - 1].audio = url;
        return updated;
      });
      setLoading(false);
      setInput('');
      setTimeout(() => {
        if (audioRef.current) audioRef.current.play();
      }, 100);
    } catch (error) {
      setMessages(msgs => [...msgs, { text: 'Error: ' + error.message, sender: 'system' }]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => setInput(e.target.value);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <div style={{
            minHeight: '100vh',
            background: `url(${homeBg}) center/cover no-repeat`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Segoe UI, Arial, sans-serif',
          }}>
            <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 16, padding: 32, boxShadow: '0 2px 16px #0002', maxWidth: 400, width: '100%' }}>
              <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Welcome to Vox Estate Agent</h2>
              <p style={{ textAlign: 'center', marginBottom: 24 }}>Please login or register to continue.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                <Link to="/login" style={{ background: '#3498db', color: '#fff', borderRadius: 4, border: 'none', padding: '10px 24px', fontSize: 16, textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
                <Link to="/register" style={{ background: '#2c3e50', color: '#fff', borderRadius: 4, border: 'none', padding: '10px 24px', fontSize: 16, textDecoration: 'none', fontWeight: 'bold' }}>Register</Link>
              </div>
            </div>
          </div>
        } />
        <Route path="/chat" element={<SpeakChat />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
