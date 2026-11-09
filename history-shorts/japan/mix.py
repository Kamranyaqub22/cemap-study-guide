"""mix.py · voice + score + foley + ambience → out/mix.wav. Sync from events.json and timeline.json.
Foley by material (squeegee on mesh, wet ink, paper stamps, screen clack, clamp), an ambience bed per era
that wakes up inside the print, voice compressed and set ~10 dB (RMS) over the music, which ducks under speech."""
import json, os, sys
import numpy as np, soundfile as sf
D = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB', '/root/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, clack, creak, thump, whoosh, compress, limit, add
from scipy.ndimage import maximum_filter1d, uniform_filter1d
from scipy.signal import resample_poly

EVJ = json.load(open(os.path.join(D, 'events.json'))); EV = EVJ['ev']; DUR = EVJ['dur']
TL = json.load(open(os.path.join(D, 'timeline.json')))
TOT = DUR + 1; N = int(TOT * SR); tt = np.arange(N) / SR
rng = np.random.default_rng(11)
amb = np.zeros((N, 2)); fol = np.zeros((N, 2)); vox = np.zeros((N, 2))
def evs(tp): return [e for e in EV if e['type'] == tp]

def scrape(d, bright=1.0, heavy=0.0, attack=.02):
    n = noise(d); x = t_(d)
    grain = .65 + .35 * np.abs(np.sin(2 * np.pi * (230 + 50 * bright) * x + rng.random() * 6)) ** 2
    y = bp(n, 700 * bright, min(9000, 5200 * bright), 2) * grain + lp(noise(d), 380) * (.5 + heavy) * .6
    e = np.minimum(1, x / max(attack, 1e-3)) * np.minimum(1, (d - x) / .06) * (1 - .25 * x / d)
    return norm(y * e)
def squelch(f=140):
    d = .16; x = t_(d)
    return norm(np.sin(2 * np.pi * f * x * (1 - .9 * x)) * env_exp(d, .05) + lp(noise(d), 900) * env_exp(d, .03) * .5)
def stamp():
    d = .14; x = t_(d)
    return norm(lp(noise(d), 1200) * env_exp(d, .012) + np.sin(2 * np.pi * 160 * x) * env_exp(d, .03) * .7 + bp(noise(d), 2500, 6000) * env_exp(d, .006) * .4)
def tick(f=3200):
    d = .03; x = t_(d)
    return norm(hp(noise(d), 2500) * env_exp(d, .003) + np.sin(2 * np.pi * f * x) * env_exp(d, .004) * .4)
def chirp(d=.09, f0=3800, f1=5200):
    x = t_(d); f = np.linspace(f0, f1, len(x)); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 2)
def seg_env(a, b, fi, fo): return np.clip(np.minimum((tt - a) / max(fi, 1e-3), (b - tt) / max(fo, 1e-3)), 0, 1)
def bed(x, a, b, g, fi=.6, fo=.4, roll=700):
    en = seg_env(a, b, fi, fo); amb[:, 0] += x * en * g; amb[:, 1] += np.roll(x, roll) * en * g

# ---------------- ambience: the print shop, then each era wakes up inside its print (J-cut ~0.4 s early) ----------------
room = lp(brown(TOT), 240) * .5 + bp(noise(TOT), 150, 900) * .07
amb[:, 0] += room * .04; amb[:, 1] += room * .038
eras = TL['eras']; a_of = lambda i: (eras[i]['sweep'] if eras[i]['sweep'] is not None else eras[i]['land_t']) - .4
b_of = lambda i: (eras[i + 1]['sweep'] + .3) if i + 1 < len(eras) else TL['end']['wall'] + .4
wind = (lp(noise(TOT), 900) * .6 + bp(noise(TOT), 1500, 5000) * .08) * (.55 + .45 * np.sin(2 * np.pi * .13 * tt + .7) ** 2)
water = (lp(noise(TOT), 650) * .7 + bp(noise(TOT), 1200, 4500) * .12) * (.55 + .45 * np.sin(2 * np.pi * .16 * tt + 1.2) ** 2)
hum = bp(noise(TOT), 120, 900) * (.7 + .3 * np.sin(2 * np.pi * .3 * tt)) + np.sin(2 * np.pi * 60 * tt) * .02
r2 = np.random.default_rng(4)
for i, e in enumerate(eras):
    a, b, s = a_of(i), b_of(i), e['scene']
    if s in ('rice', 'nara'):
        bed(wind * .7, a, b, .03)
        for k in range(8):
            t0 = a + .8 + k * .55 + r2.random() * .3
            for j in range(1 + int(r2.random() * 3)): add(amb, chirp(.06 + .05 * r2.random(), 3000 + 1800 * r2.random(), 3600 + 2200 * r2.random()), t0 + j * .09, .006, r2.uniform(-.8, .8))
    elif s in ('samurai', 'castle'): bed(wind, a, b, .028)
    elif s == 'ships':
        bed(water, a, b, .05)
        d = 1.6; x = t_(d); horn = (np.sin(2 * np.pi * 98 * x) + .5 * np.sin(2 * np.pi * 196 * x) + .25 * np.sin(2 * np.pi * 294 * x)) * np.minimum(1, x / .1) * np.minimum(1, (d - x) / .5)
        wd = json.load(open(os.path.join(D, 'out/voice/words.json')))[e['line']]; t_h = e['vo'] + [w for w in wd if w[0].lower().startswith('arrive')][0][2] + .05   # in the pause after 'arrive.'
        add(amb, lp(horn, 1200), t_h, .022, .4)
    elif s == 'ruin': bed(wind * 1.2, a, b, .05, fi=1.0)
    elif s == 'train':
        d = 1.4; x = t_(d); rush = bp(noise(d), 300, 5000) * np.sin(np.pi * x / d) ** 2
        add(amb, rush, e['snap_t'] - .25, .07, -.6); add(amb, rush, e['snap_t'] - .1, .05, .6)
        bed(wind * .5, a, b, .02)
    elif s == 'city': bed(hum, a, b, .03)

