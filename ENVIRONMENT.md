# Environment Variables

This document describes the environment variables used in the Vox Estate Agent application.

## Required Variables

### `OPENAI_API_KEY`
- **Description**: API key for accessing OpenAI's services
- **Type**: String
- **Example**: `sk-proj-...`
- **Required**: Yes

## Server Configuration

### `HOST`
- **Description**: Host address to bind the server to
- **Type**: String (IP address)
- **Default**: `0.0.0.0` (all interfaces)
- **Required**: No

### `PORT`
- **Description**: Port to run the server on
- **Type**: Integer
- **Default**: `8000`
- **Required**: No

### `DEBUG`
- **Description**: Enable debug mode (more verbose logging)
- **Type**: Boolean
- **Values**: `True`/`False`
- **Default**: `True`
- **Required**: No

## TTS Configuration

### `TTS_ENGINE`
- **Description**: Text-to-Speech engine to use
- **Type**: String
- **Values**: `pyttsx3` (default), `gtts`
- **Required**: No

### `DEFAULT_LANGUAGE`
- **Description**: Default language for TTS
- **Type**: String (language code)
- **Default**: `en`
- **Required**: No

## Path Configuration

### `BACKEND_DIR`
- **Description**: Relative path to the backend directory
- **Type**: String (path)
- **Default**: `backend`
- **Required**: No

### `FRONTEND_DIR`
- **Description**: Relative path to the frontend directory
- **Type**: String (path)
- **Default**: `web-frontend`
- **Required**: No

### `AUDIO_DIR`
- **Description**: Directory to store generated audio files
- **Type**: String (path)
- **Default**: `static/audio`
- **Required**: No

## Environment

### `ENVIRONMENT`
- **Description**: Current environment
- **Type**: String
- **Values**: `development`, `testing`, `production`
- **Default**: `development`
- **Required**: No

## Setup

1. Copy `.env.example` to `.env`
2. Update the values in `.env` as needed
3. The application will automatically load the variables on startup

## Best Practices

- Never commit `.env` to version control
- Keep API keys and sensitive information in `.env`
- Use different `.env` files for different environments (e.g., `.env.development`, `.env.production`)
- Document any new environment variables in this file
