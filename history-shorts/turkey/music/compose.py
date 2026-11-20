"""compose.py · TURKEY score (a reedy double-reed tune on oboe in the role of the zurna, a plucked zither line on harp in the role
of the kanun, a bassoon drone, davul on bass drum and a frame drum, in 9/8 aksak — 2+2+2+3 — the karşılama rhythm;
D Hicaz (D E♭ F♯ G A B♭ C) from Göbekli Tepe to the 1500s, D major from 1923),
from events.json + timeline.json → music/score.wav (48 kHz stereo).
Recorded samples through core/audio/sampler.py (VSCO 2 CE and VCSL, CC0). Each era fills its section exactly, so every sweep
lands on a downbeat; the music rests in each sweep. 1453 is silence (one low bassoon note and a single davul stroke fade);
1923 is the signature: as the tiles flip in their diagonal wave, the harp climbs one note per wave-front, and a full chord
with davul lands as the last tile turns; the mode turns major there."""
import json, os, sys
import numpy as np, soundfile as sf
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.environ.get('LIB', '/root/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core/audio')); sys.path.insert(0, LIB)
from sfx import SR, lp, add
from core.audio import sampler as S
S.seed(11)

EVJ = json.load(open(os.path.join(D, 'events.json'))); EV = EVJ['ev']; DUR = EVJ['dur']
TL = json.load(open(os.path.join(D, 'timeline.json')))
VODUR = json.load(open(os.path.join(D, 'out/voice/dur.json')))
N = int((DUR + 3) * SR); out = np.zeros((N, 2))

HIC = [62, 63, 66, 67, 69, 70, 72, 74, 75, 78, 79, 81, 82, 84, 86]   # D Hicaz (upper octave for the oboe)
MAJ = [62, 64, 66, 67, 69, 71, 73, 74, 76, 78, 79, 81, 83, 85, 86]   # D major

def note(inst, m, d, v=.6, **kw):
    try: return S.note(inst, m, d, vel=v, **kw)
    except Exception as e: print('note', inst, m, e); return np.zeros(int(.1 * SR), np.float32)
def hit(inst, var=None, v=.7, d=None):
    try: return S.hit(inst, var, v, d)
    except Exception as e: print('hit', inst, var, e); return np.zeros(int(.1 * SR), np.float32)
def davul(v=.8, low=True): return hit('bass_drum', None, v, .6) if low else hit('frame_drum', 'small', v * .8, .3)
def chord(inst, ms, d, v=.5, att=0):
    xs = [note(inst, m, d, v, attack=att) for m in ms]; n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o / np.sqrt(len(xs))
def put(x, t, g=1.0, pan=0.0, until=None):
    if until is not None:
        n = max(0, int((until - t) * SR))
        if n <= 0: return
        if len(x) > n: x = x[:n].copy(); f = min(len(x), int(.06 * SR)); x[-f:] *= np.linspace(1, 0, f)
    if 0 <= t <= DUR + 2: add(out, x, t, g, pan)

eras = TL['eras']
starts = [e['sweep'] + e['swdur'] for e in eras]
ends = [e['sweep'] for e in eras[1:]] + [TL['end']['wall']]
sil = [e for e in EV if e['type'] == 'silence']
sil_a, sil_b = (sil[0]['t'], sil[0]['until']) if sil else (1e9, 1e9)
STEP = .165                                                                # one quaver; nine to a bar
LOW = {0, 6}; HIGH = {2, 4, 8}                                              # 2+2+2+3: DÜM . tek . tek . DÜM . . tek

# ---- cold open (the whip pan): a davul stroke on frame one, a harp run sweeping with the camera, the drone and the drums entering ----
c_end = eras[0]['sweep']
put(davul(1.0), 0.0, .7, 0)
for k, m in enumerate([50, 55, 57, 62, 63, 66, 67, 69, 74]): put(note('harp', m, .6, .6), .02 + k * .09, .35, -.5 + .11 * k, until=c_end)
put(note('bassoon', 38, c_end, .45, attack=.4), .6, .3, -.1, until=c_end)
n0 = int((c_end - 1.6) / STEP)
for k in range(n0):
    bk = k % 9
    if bk in LOW: put(davul(.7), 1.6 + k * STEP, .3, -.1, until=c_end)
    elif bk in HIGH: put(davul(.6, False), 1.6 + k * STEP, .2, .3, until=c_end)

