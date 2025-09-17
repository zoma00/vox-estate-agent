#!/bin/bash

# Change to the realestate_agent directory
cd "$(dirname "$0")/realestate_agent" || exit 1

# Create necessary directories
mkdir -p static/audio
mkdir -p audio_output

# Install dependencies if needed
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
