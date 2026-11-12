"""compose.py · INDIA score (sitar, tabla, tanpura drone; teental, 16 beats; D kafi (dorian) from the Indus to 1858,
D bilawal (major) from 1930), from events.json + timeline.json → music/score.wav (48 kHz stereo).
Sitar by physical modelling (core/audio/pluck.py: the buzzing 'shamisen' string with a long ring and a jawari buzz,
sliding notes with meend glides); tabla is synthesised (dayan: a tuned ringing head; bayan: a bass head whose pitch
rises under the palm); the tanpura is four plucked drone strings, Pa Sa Sa Sa (low), cycling. Each era is a section that fills it
exactly, so every sweep lands on sam (beat one). 628 is the signature: a sitar glide rises with the brush as it paints the zero,
and the ring opening lands on a full strike. 1858 is silence (only the drone and one low note); today ends on a tihai."""
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

KAFI = [50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74]   # D dorian
BIL = [50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69, 71, 73, 74]    # D major
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

def sitar(m, vel=.6, dur=.8, **kw):                                         # a bright, buzzing, long-ringing string
    return pluck('shamisen', m, dur, vel, t60=3.2, buzz=.75, thr=.12, bright=.85, **kw)
def tanpura(t0, t1, root=38, g=.11):                                        # Pa Sa Sa Sa(low), each string blooming and ringing
    step = 1.1; t = t0; k = 0
    while t < t1:
        m = [root + 7, root + 12, root + 12, root][k % 4]
        x = pluck('shamisen', m, min(3.2, t1 - t + .4), .45, t60=6.0, buzz=.9, thr=.08, bright=.45, damp=.3)
        put(x, t, g * (.8 if k % 4 == 3 else .6), -.5 + .3 * (k % 4)); t += step; k += 1
def dayan(v=1.0, f=294, ring=.22):                                          # the right drum: a tuned head
    d = .5; x = t_(d)
    y = sum(a * np.sin(2 * np.pi * f * r * x) * np.exp(-x / (ring * tau)) for r, a, tau in [(1, 1, 1), (2, .6, .8), (3, .4, .6), (4, .25, .5)])
    return norm(y + bp(noise(d), 2000, 6000) * env_exp(d, .004) * .5) * v
def bayan(v=1.0, f=75):                                                     # the left drum: a bass head that rises under the palm
    d = .6; x = t_(d); fr = f * (1 + .35 * np.minimum(1, x / .25))
    return norm(np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(d, .22) + lp(noise(d), 500) * env_exp(d, .01) * .3) * v
def boom(v=1.0, f=50, d=1.4):
    x = t_(d); fr = f * (1 + .7 * np.exp(-x / .025))
    return norm(np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(d, .3) + lp(noise(d), 1000) * env_exp(d, .03) * .5) * v
def put(x, t, g=1.0, pan=0.0):
    if 0 <= t <= DUR + 2: add(out, x, t, g, pan)
# teental theka: dha dhin dhin dha | dha dhin dhin dha | dha tin tin ta | ta dhin dhin dha
THEKA = ['dha', 'dhin', 'dhin', 'dha', 'dha', 'dhin', 'dhin', 'dha', 'dha', 'tin', 'tin', 'ta', 'ta', 'dhin', 'dhin', 'dha']
def bol(b, t, g=.2, sam=False):
    if b in ('dha', 'dhin'): put(bayan(.9), t, g * (1.4 if sam else 1.0), -.15)
    put(dayan(.9, 294 if b in ('dha', 'ta') else 330, .3 if b in ('dhin', 'tin') else .18), t, g * (.8 if b in ('tin', 'ta') else .9), .25)

eras = TL['eras']
starts = [e['sweep'] + e['swdur'] for e in eras]
ends = [e['sweep'] for e in eras[1:]] + [TL['end']['wall']]
sil = [e for e in EV if e['type'] == 'silence']
sil_a, sil_b = (sil[0]['t'], sil[0]['until']) if sil else (1e9, 1e9)
STEP = .25                                                                 # one matra at 120 bpm (teental: 16 per cycle)

# ---- cold open: a bayan stroke on frame one, the tanpura blooming, an alap phrase with glides, the tabla entering for the first print ----
put(boom(1.0, 46, 1.8), 0.0, .6, 0); put(bayan(1.0, 70), 0.0, .3, 0)
c_end = eras[0]['sweep']
tanpura(.05, c_end + .6)
for k, (m, gl) in enumerate([(62, None), (64, (65, .4)), (69, None), (67, (65, .5)), (62, None)]):
    put(sitar(m, .6, c_end / 5 + .6, **({'glide': gl} if gl else {})), .3 + k * (c_end - .6) / 5, .32, .2)
