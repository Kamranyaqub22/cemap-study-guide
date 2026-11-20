// scenes.js · TURKEY — vertical print (1080×1920 art units, full bleed).
// Base: a warm sky with drifting cloud bars, a sun high on the left, the fairy chimneys of a Cappadocian valley (rock cones with
// dark caps, cave-house windows), a terraced slope with rows of apricot trees swaying, storks wheeling.
// One era landmark per print. Parts: { pull, ink, path, knock?, cut?, lit?, drift?, blink?, sway?, seq?, loop?, spin?, swing? }.
// Landmarks are original stylised silhouettes from simple paths: not traced from photographs, no logos, no flags or emblems, no maps.
import { mulberry, polyPath, circlePath, ringPath, rectPath, unionPath, bandSteps } from './silk.js';

export const AW = 1080, AH = 1920, BLEED = 60;
export const GROUND = 1180;
export const BAND = [-BLEED, 1170, AW + 2 * BLEED, AH - 1170 + BLEED];
const FULL = () => rectPath(-BLEED, -BLEED, AW + 2 * BLEED, AH + 2 * BLEED);
const SUN = [230, 560], SR = 84;

function blob(p, x, y, rx, ry, a0 = 0, a1 = Math.PI * 2) { p.moveTo(x + rx * Math.cos(a0), y + ry * Math.sin(a0)); p.ellipse(x, y, rx, ry, 0, a0, a1); p.closePath(); }
const bird = (p, x, y, s) => p.addPath(polyPath([[x - 24 * s, y - 6 * s], [x - 11 * s, y - 10 * s], [x, y], [x + 11 * s, y - 10 * s], [x + 24 * s, y - 6 * s], [x + 11 * s, y - 5 * s], [x, y + 5 * s], [x - 11 * s, y - 5 * s]]));
const birds = (list) => { const p = new Path2D(); for (const [x, y, s] of list) bird(p, x, y, s); return p; };
function stork(p, x, y, s) { p.addPath(polyPath([[x - 50 * s, y - 4 * s], [x - 10 * s, y - 2 * s], [x + 30 * s, y - 6 * s], [x + 60 * s, y - 2 * s], [x + 30 * s, y + 2 * s], [x, y + 4 * s], [x - 40 * s, y + 4 * s]])); p.addPath(polyPath([[x - 16 * s, y - 2 * s], [x - 30 * s, y - 30 * s], [x - 4 * s, y - 2 * s]])); p.addPath(polyPath([[x - 16 * s, y + 2 * s], [x - 30 * s, y + 30 * s], [x - 4 * s, y + 2 * s]])); }
function line(seed, y0, amp, n = 40) {
  const pts = []; for (let i = 0; i <= n; i++) { const x = -BLEED + (AW + 2 * BLEED) * i / n; pts.push([x, y0 + amp * Math.sin(x / 210 + seed) + amp * .45 * Math.sin(x / 80 + seed * 2.3)]); }
  return pts;
}
function water(seed, y0, ink = 'mid', y1 = 1180, speed = -22) {
  const glints = new Path2D(), r = mulberry(seed);
  for (let i = 0; i < 6; i++) { const y = y0 + 8 + i * 12; let x = -BLEED - 240 + r() * 60; while (x < AW + BLEED + 240) { const L = 40 + r() * 120; glints.rect(x, y, L, 3 + i * .5); x += L + 60 + r() * 110; } }
  return [{ pull: 'land', ink, path: rectPath(-BLEED, y0, AW + 2 * BLEED, y1 - y0) }, { pull: 'land', ink: 'glow', path: glints, lit: 1, drift: [speed, 0] }];
}
function cone(p, caps, x, base, h, w) { p.addPath(polyPath([[x - w, base], [x + w, base], [x + w * .32, base - h], [x - w * .32, base - h]])); blob(caps, x, base - h, w * .5, w * .3); }
function dome(p, x, y, r, h = .8) { blob(p, x, y, r, r * h, Math.PI, Math.PI * 2); p.rect(x - r, y - 1, 2 * r, 8); }
function minaret(p, x, base, h, w = 18) { p.rect(x - w / 2, base - h, w, h); p.rect(x - w / 2 - 6, base - h * .72, w + 12, 8); p.rect(x - w / 2 - 6, base - h * .45, w + 12, 8); p.addPath(polyPath([[x - w / 2, base - h], [x + w / 2, base - h], [x, base - h - w * 3.4]])); }
function smokeCol(x, y, n = 6, s = 1) { const p = new Path2D(); for (let k = 0; k < n; k++) blob(p, x + k * 14 * s, y - k * 58 * s, (20 + k * 9) * s, (14 + k * 6) * s); return p; }
function galley(p, x, y, s) { p.addPath(polyPath([[x - 110 * s, y], [x + 110 * s, y], [x + 140 * s, y - 30 * s], [x + 100 * s, y + 18 * s], [x - 100 * s, y + 18 * s], [x - 130 * s, y - 24 * s]])); p.rect(x - 3 * s, y - 130 * s, 6 * s, 130 * s); p.addPath(polyPath([[x, y - 126 * s], [x + 60 * s, y - 70 * s], [x, y - 30 * s]])); }

