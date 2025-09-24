import os
import re
import logging
import webbrowser
import uuid
from typing import Optional, Dict, Any, List
from datetime import datetime
from pathlib import Path

from fastapi import HTTPException
from pydantic import BaseModel
import dotenv

# --------------------------------------------------------------------
# Logging Configuration
# --------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),                # Print logs to console
        logging.FileHandler('agent_pipeline.log')  # Save logs to file
    ]
)
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------
# Environment Variables
# --------------------------------------------------------------------
dotenv.load_dotenv()  # Load API keys and configs from .env file

# --------------------------------------------------------------------
# Constants & Configs
# --------------------------------------------------------------------
DEFAULT_TEMP_DIR = "static/audio"  # Directory where TTS audio files will be stored
SUPPORTED_LANGUAGES = {"en": "English", "ar": "Arabic"}
DEFAULT_LANGUAGE = "en"

# Ensure required directories exist
os.makedirs(DEFAULT_TEMP_DIR, exist_ok=True)
os.makedirs("static", exist_ok=True)


# --------------------------------------------------------------------
# Data Models
# --------------------------------------------------------------------
class TTSParams(BaseModel):
    """Parameters for Text-to-Speech generation."""
    text: str
    language: str = DEFAULT_LANGUAGE
    voice: Optional[str] = None
    speed: float = 1.0


class AIResponse(BaseModel):
    """Response object for AI + TTS pipeline."""
    text: str
    audio_path: Optional[str] = None   # Backend file path (server-side)
    audio_url: Optional[str] = None    # Public URL (/static/audio/...)
    video_path: Optional[str] = None
    urls: List[str] = []
    timestamp: str = datetime.utcnow().isoformat()


