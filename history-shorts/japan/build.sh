#!/bin/sh
# One command: Japan in 60 Seconds (Silkscreen Travel Poster, vertical 1080×1920, 24 fps).
#   sh build.sh           voice if missing + speech check, timeline + subtitles, events, score, mix, picture, master, readcheck, poster
#   VOICE=1 sh build.sh   regenerate the narration first
# Needs the Lemo-Opuscar library (core + voice + music tiers): LIB=<library path>
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
NAME=$(basename "$HERE")
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the Lemo-Opuscar library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
FFMPEG_DIR=${FFMPEG_DIR:-/opt/ffmpeg7/bin}; [ -x "$FFMPEG_DIR/ffmpeg" ] && PATH="$FFMPEG_DIR:$PATH"     # ffmpeg 7+ for mastering (6.x under-reports audio length in loudnorm)
SIZE=1080x1920
cd "$LIB"
mkdir -p "$HERE/out/voice"
if [ "${VOICE:-0}" = "1" ] || [ ! -f "$HERE/out/voice/dur.json" ]; then "$PY" core/tts/tts.py "$HERE/voice/lines.json" "$HERE/out/voice"; fi
"$PY" core/tts/asr_check.py "$HERE/voice/lines.json" "$HERE/out/voice" --lang en       # every line must transcribe back; writes word timings
"$PY" "$HERE/tools/timeline.py"                                                         # → timeline.json + $NAME.srt
node core/render/events.mjs "$HERE" --size $SIZE                                        # → events.json
"$PY" "$HERE/music/compose.py"                                                          # → music/score.wav
"$PY" "$HERE/mix.py"                                                                    # → out/mix.wav
node core/render/video.mjs "$HERE" --size $SIZE --fps 24 --workers ${WORKERS:-3} --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4" 24 0
node core/render/readcheck.mjs "$HERE" --size $SIZE > "$HERE/out/readcheck.txt" && echo "readcheck ok" || { grep -v '^OK' "$HERE/out/readcheck.txt" | tail -8; }
ffmpeg -v error -y -ss 30 -i "$HERE/$NAME.mp4" -frames:v 1 -q:v 3 "$HERE/poster.jpg"
echo "done: $HERE/$NAME.mp4"
