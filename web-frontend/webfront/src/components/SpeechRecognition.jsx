import React, { useState, useEffect, useRef, useCallback } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SpeechRecognitionComponent = ({ onResult, onEnd, isListening }) => {
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const isMounted = useRef(true);
  const finalTranscript = useRef('');

  // Handle speech recognition results
  const handleResult = useCallback((event) => {
    if (!isMounted.current) return;
    
    console.log('Raw speech recognition results:', event.results);
    
    let currentTranscript = '';
    finalTranscript.current = '';

    // Combine all results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const alternative = result[0];
      
      if (!alternative) {
        console.warn('No speech recognition alternative found for result:', result);
        continue;
      }
      
      const text = alternative.transcript || '';
      console.log(`Result ${i} (${result.isFinal ? 'final' : 'interim'}):`, text);
      
      if (result.isFinal) {
        finalTranscript.current = text;
      } else {
        currentTranscript = text;
      }
    }

    // Send final results when available, otherwise send interim results
    const transcriptToSend = finalTranscript.current || currentTranscript;
    if (transcriptToSend.trim()) {
      console.log('Sending transcript to parent:', transcriptToSend.trim());
      onResult(transcriptToSend.trim());
      if (finalTranscript.current) {
        console.log('Clearing final transcript for next input');
        finalTranscript.current = ''; // Reset for next input
      }
    } else {
      console.log('No valid transcript to send');
    }
  }, [onResult]);

  // Initialize speech recognition
  useEffect(() => {
    isMounted.current = true;
    
    // Check if the browser supports the Web Speech API
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.warn('Speech recognition is not supported in this browser');
      setIsSupported(false);
      return;
    }
    
    // Use the correct SpeechRecognition constructor for the browser
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    try {
      console.log('Initializing speech recognition...');
      recognitionRef.current = new Recognition();
      const recognition = recognitionRef.current;
      
      // Set recognition properties
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';
      
      console.log('SpeechRecognition properties:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        maxAlternatives: recognition.maxAlternatives,
        lang: recognition.lang
      });
      
      // Configure recognition
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Set up event handlers
      recognition.onresult = (event) => {
        console.log('Speech recognition result event:', event);
        handleResult(event);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error, 'Event:', event);
        if (onEnd && isMounted.current) {
          console.log('Calling onEnd due to error');
          onEnd();
        }
      };

      recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      recognition.onend = () => {
        console.log('Speech recognition ended, isListening:', isListening);
        if (isMounted.current && isListening) {
          console.log('Restarting speech recognition...');
          try {
            recognition.start();
          } catch (err) {
            console.error('Error restarting recognition:', err);
            if (onEnd) onEnd();
          }
        }
      };

      // Set supported to true after successful initialization
      setIsSupported(true);
      console.log('Speech recognition initialized successfully');

      return () => {
        console.log('Cleaning up speech recognition...');
        isMounted.current = false;
        try {
          recognition.stop();
          console.log('Speech recognition stopped');
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      };
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setIsSupported(false);
    }
  }, [handleResult, isListening, onEnd]);

  // Handle start/stop listening
  useEffect(() => {
    if (!isSupported || !recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    if (isListening) {
      console.log('Starting speech recognition...');
      try {
        recognition.start();
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        if (onEnd) onEnd();
      }
    } else {
      console.log('Stopping speech recognition...');
      try {
        recognition.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }

    return () => {
      if (isListening) {
        try {
          recognition.stop();
        } catch (err) {
          console.error('Error in cleanup:', err);
        }
      }
    };
  }, [isListening, isSupported, onEnd]);

  // No UI needed - we're using this as a controller
  return null;
};

export default React.memo(SpeechRecognitionComponent);
