# Real Estate Agent Assistant - Command Guide

## Prerequisites
- Python 3.7+
- Node.js 14+
- npm or yarn
- Virtual environment (recommended)

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd ~/Downloads/vox-estate-agent/backend/realestate_agent

# Create and activate virtual environment (first time only)
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
pip install fastapi uvicorn python-multipart gTTS
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd ~/Downloads/vox-estate-agent/web-frontend/webfront

# Install Node.js dependencies (first time only)
npm install
```

## Running the Application

### Start Backend Server
```bash
# In first terminal
cd ~/Downloads/vox-estate-agent/backend/realestate_agent
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Start Frontend Development Server
```bash
# In second terminal
cd ~/Downloads/vox-estate-agent/web-frontend/webfront
npm start
```

## Accessing the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Common Commands

### Backend
```bash
# Run tests
pytest

# Check Python dependencies for updates
pip list --outdated

# Generate requirements.txt
pip freeze > requirements.txt
```

### Frontend
```bash
# Run tests
npm test

# Build for production
npm run build

# Check for package updates
npm outdated
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
sudo lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Frontend Not Connecting to Backend
- Ensure backend is running
- Check CORS settings in `app/main.py`
- Verify API_URL in frontend code

## Production Deployment

### Backend (Using Gunicorn)
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

### Frontend (Production Build)
```bash
npm run build
# Serve the build directory using Nginx or similar
```

## Maintenance

### Update Dependencies
```bash
# Backend
pip install --upgrade -r requirements.txt

# Frontend
npm update
```

### Clean Up
```bash
# Remove Python cache files
find . -type d -name "__pycache__" -exec rm -r {} +

# Remove node_modules (frontend)
rm -rf node_modules/
```

## Notes
- The `--reload` flag is for development only
- Always use virtual environments for Python
- Keep dependencies updated for security patches
