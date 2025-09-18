import React, { useState, useRef } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import Navbar from './Navbar';
import SpeakChat from './SpeakChat';
import Gallery from './Gallery';
import Register from './Register';
import ErrorBoundary from './components/ErrorBoundary';

const TTS_API_URL = 'http://localhost:8000/api/tts';
const OPENAI_API_URL = 'http://localhost:8000/api/openai_chat';
const agentImg = 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png';
const homeBg = 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const audioRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Chat functionality handlers
  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setMessages([...messages, { text: input, sender: 'user' }]);
    
    try {
      const chatRes = await axios.post(OPENAI_API_URL, { text: input });
      const agentText = chatRes.data.response || 'No response';
      setMessages(msgs => [...msgs, { text: agentText, sender: 'agent' }]);
      
      const ttsRes = await axios.post(TTS_API_URL, { text: agentText }, { responseType: 'blob' });
      const url = URL.createObjectURL(ttsRes.data);
      
      setMessages(msgs => {
        const updated = [...msgs];
        updated[updated.length - 1].audio = url;
        return updated;
      });
      
      setInput('');
      setTimeout(() => audioRef.current?.play(), 100);
    } catch (error) {
      setMessages(msgs => [...msgs, { text: 'Error: ' + error.message, sender: 'system' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => setInput(e.target.value);
  const handleKeyDown = (e) => e.key === 'Enter' && handleSend();

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Dedicated Chat Interface */}
        <Route 
          path="/chat" 
          element={
            <div className="chat-container">
              <SpeakChat 
                messages={messages}
                input={input}
                setInput={setInput}
                handleSendMessage={handleSend}
                audioRef={audioRef}
                agentImg={agentImg}
                loading={loading}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          } 
        />

        {/* Redirect /explore to /gallery */}
        <Route 
          path="/explore" 
          element={
            <ErrorBoundary>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Redirecting to Gallery...</p>
                <Link to="/gallery" className="return-to-chat">
                  Go to Gallery
                </Link>
              </div>
            </ErrorBoundary>
          } 
        />

        {/* Homepage with Combined Access */}
        <Route 
          path="/" 
          element={
            <div className="home-container" style={{ 
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${homeBg})`,
              minHeight: '100vh',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              paddingTop: '100px',
              paddingBottom: '50px',
              boxSizing: 'border-box'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                maxWidth: '600px',
                margin: '0 auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <h1 style={{ color: '#333', marginBottom: '1.5rem' }}>Find Your Dream Home</h1>
                <Link 
                  to="/gallery" 
                  style={{
                    display: 'inline-block',
                    padding: '0.8rem 2rem',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
                >
                  Browse Properties
                </Link>
              </div>
            </div>
          } 
        />

        {/* Other Routes */}
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
