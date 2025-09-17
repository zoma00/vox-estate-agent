let synth = null;
let voice = null;
let isInitialized = false;
let voicesReady = false;
let voiceReadyCallbacks = [];
let voiceLoadAttempts = 0;
const MAX_VOICE_LOAD_ATTEMPTS = 3;

// Get the best available voice
const getBestVoice = (voices) => {
  if (!voices || voices.length === 0) {
    console.log('No voices available');
    return null;
  }
  
  console.log('Available voices:', voices);
  
  // Try to find a high-quality English voice
  const preferredVoices = [
    // Google's natural voices (Chrome)
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Microsoft David', lang: 'en-US' },
    { name: 'Microsoft Zira', lang: 'en-US' },
    { name: 'Alex', lang: 'en-US' },
    { name: 'Samantha', lang: 'en-US' },
    { name: 'Karen', lang: 'en-AU' },  // Australian English
    { name: 'Daniel', lang: 'en-GB' },  // UK English
    // Fallback to any English voice from different OS/browsers
    { name: 'English', lang: 'en' },
    { name: 'US English', lang: 'en' },
    { name: 'en-', lang: 'en' },
    // Final fallback to any voice
    { name: '', lang: '' }
  ];

  for (const pref of preferredVoices) {
    const found = voices.find(v => {
      const nameMatch = !pref.name || 
        v.name.toLowerCase().includes(pref.name.toLowerCase()) ||
        v.voiceURI.toLowerCase().includes(pref.name.toLowerCase());
      const langMatch = !pref.lang || 
        v.lang.toLowerCase().startsWith(pref.lang.toLowerCase()) ||
        v.lang.toLowerCase().includes(pref.lang.toLowerCase());
      return nameMatch && langMatch;
    });
    
    if (found) {
      console.log('Selected voice:', found);
      return found;
    }
  }
  
  // If no preferred voice found, try to find any voice that can speak English
  const englishVoice = voices.find(v => 
    v.lang.toLowerCase().includes('en') || 
    v.name.toLowerCase().includes('english')
  );
  
  if (englishVoice) {
    console.log('Using English voice:', englishVoice);
    return englishVoice;
  }
  
  // Last resort: return the first available voice
  console.log('Using first available voice:', voices[0]);
  return voices[0];
};

// Wait for voices to be loaded with retry mechanism
const waitForVoices = () => {
  return new Promise((resolve) => {
    // First, check if we already have voices
    const initialVoices = synth.getVoices();
    if (initialVoices.length > 0) {
      const bestVoice = getBestVoice(initialVoices);
      if (bestVoice) {
        console.log('Voices already available');
        resolve(bestVoice);
        return;
      }
    }

    console.log('Waiting for voices to load...');
    
    let attempts = 0;
    const maxAttempts = 3;
    const checkInterval = 500; // ms
    
    const checkVoices = () => {
      attempts++;
      const voices = synth.getVoices();
      
      if (voices.length > 0) {
        const bestVoice = getBestVoice(voices);
        if (bestVoice) {
          console.log('Voices loaded successfully');
          resolve(bestVoice);
          return;
        }
      }
      
      if (attempts >= maxAttempts) {
        console.warn(`No voices found after ${maxAttempts} attempts`);
        resolve(null);
        return;
      }
      
      console.log(`No voices yet, retrying... (${attempts}/${maxAttempts})`);
      setTimeout(checkVoices, checkInterval);
    };
    
    // Start checking
    checkVoices();
    
    // Also set up a timeout as a safety net
    const timeout = setTimeout(() => {
      console.warn('Voice loading timeout reached');
      resolve(null);
    }, 5000);
    
    // Clean up the timeout if we resolve earlier
    voiceReadyCallbacks.push(() => {
      clearTimeout(timeout);
    });
  });
};

// Load voices and update state
const loadVoices = (onVoicesLoaded) => {
  try {
    console.log('Loading voices...');
    
    if (!synth) {
      console.error('Speech synthesis not available');
      if (onVoicesLoaded) onVoicesLoaded([]);
      return;
    }
    
    // Force a small delay to ensure voices are loaded
    setTimeout(() => {
      try {
        const voices = synth.getVoices();
        console.log(`Found ${voices.length} voices`);
        
        if (voices.length > 0) {
          voice = getBestVoice(voices);
          voicesReady = true;
          
          // Resolve all waiting callbacks
          while (voiceReadyCallbacks.length > 0) {
            const callback = voiceReadyCallbacks.shift();
            if (typeof callback === 'function') {
              callback(voice);
            }
          }
          
          if (onVoicesLoaded) {
            onVoicesLoaded(voices);
          }
        } else if (voiceLoadAttempts < MAX_VOICE_LOAD_ATTEMPTS) {
          console.log('No voices found, retrying...');
          voiceLoadAttempts++;
          setTimeout(() => loadVoices(onVoicesLoaded), 1000);
        } else {
          console.warn('No voices available after multiple attempts');
          if (onVoicesLoaded) {
            onVoicesLoaded([]);
          }
        }
      } catch (error) {
        console.error('Error loading voices:', error);
        if (onVoicesLoaded) {
          onVoicesLoaded([]);
        }
      }
    }, 100);
  } catch (error) {
    console.error('Error in loadVoices:', error);
    if (onVoicesLoaded) {
      onVoicesLoaded([]);
    }
  }
};

