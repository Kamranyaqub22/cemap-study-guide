// scenes.js · GREECE — vertical print (1080×1920 art units, full bleed).
// Base: a clear sky with wind-combed cloud streaks, a big low sun in the middle, a deep sea that sparkles, rocky islands on
// the horizon, a rocky shore with silver olive trees swaying, gulls and a little sailing caique. One era landmark per print.
// Parts: { pull, ink, path, knock?, cut?, lit?, drift?, blink?, sway?, seq?, loop?, spin?, swing?, paint? }.
// Landmarks are original stylised silhouettes from simple paths: not traced from photographs, no logos, no flags, no maps.
import { mulberry, polyPath, circlePath, ringPath, rectPath, unionPath, bandSteps } from './silk.js';

export const AW = 1080, AH = 1920, BLEED = 60;
export const GROUND = 1180;
export const BAND = [-BLEED, 1170, AW + 2 * BLEED, AH - 1170 + BLEED];
const FULL = () => rectPath(-BLEED, -BLEED, AW + 2 * BLEED, AH + 2 * BLEED);
const SUN = [540, 640], SR = 120;

function blob(p, x, y, rx, ry, a0 = 0, a1 = Math.PI * 2) { p.moveTo(x + rx * Math.cos(a0), y + ry * Math.sin(a0)); p.ellipse(x, y, rx, ry, 0, a0, a1); p.closePath(); }
const bird = (p, x, y, s) => p.addPath(polyPath([[x - 24 * s, y - 6 * s], [x - 11 * s, y - 10 * s], [x, y], [x + 11 * s, y - 10 * s], [x + 24 * s, y - 6 * s], [x + 11 * s, y - 5 * s], [x, y + 5 * s], [x - 11 * s, y - 5 * s]]));
const birds = (list) => { const p = new Path2D(); for (const [x, y, s] of list) bird(p, x, y, s); return p; };
const sh = (q, dx, dy) => { const o = new Path2D(); o.addPath(q, new DOMMatrix().translate(dx, dy)); return o; };
function columns(p, x0, x1, y0, y1, w, gap) { for (let x = x0; x + w <= x1 + .1; x += w + gap) { p.rect(x, y0, w, y1 - y0); p.rect(x - 4, y0 - 8, w + 8, 8); } }
function flutes(p, x0, x1, y0, y1, w, gap) { for (let x = x0; x + w <= x1 + .1; x += w + gap) p.rect(x + w / 2 - 1.5, y0 + 6, 3, y1 - y0 - 12); }
function olive(p, x, y, s = 1) {                         // a gnarled trunk and a broad silver crown
  p.addPath(polyPath([[x - 10 * s, y], [x + 12 * s, y], [x + 6 * s, y - 40 * s], [x + 18 * s, y - 70 * s], [x + 4 * s, y - 72 * s], [x - 4 * s, y - 44 * s]]));
  for (const [dx, dy, r] of [[0, -100, 60], [-50, -80, 44], [50, -84, 46], [-20, -130, 40], [30, -126, 38]]) blob(p, x + dx * s, y + dy * s, r * s, r * .7 * s);
}
function caique(x, y, s = 1) {
  const p = new Path2D(); p.addPath(polyPath([[x - 60 * s, y], [x + 60 * s, y], [x + 76 * s, y - 16 * s], [x + 50 * s, y + 14 * s], [x - 50 * s, y + 14 * s], [x - 76 * s, y - 16 * s]]));
  p.rect(x - 2, y - 90 * s, 4, 90 * s); p.addPath(polyPath([[x + 4, y - 86 * s], [x + 50 * s, y - 10 * s], [x + 4, y - 10 * s]]));
  return p;
}

