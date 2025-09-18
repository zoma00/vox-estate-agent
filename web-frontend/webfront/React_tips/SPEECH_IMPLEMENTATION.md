# Speech Implementation Guide

This document explains how the speech recognition and text-to-speech (TTS) functionality was implemented in the Real Estate Agent application.

## Table of Contents
1. [Overview](#overview)
2. [Speech Recognition](#speech-recognition)
3. [Text-to-Speech](#text-to-speech)
4. [CORS Configuration](#cors-configuration)
5. [Common Issues and Solutions](#common-issues-and-solutions)
6. [Future Improvements](#future-improvements)

## Overview

The application uses two main speech-related features:
1. **Speech Recognition**: Converts user's spoken words into text
2. **Text-to-Speech (TTS)**: Converts the AI's text responses into spoken words

## Speech Recognition

### Implementation
- Frontend: Uses the Web Speech API via `ChromeSpeechRecognition` component
- Location: `/web-frontend/webfront/src/components/ChromeSpeechRecognition.js`

### Key Features
- Real-time speech-to-text conversion
- Continuous listening mode
- Automatic result handling
- Error handling for unsupported browsers

### Usage
```javascript
// In your React component
const { transcript, isListening, startListening, stopListening } = useSpeechRecognition();
```

## Text-to-Speech

### Implementation
- Backend: Uses `pyttsx3` for TTS generation
- Location: `/backend/realestate_agent/app/tts_service.py`
- Frontend: Plays the generated audio files

### Key Features
- Asynchronous audio generation
- Caching of generated audio files
- Support for multiple languages
- Error handling and fallbacks

### Audio File Management
- Audio files are stored in `/backend/realestate_agent/static/audio/`
- Files are named with timestamps and random strings for uniqueness
- Old files should be periodically cleaned up (not currently implemented)

## CORS Configuration

### Backend (FastAPI)
```python
# In app/main.py
from fastapi.middleware.cors import CORSMiddleware

# List of allowed origins
origins = [
    "http://localhost:3000",  # Frontend development server
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
```

### Frontend (React)
- Make sure NOT to use `withCredentials: true` in axios requests unless necessary
- Ensure the API URL is correctly set

## Common Issues and Solutions

### 1. CORS Errors
**Symptom**: Browser console shows CORS policy errors
**Solution**:
- Verify the backend CORS configuration
- Ensure the frontend URL is in the allowed origins list
- Don't use `withCredentials: true` unless specifically needed

### 2. TTS Not Working
**Symptom**: No audio plays or errors in console
**Solution**:
- Check backend logs for TTS generation errors
- Verify the audio file was created in the static/audio directory
- Ensure the frontend can access the generated audio URL

### 3. Microphone Access Issues
**Symptom**: Browser doesn't request microphone permission
**Solution**:
- Ensure the site is served over HTTPS (or localhost)
- Check browser permissions for the site
- Try in an incognito window to rule out extension conflicts

## Future Improvements

1. **Audio Cleanup**: Implement a service to clean up old audio files
2. **More TTS Voices**: Add support for more voices and languages
3. **Offline Support**: Cache common responses for offline use
4. **Better Error Handling**: More user-friendly error messages
5. **Speech Synthesis Markup Language (SSML)**: For more natural-sounding speech

## Troubleshooting

### Checking Logs
- **Backend**: Check the console output where you ran the FastAPI server
- **Frontend**: Check the browser's developer console (F12)

### Testing TTS Directly
You can test the TTS service directly with curl:
```bash
curl -X POST "http://localhost:8000/api/tts" \
     -H "Content-Type: application/json" \
     -d '{"text": "This is a test"}'
```

### Testing Speech Recognition
Use the browser's developer tools to check if the microphone is being accessed and if any speech recognition events are firing.
