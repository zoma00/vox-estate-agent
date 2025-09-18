import os
import logging
import shutil
from typing import Union, Optional
from pathlib import Path
import dotenv

# Load environment variables
# Look for .env in the current directory (app/)
env_path = Path(__file__).resolve().parent / '.env'
if not env_path.exists():
    # If not found, look in the parent directory
    env_path = Path(__file__).resolve().parent.parent / '.env'
    if not env_path.exists():
        # If still not found, look in the project root
        env_path = Path(__file__).resolve().parent.parent.parent / '.env'

dotenv.load_dotenv(env_path)
print(f"Loading environment variables from: {env_path}")
print(f"Current working directory: {os.getcwd()}")
print(f"OPENAI_API_KEY is set: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")

# Verify OpenAI API key is set
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable not set. Please check your .env file.")

from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Import TTS service
from app.tts_service import tts_service

# Import agent pipeline
from app.agent_pipeline import (
    generate_ai_response,
    process_user_input,
    AIResponse,
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("app.log"),
    ],
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Real Estate AI Agent API",
    description="API for the Real Estate AI Agent with TTS and animation capabilities",
    version="1.0.0",
)

# CORS middleware configuration
# List of allowed origins (add your frontend URL here)
origins = [
    "http://localhost:3000",  # Default React development server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Add CORS headers to all responses
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    origin = request.headers.get('origin')
    if origin in origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# Request/response models
class ChatRequest(BaseModel):
    text: str = Field(..., description="User input text")
    generate_audio: bool = Field(True, description="Whether to generate TTS audio")
    open_urls: bool = Field(True, description="Whether to open URLs in browser")
    language: str = Field(DEFAULT_LANGUAGE, description="Language code for TTS (e.g., 'en', 'ar')")
    model: str = Field("gpt-3.5-turbo", description="AI model to use")
    temperature: float = Field(
        0.7, ge=0.0, le=2.0, description="Sampling temperature (0.0 to 2.0)"
    )
    max_tokens: int = Field(1000, gt=0, description="Maximum number of tokens to generate")


class TTSRequest(BaseModel):
    text: Union[str, list[str]] = Field(
        ..., description="Text or list of sentences to convert to speech"
    )
    language: str = Field(DEFAULT_LANGUAGE, description="Language code (e.g., 'en', 'ar')")
    voice: Optional[str] = Field(None, description="Voice identifier (if supported)")


# Health check endpoint
@app.get("/")
async def root():
    """Health check endpoint to verify the API is running."""
    return {
        "status": "running",
        "service": "Real Estate AI Agent API",
        "version": "1.0.0",
    }


# Chat endpoint
@app.post("/api/chat", response_model=AIResponse)
async def chat(chat_request: ChatRequest):
    """
    Process user input and generate AI response with optional TTS and URL handling.
    """
    try:
        # Validate language
        if chat_request.language not in SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported language. Supported languages: {', '.join(SUPPORTED_LANGUAGES.keys())}",
            )

        # Process through the pipeline
        response = await process_user_input(
            user_text=chat_request.text,
            generate_audio=chat_request.generate_audio,
            open_urls=chat_request.open_urls,
            model=chat_request.model,
            temperature=chat_request.temperature,
            max_tokens=chat_request.max_tokens,
            system_prompt="You are a helpful real estate assistant. Provide detailed and accurate information about properties, market trends, and answer any real estate related questions.",
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request",
        )


# Text-to-Speech endpoint
@app.post("/api/tts")
async def text_to_speech(tts_request: TTSRequest):
    """
    Convert text to speech using the pyttsx3 TTS engine.
    Returns a JSON object with the audio URL.
    """
    try:
        logger.info(f"TTS Request - Text: {tts_request.text[:100]}..., Language: {tts_request.language}")
        
        # Check if text is provided
        if not tts_request.text or not tts_request.text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No text provided for TTS conversion",
            )
            
        # Generate TTS audio using the agent pipeline
        try:
            from app.agent_pipeline import generate_tts_audio
            
            # Generate the audio file - this now returns just the audio_url
            audio_url = await generate_tts_audio(
                text=tts_request.text,
                language=tts_request.language,
                voice=tts_request.voice
            )
            
            if not audio_url:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to generate TTS audio file"
                )
            
            # Log the successful generation
            logger.info(f"TTS audio generated successfully. URL: {audio_url}")
            
            # Return a clean JSON response with just the audio URL
            return {"audio_url": audio_url}
            
        except HTTPException:
            raise
            
        except Exception as e:
            logger.error(f"TTS generation failed: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate TTS audio: {str(e)}",
            )
        
    except HTTPException as he:
        logger.error(f"HTTP Exception in TTS endpoint: {str(he)}")
        raise
        
    except Exception as e:
        error_msg = f"Unexpected error in TTS endpoint: {str(e)}"
        logger.error(error_msg, exc_info=True)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg,
        )


# API to list supported languages
@app.get("/api/languages")
async def list_languages():
    """List all supported languages for TTS."""
    return {
        "languages": [
            {"code": code, "name": name} for code, name in SUPPORTED_LANGUAGES.items()
        ]
    }


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


# Configure static files
static_dir = Path("static/audio")
static_dir.mkdir(parents=True, exist_ok=True)

# Mount static files with proper headers
app.mount(
    "/static", 
    StaticFiles(directory="static"), 
    name="static"
)

# Add CORS headers for static files
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/static/"):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
    return response


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize application services on startup."""
    os.makedirs("temp", exist_ok=True)
    os.makedirs("static/audio", exist_ok=True)
    logger.info("Application startup: Created necessary directories")
