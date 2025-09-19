# AI Avatar Agent Workflow

This document outlines the recommended workflow for building an interactive AI avatar agent using TTS and Wav2Lip.

---

## 1. CLI Prototype

- **Purpose:** Quickly test and debug the TTS → Wav2Lip pipeline.
- **How it works:**
  1. User enters text in the terminal.
  2. TTS generates a WAV file from the text.
  3. Wav2Lip generates a talking video from the audio and a face image.
  4. Output video is saved for playback.

---

## 2. Web App (React + FastAPI)

- **Purpose:** User-friendly, scalable interface for end users.
- **How it works:**
  1. User enters text or records speech in the browser.
  2. Frontend sends input to FastAPI backend.
  3. Backend runs TTS and Wav2Lip, returns video.
  4. Video is played in the browser.

---

## 3. Deployment

- **Local testing:** Run everything on your machine for development.
- **Production:** Deploy FastAPI backend to a VPS, connect a domain, and serve the React frontend.

---

## Why this workflow?
- Fast iteration and debugging with CLI.
- Reusable backend logic for both CLI and web.
- Scalable and user-friendly for demos or real users.

---

## Next Steps
- Start with CLI script (see below).
- Build out FastAPI endpoints and React UI.
- Deploy when ready.

---

