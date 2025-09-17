import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { findMatchingLink, formatMessageWithLinks, extractLinksFromText } from './utils/linkUtils';
import SpeechRecognition from './components/SpeechRecognition';
import TTSService from './utils/ttsService';

const agentImg = 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png';
const API_URL = 'http://localhost:8000/api/chat';

function SpeakChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testStatus, setTestStatus] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize TTS service
  useEffect(() => {
    console.log('Initializing TTS service in SpeakChat...');
    
    // No initialization needed for the backend TTS service
    
    // Clean up
    return () => {
      // Any cleanup if needed
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Refs for speech recognition state
  const pressTimer = useRef(null);
  const isPressing = useRef(false);
  const lastTranscript = useRef('');

  // Handle speech recognition results
  const handleSpeechResult = useCallback((transcript) => {
    console.log('Speech result:', transcript);
    if (transcript && transcript.trim()) {
      setInput(prev => {
        // Only update if the transcript is new or different from the last one
        if (transcript !== lastTranscript.current) {
          lastTranscript.current = transcript;
          return prev ? `${prev} ${transcript}`.trim() : transcript;
        }
        return prev;
      });
    }
  }, []);

  // Handle speech recognition end
  const handleSpeechEnd = useCallback(() => {
    if (isPressing.current) {
      // If still pressing, restart recognition
      setIsListening(true);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
  }, []);

  // Fallback TTS using backend
  const speakWithBackendTTS = async (text) => {
    try {
      console.log('Using backend TTS for:', text);
      const response = await axios.post('http://localhost:8000/api/tts', 
        { text, language: 'en' },
        { responseType: 'json' }
      );
      
      // The backend returns an array with two paths - use the one that starts with a forward slash
      const audioPath = Array.isArray(response.data.audio_url) 
        ? response.data.audio_url.find(path => path.startsWith('/')) 
        : response.data.audio_url;
      
      if (!audioPath) {
        console.error('No valid audio path in response:', response.data);
        return false;
      }
      
      const audioUrl = `http://localhost:8000${audioPath}`;
      console.log('Playing audio from:', audioUrl);
      
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.error('Error playing audio:', e));
      return true;
    } catch (error) {
      console.error('Backend TTS failed:', error);
      return false;
    }
  };

  // Test speech synthesis
  const handleTestSpeech = useCallback(async () => {
    console.log('Testing TTS...');
    setTestStatus('Testing TTS service...');
    
    try {
      await TTSService.speak('This is a test of the text-to-speech service.');
      setTestStatus('TTS test successful!');
      setTimeout(() => setTestStatus(''), 3000);
    } catch (error) {
      console.error('TTS test failed:', error);
      setTestStatus(`TTS test failed: ${error.message}`);
    }
  }, []);

  // Handle mic button press (long press to record)
  const startPress = async () => {
    try {
      // Request microphone permissions first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks to release the microphone
      stream.getTracks().forEach(track => track.stop());
      
      isPressing.current = true;
      pressTimer.current = setTimeout(() => {
        setInput(prev => prev ? `${prev} ` : '');
        setIsListening(true);
        console.log('Microphone access granted, starting speech recognition...');
      }, 300);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Please allow microphone access to use voice input.');
    }
  };

  // Handle mic button release
  const endPress = () => {
    isPressing.current = false;
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    if (isListening) {
      setIsListening(false);
    }
  };

  // Read text aloud
  const handleSpeakText = useCallback(async (text) => {
    if (!text) return;
    
    console.log('Speaking text:', text);
    setIsSpeaking(true);
    
    try {
      // Use the TTSService to speak the text
      await TTSService.speak(text);
      console.log('Finished speaking');
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      // Fallback to browser's speech synthesis if available
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  // Handle opening links
  const handleOpenLink = (url, event) => {
    event.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Render message with clickable links
  const renderMessageWithLinks = (text, isAgent = false) => {
    if (!text) return null;
    const formattedText = formatMessageWithLinks(text);
    
    return (
      <div className="message-content">
        <div dangerouslySetInnerHTML={{ __html: formattedText }} />
        {isAgent && (
          <button 
            onClick={() => handleSpeakText(text)}
            className="speak-button"
            aria-label="Read message aloud"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              marginLeft: '8px',
              color: isSpeaking ? '#1a73e8' : '#666',
              fontSize: '0.9em',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {isSpeaking ? '⏹️' : '🔊'}
          </button>
        )}
      </div>
    );
  };

  // Handle sending messages
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setError(null);

    // Add user message to chat
    setMessages(prev => [...prev, {
      text: userMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      links: extractLinksFromText(userMessage)
    }]);

    try {
      // Check for direct link requests
      const matchingLink = findMatchingLink(userMessage);
      if (matchingLink) {
        const linkMessage = {
          text: `Here's the link to ${matchingLink.name}: ${matchingLink.url}`,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          links: [matchingLink]
        };
        setMessages(prev => [...prev, linkMessage]);
        handleSpeakText(linkMessage.text);
        return;
      }

      const response = await axios.post(API_URL, 
        { 
          text: userMessage,
          generate_audio: true,
          language: 'en',
          open_urls: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );
      
      console.log('API Response:', response.data);
      
      if (response.data) {
        const botMessage = { 
          text: response.data.text || "I'm sorry, I couldn't process that request.",
          sender: 'bot',
          audioUrl: response.data.audio_url,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Read the response aloud if we have text
        if (botMessage.text) {
          console.log('Speaking response:', botMessage.text);
          handleSpeakText(botMessage.text);
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      setMessages(prev => [...prev, { 
        text: errorMessage, 
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
      
      // Also speak the error message
      handleSpeakText(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes and key events
  const handleInputChange = (e) => setInput(e.target.value);
  const handleKeyDown = (e) => e.key === 'Enter' && !e.shiftKey && handleSend();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      {/* Speech Recognition */}
      <SpeechRecognition 
        onResult={handleSpeechResult}
        onEnd={handleSpeechEnd}
        isListening={isListening}
      />

      {/* Header */}
      <header style={{
        backgroundColor: '#1a73e8',
        color: 'white',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={agentImg} 
            alt="AI Assistant" 
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              marginRight: '1rem',
              backgroundColor: 'white',
              padding: 4,
            }} 
          />
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>AI Real Estate Assistant</h1>
        </div>
        <button 
          onClick={handleTestSpeech}
          style={{
            background: 'white',
            color: '#1a73e8',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          title="Test Speech Synthesis"
        >
          <span>🔊 Test Voice</span>
        </button>
      </header>

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: '1rem',
              maxWidth: '80%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              marginLeft: msg.sender === 'user' ? 'auto' : 0,
            }}
          >
            <div style={{
              backgroundColor: msg.sender === 'user' ? '#e3f2fd' : 'white',
              padding: '0.75rem 1rem',
              borderRadius: '18px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}>
              {msg.sender === 'agent' ? (
                renderMessageWithLinks(msg.text, true)
              ) : (
                <div>{msg.text}</div>
              )}
              
              {msg.links && msg.links.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '0.25rem' }}>
                    Helpful links:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {msg.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleOpenLink(link.url, e)}
                        style={{
                          color: '#1a73e8',
                          textDecoration: 'none',
                          fontSize: '0.9em',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          borderRadius: '4px',
                          display: 'inline-block',
                        }}
                      >
                        {link.name || 'Open Link'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{
                fontSize: '0.7em',
                color: '#666',
                textAlign: 'right',
                marginTop: '0.5rem',
              }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.5rem 1rem',
            backgroundColor: 'white',
            borderRadius: '18px',
            maxWidth: 'fit-content',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'white',
        borderTop: '1px solid #e0e0e0',
      }}>
        <div style={{
          display: 'flex',
          position: 'relative',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <input
            id="chat-input"
            name="message"
            type="text"
            value={input}
            onChange={handleInputChange}
            autoComplete="off"
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : 'Type your message...'}
            style={{
              flex: 1,
              padding: '0.75rem 3.5rem 0.75rem 1rem',
              border: `1px solid ${isListening ? '#4CAF50' : '#ddd'}`,
              borderRadius: '24px',
              fontSize: '1em',
              outline: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.3s',
            }}
            disabled={loading}
          />
          
          <button
            onMouseDown={startPress}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
            disabled={loading}
            style={{
              position: 'absolute',
              right: '50px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: isListening ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '0.5rem',
              color: isListening ? '#f44336' : '#757575',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            title={isListening ? 'Release to stop (long press)' : 'Hold to speak (long press)'}
            aria-label={isListening ? 'Listening... Release to stop' : 'Hold to speak'}
          >
            {isListening ? (
              <div className="pulse-animation">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            )}
          </button>
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: input.trim() ? '#1a73e8' : '#e0e0e0',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            title="Send message"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                transform: 'rotate(-45deg)',
                marginRight: '1px',
                marginTop: '1px',
              }}
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        
        {/* Status indicators */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.8em',
          color: '#666',
          marginTop: '0.5rem',
          minHeight: '1.2em',
        }}>
          {isListening && <div>Listening... Speak now</div>}
          {isSpeaking && <div>Reading message aloud...</div>}
          {error && <div style={{ color: '#d32f2f' }}>{error}</div>}
        </div>
      </div>

      {/* Animations */}
      <style jsx="true" global="true">
        {`
          @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-3px); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          .typing-indicator {
            display: flex;
            gap: 3px;
            padding: 0.5rem 1rem;
          }
          
          .typing-indicator span {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #666;
            animation: typing 1.4s infinite ease-in-out;
          }
          
          .typing-indicator span:nth-child(1) { animation-delay: 0s; }
          .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
          .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
          
          .pulse-animation {
            animation: pulse 1.5s infinite;
          }
        `}
      </style>

      {/* Touch feedback for mobile */}
      <style jsx="true" global="true">
        {`
          button:active {
            transform: scale(0.95) translateY(-50%) !important;
            transition: transform 0.1s;
          }
        `}
      </style>
    </div>
  );
}

export default SpeakChat;
