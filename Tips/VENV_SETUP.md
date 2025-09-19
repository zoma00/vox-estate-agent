# Production Virtual Environment Setup Guide

This guide explains how to set up a Python virtual environment (venv) for production use with this project. It also clarifies that Wav2Lip runs in a Docker container, not in the Python venv, and is integrated via the CLI.

---

## 1. Create a Virtual Environment

From your project root directory:

```bash
python3 -m venv venv
```

This creates a new folder called `venv` containing an isolated Python environment.

## 2. Activate the Virtual Environment

```bash
source venv/bin/activate
```

You should see `(venv)` in your shell prompt.

## 3. Install Python Dependencies

```bash
pip install -r Wav2Lip/requirements.txt
```

This ensures all required packages (and compatible versions) are installed for your backend and CLI.

---

## 4. Wav2Lip Runs in Docker (Not venv)
- The Wav2Lip model and its dependencies are containerized and run inside a Docker container (`wav2lip-cpu` image).
- You do NOT need to install Wav2Lip's requirements in your Python venv.
- The CLI script (`cli_avatar.py`) integrates with Wav2Lip by calling Docker from your Python environment.

---

## 5. Integration Flow
- Your FastAPI backend and CLI run in the Python venv.
- When you generate a video, the CLI calls the Wav2Lip Docker container to process the audio and image.
- This keeps your Python environment clean and avoids dependency conflicts.

---

## 6. Notes
- Always activate your venv before running backend or CLI scripts.
- If you move or rename your project, recreate the venv for best results.
- If you deploy to a new server, repeat these steps after cloning the repo.

---

This setup ensures a clean, reproducible, and production-ready environment for your project.

---

## 7. Running the FastAPI Server

After activating your venv, start the backend server with:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
