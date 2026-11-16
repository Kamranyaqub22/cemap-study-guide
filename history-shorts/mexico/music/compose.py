"""compose.py · MEXICO score (marimba, guitar, guitarrón, maracas and a cajón-like box; a son/huapango feel in sesquiáltera:
bars alternate 6/8 and 3/4 over the same six eighths; A minor from the Olmecs to 1521, A major from 1810),
from events.json + timeline.json → music/score.wav (48 kHz stereo).
Marimba bars are modal synthesis (a fundamental and the 4th and 10th partials of a tuned bar, short wooden decay, double-stroke rolls on
long notes); the guitar and guitarrón by physical modelling (core/audio/pluck.py: 'nylon_guitar' strums, 'upright_bass_pizz' an octave down);
maracas are short shaken noise (kept under 4 kHz). Each era fills its section exactly, so every sweep lands on a downbeat.
1521 is silence (one low marimba roll); 1810 is the signature: as the papel picado strings drop, a rising marimba roll and
a full strum land with the last string; the key turns major there."""
import json, os, sys
import numpy as np, soundfile as sf
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.environ.get('LIB', '/root/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add
from pluck import pluck, strum

EVJ = json.load(open(os.path.join(D, 'events.json'))); EV = EVJ['ev']; DUR = EVJ['dur']
TL = json.load(open(os.path.join(D, 'timeline.json')))
VODUR = json.load(open(os.path.join(D, 'out/voice/dur.json')))
N = int((DUR + 3) * SR); out = np.zeros((N, 2))

MIN = [57, 59, 60, 62, 64, 65, 68, 69, 71, 72, 74, 76, 77, 80, 81]   # A harmonic minor
MAJ = [57, 59, 61, 62, 64, 66, 68, 69, 71, 73, 74, 76, 78, 80, 81]   # A major
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

def mar(m, v=.6, d=.6):                                                   # a tuned wooden bar
    x = t_(d); f = hz(m)
    y = np.sin(2 * np.pi * f * x) * np.exp(-x / .35) + .35 * np.sin(2 * np.pi * f * 3.98 * x) * np.exp(-x / .06) + .12 * np.sin(2 * np.pi * f * 9.9 * x) * np.exp(-x / .02)
    return lp(y + lp(noise(d), 2000) * np.exp(-x / .004) * .3, 3600) * v
def roll(m, d, v=.5, rate=.07, up=None):                                   # double-stroke roll; with up=, it climbs
    o = np.zeros(int((d + .7) * SR)); k = 0; t = 0.
    while t < d:
        mm = m if up is None else m + (up - m) * t / d
        x = mar(mm, v * (.8 + .2 * (k % 2)), .5); i0 = int(t * SR); o[i0:i0 + len(x)] += x[:len(o) - i0]; t += rate; k += 1
    return o
def guitar(ms, v=.6): return strum('nylon_guitar', ms, .6, v, spread=.018)
def gbass(m, v=.7): return pluck('upright_bass_pizz', m, .5, v)
def maraca(v=1.0):
    d = .07; x = t_(d); return norm(bp(noise(d), 1500, 3800) * env_exp(d, .02)) * v
def box(v=1.0, low=True):
    d = .2 if low else .08; x = t_(d)
    if low: return norm(np.sin(2 * np.pi * np.cumsum(90 * (1 + .5 * np.exp(-x / .015))) / SR) * env_exp(d, .07)) * v
    return norm(bp(noise(d), 900, 3000) * env_exp(d, .015)) * v
def boom(v=1.0, f=50, d=1.4):
    x = t_(d); fr = f * (1 + .7 * np.exp(-x / .025))
    return norm(np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(d, .3) + lp(noise(d), 1000) * env_exp(d, .03) * .5) * v
def put(x, t, g=1.0, pan=0.0):
    if 0 <= t <= DUR + 2: add(out, x, t, g, pan)

eras = TL['eras']
starts = [e['sweep'] + e['swdur'] for e in eras]
ends = [e['sweep'] for e in eras[1:]] + [TL['end']['wall']]
sil = [e for e in EV if e['type'] == 'silence']
sil_a, sil_b = (sil[0]['t'], sil[0]['until']) if sil else (1e9, 1e9)
STEP = .17                                                                 # one eighth; six to a bar
ACC = [{0, 3}, {0, 2, 4}]                                                  # sesquiáltera: 6/8 (two groups of three), then 3/4 (three of two)

# ---- cold open: a box hit on frame one, a marimba roll swelling, guitar and maracas entering for the first print ----
put(boom(1.0, 46, 1.6), 0.0, .6, 0); put(box(1.0), 0, .3, 0)
c_end = eras[0]['sweep']
put(roll(69, c_end * .5, .45), .2, .3, .2); put(roll(72, c_end * .45, .45, up=76), .2 + c_end * .5, .3, .2)
for k in range(int(c_end * .4 / STEP)): put(maraca(.8), c_end * .6 + k * STEP, .05 + .04 * k / 10, .35)

# ---- one section per era ----
for i, e in enumerate(eras):
    a, b = starts[i], ends[i]
    if b <= a + .5: continue
    major = e['scene'] in ('grito', 'revolution', 'mural', 'today')
    sc = MAJ if major else MIN
    n = max(6, int(round((b - a) / STEP / 6)) * 6); st = (b - a) / n
    mel = [7, 9, 10, 9, 7, 6, 7, 9, 11, 10, 9, 7] if not major else [7, 9, 11, 12, 11, 9, 7, 9, 11, 14, 12, 11]
    for k in range(n):
        t = a + k * st
        if sil_a - .05 <= t < sil_b: continue
        bk = k % 6; bar = k // 6; acc = ACC[bar % 2]
        put(maraca(.8 if bk in acc else .5), t, .05, .35)
        if bk in acc: put(box(.9, bk == 0), t, .16 if bk == 0 else .08, -.2)
        if bk == 0: put(gbass(sc[0] - 24 if bar % 2 == 0 else sc[4] - 24), t, .32, -.1); put(guitar([sc[0] - 12, sc[2] - 12, sc[4] - 12, sc[0]] if bar % 2 == 0 else [sc[4] - 12, sc[6] - 12, sc[1], sc[4]], .55), t, .2, .1)
        if bk in acc and bk: put(guitar([sc[0] - 12, sc[2] - 12, sc[4] - 12], .4), t, .12, .1)
        m = sc[min(mel[(bar * 2 + bk // 3) % 12] + (bk % 3 == 2), len(sc) - 1)]
        if bk % 2 == 0 or major: put(mar(m, .55), t, .26, .25 if k % 2 else .05)
    if e.get('silence'):                                                   # 1521: the music stops; one low marimba roll fades
        t0 = e.get('silence_t', a); x = roll(45, 2.6, .5, .09); put(x * np.exp(-np.arange(len(x)) / SR / 1.2), t0 + .15, .38, 0)
    else:                                                                  # a marimba roll answering the year
        for k, m in enumerate([sc[9], sc[8], sc[7]] if not major else [sc[7], sc[9], sc[11]]): put(roll(m, .35 if k < 2 else .8, .5), e['year_t'] + .3 + k * st * 3, .2, -.35)

# ---- hits: every re-ink lands on the box; 1810: a rising roll while the strings drop, a full strum as they land ----
for e in EV:
    if e['type'] == 'sweep' and not (sil_a <= e['t'] < sil_b - .01):
        land = e['t'] + e['dur']
        if e['scene'] == 'grito':
            put(lp(lp(roll(57, e['dur'], .5, .06, up=81), 2200), 2200), e['t'], .32, -.2)
            for r in range(5): put(box(.8, False), e['t'] + r * e['dur'] / 5, .12, .3)
        put(boom(.9, 50, 1.4), land, .45 if e['scene'] != 'grito' else .7, 0); put(box(1.0), land, .3, 0)
        if e['scene'] == 'grito':
            put(guitar([45, 52, 57, 61, 64, 69], .8), land, .4, .1); put(gbass(33, .9), land, .4, 0)
# ---- the wall: a marimba roll holds; the resolving chord waits until the question is spoken ----
w = TL['end']['wall']
put(roll(73, 2.2, .4), w + .1, .14, .2)
card = TL['end']['card']; vo_end = TL['vo']['L10'] + VODUR['L10']
put(boom(.6, 50, 1.2), card, .2, 0)
res = max(card, vo_end + .05)
put(boom(.9, 45, 1.6), res, .55, 0); put(gbass(33, .9), res, .45, 0); put(guitar([45, 52, 57, 61, 64, 69], .8), res, .4, .1)
for k, m in enumerate([69, 73, 76, 81]): put(mar(m, .6, .9), res + .05 + k * .08, .3, -.3 + .2 * k)

out = out[:int((DUR + 1) * SR)]
out *= .8 / (np.abs(out).max() + 1e-9)
sf.write(os.path.join(D, 'music/score.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('score.wav', round(len(out) / SR, 2), 's, peak normalised')
