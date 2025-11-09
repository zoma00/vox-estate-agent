
# Vox Estate Agent — Full Stack AI Real Estate Platform

**System:** Ubuntu Linux (tested on 22.04+)

This project is a full-stack AI-powered real estate assistant, combining a FastAPI backend (Python) and a React frontend (JavaScript). It demonstrates modern deployment skills (systemd, nginx, venv), patch management, and automated testing.

---

## Backend
**Path:** `/home/hazem-elbatawy/Downloads/vox-estate-agent/backend`

**Tech Stack:**
- Python 3.10+
- FastAPI (REST API)
- OpenAI GPT (chat)
- pyttsx3 & gTTS (Text-to-Speech)
- Pydantic (models)
- Logging, CORS, static file serving
- Python venv for isolation

**Deployment:**
- Ubuntu Linux (systemd service for uvicorn)
- Nginx for HTTPS, API proxy, and static files
- `start_server.sh` for local dev quickstart
- `.env` for secrets (OpenAI API key)
- Audio files in `static/audio/`

**Testing:**
- Unit tests for TTS and chat pipeline (see `test_tts_api.py`)
- Manual API tests via curl/Postman or Curl.

**Patch Management:**
- Git tracked patches (see commit history)
- `.gitignore` for venv, logs, and deployment artifacts

**Key Files:**
- `app/main.py` — FastAPI app entry
- `app/agent_pipeline.py` — AI/TTS pipeline
- `app/tts_service.py` — TTS engine
- `requirements.txt` — Python dependencies
- `start_server.sh` — Dev server script

---

## Frontend
**Path:** `/home/hazem-elbatawy/Downloads/vox-estate-agent/web-frontend/webfront`

**Tech Stack:**
- React (Create React App)
- Axios (API calls)
- React Router
- Modern CSS, responsive design

**Features:**
- Chat UI with TTS playback
- Admin dashboard, property management
- API integration with backend endpoints

**Testing:**
- Jest + React Testing Library (`npm test`)
- Manual browser tests

**Deployment:**
- Build with `npm run build`
- Served via nginx (see deployment config)

**Key Files:**
- `src/App.js`, `src/SpeakChat.js` — main app/chat logic
- `src/utils/ttsService.js` — TTS API integration
- `public/` — static assets
- `package.json` — dependencies/scripts

---

## Deployment Skills Demonstrated
- Ubuntu systemd service for backend (see `vox-agent.service`)
- Nginx config for API proxy/static files
- Python venv for backend isolation
- Patch management via git
- Automated and manual testing

---

## How to Run
**Backend:**
```bash
cd backend/realestate_agent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
**Frontend:**
```bash
cd web-frontend/webfront
npm install
npm start
```

---

## See Also
- `README.md` at project root for full-stack overview
- Deployment scripts and configs in backend
- Test scripts and patch history in git







# PropEstateAI - Frontend (Create React App)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view PropEstateAI in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
