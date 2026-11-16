// scenes.js · MEXICO — vertical print (1080×1920 art units, full bleed).
// Base: a warm sky with a row of fat cumulus drifting, a sun high on the left, a layered sierra, rows of blue agave in a field,
// nopal cacti swaying in the foreground, vultures circling and a hummingbird darting. One era landmark per print.
// Parts: { pull, ink, path, knock?, cut?, lit?, drift?, blink?, sway?, seq?, loop?, spin?, swing?, paint? }.
// Landmarks are original stylised silhouettes from simple paths: not traced from photographs, no logos, no flags or emblems, no maps.
import { mulberry, polyPath, circlePath, ringPath, rectPath, unionPath, bandSteps } from './silk.js';

export const AW = 1080, AH = 1920, BLEED = 60;
export const GROUND = 1180;
export const BAND = [-BLEED, 1170, AW + 2 * BLEED, AH - 1170 + BLEED];
const FULL = () => rectPath(-BLEED, -BLEED, AW + 2 * BLEED, AH + 2 * BLEED);
const SUN = [250, 560], SR = 90;

function blob(p, x, y, rx, ry, a0 = 0, a1 = Math.PI * 2) { p.moveTo(x + rx * Math.cos(a0), y + ry * Math.sin(a0)); p.ellipse(x, y, rx, ry, 0, a0, a1); p.closePath(); }
const bird = (p, x, y, s) => p.addPath(polyPath([[x - 24 * s, y - 6 * s], [x - 11 * s, y - 10 * s], [x, y], [x + 11 * s, y - 10 * s], [x + 24 * s, y - 6 * s], [x + 11 * s, y - 5 * s], [x, y + 5 * s], [x - 11 * s, y - 5 * s]]));
const birds = (list) => { const p = new Path2D(); for (const [x, y, s] of list) bird(p, x, y, s); return p; };
const sh = (q, dx, dy) => { const o = new Path2D(); o.addPath(q, new DOMMatrix().translate(dx, dy)); return o; };
function line(seed, y0, amp, n = 40) {
  const pts = []; for (let i = 0; i <= n; i++) { const x = -BLEED + (AW + 2 * BLEED) * i / n; pts.push([x, y0 + amp * Math.sin(x / 200 + seed) + amp * .5 * Math.sin(x / 77 + seed * 2.7)]); }
  return pts;
}
function water(seed, y0, ink = 'mid', y1 = 1180, speed = -22) {
  const glints = new Path2D(), r = mulberry(seed);
  for (let i = 0; i < 6; i++) { const y = y0 + 8 + i * 12; let x = -BLEED - 240 + r() * 60; while (x < AW + BLEED + 240) { const L = 40 + r() * 120; glints.rect(x, y, L, 3 + i * .5); x += L + 60 + r() * 110; } }
  return [{ pull: 'land', ink, path: rectPath(-BLEED, y0, AW + 2 * BLEED, y1 - y0) }, { pull: 'land', ink: 'glow', path: glints, lit: 1, drift: [speed, 0] }];
}
function agave(p, x, y, s) { for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .38; p.addPath(polyPath([[x - 6 * s, y], [x + 6 * s, y], [x + Math.cos(a) * 46 * s, y + Math.sin(a) * 40 * s]])); } }
function nopal(p, x, y, s = 1) { blob(p, x, y - 60 * s, 34 * s, 50 * s); blob(p, x - 40 * s, y - 130 * s, 26 * s, 38 * s); blob(p, x + 36 * s, y - 140 * s, 28 * s, 40 * s); blob(p, x + 10 * s, y - 200 * s, 22 * s, 32 * s); p.rect(x - 10 * s, y - 20 * s, 20 * s, 20 * s); }
function steps(p, cx, base, w0, n, h, shrink) { for (let k = 0; k < n; k++) { const w = w0 - k * shrink, y = base - (k + 1) * h; p.addPath(polyPath([[cx - w / 2, y + h], [cx + w / 2, y + h], [cx + w / 2 - 10, y], [cx - w / 2 + 10, y]])); } }
function palm(p, x, y, h) {
  p.addPath(polyPath([[x - 7, y], [x + 7, y], [x + 22, y - h], [x + 14, y - h]]));
  for (let k = 0; k < 7; k++) { const a = -Math.PI + k * Math.PI / 6, tx = x + 18, ty = y - h; p.addPath(polyPath([[tx, ty], [tx + 100 * Math.cos(a), ty + 46 * Math.sin(a) + 34 * Math.abs(Math.cos(a))], [tx + 90 * Math.cos(a), ty + 46 * Math.sin(a) + 50 * Math.abs(Math.cos(a))]])); }
}

