"""compose.py · UAE score, from events.json + timeline.json → music/score.wav (48 kHz stereo).
Instruments by place: an oud-like plucked lute (physical modelling: core/audio/pluck.py, a darker, softer 'pipa' voice),
darbuka in the maqsum rhythm (doum / tek, synthesised), frame-drum hits on every re-ink and a breathy ney.
Maqam Hijaz on D for the old eras, Ajam (major) from the oil strike on. Each era is a section that fills it exactly,
so every sweep lands on a downbeat. The pearl crash is silence (waves and the ney only); the oil strike is the comeback hit;
the 1971 split-fountain sweep is a rising seven-note run, one note per emirate, and the union snap is the loudest hit."""
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

HIJAZ = [50, 51, 54, 55, 57, 58, 60, 62, 63, 66, 67, 69, 70, 72, 74]
AJAM = [50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69, 71, 73, 74]

def oud(m, vel=.6, dur=None): return pluck('pipa', m, dur, vel, damp=.34, bright=.42, t60=2.0, noise=.03)
def oud_strum(ms, vel=.75, spread=.03):
    xs = [oud(m, vel * (1 - .05 * i)) for i, m in enumerate(ms)]
    n = max(len(x) + int(i * spread * SR) for i, x in enumerate(xs)); o = np.zeros(n)
    for i, x in enumerate(xs): o[int(i * spread * SR):int(i * spread * SR) + len(x)] += x
    return o / np.sqrt(len(xs))
def doum(v=1.0):                                              # low, open centre stroke
    d = .5; x = t_(d); f = 95 * (1 + .5 * np.exp(-x / .02))
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .16) + lp(noise(d), 600) * env_exp(d, .02) * .4) * v
def tek(v=1.0):                                               # sharp rim stroke
    d = .12; x = t_(d)
    return norm(bp(noise(d), 1800, 7000) * env_exp(d, .012) + np.sin(2 * np.pi * 820 * x) * env_exp(d, .015) * .5) * v
def frame(v=1.0, f=58, d=1.4):                                # big frame-drum hit for the re-inks
    x = t_(d); fr = f * (1 + .7 * np.exp(-x / .025))
    return norm(np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(d, .3) + lp(noise(d), 1200) * env_exp(d, .03) * .5 + bp(noise(d), 2500, 6000) * env_exp(d, .006) * .2) * v
def ney(m, d, v=.5, att=.3):                                  # breathy end-blown flute
    x = t_(d); f0 = 440 * 2 ** ((m - 69) / 12)
    f = f0 * 2 ** ((-.5 * np.exp(-x / .2) + .18 * np.sin(2 * np.pi * 4.6 * x) * np.clip((x - .5) / .6, 0, 1)) / 12)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + .18 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    breath = bp(noise(d), f0 * .7, min(f0 * 5, 9000)) * .8
    return (tone * .6 + breath) * np.minimum(1, x / att) * np.minimum(1, (d - x) / .4) * v
def put(x, t, g=1.0, pan=0.0):
    if 0 <= t <= DUR + 2: add(out, x, t, g, pan)

eras = TL['eras']
starts = [e['sweep'] + e['swdur'] for e in eras]
ends = [e['sweep'] for e in eras[1:]] + [TL['end']['wall']]
sil = [e for e in EV if e['type'] == 'silence']
sil_a, sil_b = (sil[0]['t'], sil[0]['until']) if sil else (1e9, 1e9)
STEP = .3
MAQSUM = {0: 'D', 1: 'T', 3: 'T', 4: 'D', 6: 'T'}

# ---- cold open: a frame-drum hit on frame one, a low oud tremolo, the ney rising, darbuka entering ----
put(frame(1.0, 52, 1.8), 0.0, .75, 0)
c_end = eras[0]['sweep']
put(ney(62, c_end + .3, .55), .1, .3, -.2)
for k in range(int(c_end / .09)): put(oud(38 if k % 2 == 0 else 50, .35 + .2 * k / (c_end / .09)), k * .09, .25, .1)
n0 = max(4, round(c_end / STEP)); st0 = c_end / n0
for k in range(n0):
    if k < n0 // 2: continue
    s = MAQSUM.get(k % 8)
    if s == 'D': put(doum(.8), k * st0, .3, -.1)
    elif s == 'T': put(tek(.7), k * st0, .12, .3)

