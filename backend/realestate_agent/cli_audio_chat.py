#!/usr/bin/env python3
"""
CLI script for audio chat:
- User enters text
- ChatGPT (OpenAI) generates a response
- TTS API generates audio from the response
- Audio is saved and played back
"""
import os
import sys
import requests
import subprocess
from dotenv import load_dotenv
import openai

load_dotenv()

def call_openai_llm(prompt, api_key=None, model="gpt-3.5-turbo"):
    client = openai.OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=512,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()

def main():
    print("=== Audio Chat CLI ===")
    user_text = input("You: ").strip()
    if not user_text:
        print("No input provided. Exiting.")
        return

    # Get AI response from OpenAI
    ai_response = call_openai_llm(user_text)
    print(f"AI: {ai_response}")

    # Call TTS API to generate audio
    tts_api_url = os.getenv("TTS_API_URL", "http://localhost:8000/agent/tts")
    tts_wav_name = "tts_audio_chat.wav"
    try:
        response = requests.post(tts_api_url, data={"text": ai_response})
        response.raise_for_status()
        print("TTS API response headers:", response.headers)
        print("First 32 bytes of response:", response.content[:32])
        if response.headers.get("Content-Type","").startswith("audio") and response.content[:4] == b'RIFF':
            with open(tts_wav_name, "wb") as f:
                f.write(response.content)
            print(f"Audio saved to {tts_wav_name}")
            # Play the audio
            try:
                subprocess.run(["aplay", tts_wav_name], check=True)
            except Exception as e:
                print(f"Could not play audio: {e}")
        else:
            print("TTS API did not return valid WAV audio. Check API implementation and response.")
            print("Response text:", response.text)
    except Exception as e:
        print(f"TTS API call failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
