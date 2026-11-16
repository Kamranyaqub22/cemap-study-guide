"""Music + sound effects + voice for the three demos, all synthesised here.  python audio.py <glass|blue|wood>  → out/mix_<demo>.wav"""
import sys, json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly
SR = 48000
demo = sys.argv[1]
cfg = json.load(open(f'out/cfg_{demo}.json'))
N = int(cfg['dur'] * SR); T = np.arange(N) / SR
rng = np.random.default_rng(5)
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2))

def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def add(buf, t0, sig, gain=1., pan=0.):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[:N - i]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(sig), 0] += sig * gain * l * 1.41; buf[i:i + len(sig), 1] += sig * gain * r * 1.41
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a, d):   # attack seconds, exponential decay time constant
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def pluck(f, dur=1.6, bright=.5):   # Karplus-Strong
    n = int(dur * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); buf = lp(buf, 2000 + 5000 * bright, 1); out = np.zeros(n)
    for i in range(n): out[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .996
    return out * env(n, .002, dur / 2.5)
def bell(f, dur=2.5):
    t = np.arange(int(dur * SR)) / SR
    return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * (1.5 + m)) for m, a in [(1, 1), (2.76, .4), (5.4, .2), (8.9, .08)]) * env(len(t), .003, 9)
def marimba(f, dur=.9):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30)) * np.exp(-t * 6) * env(len(t), .002, 9)
def pad(freqs, dur, a=.8):
    t = np.arange(int(dur * SR)) / SR; s = sum(np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * .3 * t) * .4) + .3 * np.sin(2 * np.pi * f * 2.003 * t) for f in freqs)
    e = np.minimum(1, t / a) * np.minimum(1, (dur - t) / .8); return lp(s, 1800) * e / len(freqs)
def thump(f0=90, dur=.5, noise=.3):
    t = np.arange(int(dur * SR)) / SR; f = f0 * (1 + 1.5 * np.exp(-t * 30))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) + noise * lp(rng.normal(0, 1, len(t)), 900) * np.exp(-t * 25))
def horn(f, dur):
    t = np.arange(int(dur * SR)) / SR; ph = 2 * np.pi * np.cumsum(f * (1 + .006 * np.sin(2 * np.pi * 5 * t) * np.minimum(1, t / .5))) / SR
    s = sum(np.sin(k * ph) / k ** 1.1 for k in range(1, 9)); e = np.minimum(1, t / .12) * np.minimum(1, (dur - t) / .25)
    return lp(s, 1600) * e * .5
def click(dur=.03, f=3000): n = int(dur * SR); return bp(rng.normal(0, 1, n), f * .6, min(f * 1.4, 3900)) * np.exp(-np.arange(n) / SR * 200)

