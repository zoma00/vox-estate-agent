# Current Project Directory Structure

This document describes the current directory structure of your backend project as of September 13, 2025.


```
project-root/
├── backend/                  # All backend code (migrated from realestate_agent/)
│   ├── animation/
│   ├── app/
│   │   └── __pycache__/
│   ├── avatar/
│   ├── Generated old vids/
│   ├── __pycache__/
│   ├── results/
│   ├── tts/
│   │   └── __pycache__/
│   ├── utils/
│   ├── venv/
│   │   ├── bin/
│   │   ├── include/
│   │   ├── lib/
│   │   ├── lib64 -> lib/
│   │   └── share/
│   └── Wav2Lip/
│       ├── checkpoints/
│       ├── evaluation/
│       ├── face_detection/
│       ├── filelists/
│       ├── models/
│       ├── __pycache__/
│       ├── results/
│       └── temp/
├── web-frontend/             # React web app (Vite, CRA, or Next.js)
├── mobile-frontend/          # React Native app (Android/iOS)
├── docs/                     # Documentation, guides, markdown files
├── DEPLOYMENT_ROADMAP.md
├── SETUP_GUIDE.md
├── VENV_SETUP.md
└── README.md
```

- All backend code and assets are grouped under `backend/` (migrated from `realestate_agent/`).
- `web-frontend/` is for your React web app (Vite, CRA, or Next.js).
- `mobile-frontend/` is for your React Native app (Android/iOS).
- `docs/` is for documentation and guides.
- Top-level markdown files are for quick access to setup and deployment instructions.

This structure is ready for a fullstack monorepo and will help keep your backend, web, and mobile code organized as your project grows.
