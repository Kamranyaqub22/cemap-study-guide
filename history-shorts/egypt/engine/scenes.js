// scenes.js · EGYPT — vertical print (1080×1920 art units, full bleed).
// Base: stepped sky with drifting haze, a sun, flat desert plateaus on the horizon, green banks and the Nile winding through.
// One era landmark per print. Parts: { pull, ink, path, knock?, cut?, lit?, drift?, blink?, sway?, seq? }.
// Landmarks are original stylised silhouettes from simple paths: not traced from photographs, no logos, no flags, no maps.
import { mulberry, polyPath, circlePath, ringPath, rectPath, unionPath, bandSteps, lerp } from './silk.js';

export const AW = 1080, AH = 1920, BLEED = 60;
export const GROUND = 1180;
export const BAND = [-BLEED, 1170, AW + 2 * BLEED, AH - 1170 + BLEED];
const FULL = () => rectPath(-BLEED, -BLEED, AW + 2 * BLEED, AH + 2 * BLEED);
const SUN = [790, 540], SR = 104;

function blob(p, x, y, rx, ry, a0 = 0, a1 = Math.PI * 2) { p.moveTo(x + rx * Math.cos(a0), y + ry * Math.sin(a0)); p.ellipse(x, y, rx, ry, 0, a0, a1); p.closePath(); }
const bird = (p, x, y, s) => p.addPath(polyPath([[x - 24 * s, y - 6 * s], [x - 11 * s, y - 10 * s], [x, y], [x + 11 * s, y - 10 * s], [x + 24 * s, y - 6 * s], [x + 11 * s, y - 5 * s], [x, y + 5 * s], [x - 11 * s, y - 5 * s]]));
function palm(p, x, base, h, s = 1, seed = 1) {
  const r = mulberry(seed), lean = (r() - .5) * 40 * s;
  p.addPath(polyPath([[x - 8 * s, base], [x + 8 * s, base], [x + lean + 4 * s, base - h], [x + lean - 4 * s, base - h]]));
  const cx = x + lean, cy = base - h;
  for (let k = 0; k < 9; k++) {
    const a = -Math.PI + (k / 8) * Math.PI + (r() - .5) * .2, L = (60 + r() * 26) * s, droop = 24 * s, pts = [];
    for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([cx + Math.cos(a) * L * u, cy + Math.sin(a) * L * u * .55 + droop * u * u]); }
    p.addPath(polyPath([...pts, ...pts.slice().reverse().map(([px, py], i) => [px, py + 8 * s * Math.sin((1 - i / 8) * Math.PI)])]));
  }
}
function reeds(p, x0, x1, base, h, seed) {             // papyrus: thin stems with fan heads
  const r = mulberry(seed);
  for (let x = x0; x < x1; x += 22 + r() * 18) {
    const hh = h * (.6 + r() * .5), lean = (r() - .5) * 30;
    p.addPath(polyPath([[x - 3, base], [x + 3, base], [x + lean + 2, base - hh], [x + lean - 2, base - hh]]));
    p.addPath(polyPath([[x + lean, base - hh], [x + lean - 26, base - hh - 30], [x + lean + 26, base - hh - 30]]));
  }
}
function water(seed, y0, ink = 'mid') {
  const glints = new Path2D(), r = mulberry(seed);
  for (let i = 0; i < 7; i++) { const y = y0 + 10 + i * 13; let x = -BLEED - 200 + r() * 60; while (x < AW + BLEED + 200) { const L = 50 + r() * 130; glints.rect(x, y, L, 3 + i * .5); x += L + 60 + r() * 120; } }
  return [{ pull: 'land', ink, path: rectPath(-BLEED, y0, AW + 2 * BLEED, 1300 - y0) }, { pull: 'land', ink: 'glow', path: glints, lit: 1, drift: [-16, 0] }];
}

