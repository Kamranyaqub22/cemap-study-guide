// scenes.js · ITALY — vertical print (1080×1920 art units, full bleed).
// Base: a warm sky with drifting cloud bars, a sun, rolling Tuscan hills in two layers and a row of swaying cypresses.
// One era landmark per print. Parts: { pull, ink, path, knock?, cut?, lit?, drift?, blink?, sway?, seq? }.
// Landmarks are original stylised silhouettes from simple paths: not traced from photographs, no logos, no flags, no maps.
import { mulberry, polyPath, circlePath, ringPath, rectPath, unionPath, bandSteps, lerp } from './silk.js';

export const AW = 1080, AH = 1920, BLEED = 60;
export const GROUND = 1180;
export const BAND = [-BLEED, 1170, AW + 2 * BLEED, AH - 1170 + BLEED];
const FULL = () => rectPath(-BLEED, -BLEED, AW + 2 * BLEED, AH + 2 * BLEED);
const SUN = [300, 560], SR = 96;

function blob(p, x, y, rx, ry, a0 = 0, a1 = Math.PI * 2) { p.moveTo(x + rx * Math.cos(a0), y + ry * Math.sin(a0)); p.ellipse(x, y, rx, ry, 0, a0, a1); p.closePath(); }
const bird = (p, x, y, s) => p.addPath(polyPath([[x - 24 * s, y - 6 * s], [x - 11 * s, y - 10 * s], [x, y], [x + 11 * s, y - 10 * s], [x + 24 * s, y - 6 * s], [x + 11 * s, y - 5 * s], [x, y + 5 * s], [x - 11 * s, y - 5 * s]]));
function cypress(p, x, base, h, w = 1) {                  // a tall flame-shaped cypress
  const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12, a = u * Math.PI; pts.push([x - Math.sin(a) ** .8 * 22 * w * (1 - u * .35), base - h * u]); }
  for (let i = 12; i >= 0; i--) { const u = i / 12, a = u * Math.PI; pts.push([x + Math.sin(a) ** .8 * 22 * w * (1 - u * .35), base - h * u]); }
  p.addPath(polyPath(pts));
}
function hillLine(seed, y0, amp, n = 40) {
  const pts = []; for (let i = 0; i <= n; i++) { const x = -BLEED + (AW + 2 * BLEED) * i / n; pts.push([x, y0 + amp * Math.sin(x / 190 + seed) + amp * .5 * Math.sin(x / 83 + seed * 2.3)]); }
  return pts;
}
function water(seed, y0, ink = 'mid', y1 = 1300) {
  const glints = new Path2D(), r = mulberry(seed);
  for (let i = 0; i < 7; i++) { const y = y0 + 10 + i * 13; let x = -BLEED - 200 + r() * 60; while (x < AW + BLEED + 200) { const L = 50 + r() * 130; glints.rect(x, y, L, 3 + i * .5); x += L + 60 + r() * 120; } }
  return [{ pull: 'land', ink, path: rectPath(-BLEED, y0, AW + 2 * BLEED, y1 - y0) }, { pull: 'land', ink: 'glow', path: glints, lit: 1, drift: [-18, 0] }];
}
function arches(p, x0, x1, y, h, w, gap) {               // a row of round-headed openings (for knocks)
  for (let x = x0; x + w <= x1; x += w + gap) { p.rect(x, y + w / 2, w, h - w / 2); blob(p, x + w / 2, y + w / 2, w / 2, w / 2, Math.PI, Math.PI * 2); }
}

