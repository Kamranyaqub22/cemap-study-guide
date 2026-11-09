"""timeline.py · one timeline for picture, score, mix and subtitles, built from the narration.
Reads content.json, voice/lines.json, out/voice/dur.json and out/voice/words.json (asr_check.py).
Writes timeline.json (read by the page, the score and the mix) and <name>.srt.
Each era's re-ink sweep lands on its spoken year (or the start of its line)."""
import json, os, re, sys
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = json.load(open(os.path.join(D, 'content.json')))
LINES = {l['id']: l for l in json.load(open(os.path.join(D, 'voice/lines.json')))}
DUR = json.load(open(os.path.join(D, 'out/voice/dur.json')))
WORDS = json.load(open(os.path.join(D, 'out/voice/words.json')))
GAP, FIRST = .17, .45
order = [C['intro']['line']] + [e['line'] for e in C['eras']] + [C['end']['line']]
vo, t = {}, FIRST
for lid in order: vo[lid] = round(t, 3); t += DUR[lid] + GAP
def word_at(lid, key):
    for w, a, b in WORDS[lid]:
        if re.sub(r'[^0-9a-z]', '', w.lower()).startswith(key.lower()): return max(0, a), b
    sys.exit(f'word {key!r} not found in {lid}')
eras = []
for i, e in enumerate(C['eras']):
    lid = e['line']
    if e.get('at'): a, b = word_at(lid, e['at']); land = vo[lid] + a
    else: a, b = 0, .4; land = vo[lid] + .1
    sweep = round(land - .42, 3)                                     # the blade finishes as the year is spoken
    eras.append({**{k: v for k, v in e.items() if k != 'at'}, 'i': i, 'vo': vo[lid], 'sweep': sweep, 'swdur': .45 if not e.get('silence') else .7,
                 'label_t': round(land + .05, 3), 'year_t': round(land + .2, 3), 'snap_t': round(vo[lid] + b + .1, 3) if e.get('snap') else None})
for i, e in enumerate(eras): e['t1'] = eras[i + 1]['sweep'] if i + 1 < len(eras) else vo[C['end']['line']] - .15
first = eras[0]; first['sweep'] = None; first['land_t'] = round(first['vo'] - .25, 3); first['label_t'] = round(first['vo'] + .35, 3); first['year_t'] = round(first['vo'] + .55, 3)
end_vo = vo[C['end']['line']]
end = {'wall': round(end_vo - .15, 3), 'wall_dur': 1.2, 'card': round(end_vo + .85, 3), 'text': C['end']['text']}
total = round(end['card'] + .45 + 3.0, 2)
# subtitles: the line's own text ('sub'), split at '|'; the second part starts at the matching spoken word
subs = []
def norm(w): return re.sub(r'[^0-9a-z]', '', w.lower())
for lid in order:
    parts = [p.strip() for p in LINES[lid]['sub'].split('|')]; ws = WORDS[lid]
    starts = [vo[lid] - .08]
    if len(parts) > 1:
        key = norm(parts[1].split()[0]); n_before = len(parts[0].split())
        cand = [i for i, w in enumerate(ws) if norm(w[0]).startswith(key[:4]) and i >= n_before - 3]
        i = cand[0] if cand else n_before
        starts.append(vo[lid] + max(0, ws[i][1]) - .08)
    for k, txt in enumerate(parts):
        sp_end = vo[lid] + (ws[-1][2] if k == len(parts) - 1 else ws[max(0, [i for i, w in enumerate(ws) if vo[lid] + w[1] - .08 < starts[k + 1]][-1])][2])
        subs.append({'line': lid, 't0': round(starts[k], 3), 'text': txt, 'speech_end': round(sp_end, 3)})
for i, s in enumerate(subs):
    nxt = subs[i + 1]['t0'] - .04 if i + 1 < len(subs) else total
    s['t1'] = round(nxt if i + 1 < len(subs) else total, 3)
    if s['t1'] - s['t0'] < 1.8 - 1e-6: print('WARNING short cue', s)
def wrap(txt, n=34):
    if len(txt) <= n: return [txt]
    ws = txt.split(); best = None
    for k in range(1, len(ws)):
        a, b = ' '.join(ws[:k]), ' '.join(ws[k:])
        score = abs(len(a) - len(b)) - (6 if a[-1] in ',.' else 0)
        if best is None or score < best[0]: best = (score, [a, b])
    return best[1]
for s in subs: s['lines'] = wrap(s['text'])
TL = {'dur': total, 'vo': vo, 'eras': eras, 'end': end, 'subs': subs, 'country': C['country'], 'sub': C['sub'], 'paper': C['paper'],
      'intro': {'vo': vo[C['intro']['line']]}}
json.dump(TL, open(os.path.join(D, 'timeline.json'), 'w'), indent=1)
def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}'
name = os.path.basename(D)
with open(os.path.join(D, f'{name}.srt'), 'w') as f:
    for i, s in enumerate(subs): f.write(f"{i + 1}\n{ts(s['t0'])} --> {ts(s['t1'])}\n" + '\n'.join(s['lines']) + '\n\n')
print('duration', total)
for e in eras: print(f"{e['scene']:8s} sweep {e['sweep']}  vo {e['vo']}  year {e['year_t']}  t1 {e['t1']}")
for s in subs: print(f"{s['t0']:6.2f}-{s['t1']:6.2f} ({s['t1']-s['t0']:.2f}s) {s['lines']}")
