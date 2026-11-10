# History in 60 Seconds — working notes for Claude

Read `PRODUCTION.md` (the runbook) and `countries.csv` (the queue). Each country is a self-contained folder; the newest one is the template
(`sh tools/new_country.sh <slug>` copies it). Uploading happens in the owner's Chrome via a local Claude session: `brand/LOCAL_SESSION.md`.

**Quality bar — every new episode must match or beat the last one** (check before delivering):
- every narration line passes `asr_check.py`, and the final file transcribes back word for word (a long-form whisper slip may be checked on a short clip);
- −14 LUFS, `readcheck ok`, no blank frames, length ≤ 60 s;
- motion: share of frames that change ≥ the previous episode (Japan 71 %, UAE 72 %, Egypt 75 %), no frozen stretch ≥ 2 s (end wall included);
- scene-change sound below the rest of the track in the >4 kHz band (no hiss);
- nothing important under the Shorts UI: top ~140 px, right ~130 px (y 980–1720), bottom ~360 px.

**Keep every episode different** (YouTube "inauthentic content"): new hook style, cold-open camera move, base landscape, signature moment,
instruments/mode. Used so far — hooks: contrast / surprising fact / list-of-three; signatures: snap / 7-ink fountain / route stamp;
instruments: koto+taiko / oud+darbuka / harp+sistrum. See each folder's `TREATMENT.md`.

**Branding:** `content.json` → `"sub": "@PrintedHistory"`, `"brand": "FOLLOW @PrintedHistory"`. Daily slot: 5:00 PM (owner's time zone).

**Lessons learned**
- Kokoro mispronounces some names: test, and reword or respell (Ramesses → "Ramses"; avoid "Ras Al Khaimah", "sheikhdoms"; "carves" sounds like "calves").
- Master with ffmpeg 7+ (`/opt/ffmpeg7/bin`, used automatically by `build.sh`); the system ffmpeg 6 wrongly rejects valid audio.
- Facts: verify anything uncertain with a web search and cite it in `FACTS.md`; no maps or borders; no flags or logos.
- Keep chat output small: grep build logs for `mismatch|I:|BAD|readcheck|done:` instead of printing them.
