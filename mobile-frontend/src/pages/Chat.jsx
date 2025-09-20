import React, { useEffect, useRef, useState, useCallback } from 'react';
import TTSService from '../utils/TTSService';
import '../styles.css';

function renderMessageWithLinks(text) {
  // simple link rendering: convert URLs to anchor tags
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, idx) => {
    if (urlRegex.test(part)) {
      return (
        <a key={idx} href={part} target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function extractLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  return matches.map((u) => ({ name: u, url: u }));
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Warm up TTS on mount (best-effort)
    TTSService.warmup().catch(() => {});
  }, []);

  useEffect(() => {
    // scroll to bottom when messages change
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(text) {
    if (!text) return;
    const userMsg = { role: 'user', text, timestamp: new Date().toISOString(), links: extractLinks(text) };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsSending(true);
    setTyping(true);

    try {
      // Match backend ChatRequest model: use 'text' and include optional flags
      const payload = {
        text,
        generate_audio: true,
        open_urls: true,
        language: 'en'
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Chat API error: ${res.status} ${errText}`);
      }

      const data = await res.json();

      // Backend returns AIResponse which may contain text or response field
      const reply = data?.text || data?.response || data?.message || data?.reply || 'No response';

      const botMsg = {
        role: 'agent',
        text: reply,
        timestamp: new Date().toISOString(),
        links: data?.links || extractLinks(reply),
      };

      // If backend included an audio_url, attach it
      if (data?.audio_url) botMsg.audio = data.audio_url;

      setMessages((m) => [...m, botMsg]);

      // Play audio: prefer audio_url if provided, otherwise ask backend TTS endpoint
      try {
        if (botMsg.audio) {
          // If audio_url is relative, convert to absolute pointing at backend host
          let audioUrl = botMsg.audio;
          if (audioUrl.startsWith('/')) {
            const pageHost = window.location.hostname || '127.0.0.1';
            const backendHost = pageHost === 'localhost' ? '127.0.0.1' : pageHost;
            const backendPort = '8000';
            audioUrl = `${window.location.protocol}//${backendHost}:${backendPort}${audioUrl}`;
          }
          const audio = new Audio(audioUrl);
          await audio.play().catch(() => {});
        } else {
          setIsSpeaking(true);
          await TTSService.speak(reply).catch(() => {});
          setIsSpeaking(false);
        }
      } catch (e) {
        console.warn('TTS playback failed', e);
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error('chat error', err);
      setMessages((m) => [...m, { role: 'agent', text: 'Error: failed to get response', timestamp: new Date().toISOString() }]);
      setError('Error: failed to get response');
    } finally {
      setIsSending(false);
      setTyping(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input.trim());
  }

  // Basic speech recognition (Chrome/Edge)
  const startListening = useCallback(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('Speech recognition not supported in this browser.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        const text = Array.from(event.results).map(r => r[0].transcript).join(' ');
        if (text && text.trim()) {
          setInput(prev => prev ? `${prev} ${text}`.trim() : text);
        }
      };

      recognition.onerror = (evt) => {
        console.error('Speech recognition error', evt);
        setError('Speech recognition error');
      };

      recognition.onend = () => {
        setIsListening(false);
        // Auto-send if there's text
        if (input.trim()) sendMessage(input.trim());
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error('startListening failed', e);
      setError('Could not start microphone');
    }
  }, [input]);

  const stopListening = useCallback(() => {
    try {
      const r = recognitionRef.current;
      if (r) {
        r.stop();
        recognitionRef.current = null;
      }
    } catch (e) {
      console.error('stopListening failed', e);
    } finally {
      setIsListening(false);
    }
  }, []);

  return (
    <div className="chat-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
  // Using a local image served from the frontend `public/assets` directory.
  backgroundImage: "linear-gradient(rgba(0,0,0,0.22), rgba(0,0,0,0.22)), url('/assets/photo-1582407947304-fd86f028f716.avif')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '2rem'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '70vh',
        // slightly more transparent card so background image shows through
        backgroundColor: 'rgba(255,255,255,0.85)',
        maxWidth: '420px',
        width: '94%',
        margin: '0 auto',
        borderRadius: '12px',
        // soften shadow for a lighter look
        boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }}>
      <div className="chat-container" ref={containerRef} aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.role}`}>
            <div className="message-body">{renderMessageWithLinks(m.text)}</div>

            {/* Helpful links block (if backend provided links array) */}
            {m.links && m.links.length > 0 && (
              <div className="helpful-links">
                <div className="links-label">Helpful links:</div>
                <div className="links-list">
                  {m.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => { e.preventDefault(); window.open(link.url, '_blank', 'noopener,noreferrer'); }}
                    >
                      {link.name || link.url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {m.role === 'agent' && (
              <button
                className="play-btn"
                onClick={async () => {
                  // Prefer provided audio URL
                  if (m.audio) {
                    let audioUrl = m.audio;
                    if (audioUrl.startsWith('/')) {
                      const pageHost = window.location.hostname || '127.0.0.1';
                      const backendHost = pageHost === 'localhost' ? '127.0.0.1' : pageHost;
                      const backendPort = '8000';
                      audioUrl = `${window.location.protocol}//${backendHost}:${backendPort}${audioUrl}`;
                    }
                    const audioEl = new Audio(audioUrl);
                    await audioEl.play().catch(() => {});
                    return;
                  }

                  try {
                    setIsSpeaking(true);
                    await TTSService.speak(m.text);
                  } finally {
                    setIsSpeaking(false);
                  }
                }}
                aria-label={`Play message ${i}`}
              >
                ▶
              </button>
            )}

            {/* timestamp */}
            {m.timestamp && (
              <div className="message-ts">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            )}
          </div>
        ))}

        {typing && (
          <div className="chat-message agent typing">
            <div className="message-body">Typing<span className="dots">...</span></div>
          </div>
        )}
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask PropEstateAI about a property, market, or listing..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Message"
        />
        <button type="submit" disabled={isSending || !input.trim()} aria-label="Send">Send</button>
      </form>
      </div>
    </div>
  );
}

