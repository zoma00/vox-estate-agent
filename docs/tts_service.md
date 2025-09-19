# TTS Service Documentation

## Overview
The Text-to-Speech (TTS) service is implemented in `app/tts_service.py` using the `pyttsx3` library. This service converts text into speech and saves it as an audio file.

## Features
- Converts text to speech using system's default TTS engine
- Supports multiple voices (with preference for female voices)
- Configurable speech rate and volume
- Saves audio files with unique timestamps
- Thread-safe singleton implementation

## Voice Configuration
The service attempts to use a female voice by default. If no female voice is available, it falls back to the first available voice.

### Default Voice Properties
- **Rate**: 150 (words per minute)
- **Volume**: 1.0 (maximum)
- **Voice**: System default (typically `gmw/en` on most systems)

## Methods

### `initialize_engine()`
Initializes the TTS engine with default settings.

**Logs**:
- `TTS Engine initialized with voice: [voice_id]` - Successfully initialized
- `Could not set voice: [error]` - Warning if voice setting fails
- `Failed to initialize TTS engine: [error]` - Error if initialization fails

### `text_to_speech(text: str) -> tuple[str, str]`
Converts text to speech and saves it as an audio file.

**Parameters**:
- `text` (str): The text to convert to speech

**Returns**:
- `tuple[str, str]`: (audio_path, audio_url)
  - `audio_path`: Absolute path to the saved audio file
  - `audio_url`: Relative URL to access the audio file

**Logs**:
- `[TTS] Saving audio to: [path]` - When saving audio file
- `[TTS] Audio saved successfully: [path]` - On successful save
- `[TTS] Error saving audio: [error]` - If save fails

## Audio File Management
- Audio files are saved in the `static/audio/` directory
- Filename format: `output_[timestamp]_[hash].wav`
- The service ensures the output directory exists

## Dependencies
- Python 3.6+
- pyttsx3
- System TTS engine (espeak, nsss, or sapi5 depending on OS)

## Usage Example
```python
from app.tts_service import tts_service

text = "Hello, this is a test message."
audio_path, audio_url = tts_service.text_to_speech(text)
print(f"Audio saved to: {audio_path}")
print(f"Access at URL: {audio_url}")
```

## Troubleshooting
1. **No voices available**
   - Ensure your system has a TTS engine installed
   - On Linux: `sudo apt-get install espeak`
   - On macOS: Built-in TTS should work out of the box
   - On Windows: Install a TTS engine like Microsoft Speech API

2. **Voice not changing**
   - Check available voices using the script in the development section
   - The voice name must match exactly (case-sensitive)

## Development
To list all available voices on your system, run:

```python
import pyttsx3
engine = pyttsx3.init()
voices = engine.getProperty('voices')
for i, voice in enumerate(voices):
    print(f"Voice {i}:")
    print(f" - ID: {voice.id}")
    print(f" - Name: {voice.name}")
    print(f" - Languages: {voice.languages}")
    print(f" - Gender: {voice.gender}")
    print(f" - Age: {voice.age}")
```
