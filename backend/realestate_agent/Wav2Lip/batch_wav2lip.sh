#!/bin/bash
for f in input_*.wav; do
  sudo docker run --rm -v "$(pwd)":/workspace wav2lip python3 inference.py --checkpoint_path wav2lip.pth --face face.jpg --audio "$f"
  mv results/result_voice.mp4 "results/result_${f%.wav}.mp4"
  echo "Generated results/result_${f%.wav}.mp4 for $f"
done
