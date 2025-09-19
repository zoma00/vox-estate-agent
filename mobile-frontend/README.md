# PropEstateAI - Mobile frontend (Vite + React)

This is a minimal mobile-focused React scaffold intended to share API endpoints with the main web frontend. It uses Vite for fast local development.

Quickstart

Install dependencies:

```bash
cd mobile-frontend
npm install
```

Run dev server:

```bash
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`). The app expects the backend API to be available under the same origin at `/api/*` (for local development you can run the FastAPI backend and use a proxy if needed).

Notes
- The `Chat` page uses `fetch('/api/openai_chat')` and `fetch('/api/tts')` by default. If your backend runs on a different host/port, either configure a local proxy or update the client to point to the full backend URL.
- This scaffold is intentionally minimal — replace the placeholder components with your existing `SpeakChat` and other UI elements as desired.
