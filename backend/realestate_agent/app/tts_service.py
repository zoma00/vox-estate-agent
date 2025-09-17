import os
import tempfile
import pyttsx3
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
        self.initialize_engine()
        self.audio_dir = Path("audio_output")
        self.audio_dir.mkdir(exist_ok=True)
    
    def initialize_engine(self):
        """Initialize the TTS engine with preferred settings."""
        try:
            self.engine = pyttsx3.init()
            # Set default voice properties
            self.engine.setProperty('rate', 150)  # Speed of speech
            self.engine.setProperty('volume', 1.0)  # Volume level (0.0 to 1.0)
            
            # Try to set a female voice if available
            voices = self.engine.getProperty('voices')
            if voices:
                # Try to find a female voice first, fall back to first available
                female_voices = [v for v in voices if 'female' in v.name.lower()]
                if female_voices:
                    self.engine.setProperty('voice', female_voices[0].id)
                else:
                    self.engine.setProperty('voice', voices[0].id)
            
            print(f"TTS Engine initialized with voice: {self.engine.getProperty('voice')}")
            return True
        except Exception as e:
            print(f"Failed to initialize TTS engine: {e}")
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
            raise ValueError("No text provided for TTS")
        
        if not self.engine:
            if not self.initialize_engine():
                raise HTTPException(status_code=500, detail="TTS engine initialization failed")
        
        try:
            # Create a unique filename
            filename = f"output_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.urandom(4).hex()}.wav"
            output_path = os.path.join("static/audio", filename)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            logger.info(f"Generating speech for text: {text[:100]}...")
            
            # Save the speech to the file
            self.engine.save_to_file(text, output_path)
            self.engine.runAndWait()
            
            # Verify the file was created and has content
            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                raise Exception("Generated audio file is empty or was not created")
                
            # Generate URL for the audio file
            audio_url = f"/static/audio/{os.path.basename(output_path)}"
            logger.info(f"Successfully generated speech file at: {output_path} (URL: {audio_url})")
            
            return output_path, audio_url
            
        except Exception as e:
            print(f"Error in text_to_speech: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate speech: {str(e)}"
            )

# Create a singleton instance
tts_service = TTSService()
