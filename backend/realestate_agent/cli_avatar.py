#!/usr/bin/env python3
"""
Simple CLI script for Text-to-Avatar pipeline:
- User enters text
- TTS generates audio
- Wav2Lip generates video
- Output video path is shown
"""

# Load environment variables from .env
import os
import sys
import time
import subprocess
import requests
from dotenv import load_dotenv
import openai
load_dotenv()

# === LLM Backend Selection ===

# Updated for openai>=1.0.0
def call_openai_llm(prompt, api_key=None, model="gpt-3.5-turbo"):
    import openai
    client = openai.OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=512,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()

def call_llm(prompt, use_openai=True, **kwargs):
    # Ollama integration is commented out for now. Only OpenAI is used.
    return call_openai_llm(prompt, **kwargs)
   

# CONFIGURABLE PATHS
TTS_SCRIPT = "batch_tts.sh"  # Your TTS batch script
FACE_IMAGE = "face.jpg"  # Path to your avatar image (relative to Wav2Lip dir)
WAV2LIP_INFER_PATH = "inference.py"  # Path inside Wav2Lip dir
WAV2LIP_CHECKPOINT = "wav2lip.pth"  # Path inside Wav2Lip dir
WAV2LIP_DIR = "Wav2Lip"
OUTPUT_DIR = os.path.join(WAV2LIP_DIR, "results")  # Where output videos are saved

# Generate a unique base name for this run
timestamp = time.strftime("%Y%m%d_%H%M%S")
base_name = f"avatar_{timestamp}"

def get_wav2lip_docker_cmd():
    return [
        "docker", "run", "--rm",
        "-v", f"{os.path.abspath(WAV2LIP_DIR)}/:/workspace",
        "wav2lip-cpu",
        "python3", WAV2LIP_INFER_PATH,
        "--checkpoint_path", WAV2LIP_CHECKPOINT,
        "--face", FACE_IMAGE,
        "--audio", "tts_output.wav"
    ]


def main():
    print("=== AI Avatar CLI ===")
    user_text = input("You: ").strip()
    if not user_text:
        print("No input provided. Exiting.")
        return

    # Get AI response from OpenAI (default) or Ollama (set use_openai=False)
    ai_response = call_llm(user_text, use_openai=True)
    print(f"AI: {ai_response}")

    # Use AI response as the text for TTS and video
    tts_text = ai_response

    # Call FastAPI TTS endpoint to generate audio
    print("[1/3] Generating speech audio with TTS (FastAPI)...")
    tts_api_url = "http://localhost:8000/agent/tts"
    tts_wav_name = f"tts_output_{base_name}.wav"
    try:
        response = requests.post(tts_api_url, data={"text": tts_text})
        response.raise_for_status()
        # Save the returned audio content
        with open(tts_wav_name, "wb") as f:
            f.write(response.content)
    except Exception as e:
        print(f"TTS API call failed: {e}")
        sys.exit(1)

    # Copy generated wav to Wav2Lip dir as input for Docker
    tts_wav_dst = os.path.join(WAV2LIP_DIR, f"tts_output.wav")
    if os.path.exists(tts_wav_name):
        import shutil
        shutil.copy(tts_wav_name, tts_wav_dst)
    else:
        print(f"Error: TTS output wav '{tts_wav_name}' not found. Check TTS API output.")
        sys.exit(1)


    # Ensure face image exists before running Docker
    face_path = os.path.join(WAV2LIP_DIR, FACE_IMAGE)
    if not os.path.exists(face_path):
        print(f"Error: Face image '{face_path}' not found. Please check the path.")
        sys.exit(1)

    # Ensure results directory exists before running Docker
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # Copy tts_output.wav to Wav2Lip dir for Docker
    tts_wav_src = "tts_output.wav"
    tts_wav_dst = os.path.join(WAV2LIP_DIR, "tts_output.wav")
    if os.path.exists(tts_wav_src):
        import shutil
        shutil.copy(tts_wav_src, tts_wav_dst)

    print("[2/3] Generating talking video with Wav2Lip (Docker)...")
    # Remove old result_voice.mp4 if exists to avoid confusion
    result_voice_path = os.path.join(OUTPUT_DIR, "result_voice.mp4")
    if os.path.exists(result_voice_path):
        os.remove(result_voice_path)

    wav2lip_result = subprocess.run(get_wav2lip_docker_cmd(), cwd=WAV2LIP_DIR, capture_output=True)
    if wav2lip_result.returncode != 0:
        print("Wav2Lip failed:", wav2lip_result.stderr.decode())
        sys.exit(1)

    # Rename the generated video to a unique name
    if os.path.exists(result_voice_path):
        unique_video_path = os.path.join(OUTPUT_DIR, f"{base_name}.mp4")
        os.rename(result_voice_path, unique_video_path)
        print(f"[3/3] Done! Video saved at: {unique_video_path}")
        print("Play it with: mpv", unique_video_path)
    else:
        print(f"No video output found in '{OUTPUT_DIR}'.")
        sys.exit(1)

if __name__ == "__main__":
    main()
