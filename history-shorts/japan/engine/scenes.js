// scenes.js · "History in 60 Seconds" vertical print (1080×1920 art units, full bleed).
// One fixed base (stepped sky, sun, a snow-capped volcano, hills, ground) + one era landmark per print.
// A part = { pull, ink, path, knock?, cut?, lit? }; ink is a palette key (sky1 sky2 far mid near sun glow paper).
// Landmarks are stylised silhouettes built from simple paths, not traced from photographs.
import { mulberry, polyPath, circlePath, ringPath, rectPath, unionPath, bandSteps, ridgeLine, lerp } from './silk.js';

export const AW = 1080, AH = 1920, BLEED = 60;
export const GROUND = 1180;                    // landmarks stand on this line (the info band starts just below)
export const BAND = [-BLEED, 1170, AW + 2 * BLEED, AH - 1170 + BLEED];   // the dark info band: x, y, w, h
const FULL = () => rectPath(-BLEED, -BLEED, AW + 2 * BLEED, AH + 2 * BLEED);
const SUN = [790, 540], SR = 104;

function blob(p, x, y, rx, ry, a0 = 0, a1 = Math.PI * 2) { p.moveTo(x + rx * Math.cos(a0), y + ry * Math.sin(a0)); p.ellipse(x, y, rx, ry, 0, a0, a1); p.closePath(); }
// a flared eave roof seen from the front: tips curl up, slopes concave
function eave(cx, y, W, h, tip = 16) {
  const pts = [[cx - W - 6, y - tip], [cx - W + 26, y + 6], [cx + W - 26, y + 6], [cx + W + 6, y - tip]];
  const k = 6, top = [];
  for (let i = 0; i <= k; i++) { const t = i / k; top.push([cx + lerp(W, W * .5, 1 - Math.pow(1 - t, 2)), y - tip * (1 - t) - h * t]); }
  return polyPath([...pts, ...top, ...top.slice().reverse().map(([x, yy]) => [2 * cx - x, yy])]);
}
function eaveLit(cx, y, W, h, tip = 16) {         // the sun-facing (right) half
  const pts = [[cx, y + 6], [cx + W - 26, y + 6], [cx + W + 6, y - tip]];
  const k = 6; for (let i = 0; i <= k; i++) { const t = i / k; pts.push([cx + lerp(W, W * .5, 1 - Math.pow(1 - t, 2)), y - tip * (1 - t) - h * t]); }
  pts.push([cx, y - h]);
  return polyPath(pts);
}

