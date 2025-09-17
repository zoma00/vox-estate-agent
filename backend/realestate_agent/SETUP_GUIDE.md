# Project Setup Guide: Deploying vox-estate-agent on a New Machine

Follow these steps to set up your project from scratch after cloning from GitHub:

## 1. Clone the Repository

```bash
git clone git@github.com:zoma00/vox-estate-agent.git
cd vox-estate-agent
```

## 2. Create a Python Virtual Environment

```bash
python3 -m venv venv
```

## 3. Activate the Virtual Environment

```bash
source venv/bin/activate
```

## 4. Install Python Dependencies

```bash
pip install -r Wav2Lip/requirements.txt
```

## 5. Build the Wav2Lip Docker Image (CPU-only)

```bash
cd Wav2Lip
# Make sure Dockerfile.cpu exists in this directory
# Build the Docker image
sudo docker build -t wav2lip-cpu -f Dockerfile.cpu .
cd ..
```

## 6. Start the FastAPI Server

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 7. Run the CLI Avatar Script

```bash
python cli_avatar.py
```

---

**Notes:**
- Make sure Docker is installed and running on your machine.
- If you use OpenAI API, ensure your `.env` file contains your API key.
- If you change the project structure, update any scripts or Docker commands accordingly.

---

This guide ensures a clean, reproducible setup for any new environment!
