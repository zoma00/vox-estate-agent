import requests
import subprocess

url = "http://localhost:8000/agent/tts"
text = input("Enter text to synthesize: ")

response = requests.post(url, files={"text": (None, text)})

if response.status_code == 200:
    with open("tts_output.wav", "wb") as f:
        f.write(response.content)
    print("Audio saved to tts_output.wav")
    # Play the audio (Linux, using aplay)
    try:
        subprocess.run(["aplay", "tts_output.wav"], check=True)
    except Exception as e:
        print(f"Could not play audio: {e}")
else:
    print(f"Request failed with status code {response.status_code}: {response.text}")