// ---------------- the base print: sky, sun, the volcano, hills ----------------
function base(seed) {
  const sunKnock = unionPath([circlePath(SUN[0], SUN[1], SR + 9), ringPath(SUN[0], SUN[1], SR + 30, SR + 39), ringPath(SUN[0], SUN[1], SR + 62, SR + 68)]);
  const sky2 = new Path2D(); sky2.rect(-BLEED, -BLEED, AW + 2 * BLEED, 150 + BLEED); sky2.addPath(bandSteps(-BLEED, AW + 2 * BLEED, 140, 820, 7, 10));
  // the volcano: long concave slopes, a flat crater rim
  const L = [], R = [];
  for (let i = 0; i <= 14; i++) { const t = i / 14; L.push([lerp(445, -BLEED, t), 690 + 420 * Math.pow(t, 1.35)]); R.push([lerp(585, AW + BLEED, t), 690 + 400 * Math.pow(t, 1.3)]); }
  const fuji = polyPath([...L.slice().reverse(), [470, 682], [500, 690], [528, 680], [560, 688], ...R, [AW + BLEED, 1300], [-BLEED, 1300]]);
  // snow: jagged lower edge (paper, knocked out of the mountain ink)
  const sn = [[452, 694], [470, 684], [500, 692], [528, 682], [558, 690], [578, 700]];
  const r = mulberry(seed + 2); const lower = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16, x = lerp(612, 412, t), drip = (i % 2 ? 50 + r() * 70 : 0); lower.push([x, 760 + drip + (t - .5) * (t - .5) * 120]); }
  const snow = polyPath([...sn, ...lower]);
  const fujiLit = polyPath([[560, 688], [578, 700], ...R.slice(1, 9), ...R.slice(1, 9).reverse().map(([x, y], k) => [x - 18 - 70 * (1 - k / 8), y + 6])]);
  // hills in front of the volcano
  const hill = polyPath([[-BLEED, 1300], ...ridgeLine([-BLEED, 1050], [AW + BLEED, 1020], 70, 6, seed + 5), [AW + BLEED, 1300]]);
  const birds = new Path2D();
  for (const [x, y, s] of [[230, 470, 1], [282, 440, .75], [196, 420, .6]]) birds.addPath(polyPath([[x - 24 * s, y - 6 * s], [x - 11 * s, y - 10 * s], [x, y], [x + 11 * s, y - 10 * s], [x + 24 * s, y - 6 * s], [x + 11 * s, y - 5 * s], [x, y + 5 * s], [x - 11 * s, y - 5 * s]]));
  const clouds = new Path2D();                         // flat-bottomed clouds that drift across the sky
  for (const [x, y, w] of [[-260, 640, 300], [130, 760, 220], [-700, 560, 260], [1040, 700, 200]]) {
    blob(clouds, x, y, w * .5, 34, Math.PI, Math.PI * 2); blob(clouds, x - w * .22, y, w * .3, 24, Math.PI, Math.PI * 2); blob(clouds, x + w * .25, y, w * .32, 46, Math.PI, Math.PI * 2);
  }
  return {
    sky: [
      { pull: 'sky1', ink: 'sky1', path: FULL(), knock: sunKnock },
      { pull: 'sky2', ink: 'sky2', path: sky2 },
      { pull: 'sky2', ink: 'sky1', path: clouds, drift: [30, 0] },
      { pull: 'sun', ink: 'sun', path: circlePath(SUN[0], SUN[1], SR) },
    ],
    far: [
      { pull: 'far', ink: 'far', path: fuji, knock: snow },
      { pull: 'far', ink: 'glow', path: fujiLit, cut: snow, lit: 1 },
    ],
    mid: [{ pull: 'mid', ink: 'mid', path: hill }, { pull: 'mid', ink: 'near', path: birds, drift: [42, -5] }],
  };
}
function bandPart() {
  const p = rectPath(...BAND);
  const knock = new Path2D(); for (let x = 40; x < AW - 20; x += 26) { knock.moveTo(x + 4, BAND[1] + 22); knock.arc(x, BAND[1] + 22, 4, 0, Math.PI * 2); }
  return { pull: 'band', ink: 'near', path: p, knock };
}
function compose(seed, land, opt = {}) {
  const b = base(seed);
  return { focus: land.focus, parts: [...b.sky, ...b.far, ...b.mid, ...land.parts, bandPart()], depth: { sky1: 0, sky2: 0, sun: .1, far: .3, mid: .55, land: .85, acc: .85, band: 1 }, ...opt };
}

