"""compose.py · UNITED KINGDOM score (church bells in change ringing, a brass band, field snare and bass drum; a 4/4 march,
E minor from Stonehenge to the Globe, G major from 1707), from events.json + timeline.json → music/score.wav (48 kHz stereo).
Bells are additive (hum, prime, tierce, quint, nominal partials, each with its own decay); brass is additive with a
filter that opens on the attack (the 'blat'); snare and bass drum are noise and pitched sines. Each era is a section that
fills it exactly, so every sweep lands on a downbeat. The Blitz is silence (one low bell tolls); today is a full peal of
rounds; the 1830 engine has its own chuffing and whistle in the mix."""
import json, os, sys
import numpy as np, soundfile as sf
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.environ.get('LIB', '/root/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add

EVJ = json.load(open(os.path.join(D, 'events.json'))); EV = EVJ['ev']; DUR = EVJ['dur']
TL = json.load(open(os.path.join(D, 'timeline.json')))
VODUR = json.load(open(os.path.join(D, 'out/voice/dur.json')))
N = int((DUR + 3) * SR); out = np.zeros((N, 2))

MINOR = [52, 54, 55, 57, 59, 60, 62, 64, 66, 67, 69, 71, 72, 74, 76]   # E aeolian
MAJOR = [55, 57, 59, 60, 62, 64, 66, 67, 69, 71, 72, 74, 76, 78, 79]   # G major
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

def bell(m, v=.6, d=3.0):                                                  # a tuned church bell
    x = t_(d); f = hz(m); y = np.zeros_like(x)
    for r, a, tau in [(.5, .5, 2.2), (1, .8, 1.4), (1.19, .45, 1.0), (1.5, .3, .8), (2, .7, .6), (2.51, .2, .35), (3.0, .15, .25)]:
        y += a * np.sin(2 * np.pi * f * r * x + r) * np.exp(-x / tau)
    y += lp(noise(d), 3000) * env_exp(d, .004) * .4                          # the clapper
    return lp(y, 3800) * v / 2
def brass(ms, d, v=.5, att=.06):                                           # brass: bright on the attack, mellow on the hold
    x = t_(d); y = np.zeros_like(x)
    k = 2.2 + 4.5 * np.exp(-x / att) * (1 - np.exp(-x / .01)) + .8 * np.minimum(1, x / .3)
    for m in ms:
        f = hz(m) * (1 + .003 * np.sin(2 * np.pi * 5.2 * x) * np.minimum(1, x / .4))
        ph = 2 * np.pi * np.cumsum(f) / SR
        for n in range(1, 11): y += np.sin(n * ph) / n * np.exp(-n / k)
    y = lp(y / len(ms), 3500)
    return y * np.minimum(1, x / .03) * np.minimum(1, np.maximum(0, d - x) / .12) * v
def snare(v=1.0, ghost=False):
    d = .18; x = t_(d)
    body = np.sin(2 * np.pi * 190 * x) * env_exp(d, .03)
    wires = bp(noise(d), 1800, 7000) * env_exp(d, .05 if not ghost else .025)
    return norm(body * .6 + wires) * v * (.35 if ghost else 1)
def bass(v=1.0, f=60, d=.5):
    x = t_(d); fr = f * (1 + .8 * np.exp(-x / .02))
    return norm(np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(d, .16) + lp(noise(d), 600) * env_exp(d, .01) * .3) * v
def boom(v=1.0, f=50, d=1.4):
    x = t_(d); fr = f * (1 + .7 * np.exp(-x / .025))
    return norm(np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(d, .3) + lp(noise(d), 1000) * env_exp(d, .03) * .5) * v
def put(x, t, g=1.0, pan=0.0):
    if 0 <= t <= DUR + 2: add(out, x, t, g, pan)
def rounds(t0, step, notes, g=.32, n=8):                                   # change ringing: bells in strict rotation, pan across the tower
    for k in range(n):
        for j, m in enumerate(notes): put(bell(m, .6, 2.4), t0 + (k * len(notes) + j) * step, g, -.6 + 1.2 * j / max(1, len(notes) - 1))

eras = TL['eras']
starts = [e['sweep'] + e['swdur'] for e in eras]
ends = [e['sweep'] for e in eras[1:]] + [TL['end']['wall']]
sil = [e for e in EV if e['type'] == 'silence']
sil_a, sil_b = (sil[0]['t'], sil[0]['until']) if sil else (1e9, 1e9)
STEP = .25                                                                 # eighths at 120 bpm

# ---- cold open: a bass drum on frame one, brass swelling, the bells ringing rounds over the hook, a snare roll into the first print ----
put(boom(1.0, 48, 1.8), 0.0, .7, 0)
c_end = eras[0]['sweep']
put(brass([43, 50, 55, 59], c_end + .3, .5, .2), .05, .2, -.15)
nb = int((c_end - .6) / (6 * .19))
rounds(.3, .19, [79, 78, 76, 74, 72, 71], .12, nb)
for k in range(10): put(snare(.8, ghost=True), c_end - 1.0 + k * .1, .05 + .012 * k, .2)

# ---- one section per era ----
for i, e in enumerate(eras):
    a, b = starts[i], ends[i]
    if b <= a + .5: continue
    major = e['scene'] in ('union', 'railway', 'today')
    sc = MAJOR if major else MINOR
    n = max(8, int(round((b - a) / STEP))); st = (b - a) / n
    mel = [4, 2, 3, 1, 2, 0, 1, 2] if not major else [4, 5, 6, 4, 7, 6, 5, 4]
    for k in range(n):
        t = a + k * st
        if sil_a - .05 <= t < sil_b: continue
        bar = k // 8
        if k % 8 in (0, 4): put(bass(.9, hz((sc[3] if bar % 2 else sc[0]) - 12)), t, .32, 0)
        if k % 8 in (2, 6): put(snare(.9), t, .11 + .02 * major, .25)
        if k % 8 == 7: put(snare(.7, ghost=True), t, .1, .25)
        if k % 2 == 0: put(bell(sc[min(mel[(k // 2) % 8] + 5 + (2 if bar % 2 else 0), len(sc) - 1)], .5, 1.6), t, .2, -.3 + .15 * ((k // 2) % 4))
        if k % 8 == 0:
            ch = [sc[0] - 12, sc[2], sc[4], sc[7]] if bar % 2 == 0 else [sc[3] - 12, sc[3], sc[5], sc[7]]
            put(brass(ch, st * 7.6, .45, .08), t, .14 + .03 * major, -.2)
    if e.get('silence'):                                                   # the Blitz: the band stops; a single low bell tolls twice
        t0 = e.get('silence_t', a)
        put(bell(40, .8, 4.0), t0 + .15, .5, 0); put(bell(40, .7, 4.0), t0 + 2.6, .4, 0)
    else:                                                                  # a short brass call answering the year
        ph = [sc[7], sc[9], sc[7]] if not major else [sc[7], sc[9], sc[11]]
        for k, m in enumerate(ph): put(brass([m], .45 if k < 2 else 1.0, .5, .05), e['year_t'] + .3 + k * st * 2, .13, .35)

# ---- hits: every re-ink lands on the drum; today is a full peal of rounds; 1707 rings two towers together ----
for e in EV:
    if e['type'] == 'sweep' and not (sil_a <= e['t'] < sil_b - .01):
        land = e['t'] + e['dur']
        put(boom(.9, 50, 1.4), land, .5 if e['scene'] != 'today' else .8, 0)
        if e['scene'] == 'today':
            put(brass([43, 55, 59, 62, 67], 1.6, .6, .05), land, .3, 0)
            rounds(land + .05, .17, [79, 78, 76, 74, 72, 71, 69, 67], .18, 2)
        if e['scene'] == 'union':
            for k, m in enumerate([67, 71, 74, 79]): put(bell(m, .6, 2.6), land + k * .12, .3, -.5 + .33 * k)
# ---- the wall: the brass holds; the resolving chord waits until the question is spoken ----
w = TL['end']['wall']
put(brass([55, 59, 62], 2.4, .45, .3), w + .1, .14, .2)
card = TL['end']['card']; vo_end = TL['vo']['L10'] + VODUR['L10']
put(boom(.6, 50, 1.2), card, .22, 0)
res = max(card, vo_end + .05)
put(boom(.9, 43, 1.6), res, .6, 0); put(brass([43, 55, 59, 62, 67], 2.4, .6, .05), res, .3, .1)
for k, m in enumerate([79, 74, 71, 67]): put(bell(m, .6, 2.8), res + .05 + k * .16, .3, .4 - .27 * k)

out = out[:int((DUR + 1) * SR)]
out *= .8 / (np.abs(out).max() + 1e-9)
sf.write(os.path.join(D, 'music/score.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('score.wav', round(len(out) / SR, 2), 's, peak normalised')
