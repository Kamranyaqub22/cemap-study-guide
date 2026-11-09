"""compose.py · original score for the print, from events.json → music/score.wav (48 kHz stereo).
Instruments by place: koto ostinato and shamisen phrases (physical modelling, core/audio/pluck.py),
synthesised taiko (drum hits on every re-ink) and a breathy bamboo-flute line for 1945 and the wall.
Each era is a section in its own pulse that fills the era exactly, so every sweep lands on a downbeat.
1945: the music is gone (near-silence: wind and the flute); the first loud sound after it is the 1964 snap."""
import json, os, sys
import numpy as np, soundfile as sf
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.environ.get('LIB', '/root/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add
from pluck import pluck, strum

EVJ = json.load(open(os.path.join(D, 'events.json'))); EV = EVJ['ev']; DUR = EVJ['dur']
TL = json.load(open(os.path.join(D, 'timeline.json')))
N = int((DUR + 3) * SR); out = np.zeros((N, 2))
rng = np.random.default_rng(5)

# scales (D): yo (bright, open) and in / miyako-bushi (dark) — MIDI note numbers
YO = [50, 52, 55, 57, 59, 62, 64, 67, 69, 71, 74]
IN = [50, 51, 55, 57, 58, 62, 63, 67, 69, 70, 74]

def taiko(v=1.0, f=62, d=1.2):
    x = t_(d); fr = f * (1 + .6 * np.exp(-x / .03))
    body = np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(d, .28)
    skin = lp(noise(d), 900) * env_exp(d, .03) * .6
    rim = bp(noise(d), 1800, 5000) * env_exp(d, .008) * .25
    return norm(body + skin + rim) * v
def shime(v=1.0):                                   # small high drum for the pulse
    d = .18; x = t_(d)
    return norm(np.sin(2 * np.pi * 330 * x * (1 - .3 * x)) * env_exp(d, .04) + bp(noise(d), 1500, 6000) * env_exp(d, .01) * .7) * v
def flute(m, d, v=.5, att=.25):                      # breathy bamboo flute: sine + band noise, slow vibrato, pitch bend into the note
    x = t_(d); f0 = 440 * 2 ** ((m - 69) / 12)
    f = f0 * 2 ** ((-.6 * np.exp(-x / .15) + .15 * np.sin(2 * np.pi * 5 * x) * np.clip((x - .4) / .5, 0, 1)) / 12)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + .25 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    br = bp(noise(d), f0 * .8, min(f0 * 4, 9000)) * .5
    e = np.minimum(1, x / att) * np.minimum(1, (d - x) / .35)
    return (tone * .7 + br) * e * v

def put(x, t, g=1.0, pan=0.0):
    if t < 0 or t > DUR + 2: return
    add(out, x, t, g, pan)

eras = TL['eras']
starts = [e['sweep'] + e['swdur'] for e in eras]      # each section begins as its sweep lands
ends = [e['sweep'] for e in eras[1:]] + [TL['end']['wall']]
sil = [e for e in EV if e['type'] == 'silence']
sil_a, sil_b = (sil[0]['t'], sil[0]['until']) if sil else (1e9, 1e9)

# ---- cold open (0 → first sweep): a drum on frame one, a fast koto run and a driving pulse under the hook ----
put(taiko(1.0, 56, 1.4), 0.0, .7, 0)
c_end = eras[0]['sweep']
for k, m in enumerate([62, 64, 67, 69, 71, 74, 76, 79]): put(pluck('koto', m, vel=.6 + .03 * k), .05 + k * .07, .45, -.4 + .1 * k)
st0 = c_end / max(1, round(c_end / STEP0)) if (STEP0 := .3125) else .3125
k = 0
while k * st0 < c_end - .05:
    t = k * st0
    put(pluck('koto', YO[[0, 4, 2, 4][k % 4] + 3], vel=.5), t, .35, .3 if k % 2 else .1)
    if k % 2: put(shime(.6), t, .08, .4)
    if k % 4 == 0 and k: put(taiko(.6, 70, .6), t, .2, -.2)
    k += 1

# ---- one section per era ----
STEP = .3125                                                       # target eighth (96 bpm); stretched so the section fills exactly
for i, e in enumerate(eras):
    a = starts[i]
    b = ends[i]
    if b <= a + .5: continue
    dark = e['scene'] in ('ships', 'ruin')
    sc = IN if dark else YO
    if e.get('silence'):                                           # 1945: no music, only a slow flute over the wind
        put(flute(57, 2.6, .5), a + .3, .35, -.2); put(flute(58, 1.6, .45), a + 3.0, .3, -.2); put(flute(55, 2.4, .4), a + 4.5, .28, -.2)
        continue
    n = max(8, int(round((b - a) / STEP))); st = (b - a) / n
    root = sc[0] if i % 2 == 0 else sc[2] - 12 + 12          # alternate the bass between D and G
    pat = [0, 4, 2, 4, 1, 4, 2, 3] if not dark else [0, 3, 1, 3, 0, 2, 1, 3]
    for k in range(n):
        t = a + k * st
        if t >= sil_a - .05 and t < sil_b: continue
        deg = pat[k % 8] + (2 if (k // 8) % 2 else 0)
        m = sc[min(deg + 3, len(sc) - 1)]
        vel = .45 + .15 * (k % 4 == 0)
        put(pluck('koto', m, vel=vel), t, .42, .3 if k % 2 else .1)
        if k % 8 == 0: put(pluck('koto', root - 12 if root > 45 else root, vel=.6), t, .5, -.1)
        if i >= 1 and k % 2 == 1: put(shime(.6), t, .07 + .02 * (i >= 6), .4)
        if i >= 2 and k % 8 == 4: put(taiko(.6, 70, .6), t, .16, -.2)
    # a shamisen phrase answering the narration, after the year lands
    ph = [sc[5], sc[4], sc[3], sc[4]] if not dark else [sc[6], sc[5], sc[4], sc[3]]
    t0 = e['year_t'] + .25 if i else e['year_t'] + .1
    for k, m in enumerate(ph): put(pluck('shamisen', m, vel=.65), t0 + k * st * 2, .3, -.35)
    if e['scene'] == 'ships':                                      # heavier drums as the ships arrive
        for k in range(0, n, 4): put(taiko(.8, 55, .9), a + k * st, .3, 0)
    if e['scene'] == 'city':                                       # brighter: a high koto counter-line
        for k in range(2, n, 4): put(pluck('koto', sc[min(9, 6 + (k // 4) % 3)], vel=.5), a + k * st + st * .5, .3, .5)

# ---- hits: every sweep lands on a drum; the 1964 snap is the loudest downbeat ----
for e in EV:
    if e['type'] == 'sweep' and not (sil_a <= e['t'] < sil_b - .01):
        land = e['t'] + e['dur']
        put(taiko(.9, 60 if e['scene'] != 'train' else 52, 1.4), land, .55 if e['scene'] != 'train' else .75, 0)
    if e['type'] == 'snap':
        put(taiko(1.0, 48, 1.8), e['t'], 1.0, 0); put(taiko(1.0, 66, 1.2), e['t'] + .01, .6, -.3)
        put(strum('koto', [50, 57, 62, 64, 69, 74], 2.5, vel=.85, spread=.018), e['t'], .7, .2)
# ---- the wall: the flute returns, a last open chord when the card is printed ----
w = TL['end']['wall']
put(flute(69, 2.0, .45), w + .1, .14, .2)
card = TL['end']['card']
vo_end = TL['vo']['L10'] + json.load(open(os.path.join(D, 'out/voice/dur.json')))['L10']
put(taiko(.6, 58, 1.2), card, .22, 0)                              # soft under the last line
res = max(card, vo_end + .05)                                      # the resolving chord waits for the question to finish
put(taiko(.9, 52, 1.6), res, .6, 0)
put(strum('koto', [50, 55, 57, 62, 64, 69], 3.0, vel=.8, spread=.03), res, .75, .1)
put(pluck('shamisen', 74, vel=.6), res + .6, .3, -.3)

out = out[:int((DUR + 1) * SR)]
pk = np.abs(out).max(); out *= .8 / (pk + 1e-9)
sf.write(os.path.join(D, 'music/score.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('score.wav', round(len(out) / SR, 2), 's, peak normalised')