// ---------------- the eras ----------------
// 1 · rice and small kingdoms: terraced paddies and a raised-floor granary
function rice(seed = 11) {
  const terr = new Path2D(), water = new Path2D();
  for (let i = 0; i < 4; i++) {
    const y0 = 1040 + i * 36, y1 = y0 + 34;
    terr.addPath(polyPath([[-BLEED, y0 + 10], [300, y0 - 6], [620, y0 + 4], [AW + BLEED, y0 - 10], [AW + BLEED, y1], [-BLEED, y1]]));
    water.addPath(polyPath([[-BLEED + 30 * i, y0 + 16], [280, y0 + 2], [560, y0 + 10], [600, y0 + 16], [270, y0 + 9], [-BLEED + 30 * i, y0 + 22]]));
  }
  const g = new Path2D(), cx = 770;
  for (const x of [-78, -26, 26, 78]) g.rect(cx + x - 7, 1050, 14, 140);
  g.rect(cx - 104, 1040, 208, 16);
  g.rect(cx - 82, 950, 164, 92);
  g.addPath(polyPath([[cx - 150, 972], [cx + 150, 972], [cx + 84, 760], [cx - 84, 760]]));
  g.addPath(polyPath([[cx - 104, 772], [cx - 70, 700], [cx - 58, 706], [cx - 88, 772]]));   // crossed ridge ends
  g.addPath(polyPath([[cx + 104, 772], [cx + 70, 700], [cx + 58, 706], [cx + 88, 772]]));
  const ladder = new Path2D(); for (let y = 1066; y < 1180; y += 20) ladder.rect(cx - 20, y, 40, 5);
  const lit = polyPath([[cx, 760], [cx + 84, 760], [cx + 150, 972], [cx + 30, 972]]);
  const hut = new Path2D(), hx = 520;
  hut.addPath(polyPath([[hx - 90, 1110], [hx + 90, 1110], [hx + 44, 1000], [hx - 44, 1000]])); hut.rect(hx - 46, 1100, 92, 60);
  return compose(seed, { focus: [700, 950], parts: [
    { pull: 'land', ink: 'mid', path: terr },
    { pull: 'land', ink: 'glow', path: water, lit: 1, drift: [14, 0] },
    { pull: 'land', ink: 'near', path: unionPath([g, hut]) },
    { pull: 'acc', ink: 'far', path: ladder, lit: 1 },
    { pull: 'acc', ink: 'glow', path: lit, lit: 1 },
  ] });
}
// 2 · Nara: a five-storey pagoda
function pagodaPath(cx, gy, s = 1) {
  const body = new Path2D(), roofs = new Path2D(), lits = new Path2D();
  body.rect(cx - 150 * s, gy - 30 * s, 300 * s, 30 * s);
  let y = gy - 30 * s;
  for (let i = 0; i < 5; i++) {
    const W = (190 - i * 20) * s, bw = W * .62, bh = 64 * s;
    body.rect(cx - bw / 2, y - bh, bw, bh + 2);
    y -= bh;
    roofs.addPath(eave(cx, y + 10 * s, W, 30 * s, 16 * s)); lits.addPath(eaveLit(cx, y + 10 * s, W, 30 * s, 16 * s));
    y -= 26 * s;
  }
  const spire = new Path2D(); spire.rect(cx - 6 * s, y - 170 * s, 12 * s, 176 * s);
  const rings = new Path2D(); for (let k = 0; k < 9; k++) rings.rect(cx - 16 * s, y - 40 * s - k * 13 * s, 32 * s, 6 * s);
  blob(rings, cx, y - 180 * s, 12 * s, 14 * s);
  const doors = new Path2D(); let yy = gy - 30 * s;
  for (let i = 0; i < 5; i++) { const W = (190 - i * 20) * s, bw = W * .62, bh = 64 * s; for (let k = -1; k <= 1; k++) doors.rect(cx + k * bw * .3 - 8 * s, yy - bh + 16 * s, 16 * s, 36 * s); yy -= bh + 26 * s; }
  return { body: unionPath([body, roofs, spire]), rings, lits, doors, top: y - 190 * s };
}
function nara(seed = 13) {
  const P = pagodaPath(790, GROUND, 1.05);
  const trees = new Path2D(); const r = mulberry(seed);
  for (let i = 0; i < 9; i++) blob(trees, 80 + i * 70 + r() * 30, 1120 - r() * 50, 70 + r() * 30, 50 + r() * 20);   // blossom clumps
  const trunks = new Path2D(); for (let i = 0; i < 4; i++) trunks.rect(110 + i * 150, 1110, 12, 80);
  const petals = new Path2D(); for (let k = 0; k < 55; k++) { const x = r() * 1300 - 200, y = r() * 950 + 250, q = 1.6 + r() * 1.2; petals.addPath(polyPath([[x, y], [x + 9 * q, y - 5 * q], [x + 16 * q, y + 2 * q], [x + 6 * q, y + 7 * q]])); }
  return compose(seed, { focus: [760, 860], parts: [
    { pull: 'land', ink: 'sky2', path: trees },
    { pull: 'acc', ink: 'sky2', path: petals, drift: [-26, 52] },
    { pull: 'land', ink: 'near', path: unionPath([P.body, trunks]), knock: P.doors },
    { pull: 'acc', ink: 'sun', path: P.rings },
    { pull: 'acc', ink: 'glow', path: P.lits, lit: 1 },
  ] });
}
// 3 · the samurai: a horned war helmet, printed as an emblem on the hillside
function samurai(seed = 17) {
  const cx = 520, cy = 940;
  const bowl = new Path2D(); blob(bowl, cx, cy, 190, 175, Math.PI, Math.PI * 2);
  const brim = polyPath([[cx - 210, cy - 6], [cx + 210, cy - 6], [cx + 170, cy + 26], [cx - 170, cy + 26]]);
  const neck = new Path2D(), gaps = new Path2D();
  for (let i = 0; i < 4; i++) {
    const y = cy + 24 + i * 44, w0 = 200 + i * 30, w1 = 230 + i * 32;
    const droop = (x, w) => .00045 * (x - cx) * (x - cx) * (w / 300);
    const top = [], bot = [], gp = [];
    for (let k = 0; k <= 16; k++) { const u = k / 16; const xt = lerp(cx - w0, cx + w0, u), xb = lerp(cx - w1, cx + w1, u); top.push([xt, y + droop(xt, w0)]); bot.push([xb, y + 44 + droop(xb, w1)]); gp.push([xb, y + 38 + droop(xb, w1)]); }
    neck.addPath(polyPath([...top, ...bot.reverse()]));
    gaps.addPath(polyPath([...gp, ...gp.slice().reverse().map(([x, yy]) => [x, yy + 5])]));
  }
  const flaps = new Path2D();
  for (const sgn of [-1, 1]) flaps.addPath(polyPath([[cx + sgn * 170, cy + 10], [cx + sgn * 260, cy - 50], [cx + sgn * 300, cy - 10], [cx + sgn * 250, cy + 60]]));
  const horns = new Path2D();
  for (const sgn of [-1, 1]) {
    const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([cx + sgn * (30 + 150 * Math.pow(t, 1.5)), cy - 120 - 270 * t + 50 * t * t]); }
    const inner = pts.map(([x, y], i) => [x - sgn * (36 - 24 * i / 12), y + 12]);
    horns.addPath(polyPath([...pts, ...inner.reverse()]));
  }
  const crest = circlePath(cx, cy - 110, 34);
  const ribs = new Path2D(); for (let k = -4; k <= 4; k++) { if (k === 0) continue; ribs.rect(cx + k * 38 - 3, cy - 150 + Math.abs(k) * k * 0, 6, 150 - Math.abs(k) * 6); }
  const lit = new Path2D(); blob(lit, cx, cy, 190, 175, Math.PI * 1.5, Math.PI * 2); lit.addPath(polyPath([[cx, cy - 6], [cx + 210, cy - 6], [cx + 170, cy + 26], [cx, cy + 26]]));
  const banners = new Path2D();
  for (const [x, h] of [[120, 520], [210, 440], [960, 480]]) { banners.rect(x - 4, GROUND - h, 8, h); banners.rect(x + 4, GROUND - h + 20, 56, Math.min(260, h * .5)); }
  return compose(seed, { focus: [520, 860], parts: [
    { pull: 'land', ink: 'near', path: unionPath([bowl, brim, neck, flaps, banners]), knock: ribs },
    { pull: 'land', ink: 'mid', path: gaps, lit: 1 },
    { pull: 'acc', ink: 'glow', path: horns },
    { pull: 'acc', ink: 'sun', path: crest },
    { pull: 'acc', ink: 'mid', path: lit, cut: ribs, lit: 1 },
  ] });
}
// 4 · the Tokugawa peace: a castle keep with white (bare paper) walls on a stone base
function castle(seed = 19) {
  const cx = 760;
  const stone = polyPath([[cx - 260, GROUND + 10], [cx + 260, GROUND + 10], [cx + 200, 1040], [cx - 200, 1040]]);
  const courses = new Path2D(); for (let y = 1058; y < GROUND; y += 26) { const w = lerp(200, 260, (y - 1040) / 150); courses.rect(cx - w, y, 2 * w, 4); }
  const walls = new Path2D(), roofs = new Path2D(), win = new Path2D(), lits = new Path2D(), gables = new Path2D();
  let y = 1040;
  for (let i = 0; i < 4; i++) {
    const ww = 330 - i * 62, wh = 82 - i * 4;
    walls.rect(cx - ww / 2, y - wh, ww, wh + 2);
    for (let k = 0; k < Math.max(2, 5 - i); k++) { const n = Math.max(2, 5 - i), x = cx - ww / 2 + ww * (k + .5) / n; win.rect(x - 9, y - wh + 22, 18, 26); }
    y -= wh;
    roofs.addPath(eave(cx, y + 8, ww / 2 + 44, 30, 14)); lits.addPath(eaveLit(cx, y + 8, ww / 2 + 44, 30, 14));
    if (i === 1 || i === 2) gables.addPath(polyPath([[cx - 50, y - 10], [cx + 50, y - 10], [cx, y - 62]]));
    y -= 26;
  }
  const shachi = new Path2D(); for (const sgn of [-1, 1]) shachi.addPath(polyPath([[cx + sgn * 60, y + 4], [cx + sgn * 74, y - 30], [cx + sgn * 84, y - 24], [cx + sgn * 76, y + 4]]));
  const pines = new Path2D(); const r = mulberry(seed);
  for (const [x, h] of [[150, 360], [330, 260]]) { pines.rect(x - 8, GROUND - h, 16, h); for (let k = 0; k < 4; k++) blob(pines, x + (r() - .5) * 60, GROUND - h + k * 60, 110 - k * 14, 26, Math.PI, Math.PI * 2); }
  return compose(seed, { focus: [740, 860], parts: [
    { pull: 'land', ink: 'mid', path: stone },
    { pull: 'land', ink: 'near', path: courses, lit: 1 },
    { pull: 'land', ink: 'paper', path: walls },
    { pull: 'land', ink: 'near', path: unionPath([roofs, gables, win, pines]) },
    { pull: 'acc', ink: 'sun', path: shachi },
    { pull: 'acc', ink: 'glow', path: lits, lit: 1 },
  ] });
}
// 5 · the black ships: a steam warship with a paddle box and smoke, on the bay
function ships(seed = 23) {
  const sea = new Path2D(); sea.rect(-BLEED, 1080, AW + 2 * BLEED, 300);
  const glints = new Path2D(); const r = mulberry(seed);
  for (let i = 0; i < 7; i++) { const y = 1094 + i * 14; let x = -BLEED + r() * 60; while (x < AW + BLEED) { const L = 60 + r() * 140; glints.rect(x, y, L, 3 + i * .6); x += L + 60 + r() * 120; } }
  const hull = polyPath([[260, 1060], [1010, 1060], [960, 1150], [380, 1150]]);
  const cabin = new Path2D(); cabin.rect(470, 1020, 360, 42);
  const paddle = new Path2D(); blob(paddle, 640, 1060, 84, 84, Math.PI, Math.PI * 2);
  const funnel = new Path2D(); funnel.rect(700, 870, 40, 160);
  const masts = new Path2D(), yards = new Path2D();
  for (const [x, top] of [[400, 700], [560, 650], [880, 720]]) { masts.rect(x - 5, top, 10, 1062 - top); for (const k of [0, 1, 2]) yards.rect(x - 90 + k * 18, top + 40 + k * 90, 180 - k * 36, 9); }
  const ports = new Path2D(); for (let x = 420; x < 940; x += 46) ports.rect(x, 1084, 16, 14);
  const smoke = new Path2D(); for (let k = 0; k < 6; k++) blob(smoke, 720 + k * 46, 850 - k * 50, 46 + k * 12, 32 + k * 8);
  const stripe = new Path2D(); stripe.rect(300, 1066, 690, 8);
  return compose(seed, { focus: [660, 900], parts: [
    { pull: 'land', ink: 'mid', path: sea },
    { pull: 'land', ink: 'glow', path: glints, lit: 1, drift: [-14, 0] },
    { pull: 'land', ink: 'far', path: smoke, drift: [14, -24] },
    { pull: 'land', ink: 'near', path: unionPath([hull, cabin, paddle, funnel, masts, yards]), knock: ports, drift: [-16, 0] },
    { pull: 'acc', ink: 'sun', path: stripe, drift: [-16, 0] },
  ] });
}
// 6 · 1945: a ruined domed hall, its dome stripped to the ribs
function ruin(seed = 29) {
  const cx = 720, r = mulberry(seed);
  const top = []; for (let x = 440; x <= 1010; x += 30) top.push([x, 930 + (r() < .4 ? r() * 90 : r() * 20)]);
  const hall = polyPath([[440, GROUND + 10], ...top, [1010, GROUND + 10]]);
  const tower = polyPath([[cx - 90, GROUND], [cx - 90, 860], [cx - 70, 850], [cx + 70, 850], [cx + 90, 870], [cx + 90, GROUND]]);
  const win = new Path2D(); for (let row = 0; row < 3; row++) for (let x = 470; x < 1000; x += 44) { if (Math.abs(x - cx) < 100) continue; win.rect(x, 990 + row * 60, 18, 34); }
  for (let row = 0; row < 4; row++) for (const dx of [-50, 0, 50]) win.rect(cx + dx - 10, 880 + row * 70, 20, 40);
  // the dome: an outer rib, a crown ring and meridian ribs, all thin flat bars (no strokes)
  const dome = new Path2D(), R = 100, H = 160, baseY = 850, th = 9;
  dome.moveTo(cx - R, baseY); dome.ellipse(cx, baseY, R, H, 0, Math.PI, Math.PI * 2); dome.lineTo(cx + R - th, baseY); dome.ellipse(cx, baseY, R - th, H - th, 0, Math.PI * 2, Math.PI, true); dome.closePath();
  for (const k of [.35, .7]) { dome.moveTo(cx - R * k, baseY); dome.ellipse(cx, baseY, R * k, H - 4, 0, Math.PI, Math.PI * 2); dome.lineTo(cx + R * k - th * .8, baseY); dome.ellipse(cx, baseY, R * k - th * .8, H - 4 - th, 0, Math.PI * 2, Math.PI, true); dome.closePath(); }
  dome.rect(cx - 5, baseY - H, 10, H); dome.rect(cx - R, baseY - 70, 2 * R, 8); dome.rect(cx - R * .8, baseY - 120, 1.6 * R, 7);
  const rubble = new Path2D(); for (let i = 0; i < 26; i++) { const x = 380 + r() * 700, s = 10 + r() * 26; rubble.addPath(polyPath([[x, GROUND + 4], [x + s, GROUND + 4], [x + s * .6, GROUND - s * .7]])); }
  const tree = new Path2D(); tree.rect(232, 880, 14, 300); tree.addPath(polyPath([[239, 960], [170, 880], [178, 874], [242, 940]])); tree.addPath(polyPath([[240, 920], [300, 850], [306, 858], [244, 932]]));
  return compose(seed, { focus: [720, 860], parts: [
    { pull: 'land', ink: 'near', path: unionPath([hall, tower, dome, rubble, tree]), knock: win },
  ] });
}
// 7 · 1964: the bullet train on its viaduct, the volcano behind
function train(seed = 31) {
  const via = new Path2D(); via.rect(-BLEED, 1104, AW + 2 * BLEED, 26);
  for (let x = -20; x < AW + BLEED; x += 150) via.addPath(polyPath([[x, 1130], [x + 44, 1130], [x + 36, GROUND + 10], [x + 8, GROUND + 10]]));
  const body = new Path2D(); body.rect(-2400, 1000, 3200, 96);
  body.moveTo(800, 1000); body.bezierCurveTo(900, 1000, 1000, 1030, 1030, 1080); body.lineTo(1030, 1096); body.lineTo(800, 1096); body.closePath();
  const stripe = new Path2D(); stripe.rect(-2400, 1066, 3260, 14); stripe.moveTo(860, 1066); stripe.lineTo(1022, 1066); stripe.lineTo(1028, 1080); stripe.lineTo(860, 1080); stripe.closePath();
  const skirt = new Path2D(); skirt.rect(-BLEED, 1090, 1090 + BLEED, 10);
  const win = new Path2D(); for (let x = -2380; x < 780; x += 34) win.rect(x, 1018, 22, 24);
  win.addPath(polyPath([[840, 1010], [930, 1018], [952, 1038], [850, 1036]]));
  const gaps = new Path2D(); for (let x = -2450; x < 800; x += 260) gaps.rect(x, 1000, 5, 96);
  const speed = new Path2D(); const r = mulberry(seed); for (let i = 0; i < 9; i++) speed.rect(-BLEED, 940 + i * 18 + r() * 8, 120 + r() * 260, 5);
  const light = new Path2D(); blob(light, 1008, 1068, 9, 6);
  return compose(seed, { focus: [640, 960], parts: [
    { pull: 'land', ink: 'near', path: unionPath([via, skirt, speed]) },
    { pull: 'land', ink: 'paper', path: body, knock: gaps, mov: 1 },
    { pull: 'land', ink: 'mid', path: stripe, mov: 1 },
    { pull: 'land', ink: 'near', path: win, mov: 1 },
    { pull: 'acc', ink: 'sun', path: light, mov: 1 },
  ] });
}
// 8 · today: a night city, a lattice tower and an old pagoda among the towers
function city(seed = 37) {
  const r = mulberry(seed), blocks = new Path2D(), lits = [new Path2D(), new Path2D(), new Path2D()], signs = new Path2D();
  let x = -BLEED;
  while (x < AW + BLEED) {
    const w = 70 + r() * 90, h = 180 + r() * 330, y = GROUND - h;
    if (!(x > 140 && x < 340)) {
      blocks.rect(x, y, w - 6, h + 20);
      for (let wy = y + 18; wy < GROUND - 20; wy += 28) for (let wx = x + 10; wx < x + w - 18; wx += 20) if (r() < .32) lits[Math.floor(r() * 3)].rect(wx, wy, 10, 14);
      if (r() < .45) signs.rect(x + 10, y + 30 + r() * 80, 14, 60 + r() * 50);
    }
    x += w;
  }
  const tower = new Path2D(), holes = new Path2D(), tx = 240;
  tower.addPath(polyPath([[tx - 100, GROUND + 10], [tx - 16, 640], [tx - 6, 470], [tx + 6, 470], [tx + 16, 640], [tx + 100, GROUND + 10]]));
  for (let y = 1120; y > 680; y -= 52) { const w = lerp(16, 92, Math.pow((y - 640) / 540, 1.4)); const w2 = lerp(16, 92, Math.pow((y - 52 - 640) / 540, 1.4)); holes.addPath(polyPath([[tx - w + 16, y - 6], [tx + w - 16, y - 6], [tx, y - 44 + 6]])); holes.addPath(polyPath([[tx - Math.max(4, w2 - 12), y - 48], [tx - 8, y - 12], [tx - Math.max(6, w - 18), y - 12]])); }
  tower.rect(tx - 58, 900, 116, 26); tower.rect(tx - 34, 700, 68, 20);
  const P = pagodaPath(860, GROUND, .55);
  const stars = new Path2D(); for (let i = 0; i < 26; i++) blob(stars, r() * AW, 120 + r() * 520, 2.5, 2.5);
  return compose(seed, { focus: [600, 900], parts: [
    { pull: 'land', ink: 'paper', path: stars },
    { pull: 'land', ink: 'mid', path: blocks },
    ...lits.map((p, k) => ({ pull: 'land', ink: 'glow', path: p, lit: 1, blink: k })),
    { pull: 'acc', ink: 'sun', path: unionPath([tower, signs]), knock: holes },
    { pull: 'land', ink: 'near', path: P.body, knock: P.doors },
  ] });
}

export const SCENES = { rice, nara, samurai, castle, ships, ruin, train, city };
