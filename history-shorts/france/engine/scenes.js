// scenes.js · FRANCE — vertical print (1080×1920 art units, full bleed).
// Base: a high summer sky with long cloud streaks, a sun on the right with a ring of short rays, a far line of blue hills with
// vineyard terraces, a stone farmhouse, rows of lavender running to the horizon, round plane trees swaying, swallows swinging.
// One era landmark per print. Parts: { pull, ink, path, knock?, cut?, lit?, drift?, blink?, sway?, seq?, loop?, spin?, swing? }.
// Landmarks are original stylised silhouettes from simple paths: not traced from photographs, no logos, no flags or emblems, no maps.
import { mulberry, polyPath, circlePath, ringPath, rectPath, unionPath, bandSteps } from './silk.js';

export const AW = 1080, AH = 1920, BLEED = 60;
export const GROUND = 1180;
export const BAND = [-BLEED, 1170, AW + 2 * BLEED, AH - 1170 + BLEED];
const FULL = () => rectPath(-BLEED, -BLEED, AW + 2 * BLEED, AH + 2 * BLEED);
const SUN = [800, 560], SR = 78;

function blob(p, x, y, rx, ry, a0 = 0, a1 = Math.PI * 2) { p.moveTo(x + rx * Math.cos(a0), y + ry * Math.sin(a0)); p.ellipse(x, y, rx, ry, 0, a0, a1); p.closePath(); }
const bird = (p, x, y, s) => p.addPath(polyPath([[x - 24 * s, y - 6 * s], [x - 11 * s, y - 10 * s], [x, y], [x + 11 * s, y - 10 * s], [x + 24 * s, y - 6 * s], [x + 11 * s, y - 5 * s], [x, y + 5 * s], [x - 11 * s, y - 5 * s]]));
const birds = (list) => { const p = new Path2D(); for (const [x, y, s] of list) bird(p, x, y, s); return p; };
function swallow(p, x, y, s) { p.addPath(polyPath([[x - 30 * s, y - 8 * s], [x - 6 * s, y - 2 * s], [x, y - 6 * s], [x + 6 * s, y - 2 * s], [x + 30 * s, y - 8 * s], [x + 8 * s, y + 4 * s], [x + 4 * s, y + 18 * s], [x, y + 8 * s], [x - 4 * s, y + 18 * s], [x - 8 * s, y + 4 * s]])); }
function line(seed, y0, amp, n = 40) {
  const pts = []; for (let i = 0; i <= n; i++) { const x = -BLEED + (AW + 2 * BLEED) * i / n; pts.push([x, y0 + amp * Math.sin(x / 230 + seed) + amp * .4 * Math.sin(x / 90 + seed * 2.1)]); }
  return pts;
}
function water(seed, y0, ink = 'mid', y1 = 1180, speed = -22) {
  const glints = new Path2D(), r = mulberry(seed);
  for (let i = 0; i < 6; i++) { const y = y0 + 8 + i * 12; let x = -BLEED - 240 + r() * 60; while (x < AW + BLEED + 240) { const L = 40 + r() * 120; glints.rect(x, y, L, 3 + i * .5); x += L + 60 + r() * 110; } }
  return [{ pull: 'land', ink, path: rectPath(-BLEED, y0, AW + 2 * BLEED, y1 - y0) }, { pull: 'land', ink: 'glow', path: glints, lit: 1, drift: [speed, 0] }];
}
function plane(p, x, base, s = 1) { p.rect(x - 8 * s, base - 70 * s, 16 * s, 70 * s); for (const [dx, dy, r] of [[0, -110, 62], [-48, -86, 44], [48, -88, 46], [0, -150, 40]]) blob(p, x + dx * s, base + dy * s, r * s, r * s * .8); }
function crenel(p, x0, x1, y, h = 20, w = 20, gap = 14) { for (let x = x0; x < x1 - w / 2; x += w + gap) p.rect(x, y - h, w, h + 1); }
function roundTower(p, x, top, base, w, cap = true) { p.rect(x - w / 2, top, w, base - top); if (cap) p.addPath(polyPath([[x - w / 2 - 6, top + 2], [x + w / 2 + 6, top + 2], [x, top - w * 1.1]])); }
function smokeCol(x, y, n = 6, s = 1) { const p = new Path2D(); for (let k = 0; k < n; k++) blob(p, x + k * 14 * s, y - k * 60 * s, (20 + k * 9) * s, (14 + k * 6) * s); return p; }

