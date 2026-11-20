"""compose.py · FRANCE score (harpsichord, string ensemble, timpani; a baroque minuet in 3/4: bass on the downbeat, chords on two
and three, a harpsichord tune in quavers; D Dorian from the cave to Versailles, D major from 1789),
from events.json + timeline.json → music/score.wav (48 kHz stereo).
Real instrument samples through core/audio/sampler.py (VSCO 2 CE and VCSL, CC0): harpsichord, violins, violas, cellos and
pizzicato basses, timpani. Each era fills its section exactly, so every sweep lands on a downbeat; the music rests during each
sweep (no bright sound in the sweep window). 52 BC is silence (one low cello note fades); 1789 is the signature: while the
fortress wall falls block by block a timpani roll swells under low string tremolo, and a full tutti chord lands with the last
block; the key turns major there."""
import json, os, sys
import numpy as np, soundfile as sf
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.environ.get('LIB', '/root/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core/audio')); sys.path.insert(0, LIB)
from sfx import SR, t_, env_exp, lp, noise, norm, add
from core.audio import sampler as S
S.seed(7)

EVJ = json.load(open(os.path.join(D, 'events.json'))); EV = EVJ['ev']; DUR = EVJ['dur']
TL = json.load(open(os.path.join(D, 'timeline.json')))
VODUR = json.load(open(os.path.join(D, 'out/voice/dur.json')))
N = int((DUR + 3) * SR); out = np.zeros((N, 2))

DOR = [50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76]   # D Dorian
MAJ = [50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69, 71, 73, 74, 76]   # D major

def note(inst, m, d, v=.6, **kw):
    try: return S.note(inst, m, d, vel=v, **kw)
    except Exception as e: print('note', inst, m, e); return np.zeros(int(.1 * SR), np.float32)
def hpsi(m, d=.3, v=.6): return note('harpsichord', m, d, v)
def chord(inst, ms, d, v=.5, att=0):
    xs = [note(inst, m, d, v, attack=att) for m in ms]; n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o / np.sqrt(len(xs))
def timp(v=.7, m=38):
    try: return S.note('timpani', m, 1.2, vel=v)
    except Exception: return S.hit('timpani', None, v)
def put(x, t, g=1.0, pan=0.0, until=None):
    if until is not None:                                                  # stop (with a short fade) before the next sweep
        n = max(0, int((until - t) * SR))
        if n <= 0: return
        if len(x) > n: x = x[:n].copy(); f = min(len(x), int(.06 * SR)); x[-f:] *= np.linspace(1, 0, f)
    if 0 <= t <= DUR + 2: add(out, x, t, g, pan)

eras = TL['eras']
starts = [e['sweep'] + e['swdur'] for e in eras]
ends = [e['sweep'] for e in eras[1:]] + [TL['end']['wall']]
sil = [e for e in EV if e['type'] == 'silence']
sil_a, sil_b = (sil[0]['t'], sil[0]['until']) if sil else (1e9, 1e9)
BEAT = .44                                                                 # a crotchet; three to a bar

# ---- cold open (torchlight): a soft timpani on frame one, a low cello drone, single harpsichord notes climbing in the dark ----
c_end = eras[0]['sweep']
put(timp(.5, 38), 0.0, .5, 0)
put(chord('cellos', [38, 45], c_end + .4, .45, att=.6), .05, .4, -.2, until=c_end)
for k, m in enumerate([62, 65, 69, 67, 69, 72, 74]): put(hpsi(m, .5, .5 + .04 * k), .5 + k * (c_end - 1.0) / 7, .5, .25, until=c_end)

