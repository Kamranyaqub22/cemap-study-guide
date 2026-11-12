// scenes.js · INDIA — vertical print (1080×1920 art units, full bleed).
// Base: a hazy warm sky with monsoon cloud billows in two speeds, a big low sun on the left, layered blue hills, stepped rice
// terraces holding water that glints, a banyan tree with hanging roots swaying, and parakeets crossing. One era landmark per print.
// Parts: { pull, ink, path, knock?, cut?, lit?, drift?, blink?, sway?, seq?, loop?, spin?, swing? }.
// Landmarks are original stylised silhouettes from simple paths: not traced from photographs, no logos, no flags, no maps.
import { mulberry, polyPath, circlePath, ringPath, rectPath, unionPath, bandSteps } from './silk.js';

export const AW = 1080, AH = 1920, BLEED = 60;
export const GROUND = 1180;
export const BAND = [-BLEED, 1170, AW + 2 * BLEED, AH - 1170 + BLEED];
const FULL = () => rectPath(-BLEED, -BLEED, AW + 2 * BLEED, AH + 2 * BLEED);
const SUN = [330, 610], SR = 108;

function blob(p, x, y, rx, ry, a0 = 0, a1 = Math.PI * 2) { p.moveTo(x + rx * Math.cos(a0), y + ry * Math.sin(a0)); p.ellipse(x, y, rx, ry, 0, a0, a1); p.closePath(); }
const bird = (p, x, y, s) => p.addPath(polyPath([[x - 24 * s, y - 6 * s], [x - 11 * s, y - 10 * s], [x, y], [x + 11 * s, y - 10 * s], [x + 24 * s, y - 6 * s], [x + 11 * s, y - 5 * s], [x, y + 5 * s], [x - 11 * s, y - 5 * s]]));
const birds = (list) => { const p = new Path2D(); for (const [x, y, s] of list) bird(p, x, y, s); return p; };
function parakeets(list) {                                // long-tailed birds
  const p = new Path2D();
  for (const [x, y, s] of list) { bird(p, x, y, s); p.addPath(polyPath([[x - 3 * s, y], [x + 3 * s, y], [x + 30 * s, y + 22 * s], [x + 24 * s, y + 24 * s]])); }
  return p;
}
function line(seed, y0, amp, n = 40) {
  const pts = []; for (let i = 0; i <= n; i++) { const x = -BLEED + (AW + 2 * BLEED) * i / n; pts.push([x, y0 + amp * Math.sin(x / 210 + seed) + amp * .45 * Math.sin(x / 91 + seed * 2.3)]); }
  return pts;
}
function water(seed, y0, ink = 'mid', y1 = 1180, speed = -22) {
  const glints = new Path2D(), r = mulberry(seed);
  for (let i = 0; i < 6; i++) { const y = y0 + 8 + i * 12; let x = -BLEED - 240 + r() * 60; while (x < AW + BLEED + 240) { const L = 40 + r() * 120; glints.rect(x, y, L, 3 + i * .5); x += L + 60 + r() * 110; } }
  return [{ pull: 'land', ink, path: rectPath(-BLEED, y0, AW + 2 * BLEED, y1 - y0) }, { pull: 'land', ink: 'glow', path: glints, lit: 1, drift: [speed, 0] }];
}
function arches(p, x0, x1, y, h, w, gap) {               // a row of round-headed openings
  for (let x = x0; x + w <= x1; x += w + gap) { p.rect(x, y + w / 2, w, h - w / 2); blob(p, x + w / 2, y + w / 2, w / 2, w / 2, Math.PI, Math.PI * 2); }
}
function ogee(p, x, y, w, h) {                           // a pointed (onion) arch opening: base at y, apex at y - h
  const hw = w / 2, sh = h * .55;
  p.moveTo(x - hw, y); p.lineTo(x - hw, y - sh);
  p.bezierCurveTo(x - hw, y - h * .9, x - 4, y - h * .8, x, y - h);
  p.bezierCurveTo(x + 4, y - h * .8, x + hw, y - h * .9, x + hw, y - sh);
  p.lineTo(x + hw, y); p.closePath();
}
function onion(p, x, y, r, tip = 1) {                    // an onion dome sitting on y
  p.moveTo(x - r * .7, y);
  p.bezierCurveTo(x - r * 1.25, y - r * .7, x - r * .9, y - r * 1.5, x, y - r * 1.9);
  p.bezierCurveTo(x + r * .9, y - r * 1.5, x + r * 1.25, y - r * .7, x + r * .7, y); p.closePath();
  if (tip) { p.rect(x - 2.5, y - r * 1.9 - r * .5, 5, r * .55); blob(p, x, y - r * 1.9 - r * .2, r * .09, r * .09); }
}
function rain(seed) {                                    // slanted monsoon streaks, one tile of 240 px repeated
  const p = new Path2D(), r = mulberry(seed + 9);
  for (let ty = -480; ty < 1200; ty += 240) for (let k = 0; k < 26; k++) {
    const x = -BLEED - 100 + r() * (AW + 2 * BLEED + 200), y = ty + r() * 240, L = 40 + r() * 34;
    p.addPath(polyPath([[x, y], [x + 2.6, y], [x + 2.6 - L * .18, y + L], [x - L * .18, y + L]]));
  }
  return { pull: 'acc', ink: 'glow', path: p, lit: 1, loop: [-43, 240, 1.7] };
}
function kites(list) {                                   // diamond kites with a tail
  const p = new Path2D(), s2 = new Path2D();
  list.forEach(([x, y, s], k) => {
    const g = k % 2 ? p : s2;
    g.addPath(polyPath([[x, y - 34 * s], [x + 26 * s, y], [x, y + 40 * s], [x - 26 * s, y]]));
    g.addPath(polyPath([[x - 2, y + 40 * s], [x + 2, y + 40 * s], [x + 8 * s, y + 90 * s], [x + 4 * s, y + 90 * s]]));
  });
  return [p, s2];
}

