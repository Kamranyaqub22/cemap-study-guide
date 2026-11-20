"""mix.py (France) · voice + score + foley + ambience → out/mix.wav. Sync from events.json and timeline.json.
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
def swish(d, pan_from=-.6, pan_to=.6):
    """A soft paper swish for a scene change: low, warm filtered air that rises and falls (no hiss)."""
    x = t_(d); n = lp(lp(noise(d), 1400, 4), 1400, 2) * .8 + lp(noise(d), 350) * .5
    e = np.sin(np.pi * np.clip(x / d, 0, 1)) ** 2
    return norm(hp(n, 120) * e)
def squelch(f=140):
    d = .16; x = t_(d)
    return norm(np.sin(2 * np.pi * f * x * (1 - .9 * x)) * env_exp(d, .05) + lp(noise(d), 900) * env_exp(d, .03) * .5)
def stamp():
    d = .14; x = t_(d)
    return norm(lp(noise(d), 1200) * env_exp(d, .012) + np.sin(2 * np.pi * 160 * x) * env_exp(d, .03) * .7 + bp(noise(d), 2500, 6000) * env_exp(d, .006) * .4)
def tick(f=3200):
    d = .03; x = t_(d)
    return norm(hp(noise(d), 2500) * env_exp(d, .003) + np.sin(2 * np.pi * f * x) * env_exp(d, .004) * .4)
def gull(d=.5):
    x = t_(d); f = np.interp(x, [0, .08, .3, d], [1500, 2300, 1900, 1400])
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + .4 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return norm(bp(tone * (1 + .4 * np.sin(2 * np.pi * 28 * x)), 900, 5000) * np.sin(np.pi * x / d) ** 1.5)
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
rain = (lp(noise(TOT), 2500) * .5 + bp(noise(TOT), 2500, 3800) * .1) * (.7 + .3 * np.sin(2 * np.pi * .11 * tt) ** 2)
def hooves(a, b, g):
    t = a + .3
    while t < b - .3:
        for dt in (0, .09): add(amb, norm(lp(noise(.06), 1500) * env_exp(.06, .01) + np.sin(2 * np.pi * 260 * t_(.06)) * env_exp(.06, .012)), t + dt, g, .2)
        t += .42
def crowd_bed(a, b, g): bed(lp(bp(noise(TOT), 250, 1800), 1600) * .6, a, b, g)
def birdsong(a, n, g=.005):
    for k in range(n): add(amb, chirp(.07 + .04 * r2.random(), 2600 + 1400 * r2.random(), 3200 + 1600 * r2.random()), a + 1.0 + k * .9 + r2.random() * .3, g, r2.uniform(-.8, .8))
def crackle(a, b, g):                                                  # torch or fire: small low crackles
    t = a + .2
    while t < b - .1:
        add(amb, norm(bp(noise(.03), 400, 2400) * env_exp(.03, .006)), t, g, r2.uniform(-.6, .6)); t += .12 + .25 * r2.random()
def drips(a, b, g):                                                    # water dripping in the cave
    t = a + .4
    while t < b - .2:
        d = .12; x = t_(d); add(amb, norm(np.sin(2 * np.pi * (900 + 500 * r2.random()) * x * (1 + 2 * x)) * env_exp(d, .025)), t, g, r2.uniform(-.7, .7)); t += .6 + .5 * r2.random()
for i, e in enumerate(eras):
    a, b, s = a_of(i), b_of(i), e['scene']
    if s == 'cave':                                                     # the cave: a low room tone, drips, the torches crackling
        bed(lp(brown(TOT), 160), a, b, .03); drips(a, b, .012); crackle(a, b, .008)
    elif s == 'alesia':                                                 # wind over the siege lines, crows, marching feet
        bed(wind * 1.0, a, b, .035)
        for k in range(10): add(amb, norm(lp(noise(.05), 900) * env_exp(.05, .012)), a + .8 + k * .45, .02, .2)
    elif s == 'charlemagne':                                            # a great hall: a bell, voices far off, hooves
        crowd_bed(a, b, .012); bed(wind * .5, a, b, .02)
        d = 2.4; x = t_(d); add(amb, lp(sum(q * np.sin(2 * np.pi * f * x) for f, q in [(196, 1), (392, .5), (523, .3), (740, .15)]) * np.exp(-x / .9), 2500), a + .9, .02, -.3)
    elif s == 'joan':                                                   # the river under the bridge, a marching column, wind
        bed(water * .8, a, b, .03); bed(wind * .5, a, b, .02); hooves(a, b, .02)
    elif s == 'versailles':                                             # fountains, gravel under the carriage wheels, birdsong
        bed(water * .9, a, b, .03); birdsong(a, 4, .004); hooves(a, b, .015)
    elif s == 'bastille':                                               # a crowd roaring, smoke and wind
        crowd_bed(a, b, .04); bed(wind * .6, a, b, .02)
    elif s == 'eiffel':                                                 # the fair: a crowd, the river, wind high up
        crowd_bed(a, b, .02); bed(water * .5, a, b, .02); bed(wind * .5, a, b, .02)
    elif s == 'today':                                                  # the city by the river: traffic, a boat, bicycle bells
        bed(hum * .9, a, b, .03); bed(water * .5, a, b, .02); crowd_bed(a, b, .01)
        for k in range(3): d = .25; x = t_(d); add(amb, norm(np.sin(2 * np.pi * 2100 * x) * np.exp(-x / .08)) * .6, a + 1.2 + k * 1.4, .006, .4)

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
    elif tp == 'sweep' and e['scene'] == 'bastille':                      # the signature: stone blocks tumbling and landing (low thuds, no hiss)
        for k in range(16):
            d = .22; x = t_(d); th = np.sin(2 * np.pi * (70 + 40 * r2.random()) * x) * env_exp(d, .05) + lp(noise(d), 700) * env_exp(d, .02) * .6
            add(fol, norm(lp(th, 1500)), t + .15 + k * e['dur'] / 16 * .9, .32, r2.uniform(-.7, .7))
    elif tp == 'sweep':
        sw = swish(e['dur'] + .25); add(fol, sw, t - .05, .32 if e['scene'] != 'fall' else .22, -.3); add(fol, np.roll(sw, 900), t - .05, .2, .3)
    elif tp == 'snap':
        d = .6; x = t_(d)
        wood = sum(a * np.sin(2 * np.pi * f * x) * env_exp(d, tau) for f, a, tau in [(480, 1, .03), (1100, .6, .02), (220, .9, .06)])
        add(fol, norm(wood + hp(noise(d), 3000) * env_exp(d, .002)), t, 1.0, 0); add(fol, thump(1, 55), t, .6, 0)
    elif tp == 'cold':                                                     # torchlight in the cave: room tone, the torch, drips
        c_end = TL['eras'][0]['sweep'] + .3
        bed(lp(brown(TOT), 160), t, c_end, .035, fi=.05, fo=.3); crackle(t, c_end, .012); drips(t + .3, c_end, .012)
        d = 1.2; x = t_(d); add(fol, norm(lp(lp(noise(d), 500, 4), 500) * np.sin(np.pi * np.clip(x / d, 0, 1)) ** 2), t + .05, .2, 0)
    elif tp == 'wall':
        add(fol, whoosh(e['dur'], 1), t, .12, 0)
    elif tp == 'clip':
        d = .25; x = t_(d)
        add(fol, norm(sum(a * np.sin(2 * np.pi * f * x) * env_exp(d, tau) for f, a, tau in [(2400, .6, .05), (3900, .4, .03), (900, .8, .02)]) + hp(noise(d), 3000) * env_exp(d, .002)), t, .45, .3)
    elif tp == 'card':
        add(fol, swish(e['dur'] + .2), t, .22, 0)

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
if os.environ.get("STEMS"): np.savez(os.path.join(D, "out/stems.npz"), m=m, fol=fol * .5, amb=amb, vox=vox)
fo = int(.4 * SR); mix[int(DUR * SR) - fo:int(DUR * SR)] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix = mix[:int(DUR * SR)]
for c in range(2): mix[:, c] = limit(mix[:, c], .92)
assert np.isfinite(mix).all()
os.makedirs(os.path.join(D, 'out'), exist_ok=True)
sf.write(os.path.join(D, 'out/mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
vr = 20 * np.log10(rms(vox.mean(1), vmask)); mr = 20 * np.log10(rms(m.mean(1), mmask))
print(f'mix.wav {DUR}s  voice rms {vr:.1f} dB  music rms {mr:.1f} dB  gap {vr - mr:.1f} dB  peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS')