// ---------------- the base print ----------------
function base(seed, o = {}) {
  const sunKnock = unionPath([circlePath(SUN[0], SUN[1], SR + 10), ringPath(SUN[0], SUN[1], SR + 30, SR + 36)]);
  const rays = new Path2D(); for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; rays.addPath(polyPath([[SUN[0] + (SR + 44) * Math.cos(a - .05), SUN[1] + (SR + 44) * Math.sin(a - .05)], [SUN[0] + (SR + 74) * Math.cos(a), SUN[1] + (SR + 74) * Math.sin(a)], [SUN[0] + (SR + 44) * Math.cos(a + .05), SUN[1] + (SR + 44) * Math.sin(a + .05)]])); }
  const sky2 = new Path2D(); sky2.rect(-BLEED, -BLEED, AW + 2 * BLEED, 110 + BLEED); sky2.addPath(bandSteps(-BLEED, AW + 2 * BLEED, 100, 780, 5, 12));
  const streaks = [new Path2D(), new Path2D()], r = mulberry(seed + 3);
  for (let k = 0; k < 12; k++) { const g = streaks[k % 2], x = -700 + r() * 1900, y = 470 + k * 30 + r() * 14, w = 200 + r() * 360; g.rect(x, y, w, 8 + r() * 6); g.rect(x + 60, y - 12, w * .45, 6); }
  const hills = polyPath([[-BLEED, 1300], ...line(seed, 960, 26), [AW + BLEED, 1300]]);
  const vines = new Path2D(); for (let k = 0; k < 4; k++) vines.addPath(polyPath([...line(seed, 985 + k * 15, 26 - k * 3), ...line(seed, 989 + k * 15, 26 - k * 3).reverse()]));
  const field = polyPath([[-BLEED, 1300], ...line(seed + 2, 1045, 6), [AW + BLEED, 1300]]);
  const lav = new Path2D(), VX = 540, VY = 1040;                                                   // lavender rows running to the horizon
  for (let k = -9; k <= 9; k++) { const xb = VX + k * 150; lav.addPath(polyPath([[VX + k * 22 - 4, VY + 8], [VX + k * 22 + 4, VY + 8], [xb + 30, 1190], [xb - 30, 1190]])); }
  const mas = new Path2D(); if (o.farm !== false) { mas.rect(130, 990, 120, 56); mas.addPath(polyPath([[120, 992], [260, 992], [240, 966], [140, 966]])); mas.rect(230, 950, 14, 30); }
  const masW = new Path2D(); if (o.farm !== false) { masW.rect(150, 1006, 16, 20); masW.rect(196, 1006, 16, 20); }
  const trees = new Path2D(); for (const [x, s] of o.trees || [[40, .9], [1030, 1.0]]) plane(trees, x, 1110, s);
  const sw = new Path2D(); swallow(sw, 620, 470, 1); swallow(sw, 680, 430, .7); swallow(sw, 560, 430, .6);
  return {
    sky: [
      { pull: 'sky1', ink: 'sky1', path: FULL(), knock: sunKnock },
      { pull: 'sky2', ink: 'sky2', path: sky2 },
      { pull: 'sky2', ink: 'sky1', path: streaks[0], drift: [-34, 0] }, { pull: 'sky2', ink: 'glow', path: streaks[1], drift: [-58, 0], lit: 1 },
      { pull: 'sun', ink: 'sun', path: circlePath(SUN[0], SUN[1], SR) },
      { pull: 'sun', ink: 'sun', path: rays, spin: [SUN[0], SUN[1], .12], lit: 1 },
    ],
    far: [{ pull: 'far', ink: 'far', path: hills }, { pull: 'far', ink: 'mid', path: vines, lit: 1 }],
    mid: [
      ...(o.field === false ? [] : [{ pull: 'mid', ink: 'mid', path: field }, { pull: 'mid', ink: 'far', path: lav, sway: [3, 1.4, 0] }, { pull: 'mid', ink: 'glow', path: mas, knock: masW }]),
      ...(o.trees === false ? [] : [{ pull: 'mid', ink: 'near', path: trees, sway: [5, 1.2, .4] }]),
      { pull: 'mid', ink: 'near', path: sw, swing: [600, 560, .3, .9, 0] },
    ],
  };
}
function bandPart() {
  const p = rectPath(...BAND);
  const knock = new Path2D(); for (let x = 20; x < AW - 30; x += 48) { knock.addPath(polyPath([[x, BAND[1] + 22], [x + 12, BAND[1] + 12], [x + 24, BAND[1] + 22], [x + 12, BAND[1] + 32]])); knock.rect(x + 30, BAND[1] + 20, 12, 4); }   // a lozenge border, like wrought iron
  return { pull: 'band', ink: 'near', path: p, knock };
}
function compose(seed, land, o = {}) {
  const b = base(seed, o);
  const parts = o.cave ? [] : [...b.sky, ...b.far, ...b.mid];
  return { focus: land.focus, parts: [...parts, ...land.parts, bandPart()], depth: { sky1: 0, sky2: 0, sun: .1, far: .3, mid: .55, land: .85, acc: .85, band: 1 } };
}

