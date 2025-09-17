import axios from 'axios';

const API_URL = 'http://localhost:8000/api/tts';

/**
 * Text-to-Speech Service
 * Handles communication with the backend TTS API
 */
class TTSService {
  /**
   * Convert text to speech using the backend TTS service
   * @param {string} text - The text to convert to speech
   * @param {string} language - Language code (e.g., 'en', 'es')
   * @returns {Promise<string>} - URL of the generated audio file
   */
  static async textToSpeech(text, language = 'en') {
    try {
      if (!text || !text.trim()) {
        throw new Error('No text provided for TTS');
      }

      console.log('Sending TTS request for text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      
      const response = await axios.post(API_URL, {
        text,
        language,
      }, {
        timeout: 30000, // 30 second timeout
        validateStatus: (status) => status >= 200 && status < 500
      });

      console.log('TTS response:', response.data);

      // Log the full response for debugging
      console.log('Full TTS response:', response.data);
      
      // Extract the audio URL from the response
      let audioUrl = response.data.audio_url || response.data.audioUrl;
      
      // If audio_url is an object (from the chat endpoint), extract the URL
      if (audioUrl && typeof audioUrl === 'object') {
        audioUrl = audioUrl.audio_url || audioUrl.audioUrl;
      }
      
      if (!audioUrl) {
        console.error('No audio URL in response from TTS service:', response.data);
        throw new Error('No audio URL in response from TTS service');
      }

      // Ensure the audio URL is properly formatted
      if (typeof audioUrl !== 'string') {
        console.error('Invalid audio URL format:', audioUrl);
        throw new Error('Invalid audio URL format received from server');
      }
      
      // Remove any surrounding quotes if present
      audioUrl = audioUrl.replace(/^['"]|['"]$/g, '');
      
      // Construct the full URL if it's a relative path
      const fullAudioUrl = audioUrl.startsWith('http')
        ? audioUrl
        : `http://localhost:8000${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;

      console.log('Formatted audio URL:', fullAudioUrl);
      return fullAudioUrl;
    } catch (error) {
      console.error('TTS Error:', error);
      throw new Error(`TTS failed: ${error.message}`);
    }
  }

  /**
   * Play audio from a URL
   * @param {string} audioUrl - URL of the audio to play
   * @returns {Promise<void>}
   */
  static async playAudio(audioUrl) {
    return new Promise((resolve, reject) => {
      if (!audioUrl) {
        const error = new Error('No audio URL provided');
        console.error(error.message);
        reject(error);
        return;
      }

      // Ensure audioUrl is a string
      const audioUrlStr = String(audioUrl).trim();
      console.log('Attempting to play audio from URL:', audioUrlStr);
      
      // Create a new audio element
      const audio = new Audio(audioUrlStr);
      
      // Set up event handlers
      const cleanup = () => {
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
      };
      
      const onEnded = () => {
        console.log('Audio playback finished successfully');
        cleanup();
        // Only revoke object URLs, not regular HTTP URLs
        if (audioUrlStr.startsWith('blob:')) {
          URL.revokeObjectURL(audioUrlStr);
        }
        resolve();
      };
      
      const onError = (event) => {
        console.error('Audio playback error:', {
          event,
          audioSrc: audio.src,
          currentSrc: audio.currentSrc,
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState,
          paused: audio.paused,
          muted: audio.muted,
          volume: audio.volume
        });
        cleanup();
        reject(new Error(`Failed to play audio: ${audio.error?.message || 'Unknown error'}`));
      };
      
      // Add event listeners
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);
      
      // Attempt to play the audio
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio playback started successfully');
          })
          .catch(error => {
            console.error('Audio play() failed:', error);
            onError({ type: 'playback', error });
          });
      }
    });
  }

  /**
   * Speak text using the TTS service
   * @param {string} text - Text to speak
   * @param {string} language - Language code (default: 'en')
   * @returns {Promise<void>}
   */
  static async speak(text, language = 'en') {
    try {
      const audioUrl = await this.textToSpeech(text, language);
      await this.playAudio(audioUrl);
    } catch (error) {
      console.error('Speak error:', error);
      throw error;
    }
  }
}

export default TTSService;