// ---------------- the base print ----------------
function base(seed, o = {}) {
  const sunKnock = unionPath([circlePath(SUN[0], SUN[1], SR + 10), ringPath(SUN[0], SUN[1], SR + 30, SR + 36)]);
  const sky2 = new Path2D(); sky2.rect(-BLEED, -BLEED, AW + 2 * BLEED, 110 + BLEED); sky2.addPath(bandSteps(-BLEED, AW + 2 * BLEED, 100, 700, 4, 8));
  const streaks = [new Path2D(), new Path2D()], r = mulberry(seed + 3);
  for (let k = 0; k < 10; k++) { const g = streaks[k % 2], y = 450 + k * 40 + r() * 16, x = -800 + r() * 1800, w = 260 + r() * 360; g.addPath(polyPath([[x, y], [x + w, y - 6], [x + w + 40, y], [x + w, y + 6]])); }
  const isl = new Path2D(); for (const [x, w, h] of [[120, 220, 70], [420, 140, 40], [760, 260, 90], [1040, 160, 50]]) isl.addPath(polyPath([[x - w / 2, 960], [x - w / 4, 960 - h * .7], [x, 960 - h], [x + w / 5, 960 - h * .8], [x + w / 2, 960]]));
  const sea = rectPath(-BLEED, 958, AW + 2 * BLEED, 240);
  const spark = [new Path2D(), new Path2D()], rr = mulberry(seed + 5);
  for (let i = 0; i < 8; i++) { const y = 970 + i * 18; let x = -BLEED - 260 + rr() * 60; while (x < AW + BLEED + 260) { const L = 30 + rr() * 110; spark[i % 2].rect(x, y, L, 3 + i * .4); x += L + 50 + rr() * 120; } }
  const path = new Path2D(); for (let k = 0; k < 12; k++) path.rect(SUN[0] - 60 + (k % 3) * 20 - k * 2, 970 + k * 16, 120 - k * 6, 5);   // the sun's road on the water
  const shore = new Path2D(); shore.addPath(polyPath([[-BLEED, 1180], [-BLEED, 1050], [80, 1040], [200, 1070], [260, 1100], [320, 1180]])); shore.addPath(polyPath([[AW + BLEED, 1180], [AW + BLEED, 1060], [960, 1050], [880, 1090], [840, 1180]]));
  const trees = new Path2D(); if (o.olives !== false) { olive(trees, 60, 1060, .9); olive(trees, 1010, 1070, 1); }
  return {
    sky: [
      { pull: 'sky1', ink: 'sky1', path: FULL(), knock: sunKnock },
      { pull: 'sky2', ink: 'sky2', path: sky2 },
      { pull: 'sky2', ink: 'sky1', path: streaks[0], drift: [-50, 0] }, { pull: 'sky2', ink: 'glow', path: streaks[1], drift: [-80, 0], lit: 1 },
      { pull: 'sun', ink: 'sun', path: circlePath(SUN[0], SUN[1], SR) },
    ],
    far: [{ pull: 'far', ink: 'far', path: isl }],
    mid: [
      { pull: 'mid', ink: 'mid', path: sea },
      { pull: 'mid', ink: 'glow', path: spark[0], lit: 1, drift: [-30, 0] }, { pull: 'mid', ink: 'sky1', path: spark[1], lit: 1, drift: [26, 0] },
      { pull: 'mid', ink: 'glow', path: path, lit: 1, sway: [8, 1.6, 0] },
      ...(o.boat === false ? [] : [{ pull: 'mid', ink: 'near', path: caique(-120, 1010, .6), drift: [40, 0] }]),
      ...(o.shore === false ? [] : [{ pull: 'mid', ink: 'near', path: shore }, { pull: 'mid', ink: 'far', path: trees, sway: [5, 1.3, .4] }]),
      { pull: 'mid', ink: 'near', path: birds([[1140, 520, .9], [1190, 490, .7], [1100, 480, .6]]), drift: [-90, 6] },
    ],
  };
}
function bandPart() {
  const p = rectPath(...BAND);
  const knock = new Path2D(); for (let x = 20; x < AW - 30; x += 48) { knock.rect(x, BAND[1] + 12, 36, 5); knock.rect(x + 31, BAND[1] + 12, 5, 20); knock.rect(x + 12, BAND[1] + 27, 24, 5); knock.rect(x + 12, BAND[1] + 19, 5, 13); }   // a Greek key border
  return { pull: 'band', ink: 'near', path: p, knock };
}
function compose(seed, land, o = {}) {
  const b = base(seed, o);
  const parts = o.night ? [...b.sky.map(p => p.pull === 'sun' ? { ...p, ink: 'glow', path: circlePath(SUN[0], SUN[1], SR * .5) } : p), ...b.far, ...b.mid] : [...b.sky, ...b.far, ...b.mid];
  return { focus: land.focus, parts: [...parts, ...land.parts, bandPart()], depth: { sky1: 0, sky2: 0, sun: .1, far: .3, mid: .55, land: .85, acc: .85, band: 1 } };
}

