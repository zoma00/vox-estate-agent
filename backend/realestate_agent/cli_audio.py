import argparse
import requests
import subprocess
import sys


def main():
    parser = argparse.ArgumentParser(description="CLI for audio-only TTS generation via API.")
    parser.add_argument("text", nargs="?", help="Text to synthesize. If not provided, will prompt.")
    parser.add_argument("--url", default="http://localhost:8000/agent/tts", help="TTS API endpoint URL.")
    parser.add_argument("--output", default="tts_output.wav", help="Output WAV file name.")
    parser.add_argument("--play", action="store_true", help="Play audio after generation.")
    args = parser.parse_args()

    text = args.text
    if not text:
        text = input("Enter text to synthesize: ")

    try:
        response = requests.post(args.url, files={"text": (None, text)})
        if response.status_code == 200:
            with open(args.output, "wb") as f:
                f.write(response.content)
            print(f"Audio saved to {args.output}")
            if args.play:
                try:
                    subprocess.run(["aplay", args.output], check=True)
                except Exception as e:
                    print(f"Could not play audio: {e}")
        else:
            print(f"Request failed with status code {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Error connecting to TTS API: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