// ---------------- the base print ----------------
function base(seed, o = {}) {
  const sunKnock = unionPath([circlePath(SUN[0], SUN[1], SR + 9), ringPath(SUN[0], SUN[1], SR + 26, SR + 34), ringPath(SUN[0], SUN[1], SR + 52, SR + 58)]);
  const sky2 = new Path2D(); sky2.rect(-BLEED, -BLEED, AW + 2 * BLEED, 110 + BLEED); sky2.addPath(bandSteps(-BLEED, AW + 2 * BLEED, 100, 780, 7, 18));
  const billows = [new Path2D(), new Path2D()], r = mulberry(seed + 3);
  for (let k = 0; k < 7; k++) {                          // stacked monsoon billows (two speeds)
    const g = billows[k % 2], y = 470 + k * 56 + r() * 20, x = -720 + r() * 1650, w = 240 + r() * 280;
    g.rect(x, y, w, 14); for (let j = 0; j < 5; j++) blob(g, x + 30 + j * w / 5.2, y - (j % 2) * 10, 30 + r() * 30, 24 + r() * 20, Math.PI, Math.PI * 2);
  }
  const far = line(seed, 950, 30), farP = polyPath([[-BLEED, 1300], ...far, [AW + BLEED, 1300]]);
  const far2 = line(seed + 4.1, 1000, 22), far2P = polyPath([[-BLEED, 1300], ...far2, [AW + BLEED, 1300]]);
  const terr = new Path2D(), lit = new Path2D();
  for (let k = 0; k < 4; k++) {                          // stepped rice terraces: each step a lit strip of water
    const y = 1048 + k * 30, top = line(seed + 1.7, y, 12 - k * 2), bot = line(seed + 1.7, y + 7, 12 - k * 2).reverse();
    lit.addPath(polyPath([...top, ...bot]));
  }
  terr.addPath(polyPath([[-BLEED, 1300], ...line(seed + 1.7, 1040, 14), [AW + BLEED, 1300]]));
  const bx = o.banyan ?? 930, by = 1060;                  // the banyan: a wide canopy, a stout trunk, hanging roots
  const tree = new Path2D(); for (const [dx, dy, rx, ry] of [[0, -170, 150, 70], [-110, -140, 100, 56], [110, -146, 100, 56], [-40, -210, 90, 50], [60, -214, 80, 44]]) blob(tree, bx + dx, by + dy, rx, ry);
  tree.addPath(polyPath([[bx - 26, by], [bx + 26, by], [bx + 16, by - 140], [bx - 16, by - 140]]));
  const roots = new Path2D(); for (let k = 0; k < 9; k++) { const x = bx - 200 + k * 48; roots.rect(x, by - 120, 4, 90 + (k % 3) * 24); }
  return {
    sky: [
      { pull: 'sky1', ink: 'sky1', path: FULL(), knock: sunKnock },
      { pull: 'sky2', ink: 'sky2', path: sky2 },
      { pull: 'sky2', ink: 'sky1', path: billows[0], drift: [-30, 0] },
      { pull: 'sky2', ink: 'glow', path: billows[1], drift: [-54, 0], lit: 1 },
      { pull: 'sun', ink: 'sun', path: circlePath(SUN[0], SUN[1], SR) },
    ],
    far: [{ pull: 'far', ink: 'far', path: farP }, { pull: 'far', ink: 'mid', path: far2P, lit: 1 }],
    mid: [
      { pull: 'mid', ink: 'mid', path: terr }, { pull: 'mid', ink: 'glow', path: lit, lit: 1, drift: [-10, 0] },
      ...(o.banyan === null ? [] : [{ pull: 'mid', ink: 'near', path: tree, sway: [4, 1.1, .3] }, { pull: 'mid', ink: 'near', path: roots, sway: [7, 1.6, .8] }]),
      { pull: 'mid', ink: 'near', path: parakeets([[-60, 440, .9], [-120, 410, .7], [-20, 395, .6], [-170, 450, .6]]), drift: [80, -10] },
      ...(o.rain ? [rain(seed)] : []),
    ],
  };
}
function bandPart() {
  const p = rectPath(...BAND);
  const knock = new Path2D(); for (let x = 24; x < AW - 20; x += 54) { knock.addPath(polyPath([[x, BAND[1] + 22], [x + 12, BAND[1] + 14], [x + 24, BAND[1] + 22], [x + 12, BAND[1] + 30]])); knock.rect(x + 32, BAND[1] + 20, 10, 4); }   // a block-print border
  return { pull: 'band', ink: 'near', path: p, knock };
}
function compose(seed, land, o = {}) {
  const b = base(seed, o);
  let parts;
  if (o.space) parts = b.sky.filter(p => p.pull === 'sky1' || (p.pull === 'sky2' && !p.drift)).map(p => ({ ...p, knock: undefined }));
  else if (o.night) parts = [...b.sky.map(p => p.pull === 'sun' ? { ...p, ink: 'glow', path: circlePath(SUN[0], SUN[1], SR * .55) } : p), ...b.far, ...b.mid];   // night: the sun becomes the moon
  else parts = [...b.sky, ...b.far, ...b.mid];
  return { focus: land.focus, parts: [...parts, ...land.parts, bandPart()], depth: { sky1: 0, sky2: 0, sun: .1, far: .3, mid: .55, land: .85, acc: .85, band: 1 } };
}

