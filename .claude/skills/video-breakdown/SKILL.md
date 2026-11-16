---
name: video-breakdown
description: Review a reference video (YouTube link or uploaded file) and explain how it is made and how to make something similar with our code-drawn pipeline. Use when the owner sends a video link and asks to review it, break it down, find out why it went viral, or "how do I make this".
---

# Video breakdown

Goal: learn the *pattern* (structure, pacing, style, sound) of a reference video and turn it into a recipe for our pipeline
(canvas/three.js scenes, Kokoro voice, synthesised music). Never copy a creator's specific look, characters, script or footage.

## 1. Get the material (work in the scratchpad, one new folder per video)
- `pip install -q -U yt-dlp`, then `yt-dlp --write-info-json -f "bv*[height<=1920]+ba/b" --merge-output-format mp4 -o "ref.%(ext)s" <url>`.
- YouTube often answers 403 from cloud machines. Then still get:
  - metadata: `ref.info.json` (title, channel, subscribers, views, likes, comments, upload date, duration, description);
  - captions with timings: `yt-dlp --load-info-json ref.info.json --skip-download --write-subs --write-auto-subs --sub-langs "en,en-orig" --sub-format vtt -o subs`;
  - the storyboard (one thumbnail every ~2 s): `yt-dlp --load-info-json ref.info.json -f sb0 -o sb0.%(ext)s`, unpack the `.mhtml` images
    with Python's `email` module, `hstack` them and upscale to look at them.
  - Tell the owner the review is from thumbnails + captions and offer a frame-level review if they upload the .mp4.
- With the file: frames at scene changes (`ffmpeg -vf "select='gt(scene,0.3)',showinfo"`) plus one every 2 s; transcript with
  `core/tts/asr_check.py`'s whisper (or faster-whisper) for word timings; loudness with `ffmpeg -af ebur128`; motion with `history-shorts/tools/qc.py`.

## 2. Measure
Views ÷ subscribers (how far it travelled), length, words per minute, seconds per shot (shots ÷ length), the first 3 s (hook) word for word,
time stamps / structure beats, caption style and position, camera moves, what stays on screen, sound (music, effects, silence before the climax).

## 3. Write the breakdown (save to `new-channel/references/<channel>-<slug>.md`)
1. What it is (one paragraph, numbers).
2. Why it works: hook, structure, point of view, pacing, sound, timing/news value.
3. How it's made: table of visuals, shot length, camera, captions, narration, sound.
4. How we'd make it: style in our pipeline, topic advice (prefer evergreen history; flag fresh tragedies, real people, copyrighted audio,
   ad-unfriendly subjects), format recipe, rough effort.
5. Offer a short demo in the new style (see `new-channel/demos/`).
