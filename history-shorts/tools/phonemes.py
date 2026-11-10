"""phonemes.py · catch mispronunciations the speech check can't hear.
Whisper writes "live" whether Kokoro says /lɪv/ (we live) or /laɪv/ (live TV), so words spelled the same with two
pronunciations (heteronyms) pass asr_check.py even when they sound wrong. This prints the phonemes Kokoro will use
for every risky word in voice/lines.json and fails on the ones known to come out wrong.
  $LIB/.venv/bin/python history-shorts/tools/phonemes.py history-shorts/<slug>     (build.sh runs it before the voice)
"""
import json, os, re, sys
from kokoro_onnx.tokenizer import Tokenizer

# known wrong in Kokoro/espeak-ng (en-gb): word → (phoneme it gives, why, what to say instead)
BAD = {
    'live': ('laɪv', 'said like "live TV", not "we live"', 'say "living", "call it home", "are home to"'),
    'lives': ('laɪvz', 'said like "nine lives"?', 'say "is home to", "living"'),
}
# spelled the same, said two ways: always look at these (and listen)
WATCH = {'read', 'lead', 'wind', 'wound', 'tear', 'tears', 'close', 'bow', 'row', 'rows', 'minute', 'present', 'record', 'object',
         'content', 'desert', 'refuse', 'use', 'house', 'produce', 'conduct', 'project', 'rebel', 'rebels', 'permit', 'contract',
         'polish', 'august', 'reading', 'nice', 'sow', 'bass', 'dove', 'does', 'moped', 'number', 'entrance', 'invalid', 'separate',
         'estimate', 'graduate', 'moderate', 'resume', 'subject', 'progress', 'conflict', 'console', 'convert', 'export', 'import',
         'increase', 'decrease', 'insult', 'protest', 'suspect', 'upset', 'address', 'combat', 'compound', 'converse', 'desert'}

d = sys.argv[1]
lines = json.load(open(os.path.join(d, 'voice/lines.json')))
tok = Tokenizer(); bad = 0
for l in lines:
    words = re.findall(r"[A-Za-z']+", l['text']); lw = [w.lower() for w in words]
    risky = [w for w in lw if w in BAD or w in WATCH]
    if not risky: continue
    ph = tok.phonemize(l['text'], l.get('lang', 'en-gb'))
    for w in risky:
        if w in BAD:
            bad += 1; print(f"BAD   {l['id']} '{w}': {BAD[w][1]} → {BAD[w][2]}")
        else:
            print(f"CHECK {l['id']} '{w}': spelled the same, said two ways — listen to it")
    print(f"      {l['id']} phonemes: {ph}")
print(f'phonemes: {bad} known mispronunciation(s)')
sys.exit(1 if bad else 0)