// ---------------- the base print ----------------
function base(seed, o = {}) {
  const sunKnock = unionPath([circlePath(SUN[0], SUN[1], SR + 10), ringPath(SUN[0], SUN[1], SR + 26, SR + 32)]);
  const sky2 = new Path2D(); sky2.rect(-BLEED, -BLEED, AW + 2 * BLEED, 110 + BLEED); sky2.addPath(bandSteps(-BLEED, AW + 2 * BLEED, 100, 760, 6, 14));
  const bars = [new Path2D(), new Path2D()], r = mulberry(seed + 3);
  for (let k = 0; k < 10; k++) { const g = bars[k % 2], x = -700 + r() * 1900, y = 480 + k * 34 + r() * 14, w = 180 + r() * 300; g.rect(x, y, w, 10 + r() * 6); }
  const far = polyPath([[-BLEED, 1300], ...line(seed, 980, 22), [AW + BLEED, 1300]]);
  const cones = new Path2D(), caps = new Path2D(), holes = new Path2D(), rr = mulberry(seed + 5);
  for (const [x, h, w] of o.cones || [[60, 190, 54], [150, 140, 44], [880, 210, 58], [990, 160, 48], [1060, 120, 40]]) { cone(cones, caps, x, 1060, h, w); for (let k = 0; k < 3; k++) if (rr() < .7) { holes.rect(x - 8 + (rr() - .5) * w * .6, 1060 - h * (.25 + k * .22), 14, 18); } }
  const slope = polyPath([[-BLEED, 1300], ...line(seed + 2, 1060, 10), [AW + BLEED, 1300]]);
  const orchard = new Path2D(); for (let row = 0; row < 3; row++) for (let x = -30 + row * 30; x < AW + 40; x += 92) { blob(orchard, x, 1080 + row * 30, 22 - row * 2, 16 - row); }
  const st = new Path2D(); stork(st, 760, 480, 1); stork(st, 840, 440, .7);
  return {
    sky: [
      { pull: 'sky1', ink: 'sky1', path: FULL(), knock: sunKnock },
      { pull: 'sky2', ink: 'sky2', path: sky2 },
      { pull: 'sky2', ink: 'sky1', path: bars[0], drift: [-36, 0] }, { pull: 'sky2', ink: 'glow', path: bars[1], drift: [-60, 0], lit: 1 },
      { pull: 'sun', ink: 'sun', path: circlePath(SUN[0], SUN[1], SR) },
    ],
    far: [{ pull: 'far', ink: 'far', path: far }],
    mid: [
      ...(o.cones === false ? [] : [{ pull: 'mid', ink: 'glow', path: cones, knock: holes }, { pull: 'mid', ink: 'near', path: holes, lit: 1 }, { pull: 'mid', ink: 'far', path: caps }]),
      ...(o.slope === false ? [] : [{ pull: 'mid', ink: 'mid', path: slope }, { pull: 'mid', ink: 'near', path: orchard, sway: [4, 1.3, .2] }]),
      { pull: 'mid', ink: 'near', path: st, swing: [700, 600, .35, .7, 0] },
    ],
  };
}
function bandPart() {
  const p = rectPath(...BAND);
  const knock = new Path2D(); for (let x = 14; x < AW - 30; x += 44) { blob(knock, x + 12, BAND[1] + 22, 10, 10); knock.addPath(polyPath([[x + 26, BAND[1] + 22], [x + 34, BAND[1] + 14], [x + 42, BAND[1] + 22], [x + 34, BAND[1] + 30]])); }   // a border of rosettes and lozenges, like a tile frieze
  return { pull: 'band', ink: 'near', path: p, knock };
}
function compose(seed, land, o = {}) {
  const b = base(seed, o);
  return { focus: land.focus, parts: [...b.sky, ...b.far, ...b.mid, ...land.parts, bandPart()], depth: { sky1: 0, sky2: 0, sun: .1, far: .3, mid: .55, land: .85, acc: .85, band: 1 } };
}