// ---------------- the base print ----------------
function base(seed) {
  const sunKnock = unionPath([circlePath(SUN[0], SUN[1], SR + 9), ringPath(SUN[0], SUN[1], SR + 30, SR + 39), ringPath(SUN[0], SUN[1], SR + 62, SR + 68)]);
  const sky2 = new Path2D(); sky2.rect(-BLEED, -BLEED, AW + 2 * BLEED, 150 + BLEED); sky2.addPath(bandSteps(-BLEED, AW + 2 * BLEED, 140, 860, 7, 8));
  const haze = new Path2D(), r = mulberry(seed + 3);
  for (let k = 0; k < 7; k++) { const y = 470 + k * 58 + r() * 20, x = -700 + r() * 1600; haze.rect(x, y, 260 + r() * 340, 7 + r() * 5); }
  // far: flat-topped desert plateaus in steps, their sunlit faces in glow
  const pts = [[-BLEED, 1300]]; let x = -BLEED, y = 960;
  while (x < AW + BLEED) { const w = 90 + r() * 160, ny = 925 + r() * 60; pts.push([x, y], [x + 18, ny]); y = ny; x += w; pts.push([x - 18, y]); }
  pts.push([AW + BLEED, y], [AW + BLEED, 1300]);
  const plat = polyPath(pts);
  const plit = new Path2D(); for (let i = 1; i < pts.length - 2; i += 3) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1]; if (by < ay) plit.addPath(polyPath([[ax, ay], [bx, by], [bx, by + 20], [ax, ay + 24]])); }
  // mid: green banks and the river, sinuous, with drifting glints
  const bank = polyPath([[-BLEED, 1300], [-BLEED, 1050], ...Array.from({ length: 30 }, (_, i) => { const xx = -BLEED + (AW + 2 * BLEED) * i / 29; return [xx, 1046 + 10 * Math.sin(xx / 120 + seed)]; }), [AW + BLEED, 1300]]);
  const riv = []; for (let i = 0; i <= 30; i++) { const xx = -BLEED + (AW + 2 * BLEED) * i / 30; riv.push([xx, 1102 + 16 * Math.sin(xx / 170 + seed * .7)]); }
  const river = polyPath([...riv, ...riv.slice().reverse().map(([xx, yy]) => [xx, yy + 46 + 8 * Math.sin(xx / 90)])]);
  const rg = new Path2D(); for (let k = 0; k < 9; k++) { const xx = -BLEED + k * 150 + r() * 60; rg.rect(xx, 1114 + r() * 20, 50 + r() * 60, 4); }
  const birds = new Path2D(); bird(birds, 230, 470, 1); bird(birds, 280, 440, .75); bird(birds, 196, 420, .6);
  const birds2 = new Path2D(); bird(birds2, 1160, 640, .8); bird(birds2, 1210, 610, .6); bird(birds2, 1250, 660, .7);
  return {
    sky: [
      { pull: 'sky1', ink: 'sky1', path: FULL(), knock: sunKnock },
      { pull: 'sky2', ink: 'sky2', path: sky2 },
      { pull: 'sky2', ink: 'sky1', path: haze, drift: [40, 0] },
      { pull: 'sun', ink: 'sun', path: circlePath(SUN[0], SUN[1], SR) },
    ],
    far: [{ pull: 'far', ink: 'far', path: plat }, { pull: 'far', ink: 'glow', path: plit, lit: 1 }],
    mid: [
      { pull: 'mid', ink: 'mid', path: bank }, { pull: 'mid', ink: 'sky2', path: river }, { pull: 'mid', ink: 'glow', path: rg, lit: 1, drift: [-22, 0] },
      { pull: 'mid', ink: 'near', path: birds, drift: [44, -5] }, { pull: 'mid', ink: 'near', path: birds2, drift: [-58, -4] },
    ],
  };
}
function bandPart() {
  const p = rectPath(...BAND);
  const knock = new Path2D(); for (let x = 40; x < AW - 20; x += 26) { knock.moveTo(x + 4, BAND[1] + 22); knock.arc(x, BAND[1] + 22, 4, 0, Math.PI * 2); }
  return { pull: 'band', ink: 'near', path: p, knock };
}
function compose(seed, land) {
  const b = base(seed);
  return { focus: land.focus, parts: [...b.sky, ...b.far, ...b.mid, ...land.parts, bandPart()], depth: { sky1: 0, sky2: 0, sun: .1, far: .3, mid: .55, land: .85, acc: .85, band: 1 } };
}