# --------------------------------------------------------------------
# Utility Functions
# --------------------------------------------------------------------
def generate_unique_filename(extension: str = "wav") -> str:
    """Generate a unique filename with timestamp + random string."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    random_str = str(uuid.uuid4().hex)[:8]
    return f"output_{timestamp}_{random_str}.{extension}"


def get_audio_url(filename: str) -> str:
    """Convert a filename into a static URL for frontend access."""
    return f"/static/audio/{os.path.basename(filename)}"


# --------------------------------------------------------------------
# AI Response (ChatGPT)
# --------------------------------------------------------------------
async def generate_ai_response(
    user_text: str,
    model: str = "gpt-3.5-turbo",
    temperature: float = 0.7,
    max_tokens: int = 1000,
    system_prompt: Optional[str] = None
) -> AIResponse:
    """
    Generate AI response using OpenAI's API with error handling and logging.

    Args:
        user_text: The input text from the user
        model: OpenAI model to use
        temperature: Controls randomness (0.0 to 2.0)
        max_tokens: Maximum number of tokens
        system_prompt: System role description for the assistant

    Returns:
        AIResponse with generated text + extracted URLs
    """
    # Ensure OpenAI API key is present
    if not os.getenv("OPENAI_API_KEY"):
        error_msg = "OpenAI API key not found in environment variables"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

    # Import `openai` lazily so the application can start even if the
    # package hasn't been installed into the runtime venv yet. If it's
    # missing, return a clear HTTP 500 message so operators know what to do.
    try:
        import openai
    except ImportError as e:
        error_msg = (
            "OpenAI Python package is not installed in this environment. "
            "Install it into the project's virtualenv, for example:\n"
            "/opt/vox-estate-agent/venv/bin/pip install openai\n"
            "Or run: pip install -r backend/realestate_agent/requirements.txt"
        )
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

    client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    try:
        # Prepare messages for ChatGPT
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_text})

        logger.info(f"Sending request to OpenAI with model: {model}")

        # Make the request to OpenAI
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )

        # Extract generated text
        ai_text = response.choices[0].message.content
        logger.info(f"Generated response with {len(ai_text)} characters")

        # Extract URLs from the response
        urls = re.findall(r'https?://[^\s<>"\']+', ai_text)

        return AIResponse(
            text=ai_text,
            urls=urls
        )

    except Exception as e:
        error_msg = f"Error generating AI response: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(status_code=500, detail=error_msg)


# --------------------------------------------------------------------
# TTS (Text-to-Speech)
# --------------------------------------------------------------------
async def generate_tts_audio(
    text: str,
    language: str = DEFAULT_LANGUAGE,
    voice: Optional[str] = None,
    output_path: Optional[str] = None
) -> str:
    """
    Generate speech from text using a simple TTS engine.

    Args:
        text: The text to convert
        language: Language code (e.g., 'en', 'ar')
        voice: Optional voice choice (not currently used)
        output_path: Optional custom file path

    Returns:
        Tuple: (audio_path, audio_url)
    """
    if not text.strip():
        error_msg = "Text cannot be empty"
        logger.error(error_msg)
        raise HTTPException(status_code=400, detail=error_msg)

    try:
        from tts.tts_simple import generate_tts_audio as simple_generate_tts_audio

        # Create unique filename if not provided
        if not output_path:
            filename = generate_unique_filename()
            output_path = os.path.join(DEFAULT_TEMP_DIR, filename)

        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Call simple TTS implementation
        audio_path = simple_generate_tts_audio(
            text=text,
            output_path=output_path,
            language=language,
            speed=1.3  # 30% faster than normal
        )

        # Convert saved path into a URL for frontend
        audio_url = get_audio_url(os.path.basename(audio_path))
        
        # Ensure the URL starts with a forward slash
        if not audio_url.startswith('/'):
            audio_url = f'/{audio_url}'
            
        logger.info(f"TTS generated: {audio_path} (URL: {audio_url})")
        return {
            'audio_path': audio_path,
            'audio_url': audio_url
        }

    except ImportError as e:
        error_msg = f"TTS module not installed. Please install pyttsx3: pip install pyttsx3"
        logger.error(f"{error_msg} Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Failed to generate TTS audio: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(status_code=500, detail=error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


# --------------------------------------------------------------------
# URL Opening Utility
# --------------------------------------------------------------------
async def open_urls_in_browser(urls: List[str]) -> None:
    """Open a list of URLs in the default system browser."""
    if not urls:
        return

    logger.info(f"Opening {len(urls)} URLs in browser")
    for url in urls:
        try:
            webbrowser.open(url)
        except Exception as e:
            logger.error(f"Failed to open URL {url}: {str(e)}")


# --------------------------------------------------------------------
# Full Pipeline
# --------------------------------------------------------------------
async def process_user_input(
    user_text: str,
    generate_audio: bool = True,
    open_urls: bool = True,
    **kwargs
) -> Dict[str, Any]:
    """
    Process user input through the entire AI pipeline.

    Steps:
    1. Generate AI response with ChatGPT
    2. Optionally generate TTS audio
    3. Optionally open any URLs in browser
    4. Return response dictionary

    Returns:
        Dict with AI response text, optional audio paths/urls, and extracted URLs
    """
    try:
        # Step 1: AI Response
        response = await generate_ai_response(user_text, **kwargs)

        # Step 2: TTS Audio
        audio_path = None
        audio_url = None
        if generate_audio and response.text:
            try:
                tts_result = await generate_tts_audio(response.text)
                if tts_result:
                    audio_path = tts_result.get('audio_path')
                    audio_url = tts_result.get('audio_url')
                    
                    response.audio_path = audio_path
                    response.audio_url = audio_url
                else:
                    logger.warning("TTS generation returned no result")
            except Exception as e:
                logger.error(f"Error generating TTS audio: {e}", exc_info=True)
                # Continue without TTS rather than failing the entire request

        # Step 3: Open URLs
        if open_urls and response.urls:
            await open_urls_in_browser(response.urls)

        # Step 4: Return dictionary
        return {
            "text": response.text,
            "audio_path": audio_path,
            "audio_url": audio_url,
            "urls": response.urls
        }

    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Error processing user input: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(status_code=500, detail=error_msg)
