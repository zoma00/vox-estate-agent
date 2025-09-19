# VoxEstateAgent Frontend Plan

This plan outlines the steps to build a web frontend for audio chat with your AI agent.

## Goals
- Allow users to type or speak prompts in the browser
- Send prompts to backend (OpenAI + TTS)
- Display AI responses
- Play generated audio responses in the browser

## Tech Stack
- React.js (recommended) or plain HTML/JS
- HTML5 `<audio>` for playback
- Web Speech API for speech-to-text (optional)
- Fetch API or Axios for backend communication

## Features
1. **Text Input:**
   - Input box for user prompts
   - Button to submit
2. **Speech Input (Optional):**
   - Microphone button to record speech
   - Use browser's speech-to-text to convert to text
3. **Chat Display:**
   - Show user prompt and AI response
4. **Audio Playback:**
   - Play returned WAV file using `<audio>`
   - Option to download audio
5. **API Integration:**
   - Send prompt to backend endpoint
   - Receive AI response and audio file
6. **Error Handling:**
   - Show errors if backend/API fails

## User Flow
1. User enters or speaks a prompt
2. Frontend sends prompt to backend
3. Backend returns AI response and audio
4. Frontend displays response and plays audio

## Project Structure Example
```
web-frontend/
│
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ChatInput.js
│   │   ├── ChatDisplay.js
│   │   ├── AudioPlayer.js
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Next Steps
1. Scaffold React app (or HTML/JS files)
2. Implement text and speech input
3. Integrate backend API calls
4. Add chat display and audio playback
5. Test locally and iterate

---
For more details, see backend API docs and CLI audio implementation.
