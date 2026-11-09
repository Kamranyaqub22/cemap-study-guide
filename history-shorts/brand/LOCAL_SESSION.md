# Instructions for the Claude session on the owner's computer (Claude in Chrome)

You are helping the channel owner publish Shorts for the "History in 60 Seconds" series through YouTube Studio in their own
Chrome, where they are already signed in. Never enter passwords; if Google asks to sign in or verify, stop and let the owner do it.
Ask the owner to confirm before anything is published or made public; scheduling is fine once they've confirmed the time.

## Files
They live in the GitHub repo `kamranyaqub22/cemap-study-guide`, branch `claude/blissful-maxwell-08bbnj`, folder `history-shorts/`.
If they are not on this computer, clone that branch or ask the owner to download them into one folder.

## 1. Channel setup (once)
YouTube Studio → Customisation:
- Branding → Picture: upload `history-shorts/brand/channel-logo-800.png`.
- Branding → Banner image: upload `history-shorts/brand/channel-banner-2560x1440.png` (accept the default crop).
- Basic info → Description: paste the description from `history-shorts/brand/CHANNEL.md`. Keywords: Settings → Channel → Basic info.
- Publish the customisation changes.

## 2. Upload and schedule the UAE Short
- Video: `history-shorts/uae/uae.mp4`. Every field is in `history-shorts/uae/UPLOAD.md` (title, description, tags, audience
  = not made for kids, category Education, language English, captions `history-shorts/uae/uae.srt`, comments on).
- Altered or synthetic content: show the owner the question and let them answer.
- Visibility → **Schedule: 10 November 2026, 5:00 PM** in the time zone YouTube Studio shows (the owner's).
- After saving, confirm in Studio → Content that it shows "Scheduled" with that date and time, and tell the owner.
- When it goes live, post and pin the comment from UPLOAD.md (the owner can do this from the phone app).

## Later batches
For each new `history-shorts/<country>/` folder marked `review` in `history-shorts/countries.csv`: once the owner approves the
video, upload it the same way and schedule it for the next free day at 5:00 PM, then mark the row `scheduled`.
