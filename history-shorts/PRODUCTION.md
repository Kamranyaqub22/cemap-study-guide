# Production system — History in 60 Seconds

Goal: **one Short published every day**, produced in batches so a missed day never breaks the schedule.

## The rhythm

| When | Who | What |
|---|---|---|
| Daily (automatic) | Claude, scheduled session | Produce the next `todo` country from `countries.csv`, run every check, commit to the branch, mark it `review` |
| Daily, ~5 min | You | Watch it once with sound, then **upload and schedule** it in YouTube Studio (below), mark it `scheduled` |
| Weekly, 15 min | You | Read YouTube Analytics (below); reply to comments; move countries people ask for to the top of `countries.csv` |

Keep **5–7 finished videos scheduled ahead** in YouTube Studio. Then production can slip a day without the channel missing one.

## One episode, step by step (what the daily session does)

1. **Set up** the toolkit if it isn't there: `git clone https://github.com/lemomo-ai/lemo-opuscar ~/lemo-opuscar`, then from it `sh plugin/skills/lemo-opuscar/scripts/setup.sh deps voice music` and `sh tools/fetch.sh voice` (≈ 10 min the first time).
2. **Pick** the first `todo` row in `countries.csv`; `sh history-shorts/tools/new_country.sh <slug>`.
3. **Research** 7–8 turning points from reliable sources (Britannica, national statistics offices, museum or university pages). Write each claim with its source in `FACTS.md`. Sensitive countries: neutral wording, dates and facts only, **no maps or borders**.
4. **Script** `voice/lines.json`: a hook line, one line per era, a closing question; ≤ 140 words in total so it lands under 60 s. The `sub` field holds the subtitle text split with `|`; `asr` holds what the speech check should hear.
5. **Branding** `content.json`: keep `"sub": "@PrintedHistory"` (printed under the country name for the whole video) and `"brand": "FOLLOW @PrintedHistory"` (printed on the end wall).
6. **Eras** `content.json`: scene key, label, year, the spoken word the year lands on (`at`), a 6-ink palette per era. Mark at most one `silence` era (the darkest moment) and one `snap` era (the comeback); the cold open uses the `snap` era.
7. **Picture** `engine/scenes.js`: replace the **base landscape** with the country's own (e.g. desert and Nile for Egypt, hills and sea for Greece) and draw one simple landmark per era. These are original silhouettes, not traced photos, logos or flags.
8. **Build** `LIB=~/lemo-opuscar sh history-shorts/<slug>/build.sh`, then the checks:
   - the pronunciation check passes (`tools/phonemes.py`, run by `build.sh`): no known-bad words such as "live", and the phonemes of
     every same-spelling, two-sound word read and confirmed (the speech check cannot hear these);
   - every narration line passes the speech check, and the final mix transcribes back correctly;
   - `readcheck ok`; −14 LUFS; no blank frames; length ≤ 60 s;
   - no frozen stretch ≥ 2 s; no text under the Shorts buttons (right ~130 px, bottom ~360 px, top ~140 px);
   - a contact sheet looked at frame by frame.
   - mastering needs ffmpeg 7+ (`build.sh` uses `/opt/ffmpeg7/bin` when present; the environment setup script installs it). With ffmpeg 6, `mux.sh` can wrongly reject the audio as cut off.
   - the bar to beat: at least as much motion as the last episode (share of frames that change), transition hiss below the rest of the track, every narration word transcribed back from the final file.
9. **Upload sheet** `UPLOAD.md`: title, description with sources, hashtags, tags.
10. **Commit and push** to the branch, set the row to `review`.

### Keep every video different

YouTube may demonetise or limit channels that post many near-identical templated videos ("inauthentic content"). So each episode must differ in more than the facts:

- a **different hook** style: a question, a surprising number, the ending first;
- a **different signature moment**: not always the 1945-style silence and snap;
- a **different palette, base landscape and instrument family**: oud and darbuka for Egypt, mandolin for Italy, sitar and tabla for India, and so on;
- now and then, a **different ending** from "Which country next?".

## Uploading (YouTube Studio, desktop)

1. studio.youtube.com → **Create → Upload videos** → choose `<slug>.mp4`. A vertical video ≤ 3 min is published as a Short automatically.
2. **Details**: paste the title and description from `UPLOAD.md`. **Show more** → paste the tags, set the category to Education, and set the language to English.
3. **Audience**: *No, it's not made for kids*. **Altered content**: answer the question yourself (see `UPLOAD.md`).
4. **Video elements → Subtitles**: upload `<slug>.srt` (English).
5. **Visibility → Schedule**: the next free day, at the same time every day. A good start is 17:00 in your main audience's time zone; adjust with Analytics.
6. After it goes live, **pin a comment** asking for the next country.

Automated uploading through the YouTube API needs your Google sign-in and an audited API project; videos from an unaudited project stay private. Scheduling in Studio is the reliable route.

## What to watch in Analytics (weekly)

- **Viewed vs. swiped away** (Shorts feed): below ~60 % viewed means the first two seconds need a stronger hook.
- **Average percentage viewed**: aim for > 80 %. Find where the retention graph dips and fix that kind of beat in the next videos.
- **Comments**: the "which country next?" answers are your queue; reorder `countries.csv` from them.
- After ~30 videos, compare the best and worst by hook style, then make more of what works.