// ---------------- the base print ----------------
function base(seed) {
  const sunKnock = unionPath([circlePath(SUN[0], SUN[1], SR + 9), ringPath(SUN[0], SUN[1], SR + 28, SR + 36)]);
  const sky2 = new Path2D(); sky2.rect(-BLEED, -BLEED, AW + 2 * BLEED, 130 + BLEED); sky2.addPath(bandSteps(-BLEED, AW + 2 * BLEED, 120, 820, 6, 10));
  const clouds = new Path2D(), r = mulberry(seed + 3);
  for (let k = 0; k < 8; k++) { const y = 450 + k * 52 + r() * 18, x = -800 + r() * 1700, w = 220 + r() * 300; clouds.rect(x, y, w, 9 + r() * 6); clouds.rect(x + 40, y - 14, w * .5, 8); }
  const far = hillLine(seed, 960, 26), farP = polyPath([[-BLEED, 1300], ...far, [AW + BLEED, 1300]]);
  const farLit = new Path2D(); for (let i = 0; i < far.length - 1; i += 4) { const [ax, ay] = far[i]; farLit.addPath(polyPath([[ax, ay + 18], [ax + 90, ay + 10], [ax + 100, ay + 16], [ax + 10, ay + 24]])); }
  const mid = hillLine(seed + 1.7, 1050, 18), midP = polyPath([[-BLEED, 1300], ...mid, [AW + BLEED, 1300]]);
  const rows = new Path2D(); for (let k = 0; k < 4; k++) { const y = 1080 + k * 22; rows.addPath(polyPath([...hillLine(seed + 1.7, y, 18 - k * 3).map(([x, yy]) => [x, yy]), ...hillLine(seed + 1.7, y + 5, 18 - k * 3).reverse()])); }
  const cyp = new Path2D(); for (const [x, h] of [[860, 150], [905, 190], [950, 160], [995, 205], [1040, 170]]) cypress(cyp, x, 1062 + 10 * Math.sin(x / 190), h, .8);
  const birds = new Path2D(); bird(birds, 640, 420, 1); bird(birds, 690, 390, .75); bird(birds, 600, 380, .6);
  const birds2 = new Path2D(); bird(birds2, -120, 640, .8); bird(birds2, -70, 610, .6); bird(birds2, -30, 660, .7);
  return {
    sky: [
      { pull: 'sky1', ink: 'sky1', path: FULL(), knock: sunKnock },
      { pull: 'sky2', ink: 'sky2', path: sky2 },
      { pull: 'sky2', ink: 'sky1', path: clouds, drift: [-38, 0] },
      { pull: 'sun', ink: 'sun', path: circlePath(SUN[0], SUN[1], SR) },
    ],
    far: [{ pull: 'far', ink: 'far', path: farP }, { pull: 'far', ink: 'glow', path: farLit, lit: 1 }],
    mid: [
      { pull: 'mid', ink: 'mid', path: midP }, { pull: 'mid', ink: 'far', path: rows, lit: 1 },
      { pull: 'mid', ink: 'near', path: cyp, sway: [7, 1.3, .4] },
      { pull: 'mid', ink: 'near', path: birds, drift: [-46, -6] }, { pull: 'mid', ink: 'near', path: birds2, drift: [60, -5] },
    ],
  };
}
function bandPart() {
  const p = rectPath(...BAND);
  const knock = new Path2D(); for (let x = 30; x < AW - 20; x += 40) knock.rect(x, BAND[1] + 18, 22, 8);   // a Roman key pattern of dashes
  return { pull: 'band', ink: 'near', path: p, knock };
}
function compose(seed, land) {
  const b = base(seed);
  return { focus: land.focus, parts: [...b.sky, ...b.far, ...b.mid, ...land.parts, bandPart()], depth: { sky1: 0, sky2: 0, sun: .1, far: .3, mid: .55, land: .85, acc: .85, band: 1 } };
}