# ---------------- foley ----------------
for e in EV:
    t, tp = e['t'], e['type']
    if tp == 'pull':
        n = ['sky1', 'sky2', 'sun', 'far', 'mid', 'land', 'acc', 'band'].index(e['layer'])
        add(fol, scrape(e['dur'], 1.0 + .08 * n, .2, attack=.003 if t == 0 else .02), t, .42, -.25 + .07 * n); add(fol, squelch(140 + 12 * n), t, .18, 0)
    elif tp == 'lift':
        add(fol, clack(.65, 1), t, .3, 0); add(fol, creak(1), t + .04, .16, .2); add(fol, whoosh(.3, 1), t + .02, .1, 0)
    elif tp == 'header':
        add(fol, scrape(.35, 1.2, .3, attack=.004), t, .34, -.4); add(fol, squelch(170), t, .2, -.4)
    elif tp == 'item':
        add(fol, stamp(), t, .5 if not e.get('accent') else .65, .35); add(fol, tick(2400), t, .16, .35)
    elif tp == 'sweep':
        add(fol, scrape(e['dur'] + .1, .85 if e['scene'] != 'ruin' else .6, .8), t, .6, 0); add(fol, squelch(95), t, .32, 0)
    elif tp == 'snap':
        d = .6; x = t_(d)
        wood = sum(a * np.sin(2 * np.pi * f * x) * env_exp(d, tau) for f, a, tau in [(480, 1, .03), (1100, .6, .02), (220, .9, .06)])
        add(fol, norm(wood + hp(noise(d), 3000) * env_exp(d, .002)), t, 1.0, 0); add(fol, thump(1, 55), t, .6, 0)
    elif tp == 'wall':
        add(fol, whoosh(e['dur'], 1), t, .12, 0)
    elif tp == 'clip':
        d = .25; x = t_(d)
        add(fol, norm(sum(a * np.sin(2 * np.pi * f * x) * env_exp(d, tau) for f, a, tau in [(2400, .6, .05), (3900, .4, .03), (900, .8, .02)]) + hp(noise(d), 3000) * env_exp(d, .002)), t, .45, .3)
    elif tp == 'card':
        add(fol, scrape(e['dur'], 1.1, .4), t, .42, 0); add(fol, squelch(120), t, .2, 0)

# ---------------- voice ----------------
for lid, t0 in TL['vo'].items():
    x, sr = sf.read(os.path.join(D, 'out/voice', lid + '.wav'))
    if x.ndim > 1: x = x.mean(1)
    if sr != SR: x = resample_poly(x, SR, sr)
    x = hp(x, 80)
    x = compress(x / (np.abs(x).max() + 1e-9) * .9, thr=.22, ratio=3.0, att=.003, rel=.09)
    add(vox, x, t0, 1.0, 0)

# ---------------- music: dip the voice band, duck under speech, set ~10 dB under the voice ----------------
mus, sr = sf.read(os.path.join(D, 'music/score.wav'), always_2d=True)
m = np.zeros((N, 2)); L = min(N, len(mus)); m[:L] = mus[:L]
mid = np.stack([bp(m[:, c], 300, 4000) for c in range(2)], 1); m = m - mid * .35
ve = np.abs(vox).max(1); ve = uniform_filter1d(maximum_filter1d(ve, int(.25 * SR)), int(.12 * SR))
m *= (1 - .3 * np.clip(ve / (ve.max() + 1e-9) * 4, 0, 1))[:, None]
def rms(x, mask): return np.sqrt((x[mask] ** 2).mean() + 1e-12)
vmask = np.zeros(N, bool)
dur = json.load(open(os.path.join(D, 'out/voice/dur.json')))
for lid, t0 in TL['vo'].items(): vmask[int(t0 * SR):int((t0 + dur[lid]) * SR)] = True
mmask = np.abs(m).max(1) > 1e-4
m *= (rms(vox.mean(1), vmask) / rms(m.mean(1), mmask)) / (10 ** (10 / 20))
mix = m + fol * .5 + amb + vox
fo = int(.4 * SR); mix[int(DUR * SR) - fo:int(DUR * SR)] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix = mix[:int(DUR * SR)]
for c in range(2): mix[:, c] = limit(mix[:, c], .92)
assert np.isfinite(mix).all()
os.makedirs(os.path.join(D, 'out'), exist_ok=True)
sf.write(os.path.join(D, 'out/mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
vr = 20 * np.log10(rms(vox.mean(1), vmask)); mr = 20 * np.log10(rms(m.mean(1), mmask))
print(f'mix.wav {DUR}s  voice rms {vr:.1f} dB  music rms {mr:.1f} dB  gap {vr - mr:.1f} dB  peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS')
