"""compose.py · GREECE score (bouzouki, Cretan lyra, daouli and toubeleki; a 7/8 kalamatianos, counted 3+2+2;
D minor with a raised fourth (a dromos colour) from Knossos to 1460, D major from 1830), from events.json + timeline.json → music/score.wav.
Bouzouki by physical modelling (core/audio/pluck.py: the bright picked 'pipa' string, metallic and short, with tremolo on long notes);
the lyra is a bowed, nasal string with a fast vibrato; the daouli is a deep two-headed drum (a boom and a stick click), the toubeleki
a goblet drum. Each era is a section that fills it exactly, so every sweep lands on the start of a 7/8 bar. 508 BC is the signature:
a lyra line runs back and forth with the boustrophedon wipe; 1460 is silence (a lone lyra); 1830 is the comeback (the key turns major)."""
import json, os, sys
import numpy as np, soundfile as sf
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.environ.get('LIB', '/root/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add
from pluck import pluck

EVJ = json.load(open(os.path.join(D, 'events.json'))); EV = EVJ['ev']; DUR = EVJ['dur']
TL = json.load(open(os.path.join(D, 'timeline.json')))
VODUR = json.load(open(os.path.join(D, 'out/voice/dur.json')))
N = int((DUR + 3) * SR); out = np.zeros((N, 2))

MIN = [50, 52, 53, 56, 57, 58, 61, 62, 64, 65, 68, 69, 70, 73, 74]   # D minor, raised 4th and 7th
MAJ = [50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69, 71, 73, 74]   # D major
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

def bouz(m, vel=.6, dur=.3, trem=None):
    kw = dict(t60=1.6, bright=.95, bmix=.4)
    if trem: kw['trem'] = trem
    return pluck('pipa', m, dur, vel, **kw)
def lyra(m, d, v=.5, glide=None):                                         # bowed and nasal, fast vibrato
    x = t_(d); f = hz(m) * np.ones_like(x)
    if glide: f = hz(m) * 2 ** ((glide - m) / 12 * np.clip(x / d, 0, 1))
    f = f * 2 ** (.2 / 12 * np.sin(2 * np.pi * 6.5 * x) * np.clip((x - .1) / .2, 0, 1))
    ph = np.cumsum(f) / SR; saw = 2 * (ph % 1) - 1
    y = bp(saw, 400, 3000) + bp(saw, 1100, 1600) * .6 + lp(noise(d), 2500) * np.exp(-x / .04) * .25
    return lp(y, 3300) * np.minimum(1, x / .05) * np.minimum(1, np.maximum(0, d - x) / .08) * v
def daouli(v=1.0, low=True):
    d = .5 if low else .1; x = t_(d)
    if low: return norm(np.sin(2 * np.pi * np.cumsum(70 * (1 + .6 * np.exp(-x / .02))) / SR) * env_exp(d, .18) + lp(noise(d), 700) * env_exp(d, .01) * .3) * v
    return norm(bp(noise(d), 800, 2800) * env_exp(d, .012) + np.sin(2 * np.pi * 900 * x) * env_exp(d, .01) * .4) * v
def toub(v=1.0, dum=False):
    d = .25; x = t_(d)
    if dum: return norm(np.sin(2 * np.pi * np.cumsum(110 * (1 + .3 * np.exp(-x / .02))) / SR) * env_exp(d, .12)) * v
    return norm(np.sin(2 * np.pi * 520 * x) * env_exp(d, .05) + bp(noise(d), 1500, 3500) * env_exp(d, .006) * .5) * v
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
STEP = .16                                                                 # one eighth; a 7/8 bar is 7 of these, felt 3+2+2
BEAT = {0: 'D', 3: 'k', 5: 'k'}                                            # the long beat, then two short ones

# ---- cold open: a daouli boom on frame one, a lyra long note turning with the camera, bouzouki tremolo rising ----
put(boom(1.0, 46, 1.8), 0.0, .6, 0); put(daouli(1.0), 0, .3, 0)
c_end = eras[0]['sweep']
put(lyra(62, c_end * .55, .5, glide=65), .2, .3, -.2); put(lyra(64, c_end * .45, .5, glide=62), .2 + c_end * .55, .3, -.2)
for k, m in enumerate([62, 65, 69, 74]): put(bouz(m, .5, c_end / 4 + .2, trem=14), k * c_end / 4, .2, .25)

# ---- one section per era ----
for i, e in enumerate(eras):
    a, b = starts[i], ends[i]
    if b <= a + .5: continue
    major = e['scene'] in ('ships', 'stadium', 'today')
    sc = MAJ if major else MIN
    n = max(7, int(round((b - a) / STEP / 7)) * 7); st = (b - a) / n
    mel = [7, 8, 9, 8, 7, 6, 7, 9, 10, 9, 8, 7, 6, 4] if not major else [7, 9, 11, 12, 11, 9, 7, 9, 11, 9, 7, 6, 7, 4]
    for k in range(n):
        t = a + k * st
        if sil_a - .05 <= t < sil_b: continue
        bk = k % 7; bar = k // 7
        if bk in BEAT:
            if BEAT[bk] == 'D': put(daouli(.9), t, .3, -.1); put(toub(.8, True), t, .12, .2)
            else: put(toub(.8), t, .1 + .02 * major, .25); put(daouli(.7, False), t, .05, -.2)
        if bk in (1, 2, 4, 6): put(toub(.5), t, .05, .3)
        if bk in (0, 3, 5): put(bouz(sc[min(mel[(bar * 3 + [0, 3, 5].index(bk)) % 14], len(sc) - 1)], .55), t, .28, .3)
        if bk == 0: put(bouz(sc[0] - 12, .6, .6), t, .25, -.15); put(lyra(sc[[4, 2, 5, 4][bar % 4] + 7], st * 6.6, .45), t, .1, -.3)
    if e.get('silence'):                                                   # 1460: the dance stops; a lone lyra phrase falls
        t0 = e.get('silence_t', a); put(lyra(62, 3.6, .55, glide=57), t0 + .15, .34, 0)
    else:                                                                  # a bouzouki tremolo answering the year
        for k, m in enumerate([sc[9], sc[8], sc[7]] if not major else [sc[7], sc[9], sc[11]]):
            put(bouz(m, .55, .45 if k < 2 else 1.0, trem=15), e['year_t'] + .3 + k * st * 3, .2, -.35)

# ---- hits: every re-ink lands on the daouli; 508 BC: the lyra runs back and forth with the wipe; 1830 turns major ----
for e in EV:
    if e['type'] == 'sweep' and not (sil_a <= e['t'] < sil_b - .01):
        land = e['t'] + e['dur']
        if e['scene'] == 'demos':
            row = e['dur'] / 6
            for r in range(6): put(lyra(62 + (0 if r % 2 == 0 else 7), row + .02, .5, glide=62 + (7 if r % 2 == 0 else 0)), e['t'] + r * row, .26, -.5 if r % 2 == 0 else .5)
        put(boom(.9, 50, 1.4), land, .45 if e['scene'] != 'ships' else .7, 0); put(daouli(1.0), land, .3, 0)
        if e['scene'] == 'ships':
            for k, m in enumerate([38, 50, 57, 62, 66, 69]): put(bouz(m, .7, .9), land + .03 * k, .3, -.3 + .12 * k)
# ---- the wall: the lyra holds; the resolving chord waits until the question is spoken ----
w = TL['end']['wall']
put(lyra(66, 2.4, .45), w + .1, .14, .2)
card = TL['end']['card']; vo_end = TL['vo']['L10'] + VODUR['L10']
put(boom(.6, 50, 1.2), card, .2, 0)
res = max(card, vo_end + .05)
put(boom(.9, 43, 1.6), res, .55, 0); put(daouli(1.0), res, .4, 0)
for k, m in enumerate([38, 50, 57, 62, 66, 69]): put(bouz(m, .7, 1.4, trem=14 if k > 3 else None), res + .04 * k, .3, -.4 + .16 * k)

out = out[:int((DUR + 1) * SR)]
out *= .8 / (np.abs(out).max() + 1e-9)
sf.write(os.path.join(D, 'music/score.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('score.wav', round(len(out) / SR, 2), 's, peak normalised')