nb = 8; st0 = .18
for k in range(nb): bol(THEKA[k % 4 * 2] if k < nb - 2 else 'dha', c_end - nb * st0 + k * st0, .08 + .015 * k)

# ---- one section per era ----
for i, e in enumerate(eras):
    a, b = starts[i], ends[i]
    if b <= a + .5: continue
    major = e['scene'] in ('salt', 'freedom', 'moon', 'today')
    sc = BIL if major else KAFI
    tanpura(a - .2, b + .3, 38, .1)
    n = max(16, int(round((b - a) / STEP))); st = (b - a) / n
    gat = [7, 9, 8, 7, 5, 7, 4, 5, 7, 8, 9, 11, 9, 8, 7, 5] if not major else [7, 9, 11, 12, 11, 9, 7, 9, 11, 9, 7, 6, 7, 9, 7, 4]
    for k in range(n):
        t = a + k * st
        if sil_a - .05 <= t < sil_b: continue
        bol(THEKA[k % 16], t, .13 + .02 * major, sam=k % 16 == 0)
        if k % 2 == 0 or (major and k % 4 == 3):
            m = sc[min(gat[k % 16] + (1 if (k // 16) % 2 else 0), len(sc) - 1)]
            put(sitar(m, .5 + .12 * (k % 16 == 0), .5), t, .3, .3 if k % 4 else .1)
    if e.get('silence'):                                                   # 1858: the tabla stops; one low note with a falling glide, the drone alone
        t0 = e.get('silence_t', a); put(sitar(50, .6, 3.0, glide=(48, 1.5)), t0 + .15, .4, 0)
    else:                                                                  # a sitar phrase answering the year, sliding up into the last note
        ph = [sc[9], sc[8], sc[7]] if not major else [sc[9], sc[11], sc[14]]
        for k, m in enumerate(ph): put(sitar(m, .55, .5 if k < 2 else 1.2, **({'glide': (m, .01)} if k < 2 else {'bend': [(0, -2), (.25, 0)]})), e['year_t'] + .3 + k * st * 2, .24, -.35)

# ---- hits: every re-ink lands on sam; the brush paints the zero with a rising glide; today ends on a tihai ----
for e in EV:
    if e['type'] == 'sweep' and not (sil_a <= e['t'] < sil_b - .01):
        land = e['t'] + e['dur']
        if e['scene'] == 'zero':                                             # the brush: one long meend as the ring is painted, a strike as it opens
            ring = e['dur'] * .55; land = e['t'] + e['dur']
            put(lp(sitar(50, .7, ring + .4, glide=(62, ring)), 2500), e['t'], .5, -.3)
            put(bayan(1.0, 60), e['t'] + ring, .45, 0)
            for k, m in enumerate([50, 57, 62, 65, 69]): put(sitar(m, .7, 1.4), land + .03 * k, .3, -.4 + .2 * k)
        put(boom(.9, 50, 1.4), land, .45 if e['scene'] != 'today' else .7, 0)
        put(bayan(1.0, 72), land, .3, 0)
        if e['scene'] == 'today':                                            # tihai: the same phrase three times, the last stroke on sam
            for r in range(3):
                for k, b in enumerate(['dha', 'tin', 'ta', 'dha']): bol(b, land + .1 + r * 1.0 + k * .2, .22)
        if e['scene'] == 'salt':
            for k, m in enumerate([62, 66, 69, 74]): put(sitar(m, .6, 1.2), land + .05 * k, .3, -.3 + .2 * k)
# ---- the wall: the drone holds; the resolving strike waits until the question is spoken ----
w = TL['end']['wall']
tanpura(w - .2, DUR + 1, 38, .12)
card = TL['end']['card']; vo_end = TL['vo']['L10'] + VODUR['L10']
put(boom(.6, 50, 1.2), card, .2, 0)
res = max(card, vo_end + .05)
put(boom(.9, 43, 1.6), res, .55, 0); put(bayan(1.0, 70), res, .4, 0)
for k, m in enumerate([50, 57, 62, 66, 69, 74]): put(sitar(m, .7, 2.0), res + .04 * k, .32, -.4 + .16 * k)

out = out[:int((DUR + 1) * SR)]
out *= .8 / (np.abs(out).max() + 1e-9)
sf.write(os.path.join(D, 'music/score.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('score.wav', round(len(out) / SR, 2), 's, peak normalised')
