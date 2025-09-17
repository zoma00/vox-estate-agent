# Audio CLI Guide

This guide explains how to use the audio-only CLI tools for generating speech from text and interacting with OpenAI in your terminal.

## Prerequisites
- Python 3.11+
- Activate your virtual environment: `source venv/bin/activate`
- Install required packages:
  ```sh
  pip install requests python-dotenv openai
  ```
- Ensure your FastAPI TTS server is running:
  ```sh
  python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
  ```

## Basic Audio CLI: `cli_audio_simple.py`
1. Run the script:
   ```sh
   python cli_audio_simple.py
   ```
2. Enter text when prompted.
3. The script will generate a WAV file and play it back using `aplay`.

## OpenAI Interactive Audio CLI: `cli_audio_openai.py`
1. Make sure your `.env` file contains your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-...
   ```
2. Run the script:
   ```sh
   python cli_audio_openai.py
   ```
3. Type your prompt in the terminal.
4. The script will:
   - Send your prompt to OpenAI (ChatGPT)
   - Print the AI's response
   - Synthesize the response to audio and play it back
   - Save each audio file with a timestamped filename

## Troubleshooting
- If you see errors about missing packages, run `pip install` as above.
- If you hear no sound, check your system volume and confirm the WAV file is not silent (open in Audacity).
- If you get connection errors, make sure your FastAPI server is running and accessible at `localhost:8000`.

## Customization
- You can change the TTS API URL in the script if your server runs on a different host/port.
- Audio files are saved with timestamps for easy organization.

---
For further help, see the code comments or ask GitHub Copilot for assistance.
