#!/bin/bash
n=0
while IFS= read -r line; do
  if [ -n "$line" ]; then
    tts --text "$line" --model_name tts_models/en/ljspeech/glow-tts --out_path "input_$n.wav"
    echo "Generated input_$n.wav for: $line"
    n=$((n+1))
  fi
done < input.txt
