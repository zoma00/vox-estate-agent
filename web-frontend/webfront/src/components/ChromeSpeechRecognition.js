import React, { useState, useRef, useEffect } from 'react';

const ChromeSpeechRecognition = ({ onResult, onError, onStart, onEnd, ...buttonProps }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const propsRef = useRef({ onResult, onError, onStart, onEnd });

  // Keep the ref updated with the latest props on each render
  useEffect(() => {
    propsRef.current = { onResult, onError, onStart, onEnd };
  });

  // Initialize speech recognition only once on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Web Speech API not supported');
      if (propsRef.current.onError) propsRef.current.onError('Speech recognition not supported in this browser');
      return;
    }

    // Only initialize if not already done
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      // Configure recognition
      recognition.continuous = false; // Listen for a single utterance at a time
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;  // Get only the best result

      // Set up event handlers
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        if (propsRef.current.onStart) propsRef.current.onStart();
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        // We get interim results, but only process the final one
        if (event.results[event.results.length - 1].isFinal) {
          console.log('Final transcript:', transcript);
          if (propsRef.current.onResult && transcript.trim()) {
            propsRef.current.onResult(transcript);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Handle specific error types
        if (event.error === 'no-speech') {
          console.log('No speech detected. Please try speaking again.');
          if (propsRef.current.onError) propsRef.current.onError('no-speech');
        } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          console.error('Microphone access was denied. Please allow microphone access to use voice commands.');
          if (propsRef.current.onError) propsRef.current.onError('microphone-denied');
        } else {
          if (propsRef.current.onError) propsRef.current.onError(event.error);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        if (propsRef.current.onEnd) propsRef.current.onEnd();
      };
      
      console.log('Speech recognition initialized.');
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up speech recognition');
      const currentRecognition = recognitionRef.current;
      if (currentRecognition) {
        try {
          currentRecognition.onend = null; // Prevent restart loop
          currentRecognition.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
        recognitionRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      console.error('Speech recognition not initialized');
      return;
    }

    // Use the component's state as the source of truth
    if (isListening) {
      console.log('User stopping recognition.');
      recognition.stop();
    } else {
      try {
        console.log('User starting recognition.');
        recognition.start();
      } catch (err) {
        // This can happen if the user clicks again very quickly.
        console.error('Error starting recognition:', err);
        if (propsRef.current.onError) propsRef.current.onError(err.name);
      }
    }
  };

  return (
    <button
      onClick={toggleListening}
      className={`mic-button ${isListening ? 'listening' : ''}`}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
      {...buttonProps} // Pass down other props like style, disabled, title
      style={{
        ...buttonProps.style, // Allow overriding style
        background: isListening ? '#ff4444' : '#1a73e8',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '18px',
        padding: 0,
      }}
    >
      {isListening ? (
        <span className="pulse-animation" style={{
          display: 'block',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: 'white',
        }} />
      ) : (
        '🎤'
      )}
    </button>
  );
};

export default ChromeSpeechRecognition;