// ---------------- the eras ----------------
// 1 · c. 34,000 BC: inside the cave — a pale wall painted with horses, lions and a rhino, hand stencils, torches flickering, drips falling
function horse(p, x, y, s) { p.addPath(polyPath([[x, y], [x + 40 * s, y - 50 * s], [x + 70 * s, y - 60 * s], [x + 100 * s, y - 40 * s], [x + 110 * s, y - 10 * s], [x + 90 * s, y], [x + 70 * s, y - 20 * s], [x + 60 * s, y + 10 * s], [x + 30 * s, y + 40 * s], [x + 6 * s, y + 30 * s]])); p.addPath(polyPath([[x + 30 * s, y - 40 * s], [x + 70 * s, y - 62 * s], [x + 60 * s, y - 70 * s], [x + 24 * s, y - 48 * s]])); }
function lion(p, x, y, s) { p.addPath(polyPath([[x, y], [x + 30 * s, y - 34 * s], [x + 60 * s, y - 30 * s], [x + 200 * s, y - 26 * s], [x + 250 * s, y - 10 * s], [x + 290 * s, y - 30 * s], [x + 270 * s, y], [x + 240 * s, y + 10 * s], [x + 236 * s, y + 50 * s], [x + 220 * s, y + 50 * s], [x + 210 * s, y + 14 * s], [x + 80 * s, y + 14 * s], [x + 60 * s, y + 50 * s], [x + 44 * s, y + 50 * s], [x + 40 * s, y + 12 * s], [x + 6 * s, y + 10 * s]])); }
function rhino(p, x, y, s) { blob(p, x + 100 * s, y, 110 * s, 54 * s); blob(p, x - 10 * s, y + 10 * s, 40 * s, 30 * s); p.addPath(polyPath([[x - 40 * s, y], [x - 70 * s, y - 50 * s], [x - 30 * s, y - 10 * s]])); p.addPath(polyPath([[x - 10 * s, y - 14 * s], [x - 20 * s, y - 50 * s], [x + 6 * s, y - 20 * s]])); for (const dx of [30, 60, 150, 180]) p.rect(x + dx * s, y + 40 * s, 18 * s, 40 * s); }
function hand(p, x, y, s, a = 0) { const m = new DOMMatrix().translate(x, y).rotate(a).scale(s); const q = new Path2D(); blob(q, 0, 0, 22, 26); for (const [dx, h] of [[-16, 40], [-6, 50], [5, 50], [15, 42]]) q.rect(dx - 4, -20 - h, 9, h); q.addPath(polyPath([[18, 0], [40, -24], [46, -18], [24, 10]])); p.addPath(q, m); }
function cave(seed = 11) {
  const rock = new Path2D(); rock.rect(-BLEED, 470, AW + 2 * BLEED, AH);
  const wallP = polyPath([[-BLEED, 540], [100, 500], [300, 480], [560, 476], [800, 486], [1000, 500], [AW + BLEED, 540], [AW + BLEED, 1110], [900, 1080], [600, 1120], [300, 1090], [-BLEED, 1120]]);
  const stal = new Path2D(); { const r = mulberry(seed); for (let x = -40; x < AW + 40; x += 40 + r() * 50) { const h = 30 + r() * 80, y = 500 + 20 * Math.sin(x / 140); stal.addPath(polyPath([[x - 14, y - 40], [x + 14, y - 40], [x + 2, y + h], [x - 2, y + h]])); } }
  const ochre = new Path2D(), char = new Path2D(); horse(char, 160, 640, 1.1); horse(char, 230, 610, 1.0); horse(char, 300, 650, .9); lion(char, 520, 760, 1.4); rhino(ochre, 300, 900, 1.0); horse(ochre, 680, 560, .9);
  const hands = new Path2D(); hand(hands, 860, 860, 1.1, -10); hand(hands, 940, 820, .9, 12); hand(hands, 120, 950, 1.0, 6);
  const dots = new Path2D(); for (let k = 0; k < 14; k++) blob(dots, 820 + (k % 5) * 30, 650 + Math.floor(k / 5) * 30, 8, 8);
  const torchL = new Path2D(), torchR = new Path2D(); torchL.addPath(polyPath([[60, 1100], [72, 1100], [96, 900], [86, 898]])); torchR.addPath(polyPath([[1010, 1100], [1022, 1100], [1000, 900], [990, 902]]));
  const flames = [new Path2D(), new Path2D()]; for (const [x, k] of [[92, 0], [994, 1]]) { flames[k].addPath(polyPath([[x - 26, 900], [x + 26, 900], [x + 10, 850], [x + 4, 870], [x - 4, 820], [x - 14, 866]])); }
  const glowP = new Path2D(); blob(glowP, 92, 870, 160, 120); blob(glowP, 994, 870, 160, 120);
  const floor = polyPath([[-BLEED, 1180], [-BLEED, 1110], [300, 1090], [600, 1120], [900, 1080], [AW + BLEED, 1110], [AW + BLEED, 1180]]);
  const drips = new Path2D(); for (const x of [200, 460, 700, 880]) for (let k = 0; k < 3; k++) blob(drips, x, 480 + k * 200, 3, 7);
  return compose(seed, { focus: [540, 760], parts: [
    { pull: 'sky1', ink: 'sky1', path: FULL() },
    { pull: 'sky2', ink: 'sky2', path: (() => { const p = new Path2D(); p.addPath(bandSteps(-BLEED, AW + 2 * BLEED, -BLEED, 440, 4, 10)); return p; })() },
    { pull: 'sky1', ink: 'near', path: rock, knock: wallP },
    { pull: 'far', ink: 'sky1', path: wallP },
    { pull: 'far', ink: 'glow', path: glowP, lit: 1, blink: 0 },
    { pull: 'mid', ink: 'mid', path: stal },
    { pull: 'land', ink: 'near', path: char },
    { pull: 'land', ink: 'sun', path: ochre },
    { pull: 'land', ink: 'sun', path: dots, lit: 1 },
    { pull: 'land', ink: 'far', path: hands },
    { pull: 'land', ink: 'far', path: floor },
    { pull: 'acc', ink: 'mid', path: unionPath([torchL, torchR]) },
    { pull: 'acc', ink: 'sun', path: flames[0], sway: [5, 7, 0] }, { pull: 'acc', ink: 'glow', path: flames[1], sway: [5, 8, 1] },
    { pull: 'acc', ink: 'glow', path: drips, lit: 1, loop: [0, 200, .9] },
    { pull: 'acc', ink: 'near', path: (() => { const p = new Path2D(); for (const [x, y, s] of [[300, 520, .6], [340, 500, .5], [380, 530, .45]]) bird(p, x, y, s); return p; })(), swing: [340, 600, .4, 1.6, 0] },
  ] }, { cave: true });
}
// 2 · 52 BC: a hilltop town behind its rampart, the ring of siege works below, towers, smoke rising, crows
function alesia(seed = 13) {
  const hill = polyPath([[-BLEED, 1180], [-BLEED, 1020], [160, 980], [300, 860], [780, 850], [920, 960], [AW + BLEED, 1000], [AW + BLEED, 1180]]);
  const town = new Path2D(), r = mulberry(seed); for (let x = 320; x < 770; x += 46) { const h = 30 + r() * 30; town.rect(x, 850 - h, 40, h + 10); town.addPath(polyPath([[x - 6, 852 - h], [x + 46, 852 - h], [x + 20, 820 - h]])); }
  const ramp = new Path2D(); ramp.rect(300, 846, 480, 16); for (let x = 300; x < 780; x += 12) ramp.addPath(polyPath([[x, 848], [x + 10, 848], [x + 5, 830]]));
  const stakes = new Path2D(); for (let x = -40; x < AW + 40; x += 14) stakes.addPath(polyPath([[x, 1100], [x + 9, 1100], [x + 5, 1060]])); stakes.rect(-BLEED, 1098, AW + 2 * BLEED, 10);
  const towers = new Path2D(); for (const x of [80, 330, 600, 880]) { towers.rect(x, 1000, 50, 100); towers.rect(x - 8, 994, 66, 12); towers.rect(x + 22, 960, 6, 34); }
  const tents = new Path2D(); for (let x = 20; x < AW; x += 120) tents.addPath(polyPath([[x, 1160], [x + 80, 1160], [x + 40, 1120]]));
  const marchers = new Path2D(); for (let k = 0; k < 10; k++) { const x = -200 + k * 60; blob(marchers, x, 1124, 8, 9); marchers.rect(x - 8, 1132, 16, 26); marchers.rect(x + 6, 1094, 3, 60); }
  return compose(seed, { focus: [540, 920], parts: [
    { pull: 'land', ink: 'mid', path: hill },
    { pull: 'land', ink: 'far', path: unionPath([town, ramp]) },
    { pull: 'acc', ink: 'mid', path: smokeCol(450, 780, 6), lit: 1, drift: [14, -26] }, { pull: 'acc', ink: 'glow', path: smokeCol(660, 790, 5, .8), lit: 1, drift: [-10, -34] },
    { pull: 'land', ink: 'near', path: unionPath([stakes, towers]) },
    { pull: 'acc', ink: 'paper', path: tents },
    { pull: 'acc', ink: 'near', path: marchers, drift: [60, 0], sway: [3, 7, 0] },
    { pull: 'acc', ink: 'near', path: birds([[640, 560, 1.0], [700, 520, .8], [580, 520, .6], [760, 600, .6]]), drift: [-50, 6], swing: [680, 600, .2, 1.3, 0] },
  ] }, { field: false, farm: false, trees: false });
}
// 3 · 800: an eight-sided domed chapel with its tower, and above it a crown with a slowly turning ring of light
function charlemagne(seed = 17) {
  const cx = 540, ch = new Path2D(); ch.addPath(polyPath([[cx - 220, 1110], [cx + 220, 1110], [cx + 220, 900], [cx + 150, 850], [cx - 150, 850], [cx - 220, 900]]));
  blob(ch, cx, 850, 150, 120, Math.PI, Math.PI * 2); ch.rect(cx - 10, 700, 20, 40); ch.rect(cx - 360, 760, 110, 350); ch.addPath(polyPath([[cx - 370, 762], [cx - 240, 762], [cx - 305, 650]]));
  const win = new Path2D(); for (const x of [cx - 160, cx - 60, cx + 40, cx + 140]) { win.rect(x, 940, 24, 70); blob(win, x + 12, 940, 12, 12, Math.PI, Math.PI * 2); } blob(win, cx, 1060, 40, 40, Math.PI, Math.PI * 2); win.rect(cx - 40, 1060, 80, 50);
  for (const y of [800, 900, 1000]) win.rect(cx - 318, y, 26, 50);
  const crown = new Path2D(); crown.addPath(polyPath([[cx - 90, 640], [cx + 90, 640], [cx + 100, 560], [cx + 60, 590], [cx + 30, 540], [cx, 580], [cx - 30, 540], [cx - 60, 590], [cx - 100, 560]])); crown.rect(cx - 6, 500, 12, 40); crown.rect(cx - 18, 512, 36, 10);
  const gems = new Path2D(); for (const dx of [-60, -20, 20, 60]) blob(gems, cx + dx, 616, 9, 9);
  const halo = new Path2D(); for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12; halo.addPath(polyPath([[cx + 130 * Math.cos(a - .04), 590 + 130 * Math.sin(a - .04)], [cx + 190 * Math.cos(a), 590 + 190 * Math.sin(a)], [cx + 130 * Math.cos(a + .04), 590 + 130 * Math.sin(a + .04)]])); }
  const riders = new Path2D(); for (let k = 0; k < 3; k++) { const x = -60 + k * 140, y = 1150; riders.addPath(polyPath([[x - 50, y], [x + 40, y], [x + 70, y - 34], [x + 84, y - 26], [x + 60, y + 4], [x + 56, y + 30], [x + 46, y + 30], [x + 40, y + 12], [x - 36, y + 12], [x - 46, y + 30], [x - 56, y + 30]])); riders.rect(x - 8, y - 40, 16, 40); blob(riders, x, y - 50, 10, 11); }
  return compose(seed, { focus: [540, 820], parts: [
    { pull: 'land', ink: 'glow', path: halo, lit: 1, spin: [cx, 590, .25] },
    { pull: 'land', ink: 'sun', path: crown, knock: gems }, { pull: 'land', ink: 'near', path: gems, lit: 1, blink: 1 },
    { pull: 'land', ink: 'paper', path: ch, knock: win }, { pull: 'land', ink: 'near', path: win, lit: 1 },
    { pull: 'acc', ink: 'near', path: riders, drift: [70, 0], sway: [0, 6, 0] },
  ] }, { trees: [[1020, .9]] });
}
// 4 · 1429: a walled city across the river, its bridge and towers; a rider with a long pennant leads a column; arrows of rain
function joan(seed = 19) {
  const city = new Path2D(); city.rect(-BLEED, 900, AW + 2 * BLEED, 160); crenel(city, -BLEED, AW + BLEED, 900, 22, 24, 16);
  for (const x of [60, 300, 560, 820]) { roundTower(city, x, 820, 1060, 70); }
  const spire = new Path2D(); spire.rect(640, 700, 90, 200); spire.addPath(polyPath([[630, 702], [740, 702], [685, 520]])); spire.rect(500, 760, 120, 140); spire.addPath(polyPath([[494, 762], [626, 762], [560, 700]]));
  const gates = new Path2D(); for (const x of [180, 440, 700, 940]) { gates.rect(x, 990, 40, 70); blob(gates, x + 20, 990, 20, 20, Math.PI, Math.PI * 2); }
  const bridge = new Path2D(), arch = new Path2D(); bridge.rect(-BLEED, 1080, AW + 2 * BLEED, 30); for (let x = 0; x < AW; x += 180) blob(arch, x + 90, 1120, 60, 30, Math.PI, Math.PI * 2);
  const rider = new Path2D(), x = 420, y = 1140;
  rider.addPath(polyPath([[x - 70, y], [x + 50, y], [x + 90, y - 44], [x + 112, y - 34], [x + 78, y + 6], [x + 76, y + 36], [x + 62, y + 36], [x + 52, y + 14], [x - 50, y + 14], [x - 62, y + 36], [x - 76, y + 36], [x - 74, y + 6]]));
  rider.addPath(polyPath([[x - 14, y], [x + 14, y], [x + 10, y - 60], [x - 10, y - 60]])); blob(rider, x, y - 72, 12, 13); rider.rect(x + 18, y - 220, 5, 230);
  const pennant = polyPath([[x + 23, y - 218], [x + 150, y - 196], [x + 23, y - 168]]);
  const column = new Path2D(); for (let k = 0; k < 8; k++) { const cxk = x - 120 - k * 70; blob(column, cxk, y - 6, 9, 10); column.rect(cxk - 9, y + 2, 18, 30); column.rect(cxk + 8, y - 70, 3, 100); }
  return compose(seed, { focus: [540, 880], parts: [
    { pull: 'land', ink: 'far', path: spire },
    { pull: 'land', ink: 'paper', path: city, knock: gates },
    { pull: 'land', ink: 'near', path: gates, lit: 1 },
    ...water(seed, 1060, 'sky2', 1180, -30),
    { pull: 'acc', ink: 'near', path: bridge, knock: arch },
    { pull: 'acc', ink: 'near', path: unionPath([rider, column]), drift: [60, 0], sway: [0, 7, 0] },
    { pull: 'acc', ink: 'sun', path: pennant, drift: [60, 0], swing: [x + 23, y - 194, .12, 4, 0] },
    { pull: 'acc', ink: 'near', path: birds([[900, 600, .8], [950, 570, .6], [860, 560, .5]]), drift: [-60, 6] },
  ] }, { field: false, farm: false, trees: [[1040, .8]] });
}
// 5 · 1682: the long garden front of a palace, gilded roofline, fountains leaping in a formal garden, a carriage on the avenue
function versailles(seed = 23) {
  const pal = new Path2D(); pal.rect(40, 860, 1000, 200); pal.rect(380, 820, 320, 240); pal.addPath(polyPath([[370, 822], [710, 822], [540, 770]]));
  const roofs = new Path2D(); roofs.rect(30, 846, 1020, 16); for (let x = 50; x < 1040; x += 40) roofs.rect(x, 830, 12, 18);
  const wins = [new Path2D(), new Path2D()]; for (let x = 60; x < 1020; x += 40) for (const y of [880, 960]) if (!(x > 380 && x < 690 && y < 900)) { const g = wins[(x / 40 | 0) % 2]; g.rect(x + 8, y, 20, 60); blob(g, x + 18, y, 10, 10, Math.PI, Math.PI * 2); }
  const garden = new Path2D(); for (let k = 0; k < 6; k++) { const x = -40 + k * 200; garden.addPath(polyPath([[x, 1130], [x + 160, 1130], [x + 150, 1100], [x + 10, 1100]])); }
  const basin = new Path2D(); for (const x of [200, 540, 880]) blob(basin, x, 1150, 90, 16);
  const jets = [new Path2D(), new Path2D()]; for (const x of [200, 540, 880]) for (let k = 0; k < 7; k++) { blob(jets[k % 2], x + (k - 3) * 10, 1060 - (3 - Math.abs(k - 3)) * 24, 5, 12); } for (const x of [200, 540, 880]) jets[0].rect(x - 3, 1060, 6, 90);
  const coach = new Path2D(); coach.rect(-40, 1150, 100, 46); blob(coach, -20, 1196, 14, 14); blob(coach, 50, 1196, 14, 14); for (let k = 0; k < 2; k++) { const hx = 90 + k * 70; coach.addPath(polyPath([[hx - 30, 1160], [hx + 30, 1160], [hx + 44, 1140], [hx + 52, 1146], [hx + 34, 1168], [hx + 30, 1196], [hx + 22, 1196], [hx + 18, 1176], [hx - 20, 1176], [hx - 26, 1196], [hx - 34, 1196]])); }
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'paper', path: pal, knock: unionPath(wins) },
    { pull: 'land', ink: 'far', path: wins[0], lit: 1 }, { pull: 'land', ink: 'glow', path: wins[1], lit: 1, blink: 2 },
    { pull: 'land', ink: 'sun', path: roofs },
    { pull: 'acc', ink: 'mid', path: garden },
    { pull: 'acc', ink: 'sky2', path: basin },
    { pull: 'acc', ink: 'glow', path: jets[0], lit: 1, blink: 0 }, { pull: 'acc', ink: 'sky1', path: jets[1], lit: 1, blink: 2 },
    { pull: 'acc', ink: 'near', path: coach, drift: [120, -20] },
  ] }, { field: false, farm: false, trees: [[60, 1.0], [1020, 1.0]] });
}
// 6 · 1789: the fortress with its round towers, a crowd surging with raised pikes and hats, smoke over the walls
function bastille(seed = 29) {
  const fort = new Path2D(); fort.rect(160, 800, 760, 300); for (const x of [160, 400, 680, 920]) roundTower(fort, x, 740, 1100, 110, false);
  crenel(fort, 110, 980, 740, 22, 22, 16); crenel(fort, 160, 920, 800, 18, 18, 14);
  const slits = new Path2D(); for (const x of [160, 400, 680, 920]) for (const y of [800, 900, 1000]) slits.rect(x - 4, y, 8, 34); for (let x = 220; x < 880; x += 60) slits.rect(x, 860, 8, 26);
  const gate = new Path2D(); gate.rect(500, 1000, 80, 100); blob(gate, 540, 1000, 40, 30, Math.PI, Math.PI * 2);
  const crowd = new Path2D(), pikes = new Path2D(), hats = new Path2D(), r = mulberry(seed);
  for (let k = 0; k < 34; k++) { const x = -60 + k * 36 + r() * 10, y = 1130 + r() * 30; blob(crowd, x, y - 18, 11, 12); crowd.addPath(polyPath([[x - 14, y - 6], [x + 14, y - 6], [x + 18, y + 60], [x - 18, y + 60]])); if (k % 3 === 0) { pikes.rect(x + 12, y - 120, 4, 120); pikes.addPath(polyPath([[x + 8, y - 120], [x + 20, y - 120], [x + 14, y - 146]])); } if (k % 4 === 1) { hats.addPath(polyPath([[x - 20, y - 26], [x + 20, y - 26], [x, y - 44]])); } }
  return compose(seed, { focus: [540, 880], parts: [
    { pull: 'acc', ink: 'mid', path: smokeCol(300, 720, 7, 1.1), lit: 1, drift: [18, -30] }, { pull: 'acc', ink: 'glow', path: smokeCol(760, 700, 6, 1), lit: 1, drift: [-12, -40] },
    { pull: 'land', ink: 'far', path: fort, knock: unionPath([slits, gate]) },
    { pull: 'land', ink: 'near', path: unionPath([slits, gate]), lit: 1 },
    { pull: 'acc', ink: 'near', path: unionPath([crowd, pikes]), sway: [8, 3.2, 0] },
    { pull: 'acc', ink: 'sun', path: hats, sway: [8, 3.2, 0] },
    { pull: 'acc', ink: 'near', path: birds([[880, 560, .9], [940, 520, .7], [820, 520, .6]]), drift: [-70, 0], swing: [880, 600, .2, 1.1, 0] },
  ] }, { field: false, farm: false, trees: false });
}
// 7 · 1889: the iron tower rising in four stages over the river, a beacon sweeping from the top, a balloon drifting, boats
function eiffel(seed = 31) {
  const cx = 600, tw = new Path2D(), lat = new Path2D();
  const st1 = polyPath([[cx - 260, 1100], [cx - 170, 1100], [cx - 70, 900], [cx + 70, 900], [cx + 170, 1100], [cx + 260, 1100], [cx + 120, 870], [cx - 120, 870]]);
  const arch1 = new Path2D(); blob(arch1, cx, 1100, 150, 150, Math.PI, Math.PI * 2);
  const st2 = polyPath([[cx - 120, 860], [cx + 120, 860], [cx + 70, 700], [cx - 70, 700]]); const deck = new Path2D(); deck.rect(cx - 140, 860, 280, 20); deck.rect(cx - 86, 690, 172, 16);
  const st3 = polyPath([[cx - 60, 690], [cx + 60, 690], [cx + 16, 480], [cx - 16, 480]]); const top = new Path2D(); top.rect(cx - 22, 470, 44, 18); top.rect(cx - 4, 420, 8, 52);
  for (let y = 880; y < 1100; y += 30) lat.rect(cx - 240 + (1100 - y) * .45, y, 480 - (1100 - y) * .9, 4);
  for (let y = 710; y < 860; y += 26) lat.rect(cx - 110 + (860 - y) * .3, y, 220 - (860 - y) * .6, 3);
  for (let y = 500; y < 690; y += 24) lat.rect(cx - 52 + (690 - y) * .22, y, 104 - (690 - y) * .44, 3);
  const beam = polyPath([[cx, 440], [cx + 700, 380], [cx + 700, 440]]);
  const balloon = new Path2D(); blob(balloon, 180, 620, 60, 72); balloon.addPath(polyPath([[136, 660], [224, 660], [196, 712], [164, 712]])); balloon.rect(166, 712, 28, 22);
  const crowd = new Path2D(); for (let k = 0; k < 20; k++) { const x = -40 + k * 60; blob(crowd, x, 1120, 9, 10); crowd.rect(x - 9, 1128, 18, 26); if (k % 2) crowd.addPath(polyPath([[x - 26, 1112], [x + 26, 1112], [x, 1092]])); }
  return compose(seed, { focus: [600, 800], parts: [
    { pull: 'acc', ink: 'glow', path: beam, lit: 1, swing: [cx, 440, .5, .9, 0] },
    { pull: 'land', ink: 'near', path: st1, knock: arch1, seq: .05 }, { pull: 'land', ink: 'near', path: unionPath([st2, deck]), seq: .3 }, { pull: 'land', ink: 'near', path: unionPath([st3, top]), seq: .55 },
    { pull: 'land', ink: 'sun', path: lat, lit: 1, seq: .8 },
    { pull: 'acc', ink: 'sun', path: balloon, drift: [40, -14], sway: [6, 1.1, 0] },
    ...water(seed, 1150, 'sky2', 1180, -30),
    { pull: 'acc', ink: 'near', path: crowd, drift: [-40, 0], sway: [3, 5, 0] },
  ] }, { field: false, farm: false, trees: [[60, .9]] });
}
// 8 · today: the city at dusk — mansard rooftops with chimneys, twin cathedral towers, a white dome on the hill, a riverboat, cyclists
function today(seed = 37) {
  const r = mulberry(seed), city = new Path2D(), roofs = new Path2D(), lit = [new Path2D(), new Path2D(), new Path2D()];
  for (let x = -BLEED; x < AW + BLEED;) { const w = 90 + r() * 60, h = 110 + r() * 60; if (!(x > 330 && x < 600)) { city.rect(x, 1080 - h, w - 4, h); roofs.addPath(polyPath([[x - 2, 1082 - h], [x + w - 2, 1082 - h], [x + w - 14, 1050 - h], [x + 10, 1050 - h]])); roofs.rect(x + w * .6, 1030 - h, 12, 24); for (let wy = 1090 - h; wy < 1060; wy += 26) for (let wx = x + 10; wx < x + w - 18; wx += 22) if (r() < .35) lit[Math.floor(r() * 3)].rect(wx, wy, 10, 14); } x += w; }
  const nd = new Path2D(); for (const tx of [350, 500]) { nd.rect(tx, 760, 90, 320); } nd.rect(440, 860, 60, 220); const ndK = new Path2D(); blob(ndK, 470, 900, 26, 26); for (const tx of [350, 500]) for (const y of [790, 880]) { ndK.rect(tx + 20, y, 16, 60); ndK.rect(tx + 52, y, 16, 60); }
  const hill = polyPath([[600, 900], [760, 820], [1000, 800], [AW + BLEED, 840], [AW + BLEED, 1000], [600, 1000]]);
  const dome = new Path2D(); blob(dome, 860, 720, 70, 80, Math.PI, Math.PI * 2); dome.rect(790, 720, 140, 90); for (const dx of [-110, 110]) { blob(dome, 860 + dx, 760, 30, 36, Math.PI, Math.PI * 2); dome.rect(860 + dx - 30, 760, 60, 50); } dome.rect(856, 610, 8, 34);
  const tower = new Path2D(); tower.addPath(polyPath([[150, 1000], [210, 1000], [186, 700], [174, 700]])); tower.rect(178, 660, 4, 40);
  const boat = new Path2D(); boat.addPath(polyPath([[-60, 1150], [240, 1150], [270, 1130], [250, 1166], [-40, 1166]])); boat.rect(0, 1120, 200, 30); const boatW = new Path2D(); for (let k = 0; k < 8; k++) boatW.rect(10 + k * 24, 1126, 16, 14);
  const bikes = new Path2D(); for (const bx of [600, 760]) { for (const dx of [0, 54]) { bikes.addPath(ringPath(bx + dx, 1100, 15, 19)); } bikes.addPath(polyPath([[bx, 1100], [bx + 26, 1074], [bx + 54, 1100], [bx + 50, 1100], [bx + 26, 1080], [bx + 4, 1100]])); blob(bikes, bx + 24, 1036, 9, 10); bikes.addPath(polyPath([[bx + 16, 1046], [bx + 32, 1046], [bx + 36, 1078], [bx + 20, 1078]])); }
  return compose(seed, { focus: [500, 880], parts: [
    { pull: 'land', ink: 'far', path: hill }, { pull: 'land', ink: 'paper', path: dome },
    { pull: 'land', ink: 'mid', path: tower },
    { pull: 'land', ink: 'mid', path: city },
    ...lit.map((p, k) => ({ pull: 'land', ink: 'glow', path: p, lit: 1, blink: k })),
    { pull: 'land', ink: 'far', path: roofs },
    { pull: 'land', ink: 'paper', path: nd, knock: ndK }, { pull: 'land', ink: 'near', path: ndK, lit: 1 },
    ...water(seed, 1110, 'sky2', 1180, -36),
    { pull: 'acc', ink: 'near', path: boat, knock: boatW, drift: [70, 0] },
    { pull: 'acc', ink: 'near', path: bikes, drift: [-110, 0] },
    { pull: 'acc', ink: 'near', path: birds([[-60, 600, .8], [-110, 570, .6], [-20, 560, .5]]), drift: [110, -6] },
  ] }, { field: false, farm: false, trees: false });
}

export const SCENES = { cave, alesia, charlemagne, joan, versailles, bastille, eiffel, today };