// ---------------- the eras ----------------
// 1 · 3100 BC: the double crown of the two lands (white crown inside the red), papyrus and lotus on the bank
function unify(seed = 11) {
  const cx = 470, by = 1150, K = 1.3;
  const P = (pts) => polyPath(pts.map(([dx, dy]) => [cx + dx * K, by + dy * K]));
  const head = P([[-170, 0], [-110, -40], [-70, -90], [-74, -150], [-84, -170], [-104, -200], [-82, -240], [-80, -262], [80, -262], [92, -180], [60, -120], [150, -40], [190, 0]]);
  const red = unionPath([P([[-86, -258], [86, -258], [86, -430], [56, -430], [56, -322], [-80, -322]]),
    P([[-30, -322], [-14, -322], [-70, -392], [-100, -388], [-104, -372], [-86, -372], [-80, -380]])]);
  const white = new Path2D(); white.addPath(P([[-48, -322], [40, -322], [30, -400], [8, -462], [-26, -462], [-42, -400]])); blob(white, cx - 9 * K, by - 474 * K, 20 * K, 20 * K);
  const wshade = P([[-4, -322], [40, -322], [30, -400], [8, -462], [-4, -462]]);
  const eye = new Path2D(); blob(eye, cx - 62 * K, by - 214 * K, 10 * K, 5 * K);
  const collar = new Path2D(); for (let k = 0; k < 3; k++) collar.addPath(P([[-118 + k * 10, -44 + k * 12], [150 - k * 10, -44 + k * 12], [140 - k * 10, -34 + k * 12], [-110 + k * 10, -34 + k * 12]]));
  const dais = new Path2D(); dais.rect(cx - 250, by, 500, 30);
  const pap = new Path2D(); reeds(pap, 760, 1120, 1180, 220, seed + 5);
  const lotus = new Path2D(); for (const [x, y] of [[800, 1160], [900, 1166], [1010, 1158]]) { lotus.addPath(polyPath([[x - 22, y], [x - 30, y - 30], [x - 10, y - 14], [x, y - 40], [x + 10, y - 14], [x + 30, y - 30], [x + 22, y]])); }
  return compose(seed, { focus: [500, 860], parts: [
    { pull: 'land', ink: 'near', path: unionPath([pap, dais]), sway: [6, 1.4, .3] },
    { pull: 'land', ink: 'near', path: head },
    { pull: 'land', ink: 'sun', path: red },
    { pull: 'land', ink: 'paper', path: white },
    { pull: 'acc', ink: 'glow', path: unionPath([wshade, eye, collar]), lit: 1 },
    { pull: 'acc', ink: 'glow', path: lotus },
  ] });
}
// 2 · 2560 BC: three pyramids with sunlit faces, and a sphinx
function giza(seed = 13) {
  const pyr = (cx, w, h) => polyPath([[cx - w / 2, 1150], [cx + w / 2, 1150], [cx, 1150 - h]]);
  const pyrLit = (cx, w, h) => polyPath([[cx, 1150 - h], [cx + w / 2, 1150], [cx + w * .12, 1150]]);
  const all = [[640, 600, 470], [300, 400, 300], [940, 260, 190]];
  const body = unionPath(all.map(a => pyr(...a))), lit = unionPath(all.map(a => pyrLit(...a)));
  const courses = new Path2D(); for (let y = 720; y < 1150; y += 34) { const [cx, w, h] = all[0], t = (1150 - y) / h, hw = w / 2 * (1 - t); courses.rect(cx - hw, y, hw * 2, 3); }
  const sphinx = new Path2D(); sphinx.addPath(polyPath([[60, 1160], [330, 1160], [330, 1120], [200, 1110], [150, 1060], [110, 1052], [86, 1064], [80, 1100], [60, 1120]]));
  sphinx.addPath(polyPath([[86, 1064], [110, 1030], [138, 1034], [150, 1060]]));
  return compose(seed, { focus: [620, 860], parts: [
    { pull: 'land', ink: 'far', path: body },
    { pull: 'land', ink: 'glow', path: lit, lit: 1 },
    { pull: 'land', ink: 'near', path: courses, cut: lit, lit: 1 },
    { pull: 'acc', ink: 'near', path: sphinx },
    { pull: 'acc', ink: 'near', drift: [44, 0], path: (() => { const p = new Path2D(); for (const x of [-160, -40, 80]) {
      p.addPath(polyPath([[x, 1140], [x + 70, 1140], [x + 74, 1118], [x + 58, 1100], [x + 44, 1112], [x + 30, 1098], [x + 14, 1112], [x + 4, 1110], [x - 8, 1090], [x - 20, 1094], [x - 8, 1118]]));
      p.rect(x + 6, 1138, 6, 30); p.rect(x + 58, 1138, 6, 30); p.addPath(polyPath([[x + 40, 1098], [x + 48, 1080], [x + 52, 1082], [x + 46, 1100]])); } return p; })() },
  ] });
}
// 3 · 1279 BC: a temple cut into the cliff, four seated colossi
function temple(seed = 17) {
  const cliff = polyPath([[80, 1180], [80, 760], [180, 720], [900, 720], [1000, 760], [1000, 1180]]);
  const figs = new Path2D(), lits = new Path2D();
  const faces = new Path2D();
  for (const x of [200, 380, 700, 880]) {
    figs.addPath(polyPath([[x - 34, 832], [x + 34, 832], [x + 48, 880], [x + 56, 960], [x + 30, 990], [x - 30, 990], [x - 56, 960], [x - 48, 880]]));   // headdress with lappets
    figs.addPath(polyPath([[x - 22, 832], [x + 22, 832], [x + 14, 800], [x - 14, 800]]));                                                          // crown top
    blob(faces, x, 900, 22, 34);                                                                                                                     // face
    figs.addPath(polyPath([[x - 14, 934], [x + 14, 934], [x + 8, 980], [x - 8, 980]]));                                                              // beard
    figs.addPath(polyPath([[x - 62, 990], [x + 62, 990], [x + 54, 1070], [x - 54, 1070]]));                                                          // torso
    figs.rect(x - 78, 1066, 156, 34);                                                                                                                // knees and hands
    figs.rect(x - 70, 1098, 62, 82); figs.rect(x + 8, 1098, 62, 82);                                                                                 // legs
    lits.addPath(polyPath([[x + 4, 990], [x + 62, 990], [x + 54, 1070], [x + 4, 1070]])); lits.rect(x + 8, 1098, 62, 82);
  }
  const door = polyPath([[495, 1180], [585, 1180], [585, 1000], [495, 1000]]);
  const frieze = new Path2D(); for (let x = 120; x < 960; x += 40) frieze.rect(x, 740, 22, 26);
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'far', path: cliff, knock: door },
    { pull: 'land', ink: 'near', path: unionPath([figs, door]) },
    { pull: 'acc', ink: 'glow', path: lits, lit: 1 },
    { pull: 'acc', ink: 'far', path: faces, lit: 1 },
    { pull: 'acc', ink: 'glow', path: polyPath([[-260, 720], [-180, 720], [-60, 1180], [-140, 1180]]), cut: unionPath([door]), lit: 1, drift: [120, 0] },
    { pull: 'acc', ink: 'sun', path: frieze },
  ] });
}
// 4 · 332 BC: the lighthouse of Alexandria on its island, a fire on top that flickers, a sail on the sea
function pharos(seed = 19) {
  const cx = 720, t = new Path2D();
  t.addPath(polyPath([[cx - 110, 1090], [cx + 110, 1090], [cx + 92, 820], [cx - 92, 820]]));
  t.addPath(polyPath([[cx - 70, 822], [cx + 70, 822], [cx + 58, 640], [cx - 58, 640]]));
  t.rect(cx - 38, 520, 76, 122); t.rect(cx - 52, 510, 104, 14); t.rect(cx - 120, 814, 240, 12); t.rect(cx - 76, 634, 152, 10);
  const island = polyPath([[cx - 260, 1110], [cx + 260, 1110], [cx + 200, 1080], [cx - 200, 1080]]);
  const win = new Path2D(); for (let y = 860; y < 1060; y += 60) win.rect(cx - 8, y, 16, 30); for (let y = 670; y < 800; y += 50) win.rect(cx - 7, y, 14, 26);
  const lit = new Path2D(); lit.addPath(polyPath([[cx + 10, 1090], [cx + 110, 1090], [cx + 92, 820], [cx + 10, 820]])); lit.addPath(polyPath([[cx + 6, 822], [cx + 70, 822], [cx + 58, 640], [cx + 6, 640]]));
  const fire1 = polyPath([[cx - 26, 512], [cx - 10, 470], [cx, 440], [cx + 12, 470], [cx + 26, 512]]), fire2 = polyPath([[cx - 26, 512], [cx - 16, 474], [cx + 4, 430], [cx + 16, 480], [cx + 26, 512]]);
  const boat = new Path2D(); boat.addPath(polyPath([[120, 1150], [330, 1150], [300, 1172], [150, 1172]])); boat.rect(222, 1000, 6, 150);
  const sail = polyPath([[230, 1004], [330, 1060], [230, 1140]]);
  return compose(seed, { focus: [700, 860], parts: [
    ...water(seed, 1080),
    { pull: 'land', ink: 'far', path: island },
    { pull: 'land', ink: 'paper', path: t, knock: win },
    { pull: 'land', ink: 'far', path: lit, cut: win, lit: 1 },
    { pull: 'land', ink: 'near', path: unionPath([win, boat]), drift: [0, 0] },
    { pull: 'land', ink: 'paper', path: sail, drift: [12, 0] },
    { pull: 'acc', ink: 'sun', path: fire1, blink: 0 }, { pull: 'acc', ink: 'sun', path: fire2, blink: 1 },
  ] });
}
// 5 · 641: Cairo's skyline of domes and pencil minarets
function cairo(seed = 23) {
  const s = new Path2D(), r = mulberry(seed);
  s.rect(-BLEED, 1090, AW + 2 * BLEED, 100);
  for (const [x, w, h] of [[200, 200, 120], [560, 260, 150], [880, 180, 110]]) { s.rect(x - w / 2, 1090 - h, w, h + 2); blob(s, x, 1090 - h, w * .34, w * .4, Math.PI, Math.PI * 2); s.rect(x - 3, 1090 - h - w * .4 - 30, 6, 32); }
  const minar = (x, h) => { s.rect(x - 12, 1090 - h, 24, h); s.rect(x - 20, 1090 - h * .6, 40, 10); s.rect(x - 18, 1090 - h * .85, 36, 9); s.addPath(polyPath([[x - 12, 1090 - h], [x + 12, 1090 - h], [x, 1090 - h - 70]])); };
  for (const [x, h] of [[90, 330], [340, 430], [420, 360], [720, 400], [1010, 300]]) minar(x, h);
  const win = new Path2D(); for (let k = 0; k < 40; k++) { const x = r() * AW, y = 1100 + r() * 60; win.rect(x, y, 8, 12); }
  const lit = new Path2D(); for (const [x, w, h] of [[200, 200, 120], [560, 260, 150], [880, 180, 110]]) blob(lit, x + w * .12, 1090 - h, w * .22, w * .38, Math.PI * 1.5, Math.PI * 2);
  return compose(seed, { focus: [560, 880], parts: [
    { pull: 'land', ink: 'near', path: s, knock: win },
    { pull: 'acc', ink: 'glow', path: lit, lit: 1 },
    { pull: 'acc', ink: 'glow', path: win, blink: 1 },
  ] });
}
// 6 · 1869: the canal running to the horizon, a steamer passing, and the route stamped segment by segment
function suez(seed = 29) {
  const vx = 820, vy = 960;
  const canal = polyPath([[-BLEED, 1180], [400, 1180], [vx + 14, vy], [vx - 6, vy]]);
  const banks = new Path2D(); banks.addPath(polyPath([[-BLEED, 1176], [-BLEED, 1150], [vx - 8, vy + 2], [vx - 6, vy]])); banks.addPath(polyPath([[400, 1180], [430, 1180], [vx + 16, vy], [vx + 14, vy]]));
  const route = [];
  for (let k = 0; k < 9; k++) { const u0 = k / 9, u1 = u0 + .06, x0 = lerp(170, vx + 4, u0), y0 = lerp(1180, vy, u0), x1 = lerp(170, vx + 4, u1), y1 = lerp(1180, vy, u1), w0 = lerp(14, 2, u0), w1 = lerp(14, 2, u1);
    route.push({ pull: 'acc', ink: 'sun', path: polyPath([[x0 - w0, y0], [x0 + w0, y0], [x1 + w1, y1], [x1 - w1, y1]]), seq: .25 + k * .16 }); }
  const ship = new Path2D(); ship.addPath(polyPath([[520, 1060], [680, 1060], [660, 1084], [540, 1084]])); ship.rect(560, 1030, 90, 30); ship.rect(600, 990, 18, 42);
  const smoke = new Path2D(); for (let k = 0; k < 5; k++) blob(smoke, 612 - k * 34, 980 - k * 30, 18 + k * 7, 12 + k * 5);
  const palms = new Path2D(); palm(palms, 950, 1180, 260, 1, seed); palm(palms, 1040, 1180, 200, .8, seed + 2);
  return compose(seed, { focus: [640, 920], parts: [
    { pull: 'land', ink: 'mid', path: canal },
    { pull: 'land', ink: 'far', path: banks, lit: 1 },
    { pull: 'land', ink: 'near', path: ship, drift: [-14, 9] },
    { pull: 'land', ink: 'far', path: smoke, drift: [-4, -14] },
    { pull: 'land', ink: 'near', path: palms, sway: [10, 1.5, .8] },
    ...route,
  ] });
}
// 7 · 1952: the high dam across the river, power lines on lattice pylons
function dam(seed = 31) {
  const wall = polyPath([[-BLEED, 1080], [AW + BLEED, 1050], [AW + BLEED, 1130], [-BLEED, 1160]]);
  const res = rectPath(-BLEED, 990, AW + 2 * BLEED, 80);
  const face = new Path2D(); for (let x = 0; x < AW; x += 90) face.addPath(polyPath([[x, 1080 - x * .028], [x + 40, 1080 - (x + 40) * .028], [x + 40, 1130 - (x + 40) * .028], [x, 1130 - x * .028]]));
  const py = new Path2D(), holes = new Path2D();
  for (const [x, h, s] of [[160, 420, 1], [520, 330, .8], [820, 260, .65]]) {
    py.addPath(polyPath([[x - 60 * s, 1180], [x + 60 * s, 1180], [x + 10 * s, 1180 - h], [x - 10 * s, 1180 - h]]));
    py.rect(x - 90 * s, 1180 - h * .8, 180 * s, 10 * s); py.rect(x - 70 * s, 1180 - h * .62, 140 * s, 9 * s);
    for (let y = 1160; y > 1180 - h * .6; y -= 40 * s) { const w = lerp(10 * s, 60 * s, (y - (1180 - h)) / h); holes.addPath(polyPath([[x - w + 12 * s, y], [x + w - 12 * s, y], [x, y - 28 * s]])); }
  }
  const lines = new Path2D(); for (const yy of [.8, .62]) lines.addPath(polyPath([[160 - 90, 1180 - 420 * yy], [820 + 60, 1180 - 260 * yy - 4], [820 + 60, 1180 - 260 * yy], [160 - 90, 1180 - 420 * yy + 3]]));
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'mid', path: res },
    { pull: 'land', ink: 'glow', lit: 1, drift: [-30, 0], path: (() => { const p = new Path2D(), r = mulberry(seed); for (let i = 0; i < 5; i++) { let x = -BLEED - 300 + r() * 80; while (x < AW + 300) { const L = 40 + r() * 110; p.rect(x, 1000 + i * 13, L, 3); x += L + 60 + r() * 100; } } return p; })() },
    { pull: 'land', ink: 'far', path: wall },
    { pull: 'land', ink: 'glow', path: face, lit: 1 },
    { pull: 'acc', ink: 'near', path: unionPath([py, lines]), knock: holes },
  ] });
}
// 8 · today: Cairo at night — towers, a lattice tower with a flared top, feluccas on the Nile, pyramids far off
function today(seed = 37) {
  const r = mulberry(seed), blocks = new Path2D(), lits = [new Path2D(), new Path2D(), new Path2D()];
  let x = -BLEED;
  while (x < AW + BLEED) {
    const w = 60 + r() * 80, h = 120 + r() * 260, y = 1090 - h;
    if (!(x > 230 && x < 360) && !(x > 560 && x < 880)) { blocks.rect(x, y, w - 6, h + 10); for (let wy = y + 16; wy < 1080; wy += 24) for (let wx = x + 8; wx < x + w - 16; wx += 16) if (r() < .34) lits[Math.floor(r() * 3)].rect(wx, wy, 8, 12); }
    x += w;
  }
  const tower = new Path2D(), tx = 300; tower.addPath(polyPath([[tx - 22, 1090], [tx + 22, 1090], [tx + 16, 640], [tx - 16, 640]])); tower.addPath(polyPath([[tx - 16, 640], [tx + 16, 640], [tx + 44, 590], [tx - 44, 590]])); tower.rect(tx - 30, 560, 60, 32); tower.rect(tx - 3, 470, 6, 92);
  const tholes = new Path2D(); for (let y = 1070; y > 660; y -= 36) tholes.addPath(polyPath([[tx - 10, y], [tx + 10, y], [tx, y - 22]]));
  const pyrs = new Path2D(); pyrs.addPath(polyPath([[560, 1090], [760, 1090], [660, 950]])); pyrs.addPath(polyPath([[720, 1090], [880, 1090], [800, 980]]));
  const boats = new Path2D(), sails = new Path2D();
  for (const [bx, s] of [[180, 1], [560, .8], [880, .9]]) { boats.addPath(polyPath([[bx - 60 * s, 1140], [bx + 60 * s, 1140], [bx + 46 * s, 1156], [bx - 46 * s, 1156]])); sails.addPath(polyPath([[bx - 6 * s, 1138], [bx + 50 * s, 1138], [bx - 6 * s, 1040]])); }
  const stars = new Path2D(); for (let i = 0; i < 30; i++) blob(stars, r() * AW, 110 + r() * 600, 2.4, 2.4);
  return compose(seed, { focus: [560, 880], parts: [
    { pull: 'land', ink: 'paper', path: stars },
    { pull: 'land', ink: 'far', path: pyrs },
    { pull: 'land', ink: 'mid', path: blocks },
    ...lits.map((p, k) => ({ pull: 'land', ink: 'glow', path: p, lit: 1, blink: k })),
    { pull: 'land', ink: 'near', path: tower, knock: tholes },
    { pull: 'acc', ink: 'near', path: boats, drift: [16, 0] },
    { pull: 'acc', ink: 'paper', path: sails, drift: [16, 0] },
  ] });
}

export const SCENES = { unify, giza, temple, pharos, cairo, suez, dam, today };
