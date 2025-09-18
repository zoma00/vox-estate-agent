# Environment Variable Setup Guide

This guide provides solutions for resolving environment variable issues in the Vox Estate Agent application.

## Quick Start

1. **Navigate to the project directory**:
   ```bash
   cd ~/Downloads/vox-estate-agent/backend/realestate_agent
   ```

2. **Activate the virtual environment**:
   ```bash
   source venv/bin/activate
   ```

3. **Set the API key directly** (temporary solution):
   ```bash
   export OPENAI_API_KEY="your_api_key_here"
   ```

4. **Run the server**:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

## Permanent Solution

1. **Create/Update `.env` file** in the project root:
   ```bash
   # Navigate to project root
   cd ~/Downloads/vox-estate-agent/backend/realestate_agent
   
   # Create .env file
   cat > .env << 'ENV_CONTENT'
   # API Keys
   OPENAI_API_KEY=your_api_key_here
   
   # Server Configuration
   HOST=0.0.0.0
   PORT=8000
   DEBUG=True
   
   # TTS Configuration
   TTS_ENGINE=pyttsx3
   DEFAULT_LANGUAGE=en
   ENV_CONTENT
   ```

## Common Issues and Solutions

### 1. "OPENAI_API_KEY not set" Error
- **Solution**:
  ```bash
  # Verify .env file exists
  ls -la .env
  
  # Check file permissions
  chmod 644 .env
  
  # Load variables manually
  set -a
  source .env
  set +a
  ```

### 2. Environment Variables Not Loading
- **Debug**:
  ```python
  import os
  print("Current directory:", os.getcwd())
  print("Files in directory:", os.listdir('.'))
  print("OPENAI_API_KEY:", os.getenv('OPENAI_API_KEY'))
  ```

## Best Practices

1. **Security**:
   - Never commit `.env` to version control
   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation

2. **Development**:
   - Use different `.env` files for different environments
   - Document all required variables in `ENVIRONMENT.md`

## Support

For additional help, contact the development team or refer to the project documentation.