// ---------------- the eras ----------------
// 1 · c. 9500 BC: a ring of great T-shaped stone pillars carved with animals, hunters with spears, gazelles running, vultures circling
function gobekli(seed = 11) {
  const ring = new Path2D(), reliefs = new Path2D(), wall = new Path2D();
  wall.addPath(polyPath([[60, 1120], [1020, 1120], [960, 1040], [120, 1040]]));
  for (const [x, h, s] of [[180, 230, .8], [330, 260, .9], [760, 260, .9], [900, 230, .8]]) { ring.rect(x - 22 * s, 1110 - h, 44 * s, h); ring.rect(x - 60 * s, 1110 - h - 40 * s, 120 * s, 44 * s); }
  for (const [x, h] of [[470, 360], [610, 360]]) { ring.rect(x - 36, 1120 - h, 72, h); ring.rect(x - 100, 1120 - h - 60, 200, 64); }
  // carved animals on the two central pillars: a fox, a boar, a bird
  reliefs.addPath(polyPath([[446, 820], [490, 810], [500, 790], [506, 812], [496, 830], [450, 836], [436, 850], [430, 830]]));
  reliefs.addPath(polyPath([[584, 900], [636, 890], [646, 904], [636, 926], [594, 928], [584, 944], [578, 922]])); blob(reliefs, 610, 1000, 22, 12); reliefs.addPath(polyPath([[600, 1000], [570, 1030], [610, 1012], [650, 1030], [622, 1000]]));
  for (let y = 960; y < 1080; y += 24) reliefs.rect(458, y, 24, 6);
  const hunters = new Path2D(); for (let k = 0; k < 4; k++) { const x = -60 + k * 70, y = 1150; blob(hunters, x, y - 40, 9, 10); hunters.addPath(polyPath([[x - 10, y - 30], [x + 10, y - 30], [x + 16, y + 10], [x - 16, y + 10]])); hunters.addPath(polyPath([[x + 6, y - 30], [x + 70, y - 70], [x + 72, y - 66], [x + 8, y - 26]])); }
  const gaz = new Path2D(); for (let k = 0; k < 3; k++) { const x = 760 + k * 90, y = 1140; gaz.addPath(polyPath([[x - 34, y], [x + 26, y - 4], [x + 40, y - 30], [x + 50, y - 26], [x + 36, y + 2], [x + 30, y + 26], [x + 22, y + 26], [x + 16, y + 8], [x - 20, y + 8], [x - 30, y + 26], [x - 38, y + 26], [x - 36, y + 6]])); gaz.addPath(polyPath([[x + 40, y - 30], [x + 34, y - 60], [x + 46, y - 32]])); }
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'far', path: wall },
    { pull: 'land', ink: 'far', path: ring, knock: reliefs }, { pull: 'land', ink: 'glow', path: reliefs, lit: 1 },
    { pull: 'acc', ink: 'near', path: hunters, drift: [70, 0], sway: [0, 7, 0] },
    { pull: 'acc', ink: 'near', path: gaz, drift: [120, 0], sway: [0, 9, 0] },
    { pull: 'acc', ink: 'near', path: birds([[560, 560, 1.0], [620, 520, .8], [500, 520, .6]]), swing: [560, 640, .35, .8, 0] },
  ] }, { cones: [[60, 150, 46], [1020, 160, 48]] });
}
// 2 · c. 1600 BC: the capital's great walls and towers on a rocky ridge, a corbelled gate, a chariot racing below
function hattusa(seed = 13) {
  const ridge = polyPath([[-BLEED, 1180], [-BLEED, 1000], [200, 960], [420, 940], [700, 950], [900, 980], [AW + BLEED, 1000], [AW + BLEED, 1180]]);
  const walls = new Path2D(); walls.rect(-BLEED, 820, AW + 2 * BLEED, 140); for (let x = -20; x < AW + 40; x += 150) { walls.rect(x, 770, 90, 190); for (let k = 0; k < 3; k++) walls.rect(x + k * 34, 752, 22, 20); }
  const blocks = new Path2D(); for (let y = 840; y < 950; y += 28) for (let x = -BLEED + ((y / 28) % 2) * 30; x < AW + BLEED; x += 60) blocks.rect(x, y, 54, 3);
  const gate = new Path2D(); gate.addPath(polyPath([[480, 960], [600, 960], [600, 900], [580, 840], [540, 810], [500, 840], [480, 900]]));
  const chariot = new Path2D(), wheel = new Path2D(); const cx = 200, cy = 1110;
  for (const hx of [cx + 110, cx + 170]) chariot.addPath(polyPath([[hx - 40, cy], [hx + 30, cy - 4], [hx + 54, cy - 38], [hx + 66, cy - 30], [hx + 44, cy], [hx + 40, cy + 34], [hx + 30, cy + 34], [hx + 24, cy + 12], [hx - 28, cy + 12], [hx - 36, cy + 34], [hx - 46, cy + 34], [hx - 44, cy + 4]]));
  chariot.rect(cx - 40, cy - 20, 80, 30); chariot.rect(cx + 30, cy - 4, 60, 6); blob(chariot, cx - 10, cy - 50, 9, 10); chariot.rect(cx - 18, cy - 40, 16, 22); blob(chariot, cx + 16, cy - 52, 9, 10); chariot.rect(cx + 8, cy - 42, 16, 24);
  wheel.addPath(ringPath(cx, cy + 20, 22, 30)); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; wheel.addPath(polyPath([[cx + 3 * Math.cos(a + 1.57), cy + 20 + 3 * Math.sin(a + 1.57)], [cx + 24 * Math.cos(a) + 3 * Math.cos(a + 1.57), cy + 20 + 24 * Math.sin(a) + 3 * Math.sin(a + 1.57)], [cx + 24 * Math.cos(a) - 3 * Math.cos(a + 1.57), cy + 20 + 24 * Math.sin(a) - 3 * Math.sin(a + 1.57)], [cx - 3 * Math.cos(a + 1.57), cy + 20 - 3 * Math.sin(a + 1.57)]])); }
  const dust = new Path2D(); for (let k = 0; k < 6; k++) blob(dust, cx - 80 - k * 60, cy + 30 - k * 6, 40 + k * 8, 18 + k * 3);
  return compose(seed, { focus: [540, 880], parts: [
    { pull: 'land', ink: 'mid', path: ridge },
    { pull: 'land', ink: 'far', path: walls, knock: unionPath([blocks, gate]) }, { pull: 'land', ink: 'near', path: gate, lit: 1 },
    { pull: 'acc', ink: 'glow', path: dust, lit: 1, drift: [100, -4] },
    { pull: 'acc', ink: 'near', path: chariot, drift: [100, 0], sway: [0, 9, 0] },
    { pull: 'acc', ink: 'sun', path: wheel, drift: [100, 0], spin: [cx, cy + 20, 6] },
    { pull: 'acc', ink: 'near', path: birds([[880, 560, .9], [940, 530, .7], [820, 520, .6]]), drift: [-60, 6] },
  ] }, { cones: [[40, 140, 44], [1040, 150, 46]], slope: false });
}
// 3 · 330: the new capital on the water — sea walls, a great column with a gilded statue, churches, galleys rowing in
function constantinople(seed = 17) {
  const city = new Path2D(), r = mulberry(seed); for (let x = -BLEED; x < AW + BLEED;) { const w = 60 + r() * 60, h = 60 + r() * 90; city.rect(x, 1040 - h, w - 4, h + 20); x += w; }
  const domes = new Path2D(); for (const [x, rr] of [[220, 60], [820, 70]]) { domes.rect(x - rr - 10, 920, 2 * rr + 20, 120); dome(domes, x, 920, rr); }
  const col = new Path2D(); col.rect(500, 640, 70, 400); col.rect(480, 1000, 110, 40); col.rect(488, 630, 94, 16);
  const rings = new Path2D(); for (let y = 680; y < 1000; y += 46) rings.rect(500, y, 70, 6);
  const statue = new Path2D(); blob(statue, 535, 580, 12, 13); statue.addPath(polyPath([[520, 594], [550, 594], [556, 630], [514, 630]])); statue.rect(554, 540, 4, 70); blob(statue, 535, 560, 24, 24, Math.PI * 1.1, Math.PI * 1.9);
  const seawall = new Path2D(); seawall.rect(-BLEED, 1040, AW + 2 * BLEED, 40); for (let x = 0; x < AW; x += 140) { seawall.rect(x, 1010, 50, 70); } for (let x = -BLEED; x < AW + BLEED; x += 30) seawall.rect(x, 1030, 18, 12);
  const galleys = new Path2D(), oars = new Path2D(); for (const [x, s] of [[200, 1], [760, .8]]) { galley(galleys, x, 1150, s); for (let k = 0; k < 8; k++) oars.addPath(polyPath([[x - 80 * s + k * 22 * s, 1160], [x - 76 * s + k * 22 * s, 1160], [x - 90 * s + k * 22 * s, 1180], [x - 94 * s + k * 22 * s, 1180]])); }
  return compose(seed, { focus: [540, 860], parts: [
    { pull: 'land', ink: 'far', path: city }, { pull: 'land', ink: 'paper', path: domes },
    { pull: 'land', ink: 'near', path: col, knock: rings }, { pull: 'land', ink: 'sun', path: statue, lit: 1 },
    { pull: 'land', ink: 'near', path: seawall },
    ...water(seed, 1080, 'sky2', 1180, -36),
    { pull: 'acc', ink: 'near', path: galleys, drift: [40, 0] }, { pull: 'acc', ink: 'near', path: oars, drift: [40, 0], sway: [6, 5, 0] },
    { pull: 'acc', ink: 'near', path: birds([[880, 600, .8], [930, 570, .6], [840, 560, .5]]), drift: [-80, 4] },
  ] }, { cones: false });
}
// 4 · 537: the great church — a vast shallow dome on a ring of windows, half-domes and buttresses, light pouring from the windows, pigeons
function hagia(seed = 19) {
  const cx = 520, ch = new Path2D(); ch.rect(cx - 330, 860, 660, 250); ch.rect(cx - 200, 760, 400, 110); dome(ch, cx, 760, 190, .55); ch.rect(cx - 6, 630, 12, 30);
  for (const s of [-1, 1]) { blob(ch, cx + s * 250, 870, 110, 70, Math.PI, Math.PI * 2); ch.rect(cx + s * 360 - 40, 820, 80, 290); }
  const wins = new Path2D(); for (let k = 0; k < 13; k++) { const x = cx - 168 + k * 28; wins.rect(x, 728, 12, 26); }
  const lower = new Path2D(); for (let x = cx - 300; x < cx + 300; x += 60) { lower.rect(x + 16, 920, 22, 60); blob(lower, x + 27, 920, 11, 11, Math.PI, Math.PI * 2); } for (let x = cx - 280; x < cx + 300; x += 80) lower.rect(x + 20, 1020, 30, 60);
  const harbor = new Path2D(); for (const [x, s] of [[880, .7], [1010, .6]]) galley(harbor, x, 1150, s);
  const trees = new Path2D(); for (const x of [40, 960, 1040]) { trees.addPath(polyPath([[x - 14, 1110], [x + 14, 1110], [x + 4, 860], [x - 4, 860]])); }
  return compose(seed, { focus: [520, 840], parts: [
    { pull: 'land', ink: 'sun', path: ch, knock: unionPath([wins, lower]) },
    { pull: 'land', ink: 'near', path: lower, lit: 1 },
    { pull: 'land', ink: 'glow', path: wins, lit: 1, blink: 1 },
    { pull: 'acc', ink: 'near', path: trees, sway: [5, 1.2, 0] },
    ...water(seed, 1120, 'sky2', 1180, -30),
    { pull: 'acc', ink: 'near', path: harbor, drift: [-30, 0] },
    { pull: 'acc', ink: 'near', path: birds([[300, 600, .7], [340, 580, .55], [380, 610, .5], [420, 590, .45]]), swing: [400, 720, .4, 1.1, 0] },
  ] }, { cones: false });
}
// 5 · 1453: the triple land walls under smoke, a great cannon firing, a breach, ships in the bay, crows
function siege(seed = 23) {
  const walls = new Path2D(); walls.rect(-BLEED, 900, AW + 2 * BLEED, 120); walls.rect(-BLEED, 980, AW + 2 * BLEED, 80); walls.rect(-BLEED, 1040, AW + 2 * BLEED, 50);
  for (let x = -20; x < AW + 40; x += 170) { walls.rect(x, 830, 80, 190); for (let k = 0; k < 3; k++) walls.rect(x + k * 30, 812, 20, 20); }
  const breach = polyPath([[520, 900], [580, 930], [640, 890], [700, 960], [700, 1100], [520, 1100], [500, 980]]);
  const rubble = new Path2D(), r = mulberry(seed); for (let k = 0; k < 16; k++) { const x = 500 + r() * 220, y = 1060 + r() * 50; rubble.addPath(polyPath([[x, y], [x + 26, y - 4], [x + 22, y - 22], [x + 4, y - 18]])); }
  const cannon = new Path2D(); cannon.addPath(polyPath([[60, 1150], [360, 1110], [370, 1150], [70, 1180]])); blob(cannon, 100, 1170, 34, 34); cannon.rect(40, 1170, 160, 16);
  const puff = new Path2D(); for (let k = 0; k < 7; k++) blob(puff, 380 + k * 40, 1110 - k * 22, 30 + k * 10, 22 + k * 7);
  return compose(seed, { focus: [540, 920], parts: [
    { pull: 'acc', ink: 'mid', path: smokeCol(300, 820, 7, 1.1), lit: 1, drift: [16, -30] }, { pull: 'acc', ink: 'glow', path: smokeCol(760, 800, 6), lit: 1, drift: [-12, -40] },
    { pull: 'land', ink: 'far', path: walls, knock: breach },
    { pull: 'land', ink: 'near', path: rubble },
    { pull: 'acc', ink: 'near', path: cannon },
    { pull: 'acc', ink: 'paper', path: puff, lit: 1, loop: [80, -40, .5] },
    { pull: 'acc', ink: 'near', path: birds([[620, 560, 1.0], [680, 520, .8], [560, 520, .6], [740, 600, .6]]), drift: [-50, 6], swing: [650, 600, .2, 1.3, 0] },
  ] }, { cones: false, slope: false });
}
// 6 · 1500s: a great mosque on the hill — cascading domes and four slender minarets — tulips swaying in the garden, caiques on the water
function suleiman(seed = 29) {
  const cx = 540, m = new Path2D(); m.rect(cx - 300, 900, 600, 180); dome(m, cx, 820, 150, .75); m.rect(cx - 160, 820, 320, 90); m.rect(cx - 5, 680, 10, 34);
  for (const s of [-1, 1]) { dome(m, cx + s * 200, 900, 80, .7); dome(m, cx + s * 300, 940, 50, .7); }
  for (const [x, h] of [[cx - 360, 420], [cx - 300, 360], [cx + 300, 360], [cx + 360, 420]]) minaret(m, x, 1080, h, 20);
  const arcs = new Path2D(); for (let x = cx - 280; x < cx + 280; x += 56) { arcs.rect(x + 16, 980, 24, 60); blob(arcs, x + 28, 980, 12, 14, Math.PI, Math.PI * 2); }
  const tul = [new Path2D(), new Path2D()], stems = new Path2D(); for (let k = 0; k < 24; k++) { const x = -40 + k * 48, y = 1120 + (k % 2) * 20; stems.rect(x - 2, y, 4, 60); tul[k % 2].addPath(polyPath([[x - 14, y], [x + 14, y], [x + 16, y - 26], [x + 7, y - 16], [x, y - 30], [x - 7, y - 16], [x - 16, y - 26]])); }
  const boats = new Path2D(); for (const x of [-120, 300]) { boats.addPath(polyPath([[x - 70, 1100], [x + 70, 1100], [x + 90, 1086], [x + 60, 1110], [x - 60, 1110], [x - 90, 1086]])); boats.rect(x - 2, 1060, 4, 40); }
  return compose(seed, { focus: [540, 860], parts: [
    { pull: 'land', ink: 'mid', path: m, knock: arcs }, { pull: 'land', ink: 'glow', path: arcs, lit: 1 },
    ...water(seed, 1080, 'sky2', 1120, -30),
    { pull: 'acc', ink: 'near', path: boats, drift: [60, 0] },
    { pull: 'acc', ink: 'mid', path: stems, sway: [5, 1.6, 0] },
    { pull: 'acc', ink: 'sun', path: tul[0], sway: [5, 1.6, 0] }, { pull: 'acc', ink: 'glow', path: tul[1], sway: [5, 1.6, .5] },
    { pull: 'acc', ink: 'near', path: birds([[860, 600, .8], [910, 570, .6], [820, 560, .5]]), swing: [860, 680, .3, 1.0, 0] },
  ] }, { cones: false, slope: false });
}
// 7 · 1923: a new capital on the steppe — a castle on its hill, a plain stone assembly hall, a boulevard with young trees and lamps, people walking
function republic(seed = 31) {
  const hill = polyPath([[600, 1000], [700, 860], [820, 820], [940, 830], [AW + BLEED, 900], [AW + BLEED, 1060], [600, 1060]]);
  const castle = new Path2D(); castle.rect(720, 760, 260, 70); for (let x = 720; x < 980; x += 40) castle.rect(x, 740, 24, 22); for (const x of [700, 960]) castle.rect(x, 720, 50, 110);
  const hall = new Path2D(); hall.rect(80, 880, 480, 200); hall.addPath(polyPath([[60, 884], [580, 884], [540, 850], [100, 850]])); hall.rect(260, 820, 120, 64);
  const hw = new Path2D(); for (let x = 110; x < 540; x += 60) for (const y of [910, 990]) { hw.rect(x, y, 26, 50); blob(hw, x + 13, y, 13, 10, Math.PI, Math.PI * 2); } hw.rect(290, 1020, 60, 60);
  const lamps = new Path2D(), lights = new Path2D(); for (let x = 40; x < AW; x += 170) { lamps.rect(x, 1050, 5, 110); lamps.rect(x - 10, 1046, 25, 6); blob(lights, x + 2, 1040, 9, 9); }
  const trees = new Path2D(); for (let x = 125; x < AW; x += 170) { trees.rect(x - 3, 1100, 6, 60); blob(trees, x, 1086, 26, 30); }
  const people = new Path2D(); for (let k = 0; k < 12; k++) { const x = -100 + k * 90; blob(people, x, 1134, 9, 10); people.addPath(polyPath([[x - 11, 1144], [x + 11, 1144], [x + 13, 1180], [x - 13, 1180]])); }
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'far', path: hill }, { pull: 'land', ink: 'near', path: castle },
    { pull: 'land', ink: 'paper', path: hall, knock: hw }, { pull: 'land', ink: 'near', path: hw, lit: 1 },
    { pull: 'acc', ink: 'mid', path: trees, sway: [4, 1.5, 0] },
    { pull: 'acc', ink: 'near', path: lamps }, { pull: 'acc', ink: 'glow', path: lights, lit: 1, blink: 1 },
    { pull: 'acc', ink: 'near', path: people, drift: [50, 0], sway: [0, 6, 0] },
  ] }, { cones: [[40, 120, 40]], slope: false });
}
// 8 · today: the strait at dusk — a suspension bridge between two shores, domes and minarets, a tall tower, ferries crossing, gulls, balloons far off
function today(seed = 37) {
  const r = mulberry(seed), city = new Path2D(), lit = [new Path2D(), new Path2D(), new Path2D()];
  for (let x = -BLEED; x < AW + BLEED;) { const w = 50 + r() * 60, h = 50 + r() * 90; city.rect(x, 1040 - h, w - 4, h + 10); for (let wy = 1050 - h; wy < 1030; wy += 22) for (let wx = x + 8; wx < x + w - 14; wx += 16) if (r() < .3) lit[Math.floor(r() * 3)].rect(wx, wy, 7, 10); x += w; }
  const mosque = new Path2D(); mosque.rect(200, 900, 300, 100); dome(mosque, 350, 900, 100, .75); for (const s of [-1, 1]) dome(mosque, 350 + s * 120, 940, 45, .7); minaret(mosque, 170, 1000, 300, 16); minaret(mosque, 530, 1000, 300, 16);
  const tower = new Path2D(); tower.rect(640, 760, 70, 280); tower.addPath(polyPath([[630, 762], [720, 762], [675, 680]])); const tw = new Path2D(); for (let y = 790; y < 1000; y += 50) tw.rect(667, y, 16, 26);
  const bridge = new Path2D(), cables = new Path2D(); bridge.rect(-BLEED, 1060, AW + 2 * BLEED, 14); for (const x of [120, 960]) bridge.rect(x - 12, 860, 24, 210);
  for (let k = 0; k <= 40; k++) { const x = -BLEED + k * (AW + 2 * BLEED) / 40, u = (x - 120) / 840, y = x < 120 ? 860 + (120 - x) * 1.2 : x > 960 ? 860 + (x - 960) * 1.2 : 860 + 180 * 4 * u * (1 - u); cables.rect(x, y, (AW + 2 * BLEED) / 40 + 1, 4); if (x > 130 && x < 950) cables.rect(x, y, 2, 1060 - y); }
  const ferries = new Path2D(); for (const x of [150, 650]) { ferries.addPath(polyPath([[x - 90, 1130], [x + 90, 1130], [x + 110, 1112], [x + 80, 1148], [x - 80, 1148], [x - 100, 1112]])); ferries.rect(x - 60, 1100, 120, 30); ferries.rect(x - 10, 1080, 16, 20); }
  const balloons = new Path2D(); for (const [x, y, s] of [[860, 560, 1], [960, 640, .7], [780, 660, .6]]) { blob(balloons, x, y, 34 * s, 40 * s); balloons.addPath(polyPath([[x - 22 * s, y + 26 * s], [x + 22 * s, y + 26 * s], [x + 10 * s, y + 52 * s], [x - 10 * s, y + 52 * s]])); balloons.rect(x - 9 * s, y + 52 * s, 18 * s, 14 * s); }
  return compose(seed, { focus: [500, 880], parts: [
    { pull: 'acc', ink: 'sun', path: balloons, drift: [6, -22], sway: [5, .9, 0] },
    { pull: 'land', ink: 'mid', path: city },
    ...lit.map((p, k) => ({ pull: 'land', ink: 'glow', path: p, lit: 1, blink: k })),
    { pull: 'land', ink: 'far', path: mosque },
    { pull: 'land', ink: 'paper', path: tower, knock: tw }, { pull: 'land', ink: 'near', path: tw, lit: 1 },
    { pull: 'land', ink: 'near', path: unionPath([bridge, cables]) },
    ...water(seed, 1074, 'sky2', 1180, -36),
    { pull: 'acc', ink: 'near', path: ferries, drift: [50, 0] },
    { pull: 'acc', ink: 'near', path: birds([[420, 620, .8], [470, 590, .6], [380, 580, .5]]), swing: [440, 700, .4, 1.2, 0] },
  ] }, { cones: false, slope: false });
}

export const SCENES = { gobekli, hattusa, constantinople, hagia, siege, suleiman, republic, today };