# ---- one section per era: a minuet, bars of three ----
for i, e in enumerate(eras):
    a, b = starts[i], ends[i]
    if b <= a + .5: continue
    major = e['scene'] in ('bastille', 'eiffel', 'today')
    sc = MAJ if major else DOR
    nb = max(3, int(round((b - a) / BEAT / 3)) * 3); bt = (b - a) / nb
    tune = [7, 9, 10, 9, 8, 7, 9, 11, 12, 11, 10, 9] if not major else [7, 9, 11, 12, 11, 9, 11, 13, 14, 12, 11, 9]
    prog = [(0, 2, 4), (3, 5, 7), (4, 6, 8), (0, 2, 4)]                    # i – iv – v – i (I – IV – V – I in the major)
    for k in range(nb):
        t = a + k * bt
        if sil_a - .05 <= t < sil_b: continue
        bk = k % 3; bar = k // 3; ch = prog[bar % 4]
        if bk == 0:
            put(note('contrabass_pizz' if not major else 'cellos_pizz', sc[ch[0]] - 12, .5, .7), t, .5, -.15, until=b)
            put(hpsi(sc[ch[0]] - 12, .4, .65), t, .35, -.3, until=b)
        else:
            put(chord('harpsichord', [sc[ch[1]], sc[ch[2]]], .25, .5), t, .3, -.3, until=b)
        for h in (0, .5):                                                  # the tune in quavers (the second only on beat two)
            if h and bk != 1: continue
            m = sc[min(tune[(bar * 3 + bk) % 12] + (1 if h else 0), len(sc) - 1)]
            put(hpsi(m, .25, .6), t + h * bt, .42, .25, until=b)
        if bk == 0 and bar % 2 == 0:                                       # strings hold the harmony underneath
            put(chord('violas' if not major else 'violins', [sc[ch[0]], sc[ch[1]], sc[ch[2]]], bt * 5.6, .35, att=.25), t, .16 if not major else .2, .1, until=b)
    if e.get('silence'):                                                   # 52 BC: the music stops; one low cello note fades
        t0 = e.get('silence_t', a); x = note('cellos', 38, 3.0, .5, attack=.4); put(x * np.exp(-np.arange(len(x)) / SR / 1.4), t0 + .15, .5, 0, until=sil_b)
    else:                                                                  # a violin phrase answering the year
        ph = [sc[11], sc[10], sc[9]] if not major else [sc[9], sc[11], sc[14]]
        for k, m in enumerate(ph): put(note('violins', m, .4 if k < 2 else 1.0, .55), e['year_t'] + .3 + k * bt, .22, -.35, until=b)

# ---- hits: every re-ink lands on the timpani; 1789: a timpani roll swells as the wall falls, a tutti chord lands with it ----
for e in EV:
    if e['type'] == 'sweep' and not (sil_a <= e['t'] < sil_b - .01):
        land = e['t'] + e['dur']
        if e['scene'] == 'bastille':
            k, t = 0, e['t']
            while t < land - .05:
                put(timp(.35 + .5 * (t - e['t']) / e['dur'], 38), t, .25, -.1 + .2 * (k % 2)); t += .07; k += 1
            put(lp(lp(note('violins_trem', 50, e['dur'] + .2, .5), 3000), 3000), e['t'], .25, .2)
        put(timp(.8, 38), land, .55 if e['scene'] != 'bastille' else .8, 0)
        if e['scene'] == 'bastille':
            put(chord('violins', [62, 66, 69, 74], 1.6, .7), land, .45, .2); put(chord('cellos', [38, 50], 1.6, .7), land, .5, -.2)
            put(chord('harpsichord', [50, 57, 62, 66, 69], .8, .8), land, .5, 0)
# ---- the wall: strings hold; the resolving chord waits until the question is spoken ----
w = TL['end']['wall']
put(chord('violas', [62, 66, 69], 2.4, .4, att=.3), w + .1, .2, .2)
card = TL['end']['card']; vo_end = TL['vo']['L10'] + VODUR['L10']
put(timp(.5, 38), card, .3, 0)
res = max(card, vo_end + .05)
put(timp(.9, 38), res, .6, 0); put(chord('cellos', [38, 50], 2.2, .7), res, .5, -.2); put(chord('violins', [62, 66, 69, 74], 2.2, .65), res, .45, .2)
for k, m in enumerate([62, 66, 69, 74]): put(hpsi(m, .8, .7), res + .05 + k * .09, .45, -.3 + .2 * k)

out = out[:int((DUR + 1) * SR)]
out *= .8 / (np.abs(out).max() + 1e-9)
sf.write(os.path.join(D, 'music/score.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('score.wav', round(len(out) / SR, 2), 's, peak normalised')
