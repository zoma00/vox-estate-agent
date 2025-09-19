# AI Avatar Agent CLI Guide

This guide lists all the commands needed to run the CLI-based Text-to-Avatar pipeline.

---

## 1. Activate Python Environment

```
source venv/bin/activate
```

---

## 2. Prepare Your Input

Edit or create `input.txt` with the text you want the avatar to speak:

```
echo "Hello, welcome to the future of real estate!" > input.txt
```

Or, use the CLI script to enter text interactively (see step 5).

---

## 3. Generate Speech Audio (TTS)

```
bash batch_tts.sh
```

This will read `input.txt` and produce a WAV file (e.g., `output.wav`).

---

## 4. Generate Talking Video (Wav2Lip)

```
bash Wav2Lip/batch_wav2lip.sh face.jpg
```

- Replace `face.jpg` with your avatar image if needed.
- The output video will be saved in the `results/` directory.

---

## 5. Run the All-in-One CLI Script

You can use the provided Python script to automate the whole process:

```
python cli_avatar.py
```

- This script will prompt you for text, run TTS and Wav2Lip, and show the output video path.

---

## 6. Play the Resulting Video

```
mpv results/your_video.mp4
```

- Replace `your_video.mp4` with the actual output filename.
- You can use any video player (e.g., VLC, ffplay).

---

## 7. Troubleshooting

- Ensure all scripts are executable: `chmod +x batch_tts.sh Wav2Lip/batch_wav2lip.sh`
- Check that your virtual environment is activated.
- Review error messages for missing dependencies or file paths.

---

## 8. Example Full Session

```
source venv/bin/activate
python cli_avatar.py
mpv results/latest_video.mp4
```

---