# ---- one section per era ----
for i, e in enumerate(eras):
    a, b = starts[i], ends[i]
    if b <= a + .5: continue
    major = e['scene'] in ('republic', 'today')
    sc = HIC if not major else MAJ
    n = max(9, int(round((b - a) / STEP / 9)) * 9); st = (b - a) / n
    tune = [4, 5, 4, 3, 2, 1, 2, 3, 0, 4, 6, 7, 6, 5, 4, 3, 2, 1]
    for k in range(n):
        t = a + k * st
        if sil_a - .05 <= t < sil_b: continue
        bk = k % 9; bar = k // 9
        if bk in LOW: put(davul(.75), t, .32, -.1, until=b)
        if bk in HIGH: put(davul(.6, False), t, .18, .3, until=b)
        if bk in (0, 2, 4, 6):                                             # the tune on the strong beats, held through the long beat
            m = sc[tune[(bar * 4 + bk // 2) % 18] + (2 if major else 0)]
            put(note('oboe', m, st * (3 if bk == 6 else 2) * .95, .55), t, .34, .2, until=b)
        if bk % 2 == 1 or bk == 8: put(note('harp', sc[[0, 2, 4, 2][(k // 2) % 4]] - 12, .3, .5), t, .22, -.35, until=b)   # kanun figures in between
        if bk == 0 and bar % 2 == 0: put(note('bassoon', 38 if not major else 38, st * 17, .4, attack=.2), t, .2, -.1, until=b)
    if e.get('silence'):                                                   # 1453: the music stops on "cannons"; a low note and one davul stroke fade
        t0 = e.get('silence_t', a); put(davul(.9), t0 + .1, .45, 0, until=sil_b)
        x = note('bassoon', 38, 3.0, .5, attack=.3); put(x * np.exp(-np.arange(len(x)) / SR / 1.3), t0 + .2, .45, 0, until=sil_b)
    else:                                                                  # a harp run answering the year
        for k, m in enumerate([sc[7], sc[9], sc[11]]): put(note('harp', m, .5, .6), e['year_t'] + .3 + k * st * 2, .25, .35, until=b)

# ---- hits: every re-ink lands on the davul; 1923: the harp climbs with the tile wave, a full chord lands with the last tile ----
for e in EV:
    if e['type'] == 'sweep' and not (sil_a <= e['t'] < sil_b - .01):
        land = e['t'] + e['dur']
        if e['scene'] == 'republic':
            run = [50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69, 71, 73, 74]
            for k, m in enumerate(run): put(lp(lp(note('harp', m, .4, .55), 3200), 3200), e['t'] + k * (e['dur'] - .08) / len(run), .32, -.6 + .085 * k)
        put(davul(.95), land, .55 if e['scene'] != 'republic' else .8, 0)
        if e['scene'] == 'republic':
            put(chord('oboe', [62, 66, 69, 74], 1.4, .65), land, .35, .2); put(chord('harp', [38, 50, 57, 62, 66], .8, .75), land, .45, -.2)
            put(note('bassoon', 38, 1.6, .6), land, .35, 0)
# ---- the wall: the drone holds; the resolving chord waits until the question is spoken ----
w = TL['end']['wall']
put(note('bassoon', 38, 2.4, .4, attack=.3), w + .1, .25, 0)
card = TL['end']['card']; vo_end = TL['vo']['L10'] + VODUR['L10']
put(davul(.5, False), card, .3, .2)
res = max(card, vo_end + .05)
put(davul(1.0), res, .6, 0); put(chord('oboe', [62, 66, 69, 74], 1.8, .65), res, .35, .2); put(chord('harp', [38, 50, 57, 62, 66, 69], 1.0, .8), res, .45, -.2)

out = out[:int((DUR + 1) * SR)]
out *= .8 / (np.abs(out).max() + 1e-9)
sf.write(os.path.join(D, 'music/score.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('score.wav', round(len(out) / SR, 2), 's, peak normalised')