// ---------------- the eras ----------------
// 1 · c. 2500 BC: a planned brick city on a grid, a citadel with a stepped bath, covered drains along the street, a bullock cart, a river
function indus(seed = 11) {
  const r = mulberry(seed), city = new Path2D(), doors = new Path2D(), bricks = new Path2D();
  for (let x = -BLEED; x < AW + BLEED;) { const w = 90 + r() * 60, h = 70 + r() * 60, y = 1080 - h; city.rect(x, y, w - 10, h + 20); doors.rect(x + w / 2 - 14, 1062, 18, 38); x += w; }
  for (let y = 1000; y < 1100; y += 18) for (let x = -BLEED + (y / 18 % 2) * 20; x < AW + BLEED; x += 40) bricks.rect(x, y, 30, 3);
  const cit = new Path2D(); cit.addPath(polyPath([[250, 1000], [830, 1000], [790, 880], [290, 880]])); cit.rect(330, 800, 140, 82); cit.rect(620, 820, 160, 62);
  const bath = new Path2D(); for (let k = 0; k < 4; k++) bath.rect(430 + k * 14, 892 + k * 10, 220 - k * 28, 12);
  const towers = new Path2D(); towers.rect(360, 760, 30, 44); towers.rect(720, 780, 30, 44);
  const street = new Path2D(); street.rect(-BLEED, 1100, AW + 2 * BLEED, 30); const drains = new Path2D(); for (let x = -40; x < AW + 40; x += 70) drains.rect(x, 1108, 46, 8);
  const cart = new Path2D(); blob(cart, 120, 1140, 26, 26); cart.rect(60, 1100, 130, 22); cart.rect(180, 1108, 70, 6);
  blob(cart, 300, 1100, 46, 26); cart.rect(266, 1110, 8, 40); cart.rect(320, 1110, 8, 40); blob(cart, 350, 1088, 16, 14); cart.addPath(polyPath([[340, 1076], [352, 1060], [356, 1074]]));
  const spoke = new Path2D(); spoke.rect(118, 1116, 4, 48); spoke.rect(96, 1138, 48, 4);
  const smoke = new Path2D(); for (const x0 of [180, 900]) for (let k = 0; k < 4; k++) blob(smoke, x0 + k * 18, 960 - k * 36, 12 + k * 6, 9 + k * 4);
  return compose(seed, { focus: [540, 920], parts: [
    { pull: 'land', ink: 'far', path: cit },
    { pull: 'land', ink: 'glow', path: bath, lit: 1 },
    { pull: 'land', ink: 'far', path: towers },
    { pull: 'land', ink: 'sun', path: city, knock: doors },
    { pull: 'land', ink: 'near', path: doors, lit: 1 },
    { pull: 'land', ink: 'far', path: bricks, cut: doors, lit: 1 },
    { pull: 'acc', ink: 'mid', path: street, knock: drains },
    { pull: 'acc', ink: 'near', path: drains, lit: 1 },
    ...water(seed, 1132, 'sky2', 1180),
    { pull: 'acc', ink: 'glow', path: smoke, lit: 1, drift: [14, -34] },
    { pull: 'acc', ink: 'near', path: cart, drift: [70, 0] },
    { pull: 'acc', ink: 'glow', path: spoke, spin: [120, 1140, 3.0], drift: [70, 0] },
    { pull: 'acc', ink: 'near', path: birds([[1120, 600, .8], [1170, 570, .6], [1080, 560, .6]]), drift: [-100, 6] },
  ] }, { banyan: 990 });
}
// 2 · 628: night; a stepped temple tower, a scholar writing by an oil lamp, the digits set on a slate one by one, stars twinkling
function zero(seed = 13) {
  const r = mulberry(seed), stars = [new Path2D(), new Path2D(), new Path2D()];
  for (let i = 0; i < 50; i++) blob(stars[i % 3], r() * AW, 120 + r() * 740, 2.6, 2.6);
  const tx = 700, temple = new Path2D();
  for (let k = 0; k < 7; k++) { const w = 260 - k * 30, y = 1000 - k * 52; temple.addPath(polyPath([[tx - w / 2, y], [tx + w / 2, y], [tx + w / 2 - 8, y - 50], [tx - w / 2 + 8, y - 50]])); }
  blob(temple, tx, 636, 40, 22); temple.rect(tx - 3, 590, 6, 30); temple.rect(tx - 190, 1000, 380, 110); temple.rect(tx - 230, 1100, 460, 30);
  const door = new Path2D(); ogee(door, tx, 1100, 70, 110);
  const fins = new Path2D(); for (let k = 0; k < 7; k++) { const w = 260 - k * 30, y = 1000 - k * 52; fins.rect(tx - w / 2 + 14, y - 30, w - 28, 6); }
  const ground = polyPath([[-BLEED, 1180], [-BLEED, 1110], [AW + BLEED, 1110], [AW + BLEED, 1180]]);
  const man = new Path2D(); blob(man, 230, 1004, 22, 24); man.addPath(polyPath([[196, 1030], [266, 1030], [292, 1100], [170, 1100]])); man.addPath(polyPath([[262, 1046], [276, 1040], [330, 1070], [320, 1080]]));
  const slate = new Path2D(); slate.rect(300, 1060, 150, 50);
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, k) => { const p = new Path2D(), x = 312 + (k % 5) * 27, y = 1074 + Math.floor(k / 5) * 20; if (d === 0) p.addPath(ringPath(x + 6, y + 6, 4, 8)); else p.rect(x + 2, y, 8 + (d % 3) * 2, 12 - (d % 2) * 4); return { pull: 'acc', ink: d === 0 ? 'sun' : 'paper', path: p, seq: .3 + k * .18 }; });
  const lamp = new Path2D(); blob(lamp, 470, 1096, 20, 8); const flame = new Path2D(); flame.addPath(polyPath([[462, 1088], [478, 1088], [470, 1060]]));
  const glow = circlePath(470, 1074, 46);
  return compose(seed, { focus: [560, 860], parts: [
    ...stars.map((p, k) => ({ pull: 'land', ink: 'paper', path: p, blink: k })),
    { pull: 'land', ink: 'far', path: temple, knock: door },
    { pull: 'land', ink: 'mid', path: fins, lit: 1 },
    { pull: 'land', ink: 'sun', path: door, lit: 1, blink: 2 },
    { pull: 'land', ink: 'near', path: ground },
    { pull: 'acc', ink: 'mid', path: glow, lit: 1, blink: 1 },
    { pull: 'acc', ink: 'far', path: man },
    { pull: 'acc', ink: 'near', path: slate },
    ...digits,
    { pull: 'acc', ink: 'mid', path: lamp }, { pull: 'acc', ink: 'sun', path: flame, sway: [3, 7, 0] },
    { pull: 'acc', ink: 'near', path: birds([[-80, 700, .7], [-130, 670, .6]]), drift: [90, -6] },
  ] }, { night: true, banyan: 120 });
}
// 3 · 1632: a white marble tomb with a great onion dome, four minarets, a long reflecting pool with fountains, a line of trees
function taj(seed = 17) {
  const cx = 540, tomb = new Path2D(), holes = new Path2D();
  tomb.rect(cx - 210, 860, 420, 200); tomb.rect(cx - 250, 1060, 500, 30);
  onion(tomb, cx, 860, 130); tomb.rect(cx - 70, 820, 140, 44);
  for (const dx of [-170, 170]) { tomb.rect(cx + dx - 34, 812, 68, 50); onion(tomb, cx + dx, 812, 34); }
  ogee(holes, cx, 1040, 120, 170); for (const dx of [-150, 150]) { ogee(holes, cx + dx, 960, 56, 80); ogee(holes, cx + dx, 1050, 56, 70); }
  const mins = new Path2D(); for (const x of [180, 900]) { mins.addPath(polyPath([[x - 22, 1090], [x + 22, 1090], [x + 16, 780], [x - 16, 780]])); for (const y of [880, 980]) mins.rect(x - 26, y, 52, 10); mins.rect(x - 24, 770, 48, 12); onion(mins, x, 770, 22); }
  const shine = new Path2D(); shine.moveTo(cx + 20, 846); shine.bezierCurveTo(cx + 120, 790, cx + 100, 700, cx + 20, 650); shine.lineTo(cx + 40, 680); shine.bezierCurveTo(cx + 80, 720, cx + 90, 790, cx + 30, 846); shine.closePath();
  const pool = rectPath(cx - 90, 1090, 180, 90), pglint = new Path2D(); for (let y = 1100; y < 1176; y += 14) pglint.rect(cx - 70, y, 40 + (y % 3) * 20, 3);
  const trees = new Path2D(); for (const x of [-30, 50, 130, 950, 1030, 1110]) { blob(trees, x, 1050, 36, 60); trees.rect(x - 4, 1100, 8, 20); }
  const spray = new Path2D(); for (let k = 0; k < 4; k++) blob(spray, cx, 1166 - k * 22, 5 + k, 9);
  return compose(seed, { focus: [540, 880], parts: [
    { pull: 'land', ink: 'paper', path: mins },
    { pull: 'land', ink: 'paper', path: tomb, knock: holes },
    { pull: 'land', ink: 'far', path: holes, lit: 1 },
    { pull: 'acc', ink: 'glow', path: shine, lit: 1 },
    { pull: 'land', ink: 'mid', path: trees, sway: [4, 1.3, .2] },
    { pull: 'acc', ink: 'sky2', path: pool }, { pull: 'acc', ink: 'glow', path: pglint, lit: 1, sway: [18, 2.0, 0] },
    { pull: 'acc', ink: 'paper', path: spray, blink: 0 },
    { pull: 'acc', ink: 'near', path: (() => { const p = new Path2D(); for (const x of [120, 220, 300, 760, 860]) { blob(p, x, 1112, 9, 10); p.addPath(polyPath([[x - 12, 1122], [x + 12, 1122], [x + 15, 1166], [x - 15, 1166]])); } return p; })(), drift: [40, 0] },
    { pull: 'acc', ink: 'near', path: birds([[700, 560, .9], [760, 520, .7], [650, 510, .6], [820, 590, .55]]), drift: [-80, -10] },
    { pull: 'acc', ink: 'near', path: birds([[-60, 700, .7], [-110, 670, .6], [-150, 720, .5], [-20, 650, .5]]), drift: [120, -14] },
  ] }, { banyan: null });
}
// 4 · 1858: monsoon rain over a colonial clock tower and arcade, umbrellas crossing, the clock hands turning
function raj(seed = 19) {
  const r = mulberry(seed), hall = new Path2D(), win = new Path2D();
  hall.rect(-BLEED, 900, AW + 2 * BLEED, 220); hall.rect(-BLEED, 880, AW + 2 * BLEED, 24);
  arches(win, 10, AW, 980, 120, 60, 30); for (let x = 20; x < AW; x += 90) win.rect(x + 10, 916, 38, 44);
  const tower = new Path2D(), cx = 540; tower.rect(cx - 70, 640, 140, 260); tower.rect(cx - 86, 620, 172, 24); tower.addPath(polyPath([[cx - 86, 622], [cx + 86, 622], [cx, 500]])); tower.rect(cx - 4, 460, 8, 44);
  const face = circlePath(cx, 700, 48), hands = new Path2D(); hands.rect(cx - 2, 664, 5, 38); hands.rect(cx, 698, 30, 5);
  const domes = new Path2D(); for (const x of [120, 960]) { domes.rect(x - 50, 820, 100, 70); onion(domes, x, 820, 46); }
  const umb = new Path2D(); for (const [x, s] of [[80, 1], [260, .9], [700, 1], [880, .85]]) { blob(umb, x, 1120, 46 * s, 26 * s, Math.PI, Math.PI * 2); umb.rect(x - 2, 1120, 4, 30 * s); umb.rect(x - 14 * s, 1140, 28 * s, 30); }
  const puddles = new Path2D(); for (let k = 0; k < 6; k++) blob(puddles, 60 + r() * 960, 1150 + r() * 14, 50 + r() * 50, 4);
  return compose(seed, { focus: [540, 820], parts: [
    { pull: 'land', ink: 'far', path: domes },
    { pull: 'land', ink: 'far', path: hall, knock: win },
    { pull: 'land', ink: 'near', path: win, lit: 1 },
    { pull: 'land', ink: 'near', path: tower, knock: face },
    { pull: 'land', ink: 'glow', path: face },
    { pull: 'acc', ink: 'near', path: hands, spin: [cx, 700, .55] },
    { pull: 'acc', ink: 'glow', path: puddles, lit: 1, blink: 1 },
    { pull: 'acc', ink: 'near', path: umb, drift: [44, 0] },
    { pull: 'acc', ink: 'near', path: birds([[1130, 520, .7], [1180, 500, .6]]), drift: [-60, 4] },
  ] }, { rain: true, banyan: null });
}
// 5 · 1930: the sea at last; a long line of walkers with staffs along the shore, white salt heaps, palms leaning in the wind
function salt(seed = 23) {
  const sea = water(seed, 1020, 'mid', 1100, -40);
  const waves = new Path2D(); for (let x = -BLEED - 200; x < AW + BLEED + 200; x += 90) waves.addPath(polyPath([[x, 1100], [x + 45, 1088], [x + 90, 1100]]));
  const shore = polyPath([[-BLEED, 1180], [-BLEED, 1100], [AW + BLEED, 1096], [AW + BLEED, 1180]]);
  const heaps = new Path2D(); for (const [x, w] of [[760, 70], [860, 54], [960, 80], [1060, 50]]) heaps.addPath(polyPath([[x - w, 1150], [x + w, 1150], [x, 1104]]));
  const walkers = new Path2D(), r = mulberry(seed);
  for (let k = 0; k < 11; k++) { const x = -80 + k * 62, h = 1 - .02 * k; blob(walkers, x, 1104, 11, 12); walkers.addPath(polyPath([[x - 14, 1116], [x + 14, 1116], [x + 18, 1160], [x - 18, 1160]])); walkers.rect(x + 18, 1094, 4, 70); }
  const palms = new Path2D(); for (const [x, h] of [[90, 260], [180, 210]]) {
    palms.addPath(polyPath([[x - 8, 1100], [x + 8, 1100], [x + 40, 1100 - h], [x + 30, 1100 - h]]));
    for (let k = 0; k < 6; k++) { const a = -Math.PI + k * Math.PI / 5, tx = x + 35, ty = 1100 - h; palms.addPath(polyPath([[tx, ty], [tx + 110 * Math.cos(a), ty + 50 * Math.sin(a) + 40 * Math.abs(Math.cos(a))], [tx + 100 * Math.cos(a), ty + 50 * Math.sin(a) + 54 * Math.abs(Math.cos(a))]])); }
  }
  return compose(seed, { focus: [540, 940], parts: [
    ...sea,
    { pull: 'land', ink: 'glow', path: waves, lit: 1, drift: [-30, 0] },
    { pull: 'land', ink: 'far', path: shore },
    { pull: 'acc', ink: 'paper', path: heaps },
    { pull: 'acc', ink: 'near', path: palms, sway: [6, 1.4, .5] },
    { pull: 'acc', ink: 'near', path: walkers, drift: [46, 0] },
    { pull: 'acc', ink: 'near', path: birds([[640, 600, .8], [700, 570, .6], [590, 560, .6]]), drift: [70, -8] },
  ] }, { banyan: null });
}
// 6 · 1947, midnight: a red sandstone fort wall with domed pavilions, lamps along the parapet, fireworks bursting one after another
function freedom(seed = 29) {
  const r = mulberry(seed), stars = new Path2D(); for (let i = 0; i < 34; i++) blob(stars, r() * AW, 120 + r() * 600, 2.4, 2.4);
  const fort = new Path2D(), gates = new Path2D();
  fort.rect(-BLEED, 940, AW + 2 * BLEED, 200); for (let x = -40; x < AW + 40; x += 36) blob(fort, x, 940, 14, 16, Math.PI, Math.PI * 2);
  fort.rect(380, 820, 320, 130); for (const x of [400, 680]) { fort.rect(x - 30, 780, 60, 60); onion(fort, x, 780, 30); } onion(fort, 540, 820, 54); for (const x of [90, 990]) { fort.rect(x - 50, 860, 100, 100); onion(fort, x, 860, 40); }
  ogee(gates, 540, 1100, 120, 160); arches(gates, 420, 670, 860, 70, 44, 26);
  const lamps = [new Path2D(), new Path2D()]; for (let x = -30, k = 0; x < AW + 30; x += 48, k++) blob(lamps[k % 2], x, 952, 6, 8);
  const bursts = [[250, 520, 90, 'sun'], [800, 450, 110, 'glow'], [560, 300, 80, 'sky1'], [920, 680, 70, 'sun'], [150, 760, 70, 'glow']].map(([x, y, R, ink], k) => {
    const p = new Path2D(); for (let j = 0; j < 14; j++) { const a = j * Math.PI / 7; p.addPath(polyPath([[x + R * .3 * Math.cos(a), y + R * .3 * Math.sin(a)], [x + R * Math.cos(a - .04), y + R * Math.sin(a - .04)], [x + R * Math.cos(a + .04), y + R * Math.sin(a + .04)]])); blob(p, x + R * 1.1 * Math.cos(a), y + R * 1.1 * Math.sin(a), 5, 5); }
    return { pull: 'acc', ink, path: p, lit: 1, seq: .2 + k * .55, blink: k % 3 };
  });
  const crowd = new Path2D(); for (let k = 0; k < 30; k++) { const x = r() * AW; blob(crowd, x, 1148, 10, 12); crowd.rect(x - 10, 1150, 20, 30); }
  return compose(seed, { focus: [540, 800], parts: [
    { pull: 'land', ink: 'paper', path: stars, blink: 1 },
    ...bursts,
    { pull: 'land', ink: 'sun', path: fort, knock: gates },
    { pull: 'land', ink: 'near', path: gates, lit: 1 },
    ...lamps.map((p, k) => ({ pull: 'acc', ink: 'glow', path: p, blink: k })),
    { pull: 'acc', ink: 'near', path: crowd, sway: [8, 2.2, 0] },
    { pull: 'land', ink: 'far', path: (() => { const p = new Path2D(); for (const x of [250, 800, 560]) for (let k = 0; k < 5; k++) blob(p, x + k * 6, 900 - k * 70, 5 + k, 22); return p; })(), lit: 1, drift: [10, -60] },
  ] }, { night: true, banyan: null });
}
// 7 · 2023: the Moon's grey ground near the south pole, long shadows, a lander on four legs, a little rover rolling out, Earth in a black sky
function moon(seed = 31) {
  const r = mulberry(seed), stars = [new Path2D(), new Path2D(), new Path2D()]; for (let i = 0; i < 60; i++) blob(stars[i % 3], r() * AW, 100 + r() * 850, 2.2, 2.2);
  const earth = circlePath(780, 560, 70), land = new Path2D(); blob(land, 760, 540, 30, 22); blob(land, 810, 590, 22, 16);
  const ground = polyPath([[-BLEED, 1180], ...line(seed, 1000, 14).map(([x, y]) => [x, y]), [AW + BLEED, 1180]]);
  const ridge = polyPath([[-BLEED, 1010], [120, 930], [260, 980], [420, 900], [600, 990], [-BLEED, 1000]]);
  const craters = new Path2D(); for (const [x, y, w] of [[160, 1100, 90], [700, 1060, 60], [930, 1130, 110], [420, 1150, 50]]) blob(craters, x, y, w, w * .22);
  const lander = new Path2D(), lx = 520; lander.rect(lx - 80, 880, 160, 110); lander.rect(lx - 60, 850, 120, 34); lander.addPath(polyPath([[lx - 40, 850], [lx + 40, 850], [lx + 20, 820], [lx - 20, 820]]));
  for (const s of [-1, 1]) { lander.addPath(polyPath([[lx + s * 76, 960], [lx + s * 84, 960], [lx + s * 140, 1060], [lx + s * 130, 1060]])); lander.rect(lx + s * 135 - 20, 1056, 40, 8); }
  const panel = new Path2D(); for (let k = 0; k < 4; k++) panel.rect(lx - 70 + k * 36, 896, 30, 76);
  const ramp = polyPath([[lx + 60, 990], [lx + 72, 990], [lx + 200, 1070], [lx + 180, 1072]]);
  const rover = new Path2D(); rover.rect(0, 1040, 80, 34); rover.rect(10, 1024, 60, 18); for (const x of [8, 40, 72]) blob(rover, x, 1080, 10, 10); rover.rect(50, 1000, 4, 26); blob(rover, 52, 998, 10, 6);
  const shadow = polyPath([[lx - 140, 1064], [lx + 140, 1064], [lx + 400, 1100], [lx - 60, 1100]]);
  return compose(seed, { focus: [540, 900], parts: [
    ...stars.map((p, k) => ({ pull: 'land', ink: 'sun', path: p, blink: k })),
    { pull: 'land', ink: 'mid', path: earth }, { pull: 'land', ink: 'glow', path: land, lit: 1, drift: [8, 0] },
    { pull: 'land', ink: 'mid', path: ridge },
    { pull: 'land', ink: 'far', path: ground },
    { pull: 'land', ink: 'near', path: unionPath([craters, shadow]), lit: 1 },
    { pull: 'acc', ink: 'sun', path: lander, knock: panel },
    { pull: 'acc', ink: 'glow', path: panel, lit: 1, blink: 2 },
    { pull: 'acc', ink: 'mid', path: ramp },
    { pull: 'acc', ink: 'paper', path: rover, drift: [60, 0] },
    { pull: 'land', ink: 'glow', path: (() => { const p = new Path2D(); for (let x = -BLEED - 400; x < AW + 600; x += 260) p.addPath(polyPath([[x, 1012], [x + 120, 1008], [x + 150, 1040], [x + 20, 1044]])); return p; })(), lit: 1, drift: [-90, 0] },
    { pull: 'acc', ink: 'mid', path: (() => { const p = new Path2D(); for (let k = 0; k < 6; k++) blob(p, -30 - k * 26, 1078 - k * 6, 10 + k * 3, 6 + k * 2); return p; })(), lit: 1, drift: [60, -6] },
    { pull: 'land', ink: 'glow', path: (() => { const p = new Path2D(); p.rect(-140, 720, 60, 24); p.rect(-200, 726, 56, 12); p.rect(-84, 726, 56, 12); return p; })(), drift: [120, 8] },
  ] }, { space: true });
}
// 8 · today: a city at dusk — glass towers with windows lighting up, an elevated metro gliding by, auto-rickshaws below, kites in the sky
function today(seed = 37) {
  const r = mulberry(seed), towers = new Path2D(), lit = [new Path2D(), new Path2D(), new Path2D()];
  for (const [x, w, h, tip] of [[-30, 110, 300, 0], [90, 80, 420, 1], [190, 120, 340, 0], [330, 90, 470, 1], [440, 130, 280, 0], [600, 100, 520, 1], [720, 120, 360, 0], [860, 90, 440, 1], [970, 140, 300, 0]]) {
    towers.rect(x, 1080 - h, w, h); if (tip) towers.addPath(polyPath([[x + w / 2 - 4, 1080 - h], [x + w / 2 + 4, 1080 - h], [x + w / 2, 1000 - h]]));
    for (let wy = 1090 - h; wy < 1020; wy += 22) for (let wx = x + 8; wx < x + w - 12; wx += 16) if (r() < .35) lit[Math.floor(r() * 3)].rect(wx, wy, 7, 10);
  }
  const track = new Path2D(); track.rect(-BLEED, 1020, AW + 2 * BLEED, 22); for (let x = 40; x < AW; x += 220) track.rect(x, 1040, 30, 100);
  const metro = new Path2D(), mwin = new Path2D(); metro.addPath(polyPath([[0, 980], [600, 980], [640, 1000], [640, 1020], [0, 1020]])); for (let x = 20; x < 600; x += 50) mwin.rect(x, 988, 34, 16);
  const ricks = new Path2D(); for (const x of [100, 420, 760]) { ricks.addPath(polyPath([[x, 1160], [x + 100, 1160], [x + 100, 1110], [x + 60, 1096], [x + 10, 1096], [x, 1120]])); blob(ricks, x + 20, 1162, 12, 12); blob(ricks, x + 86, 1162, 12, 12); }
  const [k1, k2] = kites([[200, 520, 1], [880, 460, .8], [640, 700, .7], [380, 380, .6], [1000, 760, .6]]);
  return compose(seed, { focus: [560, 860], parts: [
    { pull: 'land', ink: 'mid', path: towers },
    ...lit.map((p, k) => ({ pull: 'land', ink: 'glow', path: p, lit: 1, blink: k })),
    { pull: 'land', ink: 'near', path: track },
    { pull: 'acc', ink: 'far', path: metro, knock: mwin, drift: [-160, 0] },
    { pull: 'acc', ink: 'glow', path: mwin, lit: 1, drift: [-160, 0] },
    { pull: 'acc', ink: 'sun', path: ricks, drift: [70, 0] },
    { pull: 'acc', ink: 'sun', path: k1, sway: [14, 1.1, 0] },
    { pull: 'acc', ink: 'far', path: k2, sway: [12, 1.5, 1.2] },
    { pull: 'acc', ink: 'near', path: parakeets([[1140, 600, .8], [1190, 570, .6]]), drift: [-110, 4] },
  ] }, { banyan: null });
}

export const SCENES = { indus, zero, taj, raj, salt, freedom, moon, today };
