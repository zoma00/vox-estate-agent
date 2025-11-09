#!/usr/bin/env bash
# Deletes audio files older than X days from the static/audio directory.
# Intended to be run as the 'deploy' user (no sudo required if files are owned by deploy).

AUDIO_DIR="/opt/vox-estate-agent/backend/realestate_agent/static/audio"
DAYS=7

if [ ! -d "$AUDIO_DIR" ]; then
  echo "Audio directory not found: $AUDIO_DIR" >&2
  exit 1
fi

# Preview mode (uncomment the 'echo' to dry-run)
# find "$AUDIO_DIR" -type f -mtime +$DAYS -print

# Delete old audio files
find "$AUDIO_DIR" -type f -mtime +$DAYS -print -delete

exit 0
