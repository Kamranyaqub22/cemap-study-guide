"""compose.py · USA score (banjo, fiddle, upright bass, washboard; a 2/4 bluegrass breakdown in G major, E minor for 1861),
from events.json + timeline.json → music/score.wav (48 kHz stereo).
Banjo and upright bass by physical modelling (core/audio/pluck.py: 'banjo' forward rolls, 'upright_bass_pizz' on one and three);
the fiddle is a bowed sawtooth with a scratchy attack, slow vibrato and a body filter; the washboard is short scraped noise on
the off-beats. Each era is a section that fills it exactly, so every sweep lands on a downbeat. 1861 is silence (a lone fiddle
long note); 1903 is the comeback; 1969 is the signature: the banjo roll speeds up and the fiddle slides up an octave as the
rocket climbs, landing on a full chord as the plume clears."""
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

MAJ = [55, 57, 59, 60, 62, 64, 66, 67, 69, 71, 72, 74, 76, 78, 79]   # G major
MIN = [52, 54, 55, 57, 59, 60, 62, 64, 66, 67, 69, 71, 72, 74, 76]   # E minor
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

def banjo(m, vel=.6, dur=.35): return pluck('banjo', m, dur, vel)
def bass(m, vel=.7): return pluck('upright_bass_pizz', m, .45, vel)
def fiddle(m, d, v=.5, glide=None, vib=.18):                              # a bowed string: sawtooth, scratchy attack, vibrato, body
    x = t_(d); f0 = hz(m)
    f = f0 * np.ones_like(x)
    if glide: f = f0 * 2 ** ((glide - m) / 12 * np.clip(x / d, 0, 1) ** 1.3)
    f = f * 2 ** (vib / 12 * np.sin(2 * np.pi * 5.5 * x) * np.clip((x - .15) / .3, 0, 1))
    ph = np.cumsum(f) / SR; saw = 2 * (ph % 1) - 1
    y = bp(saw, 250, 3200) + bp(saw, 2400, 3400) * .3 + lp(noise(d), 3000) * np.exp(-x / .05) * .3
    return lp(y, 3400) * np.minimum(1, x / .06) * np.minimum(1, np.maximum(0, d - x) / .08) * v
def wash(v=1.0):                                                          # a washboard scrape: short, low-mid, no hiss
    d = .08; x = t_(d); return norm(bp(noise(d), 600, 2600) * (1 + np.sign(np.sin(2 * np.pi * 120 * x))) * env_exp(d, .025)) * v
def boom(v=1.0, f=50, d=1.4):
    x = t_(d); fr = f * (1 + .7 * np.exp(-x / .025))
    return norm(np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(d, .3) + lp(noise(d), 1000) * env_exp(d, .03) * .5) * v
def put(x, t, g=1.0, pan=0.0):
    if 0 <= t <= DUR + 2: add(out, x, t, g, pan)
ROLL = [0, 2, 4, 0, 2, 4, 0, 4]                                            # a forward roll over the chord tones

eras = TL['eras']
starts = [e['sweep'] + e['swdur'] for e in eras]
ends = [e['sweep'] for e in eras[1:]] + [TL['end']['wall']]
sil = [e for e in EV if e['type'] == 'silence']
sil_a, sil_b = (sil[0]['t'], sil[0]['until']) if sil else (1e9, 1e9)
STEP = .17                                                                 # sixteenths at ~88 bpm in 2/4: a brisk breakdown