# ---- one section per era ----
for i, e in enumerate(eras):
    a, b = starts[i], ends[i]
    if b <= a + .5: continue
    modern = e['scene'] in ('oil', 'union', 'today')
    sc = AJAM if modern else HIJAZ
    n = max(8, int(round((b - a) / STEP))); st = (b - a) / n
    pat = [0, 2, 1, 3, 2, 4, 3, 1] if not modern else [0, 2, 4, 2, 5, 4, 2, 4]
    for k in range(n):
        t = a + k * st
        if sil_a - .05 <= t < sil_b: continue
        m = sc[min(pat[k % 8] + 4 + (2 if (k // 8) % 2 else 0), len(sc) - 1)]
        if k % 2 == 0 or modern: put(oud(m, .5 + .12 * (k % 4 == 0)), t, .42, .25 if k % 2 else .05)
        if k % 8 == 0: put(oud(38 if not modern else 43, .65), t, .5, -.1)
        s = MAQSUM.get(k % 8)
        if s == 'D': put(doum(.8), t, .3 + .08 * modern, -.1)
        elif s == 'T': put(tek(.7), t, .12 + .04 * modern, .3)
        if modern and k % 2 == 1: put(tek(.4), t, .06, -.3)
    # a short ney phrase answering the narration after the year lands
    if e['scene'] not in ('pearl',):
        ph = [sc[9], sc[8], sc[7]] if not modern else [sc[9], sc[11], sc[10]]
        for k, m in enumerate(ph): put(ney(m, .9 if k < 2 else 1.4, .45), e['year_t'] + .3 + k * st * 2, .18, -.35)
    if e['scene'] == 'pearl':                                  # the pearl crash: the music stops at "1930s"; waves and a lone ney
        put(ney(57, 2.4, .45), e.get('silence_t', a) + .3, .32, -.2); put(ney(58, 1.8, .4), e.get('silence_t', a) + 2.9, .28, -.2)
    if e['scene'] == 'today':                                  # a higher counter-line over the city
        for k in range(2, n, 4): put(oud(sc[min(12, 9 + (k // 4) % 3)], .5), a + k * st + st * .5, .3, .5)

# ---- hits: every re-ink lands on a frame drum; the 1971 fountain is a seven-note run; the union snap is the loudest ----
for e in EV:
    if e['type'] == 'sweep' and not (sil_a <= e['t'] < sil_b - .01):
        land = e['t'] + e['dur']
        if e['scene'] == 'union':
            for k, m in enumerate([50, 54, 55, 57, 59, 61, 62]): put(oud(m + 12, .6 + .04 * k), e['t'] + k * e['dur'] / 7, .45, -.6 + .2 * k)
        put(frame(.9, 58, 1.4), land, .5 if e['scene'] != 'oil' else .8, 0)
        if e['scene'] == 'oil': put(oud_strum([38, 50, 57, 62, 66]), land, .7, .1)   # the comeback after the silence
    if e['type'] == 'snap':
        put(frame(1.0, 46, 2.0), e['t'], 1.0, 0); put(frame(1.0, 64, 1.2), e['t'] + .01, .55, -.3)
        put(oud_strum([38, 50, 57, 62, 66, 69], .85, .02), e['t'], .75, .2)
# ---- the wall: the ney returns; the resolving chord waits until the question is spoken ----
w = TL['end']['wall']
put(ney(69, 2.0, .45), w + .1, .14, .2)
card = TL['end']['card']; vo_end = TL['vo']['L10'] + VODUR['L10']
put(frame(.6, 58, 1.2), card, .22, 0)
res = max(card, vo_end + .05)
put(frame(.9, 50, 1.6), res, .6, 0); put(oud_strum([38, 50, 57, 62, 66, 69], .8, .03), res, .75, .1)

out = out[:int((DUR + 1) * SR)]
out *= .8 / (np.abs(out).max() + 1e-9)
sf.write(os.path.join(D, 'music/score.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('score.wav', round(len(out) / SR, 2), 's, peak normalised')
