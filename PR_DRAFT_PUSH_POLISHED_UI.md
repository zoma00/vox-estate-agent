PR: Polished UI, TTS feature, and deploy helpers

Branch: feature/tts-implementation
Target: main

Summary
-------
This PR contains UI improvements to the Gallery on mobile and web, TTS integration scaffolding for the mobile frontend, Playwright screenshot tooling, and deployment helper artifacts (build/upload script, nginx/systemd templates, and a README).

Demo access
-----------
- No login/register is required for this demo. The demo is ready to be run locally or deployed to a demo server for reviewers to interact with the UI and try TTS (if backend is running).

What changed (high level)
-------------------------
- Mobile (Vite frontend):
  - New card-style gallery (`mobile-frontend/src/pages/Gallery.jsx`) with image fallbacks, price overlays, and responsive grid.
  - Readability tweaks for hero/demo text and `.muted` styling.
  - Chat and TTS pages scaffold improvements and a `TTSService` helper.
  - Local assets added to `mobile-frontend/public/assets/` and small documentation updates under `mobile-frontend/CHANGES/`.

- Web (Create React App frontend):
  - Gallery updated to use inline `<img>` thumbnails (with `object-fit: cover`) and local image fallbacks.
  - Adjusted CSS in `web-frontend/webfront/src/Gallery.css` for overlays and hover effects.

- Backend & Deployment:
  - `scripts/deploy.sh` - helper to build frontends and upload artifacts to a remote server using `scp`.
  - `deploy/nginx-systemd/` - templates for nginx and a systemd unit for running uvicorn.
  - `deploy/README_DEPLOY.md` - instructions to finalize server-side setup (venv, pip install, systemd, nginx).

- Tools & Docs:
  - Playwright screenshot script and README in `tools/`.
  - Screenshots added: `web_home.png`, `mobile_home.png`.
  - Multiple `Tips/` and `CHANGES/` files documenting design choices and notes.

How to run locally (quick)
--------------------------
1. Backend (FastAPI):

```bash
cd backend/realestate_agent
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn realestate_agent.main:app --reload --port 8000
```

2. Web frontend (dev):

```bash
cd web-frontend/webfront
npm install
npm start # runs on http://localhost:3000
```

3. Mobile frontend (dev):

```bash
cd mobile-frontend
npm install
npm run dev # runs on http://localhost:5173
```

Notes for reviewers
-------------------
- The demo does not require authentication.
- For TTS endpoints to work, start the backend (FastAPI) and ensure the frontend points to `/api/tts` (same-origin or with a proxy configured).
- I recommend reviewers open both mobile and web versions to compare the consistent gallery UI.

Screenshots (attached in repo)
-----------------------------
- `web_home.png`
- `mobile_home.png`

Suggested PR description (copy-paste)
------------------------------------
Adds a polished gallery UI for web and mobile, TTS scaffolding, Playwright screenshot tooling, and deploy helper artifacts. No login required for the demo. See `deploy/README_DEPLOY.md` for deploy instructions.

If you'd like, I can open the PR for you (requires GitHub permissions) or create this as a draft PR file you can paste into GitHub when opening the PR.