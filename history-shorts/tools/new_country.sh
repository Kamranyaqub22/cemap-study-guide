#!/bin/sh
# Scaffold a new episode from the latest template (Italy): sh history-shorts/tools/new_country.sh <slug>
# Copies the shared code; the content files (script, eras, palettes, landmarks, facts) are copied as examples to rewrite.
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd); SRC="$ROOT/italy"; DST="$ROOT/$1"
[ -n "$1" ] || { echo "usage: new_country.sh <slug>"; exit 2; }
[ ! -e "$DST" ] || { echo "$DST exists"; exit 1; }
mkdir -p "$DST/engine" "$DST/music" "$DST/tools" "$DST/voice" "$DST/fonts"
cp "$SRC"/film.js "$SRC"/main.js "$SRC"/index.html "$SRC"/mix.py "$SRC"/build.sh "$DST/"
cp "$SRC"/engine/silk.js "$DST/engine/"; cp "$SRC"/music/compose.py "$DST/music/"; cp "$SRC"/tools/timeline.py "$DST/tools/"
cp "$SRC"/fonts/* "$DST/fonts/"
# examples to rewrite for the new country
cp "$SRC"/engine/scenes.js "$SRC"/content.json "$DST/" 2>/dev/null; mv "$DST/scenes.js" "$DST/engine/scenes.js"
cp "$SRC"/voice/lines.json "$DST/voice/"; cp "$SRC"/FACTS.md "$SRC"/CREDITS "$SRC"/UPLOAD.md "$DST/"
sed -i "s/<title>.*<\/title>/<title>$1 in 60 Seconds<\/title>/" "$DST/index.html"
echo "scaffolded $DST — now rewrite voice/lines.json, content.json, engine/scenes.js, FACTS.md, CREDITS, UPLOAD.md (see PRODUCTION.md)"
