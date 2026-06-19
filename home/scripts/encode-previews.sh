#!/usr/bin/env bash
# Compresses raw preview clips in public/projects/previews/.raw down to the
# ≤500KB VP9 webm + h264 mp4 fallback that the gallery serves. Handles both the
# Playwright-recorded .webm files and any hand-recorded .mov (e.g. waveform,
# butterchurn). Re-run any time you drop new raw clips in.
set -euo pipefail
shopt -s nullglob

DIR="$(cd "$(dirname "$0")/../public/projects/previews" && pwd)"
RAW="$DIR/.raw"

clips=("$RAW"/*.webm "$RAW"/*.mov)
if [ ${#clips[@]} -eq 0 ]; then
  echo "No raw clips in $RAW — run 'bun run previews:record' first."
  exit 0
fi

for src in "${clips[@]}"; do
  slug="$(basename "${src%.*}")"
  ffmpeg -y -i "$src" -t 6 -vf "scale=640:-2,fps=24" -c:v libvpx-vp9 -b:v 0 -crf 38 -an "$DIR/$slug.webm"
  ffmpeg -y -i "$src" -t 6 -vf "scale=640:-2,fps=24" -c:v libx264 -crf 28 -an -movflags +faststart "$DIR/$slug.mp4"
  echo "✓ $slug — $(du -h "$DIR/$slug.webm" | cut -f1) webm / $(du -h "$DIR/$slug.mp4" | cut -f1) mp4"
done
