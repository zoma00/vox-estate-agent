import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { findMatchingLink, formatMessageWithLinks, extractLinksFromText } from './utils/linkUtils';
import TTSService from './utils/ttsService';
import ChromeSpeechRecognition from './components/ChromeSpeechRecognition';

const agentImg = 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png';
const API_URL = 'http://localhost:8000/api/chat';

function SpeakChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isTtsReady, setIsTtsReady] = useState(false);
  const [isTtsTesting, setIsTtsTesting] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize and warm up the TTS service on component mount
  useEffect(() => {
    let isMounted = true;
    const warmUpTts = async () => {
      try {
        console.log('Warming up TTS service...');
        // Use a valid word and call textToSpeech directly to avoid playing audio.
        // This just checks if the service is alive.
        await TTSService.textToSpeech('Hello', 'en');
        if (isMounted) {
          console.log('TTS service is ready.');
          setIsTtsReady(true);
        }
      } catch (error) {
        if (isMounted) {
          console.error('TTS service warm-up failed:', error);
          setError('TTS service is unavailable.');
          setIsTtsReady(false); // Keep it disabled if warm-up fails
        }
      }
    };

    warmUpTts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle transcript updates
  useEffect(() => {
    if (transcript) {
      setInput(prev => {
        const newInput = prev ? `${prev} ${transcript}`.trim() : transcript;
        return newInput;
      });
    }
  }, [transcript]);

  // Handle speech recognition results
  const handleSpeechResult = useCallback((text) => {
    console.log('Speech result received:', text);
    if (text && text.trim()) {
      setTranscript(prev => {
        // Append new transcript to existing input
        const newInput = prev ? `${prev} ${text}`.trim() : text;
        setInput(newInput);
        return newInput;
      });
    }
  }, []);

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

  // Memoize the handleSpeakText function to prevent unnecessary re-renders
  const memoizedHandleSpeakText = useCallback((text) => {
    return handleSpeakText(text);
  }, [handleSpeakText]);

  // Handle sending messages
  const handleSend = useCallback(async () => {
    const messageToSend = input.trim();
    if (!messageToSend) return;
    
    setInput('');
    setLoading(true);
    setError(null);

    // Add user message to chat
    setMessages(prev => [...prev, {
      text: messageToSend,
      sender: 'user',
      timestamp: new Date().toISOString(),
      links: extractLinksFromText(messageToSend)
    }]);

    try {
      // Check for direct link requests
      const matchingLink = findMatchingLink(messageToSend);
      if (matchingLink) {
        const linkMessage = {
          text: `Here's the link to ${matchingLink.name}: ${matchingLink.url}`,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          links: [matchingLink]
        };
        setMessages(prev => [...prev, linkMessage]);
        memoizedHandleSpeakText(linkMessage.text);
        return;
      }

      // Continue with normal message processing...
      const response = await axios.post(API_URL, 
        { 
          text: messageToSend,
          generate_audio: true,
          language: 'en',
          open_urls: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
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
        
        if (botMessage.text) {
          console.log('Speaking response:', botMessage.text);
          memoizedHandleSpeakText(botMessage.text);
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
      
      memoizedHandleSpeakText(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [input, memoizedHandleSpeakText]);

  // Handle speech recognition errors
  const handleSpeechError = useCallback((error) => {
    console.error('Speech recognition error:', error);
    
    let errorMessage = 'An error occurred with speech recognition.';
    
    switch(error) {
      case 'no-speech':
        errorMessage = 'No speech was detected. Please try speaking again.';
        break;
      case 'audio-capture':
        errorMessage = 'No microphone was found. Please ensure a microphone is connected.';
        break;
      case 'not-allowed':
      case 'permission-denied':
      case 'microphone-denied':
        errorMessage = 'Microphone access was denied. Please allow microphone access in your browser settings to use voice commands.';
        break;
      case 'language-not-supported':
        errorMessage = 'The selected language is not supported by your browser.';
        break;
      case 'service-not-allowed':
        errorMessage = 'Browser doesn\'t support speech recognition. Try using Chrome or Edge.';
        break;
      default:
        errorMessage = `Speech recognition error: ${error}`;
    }
    
    setError(errorMessage);
    setIsListening(false);
    
    const timer = setTimeout(() => {
      setError(null);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle speech recognition start
  const handleSpeechStart = useCallback(() => {
    console.log('Speech recognition started');
    setIsListening(true);
    setError(null);
    setTranscript(''); // Clear previous transcript
  }, []);
  
  // Handle speech recognition end
  const handleSpeechEnd = useCallback(() => {
    console.log('Speech recognition ended');
    setIsListening(false);
    
    // Auto-send if there's a transcript
    if (transcript?.trim() && !loading) {
      console.log('Auto-sending transcript:', transcript);
      handleSend().catch(e => {
        console.error('Auto-send failed:', e);
        setError('Failed to auto-send message');
      });
    }
  }, [transcript, loading, handleSend]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.stop();
        }
      }
    };
  }, [isListening]);

  // Test speech synthesis
  const handleTestSpeech = useCallback(async () => {
    console.log('Testing TTS...');
    setIsTtsTesting(true);
    try {
      await memoizedHandleSpeakText('This is a test of the text-to-speech service.');
      console.log('TTS test successful');
    } catch (error) {
      console.error('TTS test failed:', error);
      setError('TTS test failed.');
    } finally {
      setIsTtsTesting(false);
    }
  }, [memoizedHandleSpeakText]);

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

  // Handle sending messages (duplicate removed - using the first implementation above)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
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
          disabled={!isTtsReady || isTtsTesting}
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
          <span>
            {isTtsTesting 
              ? 'Testing...'
              : !isTtsReady 
                ? 'TTS Loading...'
                : '🔊 Test Voice'}
          </span>
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
        position: 'relative',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative',
          paddingRight: '50px', // Make room for the mic button
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '24px',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
              paddingRight: '50px', // Make room for the mic button
            }}
          />
          
          {/* Send Button */}
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || loading}
            style={{
              position: 'absolute',
              right: '60px',
              background: 'none',
              border: 'none',
              cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              color: !input.trim() || loading ? '#ccc' : '#1a73e8',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: input.trim() ? 1 : 0.5,
            }}
            title="Send message"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Chrome Speech Recognition Button */}
          <div style={{ 
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
          }}>
            <ChromeSpeechRecognition
              onResult={handleSpeechResult}
              onError={handleSpeechError}
              onStart={handleSpeechStart}
              onEnd={handleSpeechEnd}
              style={{
                background: isListening ? '#ff4444' : '#1a73e8',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isSpeaking ? 'not-allowed' : 'pointer',
                opacity: isSpeaking ? 0.7 : 1,
                transition: 'all 0.2s',
                fontSize: '18px',
                padding: 0,
              }}
              disabled={isSpeaking}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            />
          </div>
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
