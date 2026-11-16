# History in 60 Seconds — working notes for Claude

Read `PRODUCTION.md` (the runbook) and `countries.csv` (the queue). Each country is a self-contained folder; the newest one is the template
(`sh tools/new_country.sh <slug>` copies it). Uploading happens in the owner's Chrome via a local Claude session: `brand/LOCAL_SESSION.md`.

**Quality bar — no compromise: every new episode must match or beat the last one on every number below** (the owner's standing rule).
Never deliver, push as finished or mark `review` an episode that falls short on any of them: fix it and rebuild until it passes.
If the build can't run (toolkit missing), say so and stop; never ship an unchecked video. Measure with `tools/qc.py` on both the new
and the previous episode (same method, same thresholds); `tools/still_spots.py` shows which era is too still.
Latest reference, Mexico (qc.py): −14.0 LUFS · 52.3 s · 0 blank frames · motion 100.0 / 100.0 / 99.9 / 89.6 % at 0.1 / 0.2 / 0.3 / 0.5 ·
longest still 0.00 / 0.00 / 0.04 / 2.50 s · sweep >4 kHz −46.5 dB vs rest −28.2 dB · 0 speech-check mismatches, final file word for word.
(Greece for comparison: 100.0 / 100.0 / 99.8 / 85.9 %, longest still 0 / 0 / 0.08 / 2.67 s, sweep −43.9 dB; USA 100.0 / 100.0 / 99.8 / 84.4 %, −42.8 dB.)

Checklist (check before delivering):
- every narration line passes `asr_check.py`, and the final file transcribes back word for word (a long-form whisper slip may be checked on a short clip);
- −14 LUFS, `readcheck ok`, no blank frames, length ≤ 60 s;
- motion: share of frames that change ≥ the previous episode (Japan 71 %, UAE 72 %, Egypt 75 %), no frozen stretch ≥ 2 s (end wall included);
- scene-change sound below the rest of the track in the >4 kHz band (no hiss);
- nothing important under the Shorts UI: top ~140 px, right ~130 px (y 980–1720), bottom ~360 px.

**Keep every episode different** (YouTube "inauthentic content"): new hook style, cold-open camera move, base landscape, signature moment,
instruments/mode. Used so far — hooks: contrast / surprising fact / list-of-three / paradox question (Italy) / peak first, then rewind (UK) / talk to the viewer about something they use (India) / quiz question (USA) / myth first (Greece) / hidden-city mystery (Mexico); signatures: snap / 7-ink fountain / route stamp / mosaic set ring by ring (Italy) / steam-engine wipe (UK) / brush-painted zero (India) / rocket-plume wipe (USA) / boustrophedon wipe (Greece) / papel picado (Mexico);
instruments: koto+taiko / oud+darbuka / harp+sistrum / mandolin+accordion+tamburello in 6/8 (Italy) / change-ringing bells+brass band+snare, 4/4 march (UK) / sitar+tabla+tanpura in teental (India) / banjo+fiddle+bass+washboard 2/4 (USA) / bouzouki+lyra+daouli in 7/8 (Greece) / marimba+guitar+guitarrón+maracas in sesquiáltera (Mexico). Cold opens: slide / fall / glide / crane up (Italy) / push in with a roll (UK) / descend in an arc (India) / punch-in (USA) / spiral out (Greece) / spring pull-back (Mexico).
Endings: "Which country next?" (Japan, UAE, Egypt) / "Where should we print next?" (Italy) / "Which era would you visit?" (UK) / "What surprised you most?" (India) / "Did you get the quiz right?" (USA) / "Would you have voted in ancient Athens?" (Greece) / "Have you been to Mexico?" (Mexico). See each folder's `TREATMENT.md`.

**Branding:** `content.json` → `"sub": "@PrintedHistory"`, `"brand": "FOLLOW @PrintedHistory"`. Daily slot: 5:00 PM (owner's time zone).

**Lessons learned**
- Kokoro mispronounces some names: test, and reword or respell (Ramesses → "Ramses"; avoid "Ras Al Khaimah", "sheikhdoms"; "carves" sounds like "calves").
- **Never use the word "live"** in narration: Kokoro says "people live here" like "live TV" (/laɪv/), and whisper can't hear the
  difference, so asr_check passes it. Say "are home to", "call it home", "living here". (Japan, UAE, Egypt and Italy all have it in
  their "Today" line; the owner accepted those, but it must not happen again.)
- Same-spelling, two-sound words (heteronyms: read, lead, wind, tear, close, row, minute, present, record, desert, Polish/polish,
  August, Nice…) are invisible to the speech check. `tools/phonemes.py` runs in `build.sh` before the voice: it stops the build on
  known-bad words (`BAD`) and prints the phonemes of risky ones (`CHECK`) — read those phonemes and fix any that are wrong.
  Add every new mispronunciation the owner reports to `BAD` in `tools/phonemes.py` and to this list.
- Master with ffmpeg 7+ (`/opt/ffmpeg7/bin`, used automatically by `build.sh`); the system ffmpeg 6 wrongly rejects valid audio.
- Facts: verify anything uncertain with a web search and cite it in `FACTS.md`; no maps or borders; no flags or logos.
- Whisper hears some present-tense verbs as past ("farmers raise" → "raised", "trains link" → "linked") and "intercity" as "into city": reword.
- The hiss check measures everything in a sweep window, narration included: a sweep that overlaps a sibilant ("six") or the first word of a line fails it. Land the last print just before "Today", and play a long signature in its own `pause` before the line.
- Sweep timing (USA onwards, in timeline.py): each print lands 0.1 s before its year is spoken, lines are 0.45 s apart, and a silence era's longer sweep starts earlier so it ends as the print lands; an era whose line starts with "Around the year…" uses `at: null` + `year_at`. Then no narration sound or label stamp falls inside a sweep.
- The camera must never come to rest: film.js keeps it part-linear and drifting under the next sweep; a cold open must last until the first sweep and keep moving (at zoom ≈ 1 a pan of the anchor does nothing: change the zoom).
- `sh tools/new_country.sh` copies the newest episode: update its `SRC` after each new episode (engine fixes live in film.js, timeline.py, mix.py).
- Kokoro: "Minoans" and "Tenochtitlan" come out wrong (avoid them); respell "Knossus", "Acropolice", "Tayo-teewa-kahn" (Teotihuacan); "still in force" is heard as "enforced".
- Whisper splits some names ("Brahmagupta" → "Brahma Gupta"): check the phonemes, then put whisper's spelling in `asr` and keep the real one in `sub`.
- Watch the moments around each sweep: an eased start (camera settled, wipe still off-screen) makes a still stretch; move things at a steady speed from the first frame.
- Kokoro/whisper: "By eighty AD" came back as "By ATAD" — say "By the year eighty"; keep subtitles worded like the speech.
- A subtitle cue shorter than 1.8 s (timeline.py warns) is a fail: re-split the `sub` text or use one cue.
- Every era needs a camera move (`ZK` in film.js must change between neighbours) and moving parts (drift/sway/blink); a scene of buildings alone freezes.
- The toolkit is installed by the "Kamran" environment's setup script before the session starts; if `/root/lemo-opuscar` is missing, auto mode
  will refuse to install it (third-party code): ask the owner to switch the mode to Accept edits and approve, or start a fresh session.
- Keep chat output small: grep build logs for `mismatch|I:|BAD|readcheck|done:` instead of printing them.
