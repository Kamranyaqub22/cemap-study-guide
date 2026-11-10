"""compose.py · ITALY score (mandolin tremolo, accordion, tamburello; D harmonic minor for Rome to Galileo, D major from 1861),
from events.json + timeline.json → music/score.wav (48 kHz stereo).
Mandolin by physical modelling (core/audio/pluck.py: a bright picked 'pipa' string, shortened, with tremolo picking);
the accordion is a pair of slightly detuned reeds with bellows swell; the tamburello (frame drum with jingles) plays a 6/8
tarantella. Each era is a section that fills it exactly, so every sweep lands on a downbeat. The fall of the West is silence
(wind and a lone accordion chord); the Renaissance is the comeback; the 1861 mosaic is set ring by ring, one rising
mandolin note per ring, and the score turns from minor to major there."""
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

MINOR = [50, 52, 53, 55, 57, 58, 61, 62, 64, 65, 67, 69, 70, 73, 74]   # D harmonic minor
MAJOR = [50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69, 71, 73, 74]   # D major

def mand(m, vel=.6, dur=.5, trem=None):                                    # mandolin: bright, short, picked
    kw = dict(t60=1.5, bright=.9, bmix=.5)
    if trem: kw['trem'] = trem
    return pluck('pipa', m, dur, vel, **kw)
def mand_strum(ms, vel=.75, spread=.02):
    xs = [mand(m, vel * (1 - .05 * i), .9) for i, m in enumerate(ms)]
    n = max(len(x) + int(i * spread * SR) for i, x in enumerate(xs)); o = np.zeros(n)
    for i, x in enumerate(xs): o[int(i * spread * SR):int(i * spread * SR) + len(x)] += x
    return o / np.sqrt(len(xs))
def accordion(ms, d, v=.5, att=.25):                                       # two reeds per note, a slow bellows swell
    x = t_(d); y = np.zeros_like(x)
    for m in ms:
        f0 = 440 * 2 ** ((m - 69) / 12)
        for det in (-.0025, .0025):
            ph = 2 * np.pi * f0 * (1 + det) * x
            y += np.sin(ph) + .5 * np.sin(2 * ph) + .3 * np.sin(3 * ph) + .15 * np.sin(5 * ph)
    y = lp(y / (len(ms) * 2), 3200)
    return y * np.minimum(1, x / att) * np.minimum(1, (d - x) / .3) * (.85 + .15 * np.sin(2 * np.pi * .7 * x)) * v
def tamb(v=1.0, low=False):                                                # tamburello: skin thump + jingle shimmer
    d = .3; x = t_(d); f = (120 if low else 210) * (1 + .4 * np.exp(-x / .015))
    skin = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .07 if low else .04)
    jing = bp(noise(d), 4000, 9000) * env_exp(d, .07) * (1 + .5 * np.sin(2 * np.pi * 31 * x))
    return norm(skin * (1.0 if low else .5) + lp(jing, 7000) * (.35 if low else .6)) * v
def boom(v=1.0, f=55, d=1.4):                                              # a deep drum for the re-inks
    x = t_(d); fr = f * (1 + .7 * np.exp(-x / .025))
    return norm(np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(d, .3) + lp(noise(d), 1000) * env_exp(d, .03) * .5) * v
def put(x, t, g=1.0, pan=0.0):
    if 0 <= t <= DUR + 2: add(out, x, t, g, pan)

eras = TL['eras']
starts = [e['sweep'] + e['swdur'] for e in eras]
ends = [e['sweep'] for e in eras[1:]] + [TL['end']['wall']]
sil = [e for e in EV if e['type'] == 'silence']
sil_a, sil_b = (sil[0]['t'], sil[0]['until']) if sil else (1e9, 1e9)
STEP = .2                                                                  # 6/8: groups of three eighths
TARANT = {0: 'L', 3: 'H', 4: 'h', 5: 'h'}