// ---------------- the base print ----------------
function base(seed, o = {}) {
  const sunKnock = unionPath([circlePath(SUN[0], SUN[1], SR + 10), ringPath(SUN[0], SUN[1], SR + 24, SR + 30), ringPath(SUN[0], SUN[1], SR + 44, SR + 48)]);
  const sky2 = new Path2D(); sky2.rect(-BLEED, -BLEED, AW + 2 * BLEED, 100 + BLEED); sky2.addPath(bandSteps(-BLEED, AW + 2 * BLEED, 90, 760, 6, 16));
  const cu = [new Path2D(), new Path2D()], r = mulberry(seed + 3);
  for (let k = 0; k < 8; k++) { const g = cu[k % 2], x = -500 + k * 230 + r() * 60, y = 760 + (k % 3) * 22; g.rect(x - 90, y, 180, 24); blob(g, x - 40, y, 56, 46, Math.PI, Math.PI * 2); blob(g, x + 30, y - 10, 66, 60, Math.PI, Math.PI * 2); blob(g, x + 90, y + 4, 40, 34, Math.PI, Math.PI * 2); }
  const s1 = line(seed, 930, 34), s2 = line(seed + 2.1, 990, 22);
  const sierra = polyPath([[-BLEED, 1300], ...s1, [AW + BLEED, 1300]]), sierra2 = polyPath([[-BLEED, 1300], ...s2, [AW + BLEED, 1300]]);
  const field = polyPath([[-BLEED, 1300], ...line(seed + 3.3, 1050, 8), [AW + BLEED, 1300]]);
  const ag = new Path2D(); for (let row = 0; row < 4; row++) for (let x = -40 + (row % 2) * 40; x < AW + 60; x += 80) agave(ag, x, 1070 + row * 26, .45 + row * .12);
  const cac = new Path2D(); if (o.cactus !== false) { nopal(cac, 70, 1150, .9); nopal(cac, 1010, 1160, .8); }
  const hum = new Path2D(); blob(hum, 700, 640, 12, 7); hum.addPath(polyPath([[712, 638], [740, 634], [712, 642]])); hum.addPath(polyPath([[694, 638], [680, 610], [700, 636]]));
  return {
    sky: [
      { pull: 'sky1', ink: 'sky1', path: FULL(), knock: sunKnock },
      { pull: 'sky2', ink: 'sky2', path: sky2 },
      { pull: 'sky2', ink: 'sky1', path: cu[0], drift: [-36, 0] }, { pull: 'sky2', ink: 'glow', path: cu[1], drift: [-56, 0], lit: 1 },
      { pull: 'sun', ink: 'sun', path: circlePath(SUN[0], SUN[1], SR) },
    ],
    far: [{ pull: 'far', ink: 'far', path: sierra }, { pull: 'far', ink: 'mid', path: sierra2, lit: 1 }],
    mid: [
      ...(o.field === false ? [] : [{ pull: 'mid', ink: 'mid', path: field }, { pull: 'mid', ink: 'glow', path: ag, lit: 1, sway: [3, 1.5, 0] }]),
      ...(o.cactus === false ? [] : [{ pull: 'mid', ink: 'near', path: cac, sway: [4, 1.1, .7] }]),
      { pull: 'mid', ink: 'near', path: birds([[860, 480, 1.1], [760, 430, .9]]), swing: [800, 600, .35, .5, 0] },
      { pull: 'mid', ink: 'near', path: hum, swing: [640, 700, .25, 2.6, 0] },
    ],
  };
}
function bandPart() {
  const p = rectPath(...BAND);
  const knock = new Path2D(); for (let x = 16; x < AW - 30; x += 40) { knock.addPath(polyPath([[x, BAND[1] + 30], [x + 10, BAND[1] + 14], [x + 20, BAND[1] + 30]])); knock.rect(x + 24, BAND[1] + 20, 8, 8); }   // a stepped fret border
  return { pull: 'band', ink: 'near', path: p, knock };
}
function compose(seed, land, o = {}) {
  const b = base(seed, o);
  const parts = o.night ? [...b.sky.map(p => p.pull === 'sun' ? { ...p, ink: 'glow', path: circlePath(SUN[0], SUN[1], SR * .55) } : p), ...b.far, ...b.mid] : [...b.sky, ...b.far, ...b.mid];
  return { focus: land.focus, parts: [...parts, ...land.parts, bandPart()], depth: { sky1: 0, sky2: 0, sun: .1, far: .3, mid: .55, land: .85, acc: .85, band: 1 } };
}

