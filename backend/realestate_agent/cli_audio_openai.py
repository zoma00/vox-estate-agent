import requests
import subprocess
import time
import os
from dotenv import load_dotenv
import openai

load_dotenv()

url = "http://localhost:8000/agent/tts"
openai_api_key = os.getenv("OPENAI_API_KEY")

while True:
    user_text = input("You: ").strip()
    if not user_text:
        print("No input provided. Exiting.")
        break
    # Get AI response from OpenAI
    client = openai.OpenAI(api_key=openai_api_key)
    response_ai = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": user_text}],
        max_tokens=512,
        temperature=0.7,
    )
    ai_text = response_ai.choices[0].message.content.strip()
    print(f"AI: {ai_text}")
    # Send AI response to TTS API
    response = requests.post(url, files={"text": (None, ai_text)})
    if response.status_code == 200:
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"tts_output_{timestamp}.wav"
        with open(filename, "wb") as f:
            f.write(response.content)
        print(f"Audio saved to {filename}")
        try:
            subprocess.run(["aplay", filename], check=True)
        except Exception as e:
            print(f"Could not play audio: {e}")
    else:
        print(f"Request failed with status code {response.status_code}: {response.text}")