if demo == 'glass':   # kora-like plucks over a drone, F major pentatonic; glass pings as panes light; a swell for the king
    bpm = 96; b = 60 / bpm; scale = [53, 55, 57, 60, 62, 65, 67, 69, 72, 74]
    add(mus, 0, pad([hz(41), hz(48)], cfg['dur']), .5)
    pat = [0, 3, 5, 7, 4, 6, 8, 5]
    for i in range(int(cfg['dur'] / (b / 2))):
        t0 = i * b / 2; if_ = t0 > 9.8
        if t0 < .3 or if_: continue
        idx = pat[i % 8] + (2 if i // 16 % 2 else 0)
        add(mus, t0, pluck(hz(scale[min(idx, 9)]), 1.4, .6), .35, -.3 + .6 * (i % 2))
        if i % 4 == 0: add(mus, t0, pluck(hz(scale[pat[i % 8] % 5] - 12), 1.8, .3), .4, 0)
    r = np.random.default_rng(2)
    for k in range(16): add(sfx, 1.2 + k * .22 + r.uniform(0, .1), bell(hz(84 + [0, 2, 4, 7, 9][k % 5])), .05, r.uniform(-.7, .7))
    add(mus, 3.0, pad([hz(65), hz(69), hz(72)], 3.5, 1.2), .35)
    add(sfx, 5.95, bell(hz(93), 3), .14, .4); add(sfx, 6.0, bell(hz(88), 3), .1, .3)
elif demo == 'blue':   # marimba in C, clock ticks, pen scratch while drawing, counter clicks
    bpm = 108; b = 60 / bpm; notes = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 79, 76, 74, 71]
    add(mus, 0, pad([hz(48), hz(55), hz(64)], cfg['dur']), .35)
    for i in range(int(9.6 / (b / 2))):
        t0 = .2 + i * b / 2; add(mus, t0, marimba(hz(notes[i % 16])), .28, .3 * np.sin(i))
        if i % 2 == 0: add(sfx, t0, click(.02, 2800), .12, .6); add(mus, t0, marimba(hz([48, 53, 55, 48][i // 8 % 4]), 1.2), .25)
    def scratch(t0, t1):
        n = int((t1 - t0) * SR); s = bp(rng.normal(0, 1, n), 900, 3200); m = .6 + .4 * np.sin(2 * np.pi * 7 * np.arange(n) / SR) ** 2
        e = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (.05 * SR)); add(sfx, t0, s * m * e, .1, -.2)
    scratch(.35, 2.6); scratch(3.1, 4.2)
    for k in range(40): add(sfx, 3.6 + 2.2 * (k / 40) ** .6, click(.015, 2200), .1, .5)
    for t0 in [6.4]: add(sfx, t0, thump(220, .3, .1), .25)
elif demo == 'electra':   # airfield ambience, a low bed, two radial engines on the take-off, a swell on the map
    n = N; tt = np.arange(n) / SR
    add(sfx, 0, lp(rng.normal(0, 1, n), 220, 2) * (.8 + .2 * np.sin(2 * np.pi * .13 * tt)), .9)                     # wind
    surf = bp(rng.normal(0, 1, n), 150, 700, 2) * (.5 + .5 * np.sin(2 * np.pi * .11 * tt) ** 2); add(sfx, 0, surf, .25, -.5)
    r2 = np.random.default_rng(8)
    for t0 in r2.uniform(.3, 10.5, 9):   # distant tropical birds
        m = int(.18 * SR); f = r2.uniform(1800, 2600); ph = 2 * np.pi * np.cumsum(f * (1 + .25 * np.sin(np.arange(m) / SR * 2 * np.pi * 9))) / SR
        add(sfx, t0, np.sin(ph) * np.sin(np.pi * np.arange(m) / m) ** 2, .025, r2.uniform(-.8, .8))
    add(mus, 0, pad([hz(38), hz(45), hz(50)], 12.8, 1.5), .55)
    m = int(4.6 * SR); te = np.arange(m) / SR; rpm = 1500 + 700 * np.minimum(1, te / 2.5); fire = rpm / 60 * 4.5
    ph = 2 * np.pi * np.cumsum(fire) / SR; eng = (np.sign(np.sin(ph)) * .3 + np.sin(ph) + .5 * np.sin(2 * ph)) * (1 + .5 * lp(rng.normal(0, 1, m), 80))
    eng = lp(eng + .4 * bp(rng.normal(0, 1, m), 200, 1200) * (1 + np.sin(ph * .5)), 1300, 2) * np.minimum(1, te / .08) * np.minimum(1, (4.3 - te) / .1).clip(0, 1)
    add(sfx, 6.6, eng, .55, .2)
    add(mus, 10.9, pad([hz(57), hz(62), hz(64)], 1.9, .4), .4); add(sfx, 10.9, thump(45, 1.2, .2), .5)
elif demo == 'titanic':   # low strings, a slowing-then-racing pulse, ship rumble, three bell strokes, the impact, then silence
    add(mus, 0, pad([hz(38), hz(45), hz(50)], 16.0, 2.0), .7)
    add(mus, 8.2, pad([hz(62), hz(65)], 7.8, 1.5), .35)
    n = int(16 * SR); add(sfx, 0, lp(rng.normal(0, 1, n), 180, 4) * np.minimum(1, np.arange(n) / SR / 1.5), 2.2)   # engines and water
    t0 = .5
    while t0 < 15.9: add(mus, t0, thump(55, .5, .15), .55); add(mus, t0 + .18, thump(50, .4, .1), .35); t0 += lerp_ if (lerp_ := max(.42, 1.15 - .05 * t0)) else 1
    for k in range(3): add(sfx, 10.0 + k * .32, bell(hz(81), 1.6), .35, .3)
    crash = lp(rng.normal(0, 1, int(1.6 * SR)), 900, 2) * np.exp(-np.arange(int(1.6 * SR)) / SR * 2.5)
    add(sfx, 15.95, crash, 1.4); add(sfx, 15.95, thump(40, 1.5, .8), 1.2)
    add(mus, 16.5, bell(hz(57), 2.5), .2)
else:   # frame-drum march, a horn call, block-print thuds, footsteps
    bpm = 112; b = 60 / bpm
    for t0 in [.15, .9, 1.6, 2.4]: add(sfx, t0, thump(62, .7, .6), .9); add(sfx, t0 + .01, lp(rng.normal(0, 1, 2400), 2500) * np.exp(-np.arange(2400) / SR * 60), .3)
    add(mus, .3, horn(hz(50), 1.4), .35); add(mus, 1.75, horn(hz(57), 1.0), .35); add(mus, 2.8, horn(hz(55), 1.6), .35)
    add(mus, 0, pad([hz(38), hz(45)], cfg['dur']), .45)
    i = 0
    for t0 in np.arange(4.2, 9.9, b / 2):
        add(mus, t0, thump(85 if i % 4 == 0 else 120, .4, .4), .5 if i % 2 == 0 else .25, 0); i += 1
    for k, m in enumerate([62, 64, 65, 67, 69, 67, 65, 64]): add(mus, 4.2 + k * b * 2, horn(hz(m), b * 1.9), .3)
    for t0 in np.arange(4.4, 9.9, .4363): add(sfx, t0, lp(rng.normal(0, 1, 5000), 1400) * np.exp(-np.arange(5000) / SR * 40), .22, -.3)

# voice, with the music ducked under it
voice = np.zeros(N); duck = np.ones(N)
for v in cfg['voice']:
    x, sr = sf.read(f"out/voice/{v['id']}.wav"); x = x if x.ndim == 1 else x.mean(1); x = resample_poly(x, SR, sr)
    if v['id'] == 't3': x = np.tanh(bp(x, 350, 3200, 3) * 6) * .5   # shouted down a telephone
    i = int(v['t'] * SR); x = x[:N - i]; voice[i:i + len(x)] += x
    duck[max(0, i - 2400):i + len(x) + 4800] = .45
duck = np.convolve(duck, np.ones(4800) / 4800, 'same')
fade = np.minimum(1, np.minimum(T / .05, (cfg['dur'] - T) / .6))[:, None]
if demo == 'titanic': mus[int(15.95 * SR):int(16.5 * SR)] = 0
mix = (mus * duck[:, None] + sfx + voice[:, None] * 1.0) * fade
mix = hp(mix.T, 35).T
sf.write(f'out/mix_{demo}.wav', mix / (np.abs(mix).max() + 1e-9) * .9, SR)
print('mix', demo, cfg['dur'])