// ---------------- the eras ----------------
// 1 · c. 1200 BC: a colossal stone head with a helmet in a jungle clearing, palms, workers hauling with ropes, a raft on the river
function olmec(seed = 11) {
  const cx = 560, head = new Path2D(); blob(head, cx, 880, 190, 220); head.rect(cx - 170, 980, 340, 120);
  const helm = new Path2D(); blob(helm, cx, 820, 206, 170, Math.PI, Math.PI * 2); helm.rect(cx - 206, 810, 412, 50);
  const face = new Path2D(); for (const dx of [-70, 70]) { blob(face, cx + dx, 900, 40, 16); blob(face, cx + dx, 900, 14, 10); } face.addPath(polyPath([[cx - 30, 920], [cx + 30, 920], [cx + 50, 990], [cx - 50, 990]])); blob(face, cx, 1040, 80, 22); face.rect(cx - 70, 1038, 140, 5);
  const ears = new Path2D(); for (const s of [-1, 1]) blob(ears, cx + s * 196, 930, 26, 60);
  const ropes = new Path2D(), men = new Path2D(); for (let k = 0; k < 5; k++) { const x = 820 + k * 46; blob(men, x, 1092, 9, 10); men.addPath(polyPath([[x - 10, 1102], [x + 10, 1102], [x + 22, 1140], [x - 2, 1140]])); } ropes.addPath(polyPath([[cx + 160, 1060], [1060, 1100], [1060, 1104], [cx + 160, 1064]]));
  const palms = new Path2D(); palm(palms, 80, 1100, 300); palm(palms, 180, 1100, 230); palm(palms, 960, 1080, 260);
  const raft = new Path2D(); raft.rect(-160, 1146, 180, 14); raft.rect(-60, 1100, 4, 46); blob(raft, -70, 1094, 10, 11);
  return compose(seed, { focus: [560, 900], parts: [
    { pull: 'land', ink: 'far', path: unionPath([head, ears]), knock: face }, { pull: 'land', ink: 'near', path: face, lit: 1 },
    { pull: 'land', ink: 'mid', path: helm },
    { pull: 'acc', ink: 'near', path: birds([[-60, 560, .8], [-110, 530, .6], [-150, 580, .5]]), drift: [110, -8] },
    { pull: 'acc', ink: 'near', path: palms, sway: [6, 1.3, .3] },
    { pull: 'acc', ink: 'near', path: unionPath([ropes, men]), sway: [6, 2.2, 0] },
    ...water(seed, 1140, 'sky2', 1180, -30),
    { pull: 'acc', ink: 'near', path: raft, drift: [70, 0] },
  ] }, { field: false, cactus: false });
}
// 2 · c. AD 200: the great stepped pyramid with its stair, the long avenue, smaller pyramids, pilgrims climbing, smoke from the top
function sunpyr(seed = 13) {
  const cx = 520, pyr = new Path2D(); steps(pyr, cx, 1110, 760, 5, 64, 120); pyr.rect(cx - 60, 760, 120, 30);
  const stair = polyPath([[cx - 40, 1110], [cx + 40, 1110], [cx + 24, 790], [cx - 24, 790]]); const treads = new Path2D(); for (let y = 800; y < 1110; y += 14) treads.rect(cx - 40, y, 80, 3);
  const small = new Path2D(); steps(small, 940, 1110, 260, 3, 46, 70); steps(small, 110, 1110, 200, 3, 40, 56);
  const lit = new Path2D(); for (let k = 0; k < 5; k++) { const w = 760 - k * 120, y = 1110 - (k + 1) * 64; lit.addPath(polyPath([[cx + 40, y + 6], [cx + w / 2 - 10, y + 6], [cx + w / 2, y + 64], [cx + 40, y + 64]])); }
  const ave = polyPath([[cx - 80, 1180], [cx + 80, 1180], [cx + 50, 1110], [cx - 50, 1110]]);
  const ppl = new Path2D(); for (let k = 0; k < 6; k++) { const y = 1100 - k * 50, x = cx - 6 + (k % 2) * 12; blob(ppl, x, y - 14, 6, 7); ppl.rect(x - 6, y - 8, 12, 14); }
  return compose(seed, { focus: [520, 900], parts: [
    { pull: 'land', ink: 'far', path: small },
    { pull: 'land', ink: 'sun', path: pyr }, { pull: 'land', ink: 'near', path: lit, lit: 1 },
    { pull: 'land', ink: 'paper', path: stair, knock: treads },
    { pull: 'land', ink: 'mid', path: ave },
    { pull: 'acc', ink: 'near', path: ppl, drift: [0, -30] },
    { pull: 'acc', ink: 'near', path: (() => { const p = new Path2D(); for (let k = 0; k < 9; k++) { const x = -200 + k * 70, y = 1150; blob(p, x, y - 16, 7, 8); p.rect(x - 7, y - 9, 14, 18); } return p; })(), drift: [90, 0] },
    { pull: 'acc', ink: 'near', path: birds([[1120, 520, .8], [1170, 490, .6], [1090, 480, .6], [1200, 540, .5]]), drift: [-120, 8] },
    { pull: 'acc', ink: 'glow', path: (() => { const p = new Path2D(); for (let k = 0; k < 5; k++) blob(p, cx + k * 14, 730 - k * 40, 16 + k * 7, 12 + k * 5); return p; })(), lit: 1, drift: [20, -34] },
    { pull: 'acc', ink: 'near', path: birds([[-60, 600, .8], [-110, 570, .6]]), drift: [100, -6] },
  ] }, { cactus: false });
}
// 3 · 1325: a city on an island in a lake — a twin-shrined temple on its stepped base, a causeway, floating gardens, canoes
function lake(seed = 17) {
  const lakeP = water(seed, 1020, 'sky2', 1180, -48);
  const isl = polyPath([[140, 1060], [940, 1060], [900, 1030], [180, 1030]]);
  const tem = new Path2D(); steps(tem, 540, 1030, 420, 4, 46, 60); for (const dx of [-60, 60]) { tem.rect(540 + dx - 40, 790, 80, 50); tem.addPath(polyPath([[540 + dx - 46, 792], [540 + dx + 46, 792], [540 + dx, 740]])); }
  const stair = new Path2D(); for (const dx of [-24, 24]) stair.addPath(polyPath([[540 + dx - 14, 1030], [540 + dx + 14, 1030], [540 + dx + 10, 846], [540 + dx - 10, 846]]));
  const houses = new Path2D(), r = mulberry(seed); for (let x = 160; x < 920; x += 46) if (Math.abs(x - 540) > 220) houses.rect(x, 1000 - r() * 30, 38, 40);
  const way = polyPath([[-BLEED, 1080], [180, 1056], [180, 1064], [-BLEED, 1090]]);
  const gardens = new Path2D(); for (let k = 0; k < 10; k++) gardens.rect(-40 + k * 120, 1110 + (k % 2) * 20, 90, 12);
  const sprouts = new Path2D(); for (let k = 0; k < 40; k++) { const x = -30 + k * 30, y = 1110 + (Math.floor(k / 4) % 2) * 20; sprouts.addPath(polyPath([[x, y], [x + 4, y], [x + 2, y - 12]])); }
  const canoes = new Path2D(); for (const [x, y] of [[200, 1150], [700, 1090], [-100, 1120]]) { canoes.addPath(polyPath([[x - 60, y], [x + 60, y], [x + 70, y - 8], [x + 50, y + 8], [x - 50, y + 8], [x - 70, y - 8]])); blob(canoes, x, y - 16, 8, 9); canoes.rect(x + 10, y - 50, 3, 50); }
  return compose(seed, { focus: [540, 920], parts: [
    ...lakeP,
    { pull: 'land', ink: 'mid', path: isl }, { pull: 'land', ink: 'far', path: houses },
    { pull: 'land', ink: 'near', path: tem, knock: stair }, { pull: 'land', ink: 'sun', path: stair },
    { pull: 'land', ink: 'near', path: way },
    { pull: 'acc', ink: 'mid', path: gardens }, { pull: 'acc', ink: 'glow', path: sprouts, sway: [3, 1.6, 0], lit: 1 },
    { pull: 'acc', ink: 'near', path: canoes, drift: [46, 0] },
    { pull: 'acc', ink: 'near', path: birds([[1120, 600, .8], [1170, 570, .6], [1090, 560, .6]]), drift: [-100, 6] },
  ] }, { field: false, cactus: false });
}
// 4 · 1521: grey sky, smoke rising over a broken stepped temple, ash drifting down
function fall(seed = 19) {
  const tem = new Path2D(); steps(tem, 540, 1110, 520, 3, 50, 90); tem.addPath(polyPath([[400, 960], [470, 900], [520, 940], [600, 880], [660, 960]]));
  const rubble = new Path2D(), r = mulberry(seed); for (let k = 0; k < 18; k++) { const x = 200 + r() * 700, y = 1110 + r() * 50; rubble.addPath(polyPath([[x, y], [x + 30, y - 4], [x + 24, y - 24], [x + 4, y - 20]])); }
  const smoke = [new Path2D(), new Path2D()]; for (const [x0, k0] of [[300, 0], [760, 1], [560, 0]]) for (let k = 0; k < 6; k++) blob(smoke[(k + k0) % 2], x0 + k * 12, 900 - k * 70, 30 + k * 12, 26 + k * 8);
  const ash = new Path2D(); for (let k = 0; k < 60; k++) { const x = r() * AW, y = r() * 1100; ash.rect(x, y, 4, 4); }
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'far', path: tem }, { pull: 'land', ink: 'near', path: rubble },
    { pull: 'acc', ink: 'mid', path: smoke[0], lit: 1, drift: [16, -30] }, { pull: 'acc', ink: 'glow', path: smoke[1], lit: 1, drift: [-10, -42] },
    { pull: 'acc', ink: 'paper', path: ash, lit: 1, loop: [-20, 220, .5] },
  ] }, { cactus: false });
}
// 5 · 1810: a village church at dawn, its bell swinging, a crowd raising lanterns and torches, string lights between the trees
function grito(seed = 23) {
  const cx = 540, ch = new Path2D(); ch.rect(cx - 200, 860, 400, 250); ch.addPath(polyPath([[cx - 210, 862], [cx + 210, 862], [cx, 760]]));
  for (const s of [-1, 1]) { ch.rect(cx + s * 250 - 50, 700, 100, 410); ch.rect(cx + s * 250 - 40, 640, 80, 64); blob(ch, cx + s * 250, 640, 40, 44, Math.PI, Math.PI * 2); ch.rect(cx + s * 250 - 3, 570, 6, 30); ch.rect(cx + s * 250 - 12, 580, 24, 5); }
  const door = new Path2D(); door.rect(cx - 50, 1000, 100, 110); blob(door, cx, 1000, 50, 40, Math.PI, Math.PI * 2); const win = circlePath(cx, 900, 30);
  const belf = new Path2D(); for (const s of [-1, 1]) belf.rect(cx + s * 250 - 26, 652, 52, 46);
  const bells = []; for (const s of [-1, 1]) { const b = new Path2D(), x = cx + s * 250; b.addPath(polyPath([[x - 16, 692], [x + 16, 692], [x + 10, 664], [x - 10, 664]])); blob(b, x, 664, 10, 8, Math.PI, Math.PI * 2); bells.push({ pull: 'acc', ink: 'sun', path: b, swing: [x, 656, .45, 3.0, s > 0 ? 1.2 : 0] }); }
  const r = mulberry(seed), crowd = new Path2D(), lights = [new Path2D(), new Path2D()]; for (let k = 0; k < 26; k++) { const x = r() * AW; blob(crowd, x, 1126, 9, 10); crowd.addPath(polyPath([[x - 12, 1134], [x + 12, 1134], [x + 15, 1180], [x - 15, 1180]])); if (k % 2) { crowd.rect(x + 12, 1080, 4, 50); blob(lights[k % 4 === 1 ? 0 : 1], x + 14, 1074, 9, 12); } }
  const garland = new Path2D(), flags = [new Path2D(), new Path2D(), new Path2D()]; for (let k = 0; k < 22; k++) { const x = -40 + k * 54, y = 1000 + 18 * Math.sin(k * .6); flags[k % 3].addPath(polyPath([[x, y], [x + 40, y], [x + 40, y + 40], [x + 30, y + 34], [x + 20, y + 40], [x + 10, y + 34], [x, y + 40]])); } garland.rect(-BLEED, 998, AW + 2 * BLEED, 3);
  return compose(seed, { focus: [540, 880], parts: [
    { pull: 'land', ink: 'paper', path: ch, knock: unionPath([door, win, belf]) }, { pull: 'land', ink: 'near', path: unionPath([door, win, belf]), lit: 1 },
    ...bells,
    { pull: 'acc', ink: 'near', path: garland },
    ...flags.map((p, k) => ({ pull: 'acc', ink: ['sun', 'mid', 'glow'][k], path: p, sway: [3, 2 + k * .3, k] })),
    { pull: 'acc', ink: 'near', path: crowd, sway: [4, 2.2, 0] },
    ...lights.map((p, k) => ({ pull: 'acc', ink: 'glow', path: p, blink: k })),
  ] }, { field: false });
}
// 6 · 1910: riders in wide hats galloping across the plain, rifles on their backs, dust trailing, cacti and the sierra
function revolution(seed = 29) {
  const rider = (x, y, s) => { const p = new Path2D(); p.addPath(polyPath([[x - 60 * s, y], [x + 50 * s, y], [x + 90 * s, y - 40 * s], [x + 110 * s, y - 30 * s], [x + 76 * s, y + 6 * s], [x + 74 * s, y + 56 * s], [x + 62 * s, y + 56 * s], [x + 50 * s, y + 18 * s], [x - 40 * s, y + 18 * s], [x - 60 * s, y + 56 * s], [x - 72 * s, y + 56 * s], [x - 70 * s, y + 6 * s], [x - 90 * s, y + 20 * s], [x - 64 * s, y - 6 * s]])); p.addPath(polyPath([[x - 14 * s, y], [x + 14 * s, y], [x + 10 * s, y - 50 * s], [x - 10 * s, y - 50 * s]])); blob(p, x, y - 62 * s, 12 * s, 13 * s); blob(p, x, y - 68 * s, 44 * s, 10 * s); blob(p, x, y - 76 * s, 16 * s, 14 * s, Math.PI, Math.PI * 2); p.addPath(polyPath([[x - 20 * s, y - 50 * s], [x - 16 * s, y - 54 * s], [x + 30 * s, y - 10 * s], [x + 26 * s, y - 6 * s]])); return p; };
  const riders = unionPath([rider(160, 1080, 1), rider(420, 1090, .9), rider(680, 1070, 1.05), rider(-120, 1085, .95)]);
  const dust = new Path2D(); for (let k = 0; k < 10; k++) blob(dust, -200 + k * 120, 1140 - (k % 2) * 16, 80, 26);
  const cac = new Path2D(); for (const [x, h] of [[900, 220], [1010, 160]]) { cac.rect(x - 16, 1120 - h, 32, h); cac.rect(x - 60, 1120 - h * .7, 20, 60); cac.rect(x - 60, 1120 - h * .7 + 40, 50, 20); cac.rect(x + 40, 1120 - h * .8, 20, 70); cac.rect(x + 10, 1120 - h * .8 + 50, 50, 20); }
  return compose(seed, { focus: [500, 920], parts: [
    { pull: 'acc', ink: 'mid', path: cac },
    { pull: 'acc', ink: 'glow', path: dust, lit: 1, drift: [-30, -6] },
    { pull: 'acc', ink: 'near', path: riders, drift: [120, 0], sway: [0, 6, 0] },
    { pull: 'acc', ink: 'sun', path: (() => { const p = new Path2D(); for (const x of [160, 420, 680, -120]) p.rect(x - 30, 1076, 60, 6); return p; })(), drift: [120, 0] },
    { pull: 'acc', ink: 'near', path: birds([[1120, 600, .8], [1170, 570, .6]]), drift: [-90, 6] },
  ] }, { field: false, cactus: false });
}
// 7 · 1920s: a long wall covered by a mural that appears panel by panel — workers, corn, a great sun — the painter on a scaffold moving along
function mural(seed = 31) {
  const wall = rectPath(40, 640, 1000, 470), frame = new Path2D(); frame.rect(30, 630, 1020, 10); frame.rect(30, 1110, 1020, 10);
  const panels = []; const r = mulberry(seed);
  for (let k = 0; k < 6; k++) {
    const x0 = 60 + k * 162, p = new Path2D(), q = new Path2D();
    if (k === 2 || k === 3) { blob(p, x0 + (k === 2 ? 150 : 10), 760, 90, 90); for (let j = 0; j < 10; j++) { const a = j * Math.PI / 5; q.addPath(polyPath([[x0 + (k === 2 ? 150 : 10) + 100 * Math.cos(a - .08), 760 + 100 * Math.sin(a - .08)], [x0 + (k === 2 ? 150 : 10) + 140 * Math.cos(a), 760 + 140 * Math.sin(a)], [x0 + (k === 2 ? 150 : 10) + 100 * Math.cos(a + .08), 760 + 100 * Math.sin(a + .08)]])); } }
    for (let j = 0; j < 2; j++) { const x = x0 + 40 + j * 70; blob(p, x, 900, 18, 20); p.addPath(polyPath([[x - 26, 920], [x + 26, 920], [x + 34, 1090], [x - 34, 1090]])); q.addPath(polyPath([[x + 20, 930], [x + 30, 926], [x + 54, 1000], [x + 44, 1004]])); }
    for (let j = 0; j < 3; j++) { const x = x0 + 20 + j * 50; q.addPath(polyPath([[x - 3, 1100], [x + 3, 1100], [x + 2, 980], [x - 2, 980]])); blob(q, x + 10, 1000, 8, 24); }
    panels.push({ pull: 'acc', ink: k % 2 ? 'mid' : 'far', path: p, seq: .2 + k * .55 }, { pull: 'acc', ink: k % 2 ? 'sun' : 'glow', path: q, seq: .35 + k * .55 });
  }
  const scaf = new Path2D(); scaf.rect(0, 860, 8, 260); scaf.rect(120, 860, 8, 260); scaf.rect(0, 860, 128, 10); scaf.rect(0, 990, 128, 8); blob(scaf, 60, 820, 12, 13); scaf.addPath(polyPath([[46, 834], [74, 834], [80, 860], [40, 860]])); scaf.addPath(polyPath([[72, 838], [80, 834], [104, 790], [98, 786]]));
  return compose(seed, { focus: [540, 880], parts: [
    { pull: 'land', ink: 'paper', path: wall }, { pull: 'land', ink: 'near', path: frame },
    ...panels,
    { pull: 'acc', ink: 'near', path: scaf, drift: [170, 0] },
  ] }, { field: false });
}
// 8 · today: a great city under the sierra, a tall tower, a column with a golden winged figure, jacaranda trees dropping purple blossom, traffic
function today(seed = 37) {
  const r = mulberry(seed), city = new Path2D(), lit = [new Path2D(), new Path2D(), new Path2D()];
  for (let x = -BLEED; x < AW + BLEED;) { const w = 60 + r() * 60, h = 100 + r() * 180; if (!(x > 440 && x < 560)) { city.rect(x, 1060 - h, w - 6, h); for (let wy = 1070 - h; wy < 1040; wy += 22) for (let wx = x + 8; wx < x + w - 14; wx += 15) if (r() < .3) lit[Math.floor(r() * 3)].rect(wx, wy, 6, 10); } x += w; }
  const tower = new Path2D(); tower.rect(760, 620, 110, 440); tower.rect(780, 560, 70, 64); tower.rect(812, 470, 6, 90);
  const col = new Path2D(); col.rect(480, 1000, 120, 60); col.rect(520, 700, 40, 300); col.rect(506, 690, 68, 16);
  const angel = new Path2D(); blob(angel, 540, 650, 12, 13); angel.addPath(polyPath([[528, 662], [552, 662], [560, 690], [520, 690]])); angel.addPath(polyPath([[550, 666], [600, 620], [590, 660]])); angel.addPath(polyPath([[530, 666], [480, 620], [490, 660]]));
  const trees = new Path2D(); for (const x of [60, 200, 900, 1040]) { for (const [dx, dy, rr] of [[0, -80, 60], [-40, -50, 44], [40, -56, 44]]) blob(trees, x + dx, 1110 + dy, rr, rr * .75); trees.rect(x - 6, 1060, 12, 60); }
  const petals = new Path2D(); for (let k = 0; k < 50; k++) blob(petals, r() * AW, 700 + r() * 440, 4, 3);
  const cars = new Path2D(); for (let x = -40; x < AW + 40; x += 140) { cars.rect(x, 1130, 70, 26); blob(cars, x + 14, 1158, 9, 9); blob(cars, x + 56, 1158, 9, 9); }
  return compose(seed, { focus: [560, 860], parts: [
    { pull: 'land', ink: 'mid', path: city },
    ...lit.map((p, k) => ({ pull: 'land', ink: 'glow', path: p, lit: 1, blink: k })),
    { pull: 'land', ink: 'near', path: tower },
    { pull: 'land', ink: 'paper', path: col }, { pull: 'land', ink: 'sun', path: angel, lit: 1 },
    { pull: 'acc', ink: 'far', path: trees, sway: [4, 1.3, .3] },
    { pull: 'acc', ink: 'far', path: petals, lit: 1, loop: [30, 220, .6] },
    { pull: 'acc', ink: 'near', path: cars, drift: [-130, 0] },
    { pull: 'acc', ink: 'near', path: birds([[-60, 580, .8], [-110, 550, .6]]), drift: [110, -6] },
  ] }, { field: false, cactus: false });
}

export const SCENES = { olmec, sunpyr, lake, fall, grito, revolution, mural, today };