// Initialize speech synthesis
const initSpeechSynthesis = (onVoicesLoaded) => {
  console.log('Initializing speech synthesis...');
  
  if (isInitialized) {
    console.log('Speech synthesis already initialized');
    if (onVoicesLoaded) {
      const voices = synth?.getVoices() || [];
      onVoicesLoaded(voices);
    }
    return;
  }
  
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.error('Web Speech API not supported in this browser');
    if (onVoicesLoaded) onVoicesLoaded([]);
    return;
  }
  
  synth = window.speechSynthesis;
  isInitialized = true;
  
  // Set up event listener for when voices change
  synth.onvoiceschanged = () => loadVoices(onVoicesLoaded);
  
  // Initial load
  loadVoices(onVoicesLoaded);
  
  // Some browsers don't fire the voiceschanged event, so we'll also try to load voices after a delay
  setTimeout(() => loadVoices(onVoicesLoaded), 1000);
};

// Speak text using the Web Speech API
const speak = async (text, onEnd) => {
  console.log('Speak called with text:', text);
  
  if (!text) {
    console.warn('No text provided to speak');
    if (onEnd) onEnd();
    return;
  }
  
  // Initialize if needed
  if (!isInitialized) {
    console.log('Initializing speech synthesis...');
    initSpeechSynthesis();
  }
  
  // Ensure we have access to the speech synthesis API
  if (!synth) {
    console.error('Speech synthesis not available in this browser');
    if (onEnd) onEnd();
    return;
  }
  
  // Function to actually perform the speech
  const doSpeak = (voiceToUse) => {
    try {
      // Cancel any ongoing speech
      synth.cancel();
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice and language
      if (voiceToUse) {
        utterance.voice = voiceToUse;
        utterance.lang = voiceToUse.lang || 'en-US';
        console.log('Using voice:', voiceToUse.name, 'with language:', voiceToUse.lang);
      } else {
        console.warn('No voice available, using default settings');
        utterance.lang = 'en-US';
      }
      
      // Set speech properties
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Set up event handlers
      utterance.onend = () => {
        console.log('Speech finished');
        if (onEnd) onEnd();
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        if (onEnd) onEnd();
      };
      
      // Speak the text
      console.log('Starting speech synthesis...');
      synth.speak(utterance);
      
    } catch (error) {
      console.error('Error in speech synthesis:', error);
      if (onEnd) onEnd();
    }
  };
  
  // Try to get voices
  try {
    let voices = synth.getVoices();
    
    // If no voices, try to load them
    if (voices.length === 0) {
      console.log('No voices available, waiting for voices to load...');
      const loadedVoice = await waitForVoices();
      if (loadedVoice) {
        console.log('Voice loaded successfully');
        doSpeak(loadedVoice);
      } else {
        console.warn('Proceeding without a specific voice');
        doSpeak(null); // Try with default voice
      }
    } else {
      // We have voices, use the best one
      const bestVoice = getBestVoice(voices);
      console.log('Using best available voice');
      doSpeak(bestVoice);
    }
  } catch (error) {
    console.error('Error handling voices:', error);
    // Try to speak anyway with default settings
    doSpeak(null);
  }
  
  // Set speech properties
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  // Set up event handlers
  utterance.onstart = () => {
    console.log('Speech started');
  };
  
  // Keep track of failed attempts
  let retryCount = 0;
  const maxRetries = 2;
  
  const handleError = (event) => {
    console.error('Speech error details:', {
      error: event.error,
      type: event.type,
      timeStamp: event.timeStamp,
      message: event.message,
      charIndex: event.charIndex,
      elapsedTime: event.elapsedTime,
      name: event.name
    });
    
    // Try to get more specific error information
    if (event.error === 'synthesis-failed') {
      console.warn('Synthesis failed. Common causes:');
      console.warn('1. No voices available');
      console.warn('2. Voice synthesis not supported');
      console.warn('3. Browser/OS limitations');
      
      // Try with a different voice or settings
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying (${retryCount}/${maxRetries}) with different settings...`);
        
        // Try with a simpler text
        const simpleText = 'Hello';
        console.log(`Trying with simpler text: "${simpleText}"`);
        
        // Cancel any ongoing speech
        synth.cancel();
        
        // Create a new utterance with simpler text
        const newUtterance = new SpeechSynthesisUtterance(simpleText);
        
        // Copy all event handlers
        newUtterance.onerror = handleError;
        if (utterance.onend) newUtterance.onend = utterance.onend;
        if (utterance.onstart) newUtterance.onstart = utterance.onstart;
        
        // Try with default settings
        newUtterance.rate = 1.0;
        newUtterance.pitch = 1.0;
        newUtterance.volume = 1.0;
        
        // Try with system default voice
        const voices = synth.getVoices();
        if (voices.length > 0) {
          newUtterance.voice = voices[0];
          newUtterance.lang = voices[0].lang || 'en-US';
          console.log(`Trying with voice: ${voices[0].name} (${voices[0].lang})`);
        }
        
        // Replace the current utterance
        utterance = newUtterance;
        
        // Try speaking again
        synth.speak(utterance);
        return;
      }
    }
    
    if (event.error) {
      switch(event.error) {
        case 'interrupted':
          console.error('Speech was interrupted');
          break;
        case 'audio-busy':
          console.error('Audio device is busy');
          break;
        case 'audio-hardware':
          console.error('Audio hardware error');
          break;
        case 'network':
          console.error('Network error');
          break;
        case 'synthesis-unavailable':
          console.error('Speech synthesis unavailable');
          break;
        case 'synthesis-failed':
          console.error('Speech synthesis failed');
          // Try to get more details about the failure
          try {
            const voices = window.speechSynthesis.getVoices();
            console.log('Available voices at error time:', voices);
            console.log('Current utterance:', utterance);
          } catch (e) {
            console.error('Error getting voices:', e);
          }
          break;
        case 'language-unavailable':
          console.error('Language not supported');
          break;
        case 'voice-unavailable':
          console.error('Voice not available');
          break;
        case 'text-too-long':
          console.error('Text too long');
          break;
        case 'invalid-argument':
          console.error('Invalid argument');
          break;
        case 'not-allowed':
          console.error('Permission denied');
          break;
        default:
          console.error('Unknown speech error');
      }
    }
    
    if (onEnd) onEnd();
  };
  
  if (onEnd) {
    utterance.onend = () => {
      console.log('Speech ended');
      onEnd();
    };
  }
  
  try {
    console.log('Attempting to speak...');
    synth.speak(utterance);
    console.log('Speech queued');
  } catch (error) {
    console.error('Error speaking:', error);
    if (onEnd) onEnd();
  }
  
  return () => {
    console.log('Cancelling speech');
    synth.cancel();
  };
};

// Stop any ongoing speech
const stopSpeaking = () => {
  console.log('Stopping speech');
  if (synth) {
    synth.cancel();
  }
};

// Test function to check speech synthesis functionality
const testSpeech = async () => {
  console.log('=== Testing Speech Synthesis ===');
  
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.error('Web Speech API not supported in this browser');
    return false;
  }
  
  // List available voices
  const voices = window.speechSynthesis.getVoices();
  console.log('Available voices:', voices);
  
  if (voices.length === 0) {
    console.warn('No voices available for speech synthesis. This could be because:');
    console.warn('1. Your browser may not have any text-to-speech voices installed');
    console.warn('2. The voices haven\'t loaded yet');
    console.warn('3. Your OS might not have any TTS voices configured');
    
    // Try to force a refresh
    window.speechSynthesis.onvoiceschanged = null;
    
    // Try one more time after a short delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const refreshedVoices = window.speechSynthesis.getVoices();
    console.log('Refreshed voices:', refreshedVoices);
    
    if (refreshedVoices.length === 0) {
      console.error('Still no voices available after refresh');
      return false;
    }
  }
  
  // Try to speak a test phrase
  const testPhrase = 'This is a test of the speech synthesis';
  console.log(`Attempting to speak: "${testPhrase}"`);
  
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(testPhrase);
    
    // Try to find a good voice
    const voice = getBestVoice(voices);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'en-US';
      console.log(`Using voice: ${voice.name} (${voice.lang})`);
    } else {
      utterance.lang = 'en-US';
      console.warn('Using default voice settings');
    }
    
    utterance.onstart = () => {
      console.log('Test speech started');
    };
    
    utterance.onend = () => {
      console.log('Test speech completed successfully');
      resolve(true);
    };
    
    utterance.onerror = (event) => {
      console.error('Test speech failed:', event.error || 'Unknown error');
      resolve(false);
    };
    
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error during test speech:', error);
      resolve(false);
    }
  });
};

export { initSpeechSynthesis, speak, stopSpeaking, testSpeech };
