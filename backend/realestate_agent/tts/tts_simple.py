"""
Simple TTS implementation using gTTS (Google Text-to-Speech)
"""
import os
import time
import logging
from pathlib import Path
from gtts import gTTS

logger = logging.getLogger(__name__)

def generate_tts_audio(
    text: str,
    output_path: str = None,
    language: str = "en",
    speed: float = 1.0,
    **kwargs
) -> str:
    """
    Generate speech from text using gTTS.
    
    Args:
        text: Input text to convert to speech
        output_path: Optional output path for the audio file
        language: Language code (default: "en")
        speed: Speech rate (not directly supported by gTTS, kept for compatibility)
        
    Returns:
        Path to the generated audio file or None if failed
    """
    try:
        print(f"[TTS] Starting TTS generation for text: '{text[:50]}...'")
        print(f"[TTS] Language: {language}, Output path: {output_path}")
        
        # Validate input
        if not text or not text.strip():
            print("[TTS] Error: Empty text provided")
            return None
            
        # Create output directory if it doesn't exist
        if output_path is None:
            output_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                "static", 
                "audio"
            )
            print(f"[TTS] Creating output directory: {output_dir}")
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, f"output_{int(time.time())}.mp3")
        
        # Generate TTS
        print("[TTS] Initializing gTTS...")
        tts = gTTS(text=text, lang=language, slow=False)
        
        print(f"[TTS] Saving audio to: {output_path}")
        tts.save(output_path)
        
        # Verify the file was created and has content
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            print(f"[TTS] Error: Output file was not created: {output_path}")
            return None
            
        file_size = os.path.getsize(output_path)
        print(f"[TTS] Audio file created successfully at {output_path}. Size: {file_size} bytes")
        logger.info(f"Audio file created successfully at {output_path}. Size: {file_size} bytes")
        
        # Return the full path to the generated file
        return output_path
        
    except Exception as e:
        error_msg = f"[TTS] Error in generate_tts_audio: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        logger.error(error_msg, exc_info=True)
        return None
        raise

def list_voices():
    """List available languages (gTTS doesn't have voices, just languages)"""
    return [
        {"id": "en", "name": "English", "languages": ["en"]},
        {"id": "es", "name": "Spanish", "languages": ["es"]},
        {"id": "fr", "name": "French", "languages": ["fr"]},
        {"id": "de", "name": "German", "languages": ["de"]},
        {"id": "it", "name": "Italian", "languages": ["it"]},
        {"id": "pt", "name": "Portuguese", "languages": ["pt"]},
        {"id": "ru", "name": "Russian", "languages": ["ru"]},
        {"id": "ar", "name": "Arabic", "languages": ["ar"]},
        {"id": "zh-CN", "name": "Chinese (Simplified)", "languages": ["zh-CN"]},
        {"id": "ja", "name": "Japanese", "languages": ["ja"]},
        {"id": "ko", "name": "Korean", "languages": ["ko"]}
    ]

if __name__ == "__main__":
    # Test the TTS
    test_text = "This is a test of the simple TTS system using Google's text-to-speech."
    output = generate_tts_audio(test_text)
    print(f"Generated audio file: {output}")
    print("\nAvailable languages:")
    for voice in list_voices():
        print(f"- {voice['name']} ({voice['id']})")
