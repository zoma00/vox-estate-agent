import requests
import subprocess
import time

url = "http://localhost:8000/agent/tts"
text = input("Enter text to synthesize: ")

response = requests.post(url, files={"text": (None, text)})

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