# ---- cold open: a kick on frame one, the fiddle bowing a long note under the quiz, the banjo rolling in for the first print ----
put(boom(1.0, 48, 1.6), 0.0, .65, 0)
c_end = eras[0]['sweep']
put(fiddle(67, c_end * .5, .5), .15, .3, -.2); put(fiddle(71, c_end * .5, .5, glide=74), .15 + c_end * .5, .3, -.2)
for k in range(int(c_end * .45 / STEP)):
    t = c_end * .55 + k * STEP
    put(banjo([55, 59, 62, 67][ROLL[k % 8] // 2 + (k % 3 == 2)], .5), t, .1 + .1 * k / 12, .3)

# ---- one section per era ----
for i, e in enumerate(eras):
    a, b = starts[i], ends[i]
    if b <= a + .5: continue
    minor = e['scene'] in ('war',)
    sc = MIN if minor else MAJ
    n = max(8, int(round((b - a) / STEP))); st = (b - a) / n
    for k in range(n):
        t = a + k * st
        if sil_a - .05 <= t < sil_b: continue
        bar = k // 8; ch = [0, 2, 4] if bar % 2 == 0 else [3, 5, 7]
        put(banjo(sc[min(ch[ROLL[k % 8] // 2] + 7, len(sc) - 1)], .45 + .1 * (k % 8 == 0)), t, .2, .3 if k % 2 else .15)
        if k % 4 == 0: put(bass(sc[ch[0]] - 24 + (7 if k % 8 == 4 else 0)), t, .32, -.1)
        if k % 4 == 2: put(wash(.9), t, .08, .25)
        if k % 8 == 0: put(fiddle(sc[ch[0] + 7], st * 3.6, .45), t, .12, -.3); put(fiddle(sc[ch[1] + 7], st * 3.6, .45), t + st * 4, .12, -.3)
    if e.get('silence'):                                                   # 1861: the band stops; a lone fiddle long note, falling
        t0 = e.get('silence_t', a); put(fiddle(64, 3.4, .55, glide=59, vib=.25), t0 + .15, .35, 0)
    else:                                                                  # a fiddle lick answering the year
        for k, m in enumerate([sc[9], sc[8], sc[7]] if e['scene'] != 'flight' else [sc[7], sc[9], sc[11], sc[14]]):
            put(fiddle(m, .3 if k < 2 else .8, .5), e['year_t'] + .3 + k * st * 2, .18, -.35)

# ---- hits: every re-ink lands on the kick; 1969 is the rocket: the roll speeds up, the fiddle climbs an octave ----
for e in EV:
    if e['type'] == 'sweep' and not (sil_a <= e['t'] < sil_b - .01):
        land = e['t'] + e['dur']
        if e['scene'] == 'launch':
            put(fiddle(55, e['dur'], .55, glide=67), e['t'], .32, -.3)
            tt, k = e['t'], 0
            while tt < land - .02: put(banjo([55, 59, 62, 67, 71][k % 5], .5), tt, .16, .3); tt += max(.06, .16 - .012 * k); k += 1
            put(boom(1.0, 40, 2.0), e['t'], .35, 0)
        put(boom(.9, 50, 1.4), land, .45 if e['scene'] not in ('flight', 'launch') else .7, 0)
        if e['scene'] in ('flight', 'launch'):
            for k, m in enumerate([43, 55, 59, 62, 67]): put(banjo(m, .7, .8), land + .03 * k, .25, -.3 + .15 * k)
# ---- the wall: the fiddle holds; the resolving chord waits until the question is spoken ----
w = TL['end']['wall']
put(fiddle(62, 2.4, .45), w + .1, .14, .2)
card = TL['end']['card']; vo_end = TL['vo']['L10'] + VODUR['L10']
put(boom(.6, 50, 1.2), card, .2, 0)
res = max(card, vo_end + .05)
put(boom(.9, 43, 1.6), res, .55, 0); put(bass(31, .9), res, .5, 0)
for k, m in enumerate([55, 59, 62, 67, 71]): put(banjo(m, .7, 1.2), res + .04 * k, .3, -.4 + .2 * k)
put(fiddle(67, 2.0, .5), res, .18, -.2)

out = out[:int((DUR + 1) * SR)]
out *= .8 / (np.abs(out).max() + 1e-9)
sf.write(os.path.join(D, 'music/score.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('score.wav', round(len(out) / SR, 2), 's, peak normalised')