// ---------------- the eras ----------------
// 1 · 753 BC: seven low hills by the Tiber, round thatched huts, smoke drifting, a shepherd's flock
function hills(seed = 11) {
  const h = new Path2D(); const tops = [[60, 1060, 140], [230, 1040, 120], [400, 1070, 130], [560, 1030, 150], [730, 1060, 120], [880, 1040, 140], [1040, 1070, 120]];
  for (const [x, y, w] of tops) blob(h, x, y + 40, w, 70, Math.PI, Math.PI * 2);
  h.rect(-BLEED, 1095, AW + 2 * BLEED, 60);
  const huts = new Path2D(), doors = new Path2D(), roofs = new Path2D();
  for (const [x, y] of [[230, 1012], [300, 1020], [560, 996], [640, 1006], [880, 1010]]) {
    huts.rect(x - 26, y, 52, 34); roofs.addPath(polyPath([[x - 36, y + 4], [x + 36, y + 4], [x + 6, y - 44], [x - 6, y - 44]])); doors.rect(x - 7, y + 12, 14, 22);
  }
  const smoke = new Path2D(); for (const x0 of [300, 640]) for (let k = 0; k < 4; k++) blob(smoke, x0 + k * 22, 940 - k * 34, 12 + k * 6, 9 + k * 4);
  const sheep = new Path2D(); for (const x of [120, 170, 205, 250]) { blob(sheep, x, 1120, 22, 14); sheep.rect(x + 16, 1110, 12, 10); sheep.rect(x - 12, 1130, 4, 14); sheep.rect(x + 10, 1130, 4, 14); }
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'mid', path: h },
    ...water(seed, 1138, 'sky2', 1180),
    { pull: 'land', ink: 'far', path: huts, knock: doors },
    { pull: 'land', ink: 'near', path: unionPath([roofs, doors]) },
    { pull: 'acc', ink: 'glow', path: smoke, lit: 1, drift: [16, -30] },
    { pull: 'acc', ink: 'paper', path: sheep, drift: [26, 0] },
    { pull: 'acc', ink: 'near', path: (() => { const p = new Path2D(); for (const [x, y, s] of [[-80, 700, 1], [-140, 660, .8], [-30, 640, .7], [-190, 720, .6], [-110, 600, .6]]) bird(p, x, y, s); return p; })(), drift: [120, -10] },
  ] });
}
// 2 · AD 80: the amphitheatre in three tiers of arches, an aqueduct on the hills behind, a shaft of light sweeping the facade
function colosseum(seed = 13) {
  const aq = new Path2D(), aqH = new Path2D(); aq.rect(-BLEED, 900, AW + 2 * BLEED, 30); arches(aqH, -40, AW + 60, 930, 90, 48, 26); aq.rect(-BLEED, 930, AW + 2 * BLEED, 90);
  const wall = new Path2D(); wall.addPath(polyPath([[90, 1170], [990, 1170], [990, 760], [880, 740], [540, 730], [200, 740], [90, 760]]));
  const holes = new Path2D(); for (const [y, h] of [[1050, 110], [930, 100], [815, 95]]) arches(holes, 120, 980, y, h - 16, 52, 30);
  const attic = new Path2D(); for (let x = 130; x < 960; x += 82) attic.rect(x, 760, 30, 22);
  const cornice = new Path2D(); for (const y of [1040, 920, 805, 752]) cornice.rect(80, y, 920, 10);
  const lit = polyPath([[600, 740], [990, 760], [990, 1170], [700, 1170]]);
  const crowd = new Path2D(), r = mulberry(seed); for (let k = 0; k < 26; k++) { const x = 60 + r() * 960; blob(crowd, x, 1158, 9, 12); crowd.rect(x - 9, 1158, 18, 22); }
  return compose(seed, { focus: [540, 920], parts: [
    { pull: 'land', ink: 'far', path: aq, knock: aqH },
    { pull: 'land', ink: 'far', path: wall, knock: holes },
    { pull: 'land', ink: 'near', path: holes, lit: 1 },
    { pull: 'land', ink: 'glow', path: lit, cut: holes, lit: 1 },
    { pull: 'acc', ink: 'sun', path: unionPath([cornice, attic]) },
    { pull: 'acc', ink: 'glow', path: polyPath([[-300, 740], [-200, 740], [-60, 1170], [-160, 1170]]), cut: holes, lit: 1, drift: [140, 0] },
    { pull: 'acc', ink: 'near', path: crowd, drift: [-10, 0] },
  ] });
}
// 3 · 476: broken columns in the grass, a fallen capital, crows circling
function ruin(seed = 17) {
  const cols = new Path2D(), flutes = new Path2D();
  for (const [x, h, br] of [[170, 360, 1], [360, 250, 1], [560, 420, 0], [760, 190, 1], [930, 300, 1]]) {
    const top = 1150 - h; cols.rect(x - 38, top, 76, h);
    if (br) cols.addPath(polyPath([[x - 38, top + 2], [x - 10, top - 26], [x + 12, top - 8], [x + 38, top - 30], [x + 38, top + 2]]));
    else { cols.rect(x - 56, top - 26, 112, 26); cols.rect(x - 66, top - 46, 132, 22); cols.rect(x - 200, top - 80, 340, 36); }
    cols.rect(x - 52, 1130, 104, 22);
    for (const dx of [-20, 0, 20]) flutes.rect(x + dx - 3, top + 12, 6, h - 30);
  }
  const fallen = new Path2D(); fallen.addPath(polyPath([[420, 1150], [700, 1150], [700, 1100], [420, 1110]])); blob(fallen, 470, 1100, 50, 18);
  const grass = new Path2D(), r = mulberry(seed); for (let x = -BLEED; x < AW + BLEED; x += 12 + r() * 10) grass.addPath(polyPath([[x - 4, 1170], [x + 4, 1170], [x + (r() - .5) * 20, 1170 - 30 - r() * 40]]));
  const crows = new Path2D(); bird(crows, 700, 560, 1.1); bird(crows, 780, 520, .8); bird(crows, 640, 500, .7); bird(crows, 860, 600, .6);
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'far', path: cols },
    { pull: 'land', ink: 'near', path: flutes, lit: 1 },
    { pull: 'land', ink: 'far', path: fallen },
    { pull: 'acc', ink: 'mid', path: grass, sway: [7, 1.4, .2] },
    { pull: 'acc', ink: 'near', path: crows, drift: [-70, 8] },
  ] });
}
// 4 · 1400s: the great ribbed dome, a bell tower, red roofs and a bridge of shops over the river
function florence(seed = 19) {
  const city = new Path2D(), r = mulberry(seed);
  for (let x = -BLEED; x < AW + BLEED;) { const w = 70 + r() * 70, h = 50 + r() * 70; city.rect(x, 1060 - h, w - 4, h + 40); x += w; }
  const dome = new Path2D(), cx = 520; dome.rect(cx - 170, 930, 340, 80); blob(dome, cx, 935, 160, 210, Math.PI, Math.PI * 2); dome.rect(cx - 26, 690, 52, 40); dome.addPath(polyPath([[cx - 14, 690], [cx + 14, 690], [cx, 640]]));
  const ribs = new Path2D(); for (const a of [-.55, 0, .55]) ribs.addPath(polyPath([[cx + 160 * Math.sin(a) - 5, 932], [cx + 160 * Math.sin(a) + 5, 932], [cx + 4, 728], [cx - 4, 728]]));
  const roofs = new Path2D(); for (let x = -BLEED; x < AW + BLEED; x += 90) roofs.addPath(polyPath([[x, 1012], [x + 84, 1012], [x + 42, 984]]));
  const tower = new Path2D(); tower.rect(790, 700, 70, 330); tower.rect(780, 690, 90, 16); const tw = new Path2D(); for (const y of [740, 820, 900]) { tw.rect(808, y, 14, 40); tw.rect(828, y, 14, 40); }
  const bridge = new Path2D(), bh = new Path2D(); bridge.rect(-BLEED, 1080, AW + 2 * BLEED, 40); bridge.rect(-BLEED, 1050, AW + 2 * BLEED, 32); for (let x = 60; x < AW; x += 320) blob(bh, x + 120, 1122, 110, 40, Math.PI, Math.PI * 2);
  const shops = new Path2D(); for (let x = -40; x < AW + 40; x += 64) shops.rect(x, 1056, 26, 18);
  const dlit = new Path2D(); blob(dlit, cx + 40, 935, 110, 200, Math.PI * 1.5, Math.PI * 2);
  return compose(seed, { focus: [540, 880], parts: [
    { pull: 'land', ink: 'far', path: city },
    { pull: 'land', ink: 'sun', path: roofs },
    { pull: 'land', ink: 'sun', path: dome },
    { pull: 'land', ink: 'paper', path: ribs, lit: 1 },
    { pull: 'acc', ink: 'glow', path: dlit, cut: ribs, lit: 1 },
    { pull: 'land', ink: 'paper', path: tower, knock: tw },
    ...water(seed, 1120, 'mid', 1180),
    { pull: 'acc', ink: 'near', path: bridge, knock: bh },
    { pull: 'acc', ink: 'glow', path: shops, blink: 1 },
    { pull: 'acc', ink: 'near', path: polyPath([[60, 1150], [220, 1150], [200, 1166], [80, 1166]]), drift: [60, 0] },
    { pull: 'acc', ink: 'near', path: (() => { const p = new Path2D(); for (const [x, y, s] of [[980, 640, .8], [1040, 600, .6], [1100, 660, .7]]) bird(p, x, y, s); return p; })(), drift: [-110, 6] },
  ] });
}
// 5 · 1610: night on a hill, a telescope on its tripod, Jupiter and its four moons appearing one by one, stars twinkling
function galileo(seed = 23) {
  const r = mulberry(seed), stars = [new Path2D(), new Path2D(), new Path2D()];
  for (let i = 0; i < 48; i++) blob(stars[i % 3], r() * AW, 120 + r() * 760, 2.6, 2.6);
  const J = [700, 520]; const jup = circlePath(J[0], J[1], 46), bands = new Path2D(); bands.rect(J[0] - 46, J[1] - 12, 92, 8); bands.rect(J[0] - 44, J[1] + 10, 88, 6);
  const moons = [-170, -100, 110, 200].map((dx, k) => ({ pull: 'acc', ink: 'glow', path: circlePath(J[0] + dx, J[1] + (k % 2 ? 4 : -3), 9), seq: .6 + k * .5, drift: [k % 2 ? 4 : -4, 0] }));
  const hill = polyPath([[-BLEED, 1180], [-BLEED, 1080], [200, 1020], [420, 1010], [620, 1060], [AW + BLEED, 1100], [AW + BLEED, 1180]]);
  const scope = new Path2D(); scope.addPath(polyPath([[300, 1000], [318, 1014], [520, 820], [504, 806]])); scope.rect(296, 1000, 8, 6);
  scope.addPath(polyPath([[390, 925], [398, 925], [330, 1030], [320, 1030]])); scope.addPath(polyPath([[410, 925], [418, 925], [470, 1020], [460, 1020]])); scope.addPath(polyPath([[400, 925], [408, 925], [404, 1020], [396, 1020]]));
  const man = new Path2D(); blob(man, 270, 958, 18, 20); man.addPath(polyPath([[244, 980], [296, 980], [312, 1040], [228, 1040]])); man.addPath(polyPath([[290, 990], [304, 984], [318, 1008], [306, 1012]]));
  const town = new Path2D(); for (let x = 640; x < AW + BLEED; x += 70) { town.rect(x, 1040 - (x % 3) * 14, 60, 80); } town.rect(820, 900, 54, 160); const tl = new Path2D(); for (let x = 650; x < AW; x += 70) tl.rect(x + 20, 1060, 10, 14);
  return compose(seed, { focus: [560, 760], parts: [
    ...stars.map((p, k) => ({ pull: 'land', ink: 'paper', path: p, blink: k })),
    { pull: 'land', ink: 'sun', path: jup }, { pull: 'land', ink: 'far', path: bands },
    ...moons,
    { pull: 'land', ink: 'near', path: unionPath([hill, town]) },
    { pull: 'acc', ink: 'glow', path: tl, blink: 2 },
    { pull: 'acc', ink: 'glow', path: scope },
    { pull: 'acc', ink: 'far', path: man },
  ] });
}
// 6 · 1861: a Roman-style mosaic set ring by ring (many pieces, one picture) above an arcade
function unite(seed = 29) {
  const C = [540, 760], inks = ['sun', 'glow', 'mid', 'far', 'near', 'paper'];
  const rings = [];
  for (let k = 0; k < 10; k++) {
    const r0 = 30 + k * 30, r1 = r0 + 24, n = Math.max(6, Math.round(2 * Math.PI * (r0 + 12) / 30));
    const groups = [new Path2D(), new Path2D()];
    for (let j = 0; j < n; j++) {
      const a0 = (j / n) * Math.PI * 2 + k * .13, a1 = a0 + (Math.PI * 2 / n) * .82;
      groups[j % 2].addPath(polyPath([[C[0] + r0 * Math.cos(a0), C[1] + r0 * Math.sin(a0)], [C[0] + r1 * Math.cos(a0), C[1] + r1 * Math.sin(a0)], [C[0] + r1 * Math.cos(a1), C[1] + r1 * Math.sin(a1)], [C[0] + r0 * Math.cos(a1), C[1] + r0 * Math.sin(a1)]]));
    }
    groups.forEach((g, q) => rings.push({ pull: 'acc', ink: inks[(k + q * 3) % 6], path: g, seq: .15 + k * .14 }));
  }
  const core = { pull: 'acc', ink: 'sun', path: circlePath(C[0], C[1], 24), seq: .05 };
  const frame = { pull: 'land', ink: 'near', path: ringPath(C[0], C[1], 330, 352) };
  const arc = new Path2D(), ah = new Path2D(); arc.rect(-BLEED, 1000, AW + 2 * BLEED, 180); arches(ah, 20, AW, 1030, 140, 70, 34);
  const lamps = new Path2D(); for (let x = 55; x < AW; x += 104) blob(lamps, x + 35, 1040, 7, 9);
  return compose(seed, { focus: [540, 800], parts: [
    frame, core, ...rings,
    { pull: 'land', ink: 'far', path: arc, knock: ah },
    { pull: 'land', ink: 'near', path: ah, lit: 1 },
    { pull: 'acc', ink: 'glow', path: lamps, blink: 0 },
  ] });
}
// 7 · 1946: a piazza with an arcade, a fountain, café umbrellas, and scooters crossing
function piazza(seed = 31) {
  const pal = new Path2D(), win = new Path2D(); pal.rect(-BLEED, 820, 520, 350); pal.rect(620, 860, 520, 310); arches(win, 0, 440, 1040, 130, 60, 26); arches(win, 660, 1100, 1050, 120, 56, 26);
  for (let x = 20; x < 440; x += 86) win.rect(x + 10, 880, 40, 70); for (let x = 680; x < 1100; x += 82) win.rect(x + 8, 910, 38, 60);
  const fount = new Path2D(); fount.addPath(polyPath([[420, 1170], [660, 1170], [640, 1120], [440, 1120]])); fount.rect(530, 1020, 20, 100); blob(fount, 540, 1024, 50, 14);
  const spray = new Path2D(); for (let k = 0; k < 8; k++) blob(spray, 540 + (k - 3.5) * 14, 980 - Math.abs(k - 3.5) * -6, 5, 10);
  const umb = new Path2D(); for (const x of [120, 300, 800, 970]) { umb.addPath(polyPath([[x - 70, 1100], [x + 70, 1100], [x, 1060]])); umb.rect(x - 3, 1100, 6, 60); }
  const scoot = new Path2D(); for (const x of [-40, 260]) { blob(scoot, x, 1150, 22, 22); blob(scoot, x + 120, 1150, 22, 22); scoot.addPath(polyPath([[x - 20, 1140], [x + 70, 1140], [x + 120, 1110], [x + 132, 1060], [x + 120, 1056], [x + 100, 1104], [x + 30, 1118], [x - 10, 1110]])); blob(scoot, x + 40, 1078, 16, 18); scoot.addPath(polyPath([[x + 26, 1092], [x + 56, 1092], [x + 62, 1130], [x + 22, 1130]])); }
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'far', path: pal, knock: win },
    { pull: 'land', ink: 'near', path: win, lit: 1 },
    { pull: 'land', ink: 'paper', path: fount },
    { pull: 'acc', ink: 'sky2', path: spray, blink: 0 }, { pull: 'acc', ink: 'glow', path: spray, blink: 2, lit: 1 },
    { pull: 'acc', ink: 'sun', path: umb, sway: [3, 2.2, .5] },
    { pull: 'acc', ink: 'near', path: scoot, drift: [190, 0] },
    { pull: 'acc', ink: 'near', path: (() => { const p = new Path2D(); for (const [x, y, s] of [[420, 900, .7], [470, 870, .6], [520, 910, .65], [560, 860, .55], [610, 890, .6]]) bird(p, x, y, s); return p; })(), drift: [80, -55] },
  ] });
}
// 8 · today: a lagoon city at dusk — a bell tower, domes, a palace arcade, gondolas gliding on the water
function today(seed = 37) {
  const city = new Path2D(), r = mulberry(seed), lit = [new Path2D(), new Path2D(), new Path2D()];
  let x = -BLEED; while (x < AW + BLEED) { const w = 60 + r() * 70, h = 90 + r() * 120; if (!(x > 150 && x < 330)) { city.rect(x, 1080 - h, w - 4, h + 10); for (let wy = 1090 - h; wy < 1060; wy += 26) for (let wx = x + 8; wx < x + w - 14; wx += 18) if (r() < .3) lit[Math.floor(r() * 3)].rect(wx, wy, 8, 12); } x += w; }
  const tower = new Path2D(); tower.rect(200, 700, 80, 380); tower.rect(190, 680, 100, 24); tower.addPath(polyPath([[196, 680], [284, 680], [240, 590]])); const bell = new Path2D(); bell.rect(218, 712, 16, 40); bell.rect(246, 712, 16, 40);
  const domes = new Path2D(); for (const [cx, w] of [[620, 70], [720, 90], [820, 70]]) { blob(domes, cx, 930, w, w * .9, Math.PI, Math.PI * 2); domes.rect(cx - 3, 930 - w * .9 - 30, 6, 32); } domes.rect(540, 930, 360, 150);
  const arc = new Path2D(); arches(arc, 550, 900, 990, 80, 40, 18);
  const boats = new Path2D(); for (const [bx, s] of [[150, 1], [600, .8], [940, .9]]) { boats.addPath(polyPath([[bx - 90 * s, 1140], [bx + 80 * s, 1146], [bx + 110 * s, 1120], [bx + 94 * s, 1150], [bx - 80 * s, 1156], [bx - 100 * s, 1128]])); boats.rect(bx + 50 * s, 1070 * 1, 5, 72 * s); }
  return compose(seed, { focus: [540, 880], parts: [
    { pull: 'land', ink: 'mid', path: city },
    ...lit.map((p, k) => ({ pull: 'land', ink: 'glow', path: p, lit: 1, blink: k })),
    { pull: 'land', ink: 'far', path: domes, knock: arc },
    { pull: 'land', ink: 'near', path: tower, knock: bell },
    ...water(seed, 1090, 'sky2', 1180),
    { pull: 'acc', ink: 'near', path: boats, drift: [22, 0] },
  ] });
}

export const SCENES = { hills, colosseum, ruin, florence, galileo, unite, piazza, today };