// ---------------- the eras ----------------
// 1 · c. 1900 BC: a terraced palace on Crete with red columns that taper downward, horns on the roofline, a grand stair, dolphins leaping
function knossos(seed = 11) {
  const pal = new Path2D(); pal.rect(140, 900, 800, 200); pal.rect(260, 800, 560, 104); pal.rect(380, 730, 320, 74);
  const horns = new Path2D(); for (let x = 290; x < 800; x += 70) horns.addPath(polyPath([[x - 18, 800], [x + 18, 800], [x + 22, 770], [x + 10, 790], [x - 10, 790], [x - 22, 770]]));
  const cols = new Path2D(); for (let x = 180; x < 920; x += 70) cols.addPath(polyPath([[x - 14, 930], [x + 14, 930], [x + 9, 1060], [x - 9, 1060]])); for (let x = 300; x < 800; x += 76) cols.addPath(polyPath([[x - 12, 820], [x + 12, 820], [x + 8, 890], [x - 8, 890]]));
  const caps = new Path2D(); for (let x = 180; x < 920; x += 70) blob(caps, x, 930, 20, 9); for (let x = 300; x < 800; x += 76) blob(caps, x, 820, 17, 8);
  const stair = new Path2D(); for (let k = 0; k < 8; k++) stair.rect(460 - k * 12, 1100 - k * 24, 160 + k * 24, 10);
  const dol = (x, y, s) => { const p = new Path2D(); p.moveTo(x - 50 * s, y + 10 * s); p.bezierCurveTo(x - 30 * s, y - 40 * s, x + 30 * s, y - 40 * s, x + 50 * s, y); p.lineTo(x + 64 * s, y - 6 * s); p.lineTo(x + 50 * s, y + 8 * s); p.bezierCurveTo(x + 20 * s, y - 16 * s, x - 20 * s, y - 16 * s, x - 40 * s, y + 18 * s); p.closePath(); p.addPath(polyPath([[x - 6 * s, y - 28 * s], [x + 10 * s, y - 46 * s], [x + 12 * s, y - 26 * s]])); return p; };
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'sky1', path: pal, knock: cols },
    { pull: 'land', ink: 'sun', path: cols }, { pull: 'land', ink: 'near', path: caps },
    { pull: 'land', ink: 'near', path: horns },
    { pull: 'land', ink: 'far', path: stair, lit: 1 },
    { pull: 'acc', ink: 'near', path: dol(250, 1030, .9), swing: [250, 1080, .5, 2.1, 0] },
    { pull: 'acc', ink: 'near', path: dol(860, 1050, .7), swing: [860, 1100, .5, 2.4, 1.5] },
    { pull: 'acc', ink: 'near', path: birds([[-60, 560, .8], [-110, 530, .6]]), drift: [100, -8] },
  ] }, { shore: false });
}
// 2 · 508 BC: the assembly on its hill above the city, a speaker on the stone platform, citizens raising hands to vote
function demos(seed = 13) {
  const hill = polyPath([[-BLEED, 1180], [-BLEED, 900], [300, 860], [700, 880], [AW + BLEED, 930], [AW + BLEED, 1180]]);
  const tiers = new Path2D(); for (let k = 0; k < 6; k++) tiers.addPath(polyPath([[-BLEED, 920 + k * 42], [AW + BLEED, 950 + k * 40], [AW + BLEED, 956 + k * 40], [-BLEED, 926 + k * 42]]));
  const bema = new Path2D(); bema.rect(470, 840, 140, 60); bema.rect(490, 820, 100, 24); const sp = new Path2D(); blob(sp, 540, 772, 14, 15); sp.addPath(polyPath([[520, 788], [560, 788], [570, 822], [510, 822]])); sp.addPath(polyPath([[556, 792], [566, 786], [600, 752], [594, 746]]));
  const r = mulberry(seed), crowd = new Path2D(), hands = [new Path2D(), new Path2D(), new Path2D()];
  for (let row = 0; row < 5; row++) for (let k = 0; k < 14; k++) { const x = -20 + k * 82 + (row % 2) * 40 + r() * 10, y = 960 + row * 44; blob(crowd, x, y, 11, 12); crowd.addPath(polyPath([[x - 15, y + 10], [x + 15, y + 10], [x + 18, y + 44], [x - 18, y + 44]])); if (r() < .6) hands[Math.floor(r() * 3)].addPath(polyPath([[x + 10, y + 12], [x + 16, y + 10], [x + 22, y - 30], [x + 16, y - 32]])); }
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'mid', path: hill }, { pull: 'land', ink: 'far', path: tiers, lit: 1 },
    { pull: 'land', ink: 'sky1', path: bema }, { pull: 'land', ink: 'near', path: sp },
    { pull: 'acc', ink: 'near', path: crowd, sway: [3, 2.0, 0] },
    ...hands.map((p, k) => ({ pull: 'acc', ink: 'sun', path: p, blink: k })),
    { pull: 'acc', ink: 'near', path: birds([[700, 520, .8], [760, 490, .6], [640, 480, .6]]), drift: [-70, -10] },
  ] }, { shore: false, boat: false });
}
// 3 · 438 BC: the temple of columns crowning its great rock, an olive tree, an owl gliding, light moving across the marble
function parthenon(seed = 17) {
  const rock = polyPath([[-BLEED, 1180], [-BLEED, 1040], [80, 1000], [140, 940], [940, 930], [1000, 990], [AW + BLEED, 1020], [AW + BLEED, 1180]]);
  const strata = new Path2D(); for (let k = 0; k < 4; k++) strata.addPath(polyPath([[120 + k * 10, 970 + k * 40], [960 - k * 12, 960 + k * 40], [960 - k * 12, 966 + k * 40], [120 + k * 10, 976 + k * 40]]));
  const tem = new Path2D(); tem.rect(200, 900, 680, 34); tem.rect(220, 880, 640, 22); tem.rect(210, 700, 660, 40); tem.addPath(polyPath([[200, 702], [880, 702], [540, 600]]));
  const cols = new Path2D(); columns(cols, 236, 850, 740, 880, 44, 30);
  const fl = new Path2D(); flutes(fl, 236, 850, 740, 880, 44, 30);
  const tym = polyPath([[260, 694], [820, 694], [540, 616]]);
  const light = polyPath([[-120, 740], [-80, 740], [-20, 880], [-60, 880]]);
  const tree = new Path2D(); olive(tree, 960, 930, .8);
  const owl = new Path2D(); blob(owl, -80, 760, 26, 14); owl.addPath(polyPath([[-130, 750], [-30, 750], [-80, 724]])); blob(owl, -60, 750, 8, 8);
  return compose(seed, { focus: [540, 820], parts: [
    { pull: 'land', ink: 'far', path: rock }, { pull: 'land', ink: 'glow', path: strata, lit: 1 },
    { pull: 'land', ink: 'sky1', path: tem }, { pull: 'land', ink: 'paper', path: cols }, { pull: 'land', ink: 'far', path: fl, lit: 1 },
    { pull: 'land', ink: 'sun', path: tym, lit: 1 },
    { pull: 'acc', ink: 'glow', path: light, cut: fl, lit: 1, drift: [150, 0] },
    { pull: 'acc', ink: 'mid', path: tree, sway: [5, 1.4, .2] },
    { pull: 'acc', ink: 'near', path: owl, drift: [130, -10] },
  ] }, { shore: false, boat: false });
}
// 4 · 334 BC: a phalanx marching with long pikes, a horseman leading, war galleys rowing out, dust rising
function alexander(seed = 19) {
  const land = polyPath([[-BLEED, 1180], [-BLEED, 1060], [AW + BLEED, 1040], [AW + BLEED, 1180]]);
  const men = new Path2D(), pikes = new Path2D(); for (let row = 0; row < 3; row++) for (let k = 0; k < 16; k++) { const x = -60 + k * 50 + row * 18, y = 1090 + row * 28; blob(men, x, y, 9, 10); men.addPath(polyPath([[x - 12, y + 8], [x + 12, y + 8], [x + 13, y + 40], [x - 13, y + 40]])); blob(men, x - 12, y + 18, 12, 14); pikes.addPath(polyPath([[x + 8, y + 20], [x + 12, y + 20], [x + 70, y - 220], [x + 66, y - 220]])); }
  const horse = new Path2D(), hx = 900, hy = 1080; horse.addPath(polyPath([[hx - 60, hy], [hx + 50, hy], [hx + 80, hy - 50], [hx + 100, hy - 40], [hx + 70, hy + 6], [hx + 60, hy + 50], [hx + 50, hy + 50], [hx + 40, hy + 14], [hx - 40, hy + 14], [hx - 50, hy + 50], [hx - 60, hy + 50], [hx - 70, hy + 4]])); blob(horse, hx, hy - 36, 14, 16); horse.addPath(polyPath([[hx - 12, hy - 24], [hx + 12, hy - 24], [hx + 10, hy + 2], [hx - 10, hy + 2]])); horse.addPath(polyPath([[hx - 4, hy - 56], [hx + 4, hy - 56], [hx + 10, hy - 80], [hx - 10, hy - 80]]));
  const gal = new Path2D(), oars = new Path2D(); for (const [x, s] of [[300, .9], [700, .7]]) { gal.addPath(polyPath([[x - 140 * s, 1000], [x + 130 * s, 1000], [x + 160 * s, 980], [x + 140 * s, 1016], [x - 130 * s, 1018], [x - 150 * s, 984]])); gal.rect(x - 3, 900, 6, 100); gal.addPath(polyPath([[x - 60 * s, 910], [x + 60 * s, 910], [x + 50 * s, 980], [x - 50 * s, 980]])); for (let k = 0; k < 9; k++) oars.addPath(polyPath([[x - 110 * s + k * 28 * s, 1012], [x - 106 * s + k * 28 * s, 1012], [x - 120 * s + k * 28 * s, 1040], [x - 124 * s + k * 28 * s, 1040]])); }
  const dust = new Path2D(); for (let k = 0; k < 8; k++) blob(dust, -100 + k * 160, 1140 - (k % 2) * 16, 90, 22);
  return compose(seed, { focus: [540, 920], parts: [
    { pull: 'land', ink: 'far', path: gal, drift: [30, 0] }, { pull: 'land', ink: 'near', path: oars, drift: [30, 0], swing: [500, 1012, .03, 3, 0] },
    { pull: 'land', ink: 'mid', path: land },
    { pull: 'acc', ink: 'glow', path: dust, lit: 1, drift: [-40, -6] },
    { pull: 'acc', ink: 'far', path: pikes, drift: [40, 0] },
    { pull: 'acc', ink: 'near', path: men, drift: [40, 0] },
    { pull: 'acc', ink: 'sun', path: horse, drift: [40, 0] },
  ] }, { shore: false, boat: false });
}
// 5 · 1460: dusk over a quiet harbour, a fortress on its rock, one boat at anchor rocking, the sea grey, gulls
function harbour(seed = 23) {
  const rock = polyPath([[560, 1060], [620, 900], [760, 860], [900, 880], [1000, 960], [1060, 1060]]);
  const fort = new Path2D(); fort.rect(640, 800, 300, 80); for (let x = 640; x < 940; x += 32) fort.rect(x, 784, 18, 18); fort.rect(860, 720, 70, 90); for (let x = 860; x < 930; x += 24) fort.rect(x, 704, 14, 18);
  const slits = new Path2D(); for (let x = 670; x < 920; x += 60) slits.rect(x, 820, 8, 26);
  const mole = new Path2D(); mole.rect(-BLEED, 1060, 520, 30); mole.rect(-BLEED, 1090, 480, 90);
  const boat = caique(330, 1050, 1);
  const cloud = [new Path2D(), new Path2D()]; for (let k = 0; k < 6; k++) blob(cloud[k % 2], -200 + k * 260, 520 + (k % 3) * 40, 200, 40);
  return compose(seed, { focus: [600, 880], parts: [
    { pull: 'land', ink: 'mid', path: cloud[0], lit: 1, drift: [-20, 0] },
    { pull: 'land', ink: 'far', path: rock },
    { pull: 'land', ink: 'near', path: fort, knock: slits }, { pull: 'land', ink: 'glow', path: slits, blink: 1 },
    { pull: 'land', ink: 'near', path: mole },
    { pull: 'acc', ink: 'far', path: boat, swing: [330, 1060, .06, 1.2, 0] },
    { pull: 'acc', ink: 'mid', path: cloud[1], lit: 1, drift: [26, 0] },
    { pull: 'acc', ink: 'near', path: birds([[300, 640, .9], [360, 610, .7], [250, 600, .6]]), drift: [60, -6] },
  ] }, { shore: false, boat: false, olives: false });
}
// 6 · 1830: tall sailing ships under full sail entering the harbour, a white chapel on the hill ringing, waves
function ships(seed = 29) {
  const hill = polyPath([[-BLEED, 1060], [-BLEED, 860], [120, 830], [300, 900], [380, 1060]]);
  const chapel = new Path2D(); chapel.rect(110, 760, 110, 80); blob(chapel, 165, 760, 46, 40, Math.PI, Math.PI * 2); chapel.rect(162, 700, 6, 24); chapel.rect(154, 708, 22, 5); chapel.rect(220, 740, 40, 100); chapel.rect(216, 732, 48, 12);
  const bell = new Path2D(); blob(bell, 240, 770, 9, 11);
  const ship = (x, s) => { const p = new Path2D(), sail = new Path2D(); p.addPath(polyPath([[x - 160 * s, 1040], [x + 150 * s, 1040], [x + 190 * s, 1010], [x + 160 * s, 1070], [x - 140 * s, 1072], [x - 170 * s, 1020]])); for (const dx of [-80, 10, 100]) { p.rect(x + dx * s - 3, 760 - (dx === 10 ? 40 : 0), 6, 280 + (dx === 10 ? 40 : 0)); for (const [y, w] of [[790, 70], [870, 90], [950, 100]]) sail.addPath(polyPath([[x + dx * s - w * s / 2, y - (dx === 10 ? 30 : 0)], [x + dx * s + w * s / 2, y - (dx === 10 ? 30 : 0)], [x + dx * s + w * s / 2 + 10, y + 64 * s - (dx === 10 ? 30 : 0)], [x + dx * s - w * s / 2 + 10, y + 64 * s - (dx === 10 ? 30 : 0)]])); } return [p, sail]; };
  const [h1, s1] = ship(520, 1), [h2, s2] = ship(950, .7);
  const waves = new Path2D(); for (let x = -BLEED - 200; x < AW + BLEED + 200; x += 80) waves.addPath(polyPath([[x, 1090], [x + 40, 1078], [x + 80, 1090]]));
  return compose(seed, { focus: [540, 880], parts: [
    { pull: 'land', ink: 'far', path: hill }, { pull: 'land', ink: 'paper', path: chapel }, { pull: 'acc', ink: 'sun', path: bell, swing: [240, 760, .4, 3.4, 0] },
    { pull: 'land', ink: 'near', path: h2, drift: [-30, 0] }, { pull: 'land', ink: 'paper', path: s2, drift: [-30, 0], sway: [3, 1.6, 0] },
    { pull: 'land', ink: 'near', path: h1, drift: [-44, 0] }, { pull: 'land', ink: 'sky1', path: s1, drift: [-44, 0], sway: [4, 1.4, .6] },
    { pull: 'acc', ink: 'glow', path: waves, lit: 1, drift: [-60, 0] },
    { pull: 'acc', ink: 'near', path: birds([[700, 560, .8], [760, 530, .6], [640, 520, .6]]), drift: [-60, -10] },
  ] }, { shore: false, boat: false, olives: false });
}
// 7 · 1896: a long horseshoe stadium of white marble packed with people, runners racing along the track, wreaths of olive
function stadium(seed = 31) {
  const st = new Path2D(); st.addPath(polyPath([[-BLEED, 1180], [-BLEED, 860], [AW + BLEED, 860], [AW + BLEED, 1180]]));
  const rows = new Path2D(); for (let k = 0; k < 8; k++) rows.rect(-BLEED, 880 + k * 30, AW + 2 * BLEED, 4);
  const r = mulberry(seed), crowd = [new Path2D(), new Path2D(), new Path2D()]; for (let k = 0; k < 160; k++) blob(crowd[k % 3], r() * (AW + 120) - 60, 870 + Math.floor(r() * 8) * 30 + 14, 7, 9);
  const track = rectPath(-BLEED, 1110, AW + 2 * BLEED, 70); const lanes = new Path2D(); for (const y of [1130, 1150]) lanes.rect(-BLEED, y, AW + 2 * BLEED, 3);
  const run = new Path2D(); for (const [x, k] of [[-80, 0], [60, 1], [200, 2], [-220, 1]]) { blob(run, x, 1086, 10, 11); run.addPath(polyPath([[x - 8, 1096], [x + 10, 1096], [x + 14, 1126], [x - 4, 1126]])); run.addPath(polyPath([[x - 4, 1124], [x + 4, 1124], [x - 24 + k * 6, 1162], [x - 30 + k * 6, 1160]])); run.addPath(polyPath([[x + 6, 1124], [x + 14, 1124], [x + 34, 1156], [x + 28, 1160]])); }
  const torch = new Path2D(); torch.rect(530, 760, 20, 100); torch.addPath(polyPath([[510, 760], [570, 760], [556, 740], [524, 740]])); const fire = polyPath([[520, 742], [560, 742], [548, 700], [540, 680], [532, 700]]);
  return compose(seed, { focus: [540, 920], parts: [
    { pull: 'land', ink: 'sky1', path: st }, { pull: 'land', ink: 'far', path: rows, lit: 1 },
    ...crowd.map((p, k) => ({ pull: 'land', ink: k === 1 ? 'sun' : 'mid', path: p, blink: k })),
    { pull: 'acc', ink: 'sun', path: track }, { pull: 'acc', ink: 'paper', path: lanes, lit: 1 },
    { pull: 'acc', ink: 'near', path: run, drift: [150, 0] },
    { pull: 'acc', ink: 'near', path: torch }, { pull: 'acc', ink: 'sun', path: fire, sway: [3, 7, 0] }, { pull: 'acc', ink: 'glow', path: fire, blink: 1 },
  ] }, { shore: false, boat: false, olives: false });
}
// 8 · today: a white island village tumbling down a cliff, blue domes, windmills turning, a ferry gliding across the bay
function today(seed = 37) {
  const cliff = polyPath([[-BLEED, 1180], [-BLEED, 760], [120, 740], [300, 790], [480, 860], [560, 1000], [600, 1180]]);
  const r = mulberry(seed), houses = new Path2D(), doors = new Path2D();
  for (let k = 0; k < 26; k++) { const x = -40 + r() * 520, y = 760 + (x + 40) * .25 + r() * 160; if (y > 1100) continue; houses.rect(x, y, 48 + r() * 20, 40); doors.rect(x + 10, y + 16, 10, 18); }
  const domes = new Path2D(); for (const [x, y] of [[120, 744], [330, 820]]) { blob(domes, x, y, 36, 34, Math.PI, Math.PI * 2); domes.rect(x - 2, y - 56, 4, 24); domes.rect(x - 8, y - 46, 16, 4); }
  const mills = new Path2D(), sails = []; for (const [x, y] of [[60, 700], [230, 720]]) { mills.rect(x - 22, y, 44, 60); blob(mills, x, y, 24, 18, Math.PI, Math.PI * 2); const s = new Path2D(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; s.addPath(polyPath([[x, y - 4], [x + 64 * Math.cos(a), y - 4 + 64 * Math.sin(a)], [x + 60 * Math.cos(a + .2), y - 4 + 60 * Math.sin(a + .2)]])); } sails.push({ pull: 'acc', ink: 'paper', path: s, spin: [x, y - 4, .8] }); }
  const ferry = new Path2D(); ferry.addPath(polyPath([[700, 1060], [1000, 1060], [1030, 1030], [690, 1034]])); ferry.rect(740, 1000, 220, 34); ferry.rect(800, 976, 100, 26); ferry.rect(870, 950, 20, 30);
  const fwin = new Path2D(); for (let x = 750; x < 950; x += 26) fwin.rect(x, 1010, 14, 10);
  const wake = new Path2D(); for (let k = 0; k < 6; k++) wake.rect(1000 + k * 40, 1060 + k * 4, 30, 4);
  return compose(seed, { focus: [420, 880], parts: [
    { pull: 'land', ink: 'far', path: cliff },
    { pull: 'land', ink: 'paper', path: houses, knock: doors }, { pull: 'land', ink: 'mid', path: doors, lit: 1, blink: 2 },
    { pull: 'land', ink: 'sky2', path: domes },
    { pull: 'acc', ink: 'paper', path: mills }, ...sails,
    { pull: 'acc', ink: 'paper', path: ferry, knock: fwin, drift: [-40, 0] }, { pull: 'acc', ink: 'near', path: fwin, lit: 1, drift: [-40, 0] },
    { pull: 'acc', ink: 'glow', path: wake, lit: 1, drift: [-40, 0], blink: 0 },
    { pull: 'acc', ink: 'near', path: birds([[700, 560, .8], [760, 530, .6]]), drift: [80, -8] },
  ] }, { shore: false, boat: false, olives: false });
}

export const SCENES = { knossos, demos, parthenon, alexander, harbour, ships, stadium, today };