# ---- cold open: a drum on frame one, a mandolin tremolo rising under the question, the tamburello entering ----
put(boom(1.0, 50, 1.8), 0.0, .7, 0)
c_end = eras[0]['sweep']
put(accordion([50, 57, 62], c_end + .3, .5), .05, .22, -.2)
for k, m in enumerate([62, 64, 65, 67]): put(mand(m, .55, c_end / 4 + .2, trem=12), k * c_end / 4, .35, .15)
n0 = max(6, round(c_end / STEP)); st0 = c_end / n0
for k in range(n0 // 2, n0):
    s = TARANT.get(k % 6)
    if s: put(tamb(.8, s == 'L'), k * st0, .14 if s == 'L' else .07, .3)

# ---- one section per era ----
for i, e in enumerate(eras):
    a, b = starts[i], ends[i]
    if b <= a + .5: continue
    major = e['scene'] in ('unite', 'piazza', 'today')
    sc = MAJOR if major else MINOR
    n = max(6, int(round((b - a) / STEP))); st = (b - a) / n
    pat = [0, 2, 4, 2, 4, 5] if major else [0, 2, 3, 2, 1, 2]
    for k in range(n):
        t = a + k * st
        if sil_a - .05 <= t < sil_b: continue
        bar = k // 6
        m = sc[min(pat[k % 6] + 4 + (1 if bar % 2 else 0), len(sc) - 1)]
        if k % 3 != 1 or major: put(mand(m, .5 + .1 * (k % 6 == 0), .35), t, .38, .25 if k % 2 else .05)
        if k % 6 == 0:
            put(mand(38 if not major else 45 if bar % 2 else 38, .6, .8), t, .45, -.1)
            put(accordion([sc[0] + 12, sc[2] + 12, sc[4] + 12] if bar % 2 == 0 else [sc[3] + 12, sc[5] + 12, sc[7]], st * 6, .4), t, .12, -.25)
        s = TARANT.get(k % 6)
        if s: put(tamb(.8, s == 'L'), t, (.16 if s == 'L' else .07) + .03 * major, .3)
    if e.get('silence'):                                                   # the West falls: the dance stops; one accordion chord fades
        t0 = e.get('silence_t', a); put(accordion([50, 53, 57], 3.2, .5, .6), t0 + .2, .22, -.1)
    else:                                                                  # a tremolo phrase answering the year
        ph = [sc[9], sc[8], sc[7]] if not major else [sc[7], sc[9], sc[11]]
        for k, m in enumerate(ph): put(mand(m, .5, .6 if k < 2 else 1.1, trem=13), e['year_t'] + .3 + k * st * 3, .22, -.35)

# ---- hits: every re-ink lands on a drum; the Renaissance is the comeback; the 1861 mosaic is set one note per ring ----
for e in EV:
    if e['type'] == 'sweep' and not (sil_a <= e['t'] < sil_b - .01):
        land = e['t'] + e['dur']
        if e['scene'] == 'unite':
            for k, m in enumerate([62, 64, 66, 67, 69, 71, 73, 74, 76, 78]): put(mand(m, .5 + .03 * k, .5), e['t'] + .15 + k * .14, .42, -.6 + .13 * k)
        put(boom(.9, 55, 1.4), land, .5 if e['scene'] != 'florence' else .8, 0)
        if e['scene'] == 'florence': put(mand_strum([38, 50, 57, 62, 65]), land, .7, .1)
        if e['scene'] == 'unite': put(mand_strum([38, 50, 57, 62, 66, 69]), land + .1 + 10 * .14, .65, .1)
# ---- the wall: the accordion holds; the resolving chord waits until the question is spoken ----
w = TL['end']['wall']
put(accordion([62, 66, 69], 2.4, .45), w + .1, .14, .2)
card = TL['end']['card']; vo_end = TL['vo']['L10'] + VODUR['L10']
put(boom(.6, 55, 1.2), card, .22, 0)
res = max(card, vo_end + .05)
put(boom(.9, 50, 1.6), res, .6, 0); put(mand_strum([38, 50, 57, 62, 66, 69], .8, .03), res, .75, .1)

out = out[:int((DUR + 1) * SR)]
out *= .8 / (np.abs(out).max() + 1e-9)
sf.write(os.path.join(D, 'music/score.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('score.wav', round(len(out) / SR, 2), 's, peak normalised')
