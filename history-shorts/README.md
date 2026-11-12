# History in 60 Seconds

A YouTube Shorts series: one country's history per video, 60 seconds, vertical 1080×1920, built entirely in code in the
**Silkscreen Travel Poster** style of the [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar) library.

| Country | Video | Subtitles | Notes |
|---|---|---|---|
| Japan | [`japan/japan.mp4`](japan/japan.mp4) | [`japan/japan.srt`](japan/japan.srt) | [upload sheet](japan/UPLOAD.md) · [treatment](japan/TREATMENT.md) · [facts](japan/FACTS.md) · [credits](japan/CREDITS) |
| United Arab Emirates | [`uae/uae.mp4`](uae/uae.mp4) | [`uae/uae.srt`](uae/uae.srt) | [upload sheet](uae/UPLOAD.md) · [treatment](uae/TREATMENT.md) · [facts](uae/FACTS.md) · [credits](uae/CREDITS) |
| Egypt | [`egypt/egypt.mp4`](egypt/egypt.mp4) | [`egypt/egypt.srt`](egypt/egypt.srt) | [upload sheet](egypt/UPLOAD.md) · [treatment](egypt/TREATMENT.md) · [facts](egypt/FACTS.md) · [credits](egypt/CREDITS) |
| Italy | [`italy/italy.mp4`](italy/italy.mp4) | [`italy/italy.srt`](italy/italy.srt) | [upload sheet](italy/UPLOAD.md) · [treatment](italy/TREATMENT.md) · [facts](italy/FACTS.md) · [credits](italy/CREDITS) |
| United Kingdom | [`united-kingdom/united-kingdom.mp4`](united-kingdom/united-kingdom.mp4) | [`united-kingdom/united-kingdom.srt`](united-kingdom/united-kingdom.srt) | [upload sheet](united-kingdom/UPLOAD.md) · [treatment](united-kingdom/TREATMENT.md) · [facts](united-kingdom/FACTS.md) · [credits](united-kingdom/CREDITS) |
| India | [`india/india.mp4`](india/india.mp4) | [`india/india.srt`](india/india.srt) | [upload sheet](india/UPLOAD.md) · [treatment](india/TREATMENT.md) · [facts](india/FACTS.md) · [credits](india/CREDITS) |

**Daily workflow, uploading and the country queue:** [`PRODUCTION.md`](PRODUCTION.md) · [`countries.csv`](countries.csv)

## How one episode is made

Everything for a country lives in its own folder (`japan/` is the template):

- `voice/lines.json` — the narration, one line per era (spoken text, subtitle text, expected transcript).
- `content.json` — the eras: which landmark scene, the label and year printed in the band, and a 6-ink palette per era.
- `engine/scenes.js` — the print: a fixed base (sky, sun, mountain, hills) plus one stylised landmark per era.
- `FACTS.md` — a source for every claim in the narration.
- `sh build.sh` — narration → speech check → timeline and subtitles → score → mix → picture → master (−14 LUFS).

A new country = copy the folder, rewrite `voice/lines.json`, `content.json` and `FACTS.md`, and draw that country's
landmarks in `engine/scenes.js` (and, where it fits, change the base landscape).

The build needs the Lemo-Opuscar library with its voice and music tiers (`LIB=<library path> sh build.sh`).
