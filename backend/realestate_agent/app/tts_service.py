import os
import tempfile
import shutil
from pathlib import Path
from fastapi import HTTPException
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TTSService:
    def __init__(self):
        self.engine = None
        self.audio_dir = Path("audio_output")
        self.audio_dir.mkdir(exist_ok=True)
    
    def initialize_engine(self):
        """Initialize the TTS engine with preferred settings."""
        try:
            logger.info("Initializing TTS engine...")
            # Import pyttsx3 lazily because importing it at module import time can
            # raise a RuntimeError if the system TTS binary (eSpeak/eSpeak-ng) is
            # missing. Importing here lets the application start even when the
            # system dependency is absent; the TTS engine will be disabled until
            # the dependency is installed.
            try:
                import pyttsx3
            except Exception as imp_err:
                logger.error(f"pyttsx3 import failed: {imp_err}", exc_info=True)
                self.engine = None
                return False

            self.engine = pyttsx3.init()
            if not self.engine:
                raise Exception("Failed to initialize pyttsx3 engine")
                
            # Set default voice properties
            self.engine.setProperty('rate', 150)  # Speed of speech
            self.engine.setProperty('volume', 1.0)  # Volume level (0.0 to 1.0)
            
            # Try to set a female voice if available
            try:
                voices = self.engine.getProperty('voices')
                if voices:
                    # Try to find a female voice first, fall back to first available
                    female_voices = [v for v in voices if 'female' in v.name.lower()]
                    if female_voices:
                        self.engine.setProperty('voice', female_voices[0].id)
                    else:
                        self.engine.setProperty('voice', voices[0].id)
                
                logger.info(f"TTS Engine initialized with voice: {self.engine.getProperty('voice')}")
                return True
            except Exception as voice_error:
                logger.warning(f"Could not set voice: {voice_error}")
                return True  # Still return True as the engine is initialized
                
        except Exception as e:
            logger.error(f"Failed to initialize TTS engine: {e}", exc_info=True)
            self.engine = None
            return False
    
    def text_to_speech(self, text: str) -> tuple[str, str]:
        """
        Convert text to speech and return the path and URL to the generated audio file.
        
        Args:
            text: The text to convert to speech
            
        Returns:
            tuple: (audio_path, audio_url)
        """
        if not text or not text.strip():
            logger.warning("No text provided for TTS")
            raise ValueError("No text provided for TTS")
        
        # Ensure the engine is initialized; if not available, we'll try a
        # network-based fallback (gTTS) so the app can produce audio without
        # requiring system packages like eSpeak.
        engine_ready = True
        if not self.engine:
            engine_ready = self.initialize_engine()

        use_gtts_fallback = not engine_ready
        
        try:
            # Create a unique filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            random_str = os.urandom(4).hex()
            filename = f"output_{timestamp}_{random_str}.wav"
            output_dir = Path("static/audio")
            output_path = output_dir / filename
            
            # Ensure directory exists with proper permissions
            output_dir.mkdir(parents=True, exist_ok=True, mode=0o755)
            
            logger.info(f"Generating speech for text: {text[:100]}...")
            
            if not use_gtts_fallback:
                try:
                    # Save the speech to the file using pyttsx3
                    self.engine.save_to_file(text, str(output_path))
                    self.engine.runAndWait()
                except Exception as e:
                    logger.error(f"Error generating speech with pyttsx3: {e}", exc_info=True)
                    # Fall back to gTTS if pyttsx3 fails at runtime
                    use_gtts_fallback = True

            if use_gtts_fallback:
                logger.info("Using gTTS fallback to generate audio (network-based)")
                try:
                    from gtts import gTTS
                except Exception as e:
                    logger.error("gTTS fallback is not available: %s", str(e), exc_info=True)
                    raise Exception("No available TTS backend (pyttsx3 failed and gTTS is not installed)")

                # Write mp3 output via gTTS
                try:
                    # Use mp3 extension for gTTS output
                    output_path = output_path.with_suffix('.mp3')
                    tts = gTTS(text=text, lang='en')
                    tts.save(str(output_path))
                except Exception as e:
                    logger.error(f"gTTS generation failed: {e}", exc_info=True)
                    raise Exception(f"Failed to generate speech via gTTS: {str(e)}")
            
            # Verify the file was created and has content
            if not output_path.exists():
                error_msg = f"TTS output file was not created: {output_path}"
                logger.error(error_msg)
                raise Exception(error_msg)
                
            file_size = output_path.stat().st_size
            if file_size == 0:
                error_msg = f"Generated audio file is empty: {output_path}"
                logger.error(error_msg)
                raise Exception(error_msg)
                
            # Generate URL for the audio file
            audio_url = f"/static/audio/{filename}"
            logger.info(f"Successfully generated speech file at: {output_path} (Size: {file_size} bytes, URL: {audio_url})")
            
            return str(output_path), audio_url
            
        except HTTPException:
            raise
        except Exception as e:
            error_msg = f"Error in text_to_speech: {str(e)}"
            logger.error(error_msg, exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=error_msg
            )

# Create a singleton instance
tts_service = TTSService()
