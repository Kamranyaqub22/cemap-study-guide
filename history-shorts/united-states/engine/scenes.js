// scenes.js · USA — vertical print (1080×1920 art units, full bleed).
// Base: a big prairie sky with a towering cumulus and a ray-striped sun, a snowy mountain range far off, golden grassland
// with grass that waves, a fence line, a windmill pump turning and a hawk wheeling. One era landmark per print.
// Parts: { pull, ink, path, knock?, cut?, lit?, drift?, blink?, sway?, seq?, loop?, spin?, swing?, paint? }.
// Landmarks are original stylised silhouettes from simple paths: not traced from photographs, no logos, no flags, no maps.
import { mulberry, polyPath, circlePath, ringPath, rectPath, unionPath, bandSteps } from './silk.js';

export const AW = 1080, AH = 1920, BLEED = 60;
export const GROUND = 1180;
export const BAND = [-BLEED, 1170, AW + 2 * BLEED, AH - 1170 + BLEED];
const FULL = () => rectPath(-BLEED, -BLEED, AW + 2 * BLEED, AH + 2 * BLEED);
const SUN = [770, 540], SR = 80;

function blob(p, x, y, rx, ry, a0 = 0, a1 = Math.PI * 2) { p.moveTo(x + rx * Math.cos(a0), y + ry * Math.sin(a0)); p.ellipse(x, y, rx, ry, 0, a0, a1); p.closePath(); }
const bird = (p, x, y, s) => p.addPath(polyPath([[x - 24 * s, y - 6 * s], [x - 11 * s, y - 10 * s], [x, y], [x + 11 * s, y - 10 * s], [x + 24 * s, y - 6 * s], [x + 11 * s, y - 5 * s], [x, y + 5 * s], [x - 11 * s, y - 5 * s]]));
const birds = (list) => { const p = new Path2D(); for (const [x, y, s] of list) bird(p, x, y, s); return p; };
function line(seed, y0, amp, n = 40) {
  const pts = []; for (let i = 0; i <= n; i++) { const x = -BLEED + (AW + 2 * BLEED) * i / n; pts.push([x, y0 + amp * Math.sin(x / 240 + seed) + amp * .4 * Math.sin(x / 101 + seed * 1.9)]); }
  return pts;
}
function water(seed, y0, ink = 'mid', y1 = 1180, speed = -22) {
  const glints = new Path2D(), r = mulberry(seed);
  for (let i = 0; i < 6; i++) { const y = y0 + 8 + i * 12; let x = -BLEED - 240 + r() * 60; while (x < AW + BLEED + 240) { const L = 40 + r() * 120; glints.rect(x, y, L, 3 + i * .5); x += L + 60 + r() * 110; } }
  return [{ pull: 'land', ink, path: rectPath(-BLEED, y0, AW + 2 * BLEED, y1 - y0) }, { pull: 'land', ink: 'glow', path: glints, lit: 1, drift: [speed, 0] }];
}
function grass(seed, y, h = 40, step = 11) {             // tufts of prairie grass (they wave with sway)
  const p = new Path2D(), r = mulberry(seed);
  for (let x = -BLEED - 40; x < AW + BLEED + 40; x += step + r() * step) p.addPath(polyPath([[x - 4, y], [x + 4, y], [x + (r() - .3) * 22, y - h * (.5 + r() * .7)]]));
  return p;
}
function smokeCol(x, y, n, s = 1) { const p = new Path2D(); for (let k = 0; k < n; k++) blob(p, x + k * 10 * s, y - k * 40 * s, (16 + k * 7) * s, (12 + k * 5) * s); return p; }

// ---------------- the base print ----------------
function base(seed, o = {}) {
  const rays = new Path2D(); for (let k = 0; k < 18; k++) { const a = k * Math.PI / 9; rays.addPath(polyPath([[SUN[0] + (SR + 30) * Math.cos(a - .05), SUN[1] + (SR + 30) * Math.sin(a - .05)], [SUN[0] + 420 * Math.cos(a - .09), SUN[1] + 420 * Math.sin(a - .09)], [SUN[0] + 420 * Math.cos(a + .09), SUN[1] + 420 * Math.sin(a + .09)], [SUN[0] + (SR + 30) * Math.cos(a + .05), SUN[1] + (SR + 30) * Math.sin(a + .05)]])); }
  const sunKnock = unionPath([circlePath(SUN[0], SUN[1], SR + 10)]);
  const sky2 = new Path2D(); sky2.rect(-BLEED, -BLEED, AW + 2 * BLEED, 120 + BLEED); sky2.addPath(bandSteps(-BLEED, AW + 2 * BLEED, 110, 760, 5, 10));
  const cu = new Path2D(); for (const [dx, dy, r] of [[0, 0, 90], [-90, 30, 70], [90, 30, 76], [-40, -70, 74], [40, -110, 66], [-10, -170, 56], [150, 50, 50], [-160, 50, 46]]) blob(cu, 220 + dx, 760 + dy, r, r * .8); cu.rect(30, 790, 380, 40);
  const cuLit = new Path2D(); for (const [dx, dy, r] of [[40, -110, 50], [90, 20, 56], [-10, -170, 40]]) blob(cuLit, 236 + dx, 752 + dy, r, r * .7);
  const wisps = new Path2D(), r = mulberry(seed + 3); for (let k = 0; k < 6; k++) { const y = 470 + k * 60 + r() * 20, x = -700 + r() * 1700, w = 200 + r() * 260; wisps.rect(x, y, w, 8); wisps.rect(x + 50, y - 12, w * .45, 6); }
  const peaks = [[-BLEED, 1000], [40, 900], [110, 950], [210, 860], [300, 940], [400, 880], [480, 960], [600, 870], [700, 930], [800, 850], [900, 940], [1000, 890], [AW + BLEED, 960]];
  const mtn = polyPath([[-BLEED, 1300], ...peaks, [AW + BLEED, 1300]]);
  const snow = new Path2D(); for (let i = 1; i < peaks.length - 1; i++) { const [x, y] = peaks[i]; if (y < 920) snow.addPath(polyPath([[x - 34, y + 34], [x, y], [x + 34, y + 34], [x + 14, y + 26], [x, y + 40], [x - 14, y + 26]])); }
  const plain = line(seed + 1.7, 1060, 12), plainP = polyPath([[-BLEED, 1300], ...plain, [AW + BLEED, 1300]]);
  const stripes = new Path2D(); for (let k = 0; k < 4; k++) stripes.addPath(polyPath([...line(seed + 1.7, 1080 + k * 24, 10 - k * 2), ...line(seed + 1.7, 1086 + k * 24, 10 - k * 2).reverse()]));
  const fence = new Path2D(); for (let x = -40; x < AW + 40; x += 64) fence.rect(x, 1078, 5, 30); fence.rect(-BLEED, 1084, AW + 2 * BLEED, 3); fence.rect(-BLEED, 1096, AW + 2 * BLEED, 3);
  const wx = o.mill ?? 930, wy = 860, mill = new Path2D();
  mill.addPath(polyPath([[wx - 4, wy], [wx + 4, wy], [wx + 30, 1080], [wx + 22, 1080]])); mill.addPath(polyPath([[wx - 4, wy], [wx + 4, wy], [wx - 22, 1080], [wx - 30, 1080]])); mill.rect(wx - 20, 960, 40, 4); mill.rect(wx - 12, 1020, 24, 4); mill.addPath(polyPath([[wx, wy - 4], [wx + 70, wy - 10], [wx + 70, wy + 10], [wx, wy + 4]]));
  const blades = new Path2D(); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; blades.addPath(polyPath([[wx + 10 * Math.cos(a - .1), wy + 10 * Math.sin(a - .1)], [wx + 52 * Math.cos(a - .12), wy + 52 * Math.sin(a - .12)], [wx + 52 * Math.cos(a + .12), wy + 52 * Math.sin(a + .12)], [wx + 10 * Math.cos(a + .1), wy + 10 * Math.sin(a + .1)]])); }
  const hawk = birds([[300, 520, 1.3]]);
  return {
    sky: [
      { pull: 'sky1', ink: 'sky1', path: FULL(), knock: sunKnock },
      { pull: 'sky2', ink: 'glow', path: rays, lit: 1, spin: [SUN[0], SUN[1], .02] },
      { pull: 'sky2', ink: 'sky2', path: sky2 },
      { pull: 'sky2', ink: 'sky1', path: wisps, drift: [-62, 0] },
      { pull: 'sky2', ink: 'sky1', path: cu, drift: [-24, -3] }, { pull: 'sky2', ink: 'glow', path: cuLit, lit: 1, drift: [-24, -3] },
      { pull: 'sun', ink: 'sun', path: circlePath(SUN[0], SUN[1], SR) },
    ],
    far: [{ pull: 'far', ink: 'far', path: mtn }, { pull: 'far', ink: 'paper', path: snow, lit: 1 }],
    mid: [
      { pull: 'mid', ink: 'mid', path: plainP }, { pull: 'mid', ink: 'glow', path: stripes, lit: 1, sway: [10, .9, 0] },
      ...(o.fence === false ? [] : [{ pull: 'mid', ink: 'near', path: fence, lit: 1 }]),
      ...(o.mill === null ? [] : [{ pull: 'mid', ink: 'near', path: mill }, { pull: 'mid', ink: 'near', path: blades, spin: [wx, wy, 1.4] }]),
      { pull: 'mid', ink: 'near', path: hawk, swing: [520, 620, .5, .6, 0] },
    ],
  };
}
function bandPart() {
  const p = rectPath(...BAND);
  const knock = new Path2D(); for (let x = 18; x < AW - 20; x += 44) { knock.rect(x, BAND[1] + 14, 14, 14); knock.rect(x + 22, BAND[1] + 20, 14, 4); }   // a quilt-block border
  return { pull: 'band', ink: 'near', path: p, knock };
}
function compose(seed, land, o = {}) {
  const b = base(seed, o);
  const parts = o.night ? [...b.sky.filter(p => !p.spin).map(p => p.pull === 'sun' ? { ...p, ink: 'glow', path: circlePath(SUN[0], SUN[1], SR * .6) } : p), ...b.far, ...b.mid] : [...b.sky, ...b.far, ...b.mid];
  return { focus: land.focus, parts: [...parts, ...land.parts, bandPart()], depth: { sky1: 0, sky2: 0, sun: .1, far: .3, mid: .55, land: .85, acc: .85, band: 1 } };
}

// ---------------- the eras ----------------
// 1 · c. 1050: a city of earthen mounds by a great river — a terraced platform mound with a timber hall, smaller mounds, a log palisade, a ring of posts, canoes
function cahokia(seed = 11) {
  const mound = polyPath([[180, 1110], [900, 1110], [820, 1000], [760, 1000], [720, 920], [380, 920], [340, 1000], [260, 1000]]);
  const terr = new Path2D(); terr.rect(270, 996, 540, 6); terr.rect(380, 916, 340, 6);
  const hall = new Path2D(); hall.rect(470, 860, 160, 60); hall.addPath(polyPath([[450, 862], [650, 862], [550, 790]]));
  const door = rectPath(536, 882, 28, 38);
  const small = new Path2D(); blob(small, 60, 1110, 110, 60, Math.PI, Math.PI * 2); blob(small, 1020, 1110, 120, 70, Math.PI, Math.PI * 2); small.addPath(polyPath([[880, 1110], [960, 1110], [940, 1060], [900, 1060]]));
  const pal = new Path2D(); for (let x = -50; x < AW + 50; x += 18) pal.addPath(polyPath([[x, 1140], [x + 12, 1140], [x + 12, 1104], [x + 6, 1094], [x, 1104]]));
  const posts = new Path2D(); for (let k = 0; k < 9; k++) posts.rect(90 + k * 16, 1010 - Math.sin(k / 8 * Math.PI) * 14, 5, 60);
  const people = new Path2D(); for (const x of [420, 470, 600, 660]) { blob(people, x, 1150, 8, 9); people.addPath(polyPath([[x - 10, 1158], [x + 10, 1158], [x + 12, 1176], [x - 12, 1176]])); }
  const canoe = new Path2D(); for (const x of [120, 700]) { canoe.addPath(polyPath([[x - 70, 1158], [x + 70, 1158], [x + 84, 1146], [x + 60, 1166], [x - 60, 1166], [x - 84, 1146]])); canoe.rect(x - 20, 1134, 4, 24); canoe.rect(x + 24, 1134, 4, 24); }
  return compose(seed, { focus: [540, 920], parts: [
    { pull: 'land', ink: 'far', path: small },
    { pull: 'land', ink: 'mid', path: mound },
    { pull: 'land', ink: 'glow', path: terr, lit: 1 },
    { pull: 'land', ink: 'near', path: hall, knock: door }, { pull: 'land', ink: 'sun', path: door, blink: 1 },
    { pull: 'acc', ink: 'near', path: posts },
    { pull: 'acc', ink: 'glow', path: smokeCol(560, 760, 5), lit: 1, drift: [18, -36] },
    { pull: 'acc', ink: 'sun', path: pal },
    ...water(seed, 1140, 'sky2', 1180, -30),
    { pull: 'acc', ink: 'near', path: canoe, drift: [50, 0] },
    { pull: 'acc', ink: 'near', path: people, drift: [-20, 0] },
    { pull: 'acc', ink: 'near', path: birds([[1120, 640, .8], [1170, 610, .6], [1090, 600, .6]]), drift: [-100, 6] },
  ] }, { mill: null, fence: false });
}
// 2 · 1776: a brick hall with a white steeple, a bell swinging in the belfry, a crowd in tricorn hats, carriages, elms
function hall(seed = 13) {
  const cx = 540, hall = new Path2D(), win = new Path2D();
  hall.rect(110, 900, 860, 210); hall.addPath(polyPath([[100, 902], [980, 902], [940, 870], [140, 870]]));
  for (let x = 140; x < 950; x += 64) { win.rect(x, 930, 34, 50); win.rect(x, 1010, 34, 56); }
  const tower = new Path2D(); tower.rect(cx - 70, 740, 140, 170); tower.rect(cx - 50, 640, 100, 104); tower.rect(cx - 36, 580, 72, 64); tower.addPath(polyPath([[cx - 36, 582], [cx + 36, 582], [cx, 470]]));
  const belfry = new Path2D(); belfry.rect(cx - 30, 660, 60, 70); const bell = new Path2D(); bell.addPath(polyPath([[cx - 18, 712], [cx + 18, 712], [cx + 12, 680], [cx - 12, 680]])); blob(bell, cx, 680, 12, 10, Math.PI, Math.PI * 2);
  const clock = circlePath(cx, 610, 20), door = new Path2D(); door.rect(cx - 30, 1040, 60, 70); blob(door, cx, 1040, 30, 24, Math.PI, Math.PI * 2);
  const elms = new Path2D(); for (const x of [40, 1040]) { for (const [dx, dy, r] of [[0, -190, 90], [-60, -140, 70], [60, -140, 70]]) blob(elms, x + dx, 1110 + dy, r, r * .8); elms.rect(x - 10, 1000, 20, 110); }
  const crowd = new Path2D(), r = mulberry(seed); for (let k = 0; k < 18; k++) { const x = r() * AW; crowd.addPath(polyPath([[x - 14, 1132], [x + 14, 1132], [x, 1122]])); blob(crowd, x, 1138, 8, 9); crowd.addPath(polyPath([[x - 11, 1146], [x + 11, 1146], [x + 14, 1180], [x - 14, 1180]])); }
  const coach = new Path2D(); coach.rect(-200, 1100, 120, 50); blob(coach, -180, 1156, 18, 18); blob(coach, -100, 1156, 18, 18); blob(coach, -30, 1110, 36, 20); coach.rect(-50, 1120, 6, 40); coach.rect(-14, 1120, 6, 40); blob(coach, 4, 1094, 10, 12);
  return compose(seed, { focus: [540, 860], parts: [
    { pull: 'land', ink: 'mid', path: elms, sway: [4, 1.2, .3] },
    { pull: 'land', ink: 'sun', path: hall, knock: unionPath([win, door]) },
    { pull: 'land', ink: 'paper', path: unionPath([win, door]), lit: 1 },
    { pull: 'land', ink: 'paper', path: tower, knock: unionPath([belfry, clock]) },
    { pull: 'land', ink: 'near', path: belfry, lit: 1 }, { pull: 'land', ink: 'glow', path: clock },
    { pull: 'acc', ink: 'glow', path: bell, swing: [cx, 668, .35, 3.2, 0] },
    { pull: 'acc', ink: 'near', path: crowd, sway: [5, 2.0, 0] },
    { pull: 'acc', ink: 'near', path: coach, drift: [120, 0] },
    { pull: 'acc', ink: 'near', path: birds([[700, 420, .8], [760, 450, .6], [650, 450, .6], [820, 410, .5]]), drift: [-70, -12] },
  ] }, { mill: null });
}
// 3 · 1787: a great parchment on a writing table, its lines written one by one, a quill dipping, candles flickering
function charter(seed = 17) {
  const sheet = polyPath([[180, 640], [900, 640], [910, 1090], [170, 1090]]);
  const roll = new Path2D(); blob(roll, 540, 640, 380, 22); blob(roll, 540, 1090, 386, 22);
  const head = { pull: 'acc', ink: 'near', path: new Path2D(), paint: (g) => { g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.font = '900 96px BigShoulders'; g.letterSpacing = '4px'; g.fillText('We the People', 540, 760); }, seq: .1 };
  const lines = []; for (let k = 0; k < 9; k++) { const p = new Path2D(), r = mulberry(seed + k); let x = 230; while (x < 840) { const w = 30 + r() * 70; p.rect(x, 800 + k * 30, w, 6); x += w + 12; } lines.push({ pull: 'acc', ink: 'far', path: p, seq: .5 + k * .3 }); }
  const sigs = new Path2D(); for (const [x, y] of [[300, 1066], [470, 1060], [640, 1068], [790, 1062]]) sigs.addPath(polyPath([[x - 50, y], [x - 20, y - 14], [x + 10, y - 2], [x + 50, y - 16], [x + 52, y - 12], [x + 10, y + 3], [x - 20, y - 9], [x - 48, y + 4]]));
  const table = new Path2D(); table.rect(-BLEED, 1100, AW + 2 * BLEED, 80); const pot = new Path2D(); pot.rect(890, 1050, 60, 54); blob(pot, 920, 1050, 30, 10);
  const quill = new Path2D(); quill.moveTo(930, 1046); quill.bezierCurveTo(990, 960, 1060, 840, 1100, 760); quill.lineTo(1080, 820); quill.bezierCurveTo(1040, 900, 990, 980, 936, 1050); quill.closePath();
  const candles = new Path2D(), flames = new Path2D(); for (const x of [90, 1010]) { candles.rect(x - 14, 1000, 28, 100); flames.addPath(polyPath([[x - 9, 996], [x + 9, 996], [x, 960]])); }
  return compose(seed, { focus: [540, 860], parts: [
    { pull: 'land', ink: 'near', path: table },
    { pull: 'land', ink: 'paper', path: sheet },
    { pull: 'land', ink: 'glow', path: roll, lit: 1 },
    head, ...lines,
    { pull: 'acc', ink: 'sun', path: sigs, seq: 3.4 },
    { pull: 'acc', ink: 'far', path: pot },
    { pull: 'acc', ink: 'mid', path: quill, swing: [930, 1046, .07, 4.5, 0] },
    { pull: 'acc', ink: 'paper', path: candles }, { pull: 'acc', ink: 'sun', path: flames, sway: [3, 8, 0] },
    { pull: 'acc', ink: 'glow', path: unionPath([circlePath(90, 975, 40), circlePath(1010, 975, 40)]), lit: 1, blink: 1 },
  ] }, { mill: null });
}
// 4 · 1861: fog on a hillside, a lone cannon by a broken rail fence, a bare tree, smoke drifting, crows
function war(seed = 19) {
  const hill = polyPath([[-BLEED, 1180], [-BLEED, 1040], [300, 990], [600, 1010], [900, 1060], [AW + BLEED, 1080], [AW + BLEED, 1180]]);
  const cannon = new Path2D(); cannon.addPath(polyPath([[400, 980], [620, 940], [628, 962], [410, 1004]])); blob(cannon, 420, 1010, 44, 44); cannon.rect(330, 1000, 120, 16);
  const spokes = new Path2D(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; spokes.addPath(polyPath([[420 + 6 * Math.cos(a + 1.5), 1010 + 6 * Math.sin(a + 1.5)], [420 + 38 * Math.cos(a), 1010 + 38 * Math.sin(a)], [420 + 38 * Math.cos(a + .2), 1010 + 38 * Math.sin(a + .2)]])); }
  const fence = new Path2D(); for (const [x, y, a] of [[680, 1040, .1], [800, 1056, -.4], [920, 1066, .05]]) fence.addPath(polyPath([[x, y], [x + 120, y + 120 * a], [x + 120, y + 120 * a + 8], [x, y + 8]])); for (const x of [690, 810, 930, 1040]) fence.rect(x, 1030, 8, 50);
  const tree = new Path2D(); tree.addPath(polyPath([[150, 1030], [180, 1030], [175, 800], [160, 800]])); for (const [x0, y0, x1, y1] of [[170, 880, 90, 790], [168, 850, 260, 760], [172, 820, 200, 740], [166, 920, 80, 880]]) tree.addPath(polyPath([[x0 - 4, y0], [x0 + 4, y0], [x1 + 2, y1], [x1 - 2, y1]]));
  const fog = [new Path2D(), new Path2D()]; for (let k = 0; k < 8; k++) { blob(fog[k % 2], -200 + k * 190, 1000 + (k % 3) * 24, 160, 26); }
  const smoke = smokeCol(640, 930, 6, 1.2);
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'mid', path: hill },
    { pull: 'land', ink: 'glow', path: fog[0], lit: 1, drift: [-26, 0] },
    { pull: 'land', ink: 'near', path: tree },
    { pull: 'land', ink: 'far', path: fence },
    { pull: 'acc', ink: 'near', path: cannon }, { pull: 'acc', ink: 'far', path: spokes, lit: 1 },
    { pull: 'acc', ink: 'glow', path: smoke, lit: 1, drift: [30, -24] },
    { pull: 'acc', ink: 'sky1', path: fog[1], lit: 1, drift: [34, 0] },
    { pull: 'acc', ink: 'near', path: birds([[700, 560, 1.1], [780, 520, .8], [640, 500, .7], [860, 600, .6]]), drift: [-60, 8] },
  ] }, { mill: null, fence: false });
}
// 5 · 1903: sand dunes by the sea, a wooden biplane lifting off, a man running alongside, gulls, grass in the wind
function flight(seed = 23) {
  const dunes = new Path2D(); blob(dunes, 200, 1130, 380, 120, Math.PI, Math.PI * 2); blob(dunes, 820, 1140, 420, 140, Math.PI, Math.PI * 2); dunes.rect(-BLEED, 1120, AW + 2 * BLEED, 60);
  const shade = new Path2D(); blob(shade, 280, 1130, 280, 90, Math.PI * 1.5, Math.PI * 2); blob(shade, 920, 1140, 300, 110, Math.PI * 1.5, Math.PI * 2);
  const plane = new Path2D(), x = 300, y = 820;
  plane.rect(x, y, 360, 10); plane.rect(x, y + 60, 360, 10); for (const dx of [20, 120, 240, 340]) plane.rect(x + dx, y, 6, 70);
  plane.rect(x - 110, y + 26, 110, 6); plane.rect(x - 120, y + 10, 10, 40); plane.rect(x + 360, y + 30, 90, 5); plane.rect(x + 440, y + 14, 10, 40); plane.rect(x + 170, y + 50, 60, 12);
  const prop = new Path2D(); prop.rect(x + 196, y + 4, 6, 62);
  const man = new Path2D(); blob(man, 160, 1040, 12, 13); man.addPath(polyPath([[146, 1054], [174, 1054], [190, 1100], [130, 1100]])); man.addPath(polyPath([[140, 1100], [152, 1100], [128, 1140], [116, 1140]])); man.addPath(polyPath([[168, 1100], [180, 1100], [204, 1136], [192, 1140]]));
  const rail = new Path2D(); rail.rect(60, 1100, 700, 6);
  return compose(seed, { focus: [500, 860], parts: [
    ...water(seed, 1060, 'sky2', 1120, -34),
    { pull: 'land', ink: 'sun', path: dunes }, { pull: 'land', ink: 'far', path: shade, lit: 1 },
    { pull: 'acc', ink: 'near', path: rail },
    { pull: 'acc', ink: 'mid', path: grass(seed, 1124, 46, 18), sway: [8, 1.8, 0] },
    { pull: 'acc', ink: 'near', path: plane, drift: [90, -16] },
    { pull: 'acc', ink: 'glow', path: prop, drift: [90, -16], blink: 0 },
    { pull: 'acc', ink: 'near', path: man, drift: [80, 0] },
    { pull: 'acc', ink: 'near', path: birds([[900, 560, .8], [960, 600, .6], [840, 620, .6]]), drift: [-80, 10] },
  ] }, { mill: null, fence: false });
}
// 6 · 1931: a stepped Art Deco tower with a needle spire above the city, a blimp gliding, a crane swinging, steam from rooftops, windows lighting
function skyline(seed = 29) {
  const r = mulberry(seed), city = new Path2D(), lit = [new Path2D(), new Path2D(), new Path2D()];
  for (let x = -BLEED; x < AW + BLEED;) { const w = 60 + r() * 70, h = 120 + r() * 160; if (!(x > 400 && x < 640)) { city.rect(x, 1100 - h, w - 6, h + 20); for (let wy = 1110 - h; wy < 1080; wy += 24) for (let wx = x + 8; wx < x + w - 14; wx += 16) if (r() < .3) lit[Math.floor(r() * 3)].rect(wx, wy, 7, 11); } x += w; }
  const cx = 520, t = new Path2D(); t.rect(cx - 110, 840, 220, 280); t.rect(cx - 80, 720, 160, 130); t.rect(cx - 56, 640, 112, 90); t.rect(cx - 34, 580, 68, 70); t.rect(cx - 16, 520, 32, 66); t.addPath(polyPath([[cx - 8, 522], [cx + 8, 522], [cx, 420]]));
  const twin = new Path2D(); for (let y = 600; y < 1110; y += 30) for (let x = cx - 100; x < cx + 100; x += 22) if (y > 850 || (y > 730 && Math.abs(x - cx) < 70) || (y > 650 && Math.abs(x - cx) < 46) || Math.abs(x - cx) < 24) twin.rect(x + 4, y, 8, 14);
  const pin = new Path2D(); pin.rect(cx - 112, 840, 6, 280); pin.rect(cx - 82, 720, 6, 130);
  const blimp = new Path2D(); blob(blimp, -160, 700, 110, 34); blimp.addPath(polyPath([[-270, 700], [-300, 676], [-300, 724]])); blimp.rect(-180, 732, 50, 14);
  const crane = new Path2D(); crane.rect(820, 700, 14, 400); crane.rect(700, 700, 280, 12); crane.rect(706, 712, 4, 120); crane.rect(690, 830, 36, 20);
  const steam = new Path2D(); for (const x0 of [140, 300, 880]) for (let k = 0; k < 4; k++) blob(steam, x0 + k * 10, 930 - k * 28, 10 + k * 5, 8 + k * 3);
  return compose(seed, { focus: [520, 820], parts: [
    { pull: 'land', ink: 'mid', path: city },
    ...lit.map((p, k) => ({ pull: 'land', ink: 'glow', path: p, lit: 1, blink: k })),
    { pull: 'land', ink: 'paper', path: t, knock: twin },
    { pull: 'land', ink: 'far', path: twin, lit: 1 }, { pull: 'land', ink: 'sun', path: pin, lit: 1 },
    { pull: 'acc', ink: 'near', path: crane, swing: [827, 706, .06, .8, 0] },
    { pull: 'acc', ink: 'glow', path: steam, lit: 1, drift: [16, -30] },
    { pull: 'acc', ink: 'sun', path: blimp, drift: [70, -4] },
    { pull: 'acc', ink: 'near', path: birds([[1120, 600, .7], [1170, 570, .6], [1090, 560, .5]]), drift: [-110, 6] },
  ] }, { mill: null, fence: false });
}
// 7 · 1969: a tall rocket climbing on a column of fire and smoke above its tower, a crowd on the causeway, water, herons
function launch(seed = 31) {
  const cx = 600, rk = new Path2D(); rk.rect(cx - 26, 560, 52, 260); rk.rect(cx - 20, 500, 40, 64); rk.addPath(polyPath([[cx - 20, 502], [cx + 20, 502], [cx, 440]])); rk.rect(cx - 2, 410, 4, 34);
  rk.addPath(polyPath([[cx - 26, 780], [cx - 52, 830], [cx - 26, 820]])); rk.addPath(polyPath([[cx + 26, 780], [cx + 52, 830], [cx + 26, 820]]));
  const bands = new Path2D(); for (const y of [620, 700, 760]) bands.rect(cx - 26, y, 52, 8);
  const flame = polyPath([[cx - 24, 820], [cx + 24, 820], [cx + 10, 900], [cx, 950], [cx - 10, 900]]);
  const plume = new Path2D(); for (let k = 0; k < 9; k++) blob(plume, cx + (k % 2 ? 14 : -14), 960 + k * 26, 40 + k * 16, 24 + k * 4); for (const s of [-1, 1]) for (let k = 0; k < 4; k++) blob(plume, cx + s * (120 + k * 70), 1090 - k * 6, 70 - k * 8, 40);
  const sh = (q) => { const o = new Path2D(); o.addPath(q, new DOMMatrix().translate(0, 150)); return o; };   // the rocket sits lower, clear of the title
  const tower = new Path2D(); tower.rect(380, 700, 36, 400); for (let y = 720; y < 1100; y += 40) tower.addPath(polyPath([[380, y], [416, y + 34], [416, y + 40], [380, y + 6]])); tower.rect(400, 760, 140, 8); tower.rect(400, 860, 120, 8);
  const crowd = new Path2D(), r = mulberry(seed); for (let k = 0; k < 28; k++) { const x = r() * AW; blob(crowd, x, 1138, 8, 9); crowd.rect(x - 9, 1146, 18, 30); }
  const causeway = rectPath(-BLEED, 1136, AW + 2 * BLEED, 44);
  return compose(seed, { focus: [580, 760], parts: [
    { pull: 'land', ink: 'near', path: tower },
    { pull: 'land', ink: 'glow', path: sh(plume), lit: 1, drift: [0, 10] },
    { pull: 'land', ink: 'near', path: sh(rk), knock: sh(bands), drift: [0, -22] }, { pull: 'land', ink: 'sun', path: sh(bands), drift: [0, -22] },
    { pull: 'acc', ink: 'sun', path: sh(flame), blink: 0, drift: [0, -22] }, { pull: 'acc', ink: 'glow', path: sh(flame), blink: 2, drift: [0, -22] },
    ...water(seed, 1100, 'mid', 1140, -26),
    { pull: 'acc', ink: 'far', path: causeway },
    { pull: 'acc', ink: 'near', path: crowd, sway: [4, 2.4, 0] },
    { pull: 'acc', ink: 'near', path: birds([[-60, 900, .9], [-110, 870, .7], [-150, 920, .6]]), drift: [110, -10] },
  ] }, { mill: null, fence: false });
}
// 8 · today: a red suspension bridge over the bay, fog rolling through its towers, cars crossing, sailboats, a hill city with lights
function today(seed = 37) {
  const r = mulberry(seed), city = new Path2D(), lit = [new Path2D(), new Path2D(), new Path2D()];
  for (let x = 640; x < AW + BLEED;) { const w = 40 + r() * 40, h = 80 + r() * 200; city.rect(x, 1060 - h, w - 4, h); for (let wy = 1068 - h; wy < 1040; wy += 20) for (let wx = x + 6; wx < x + w - 10; wx += 12) if (r() < .3) lit[Math.floor(r() * 3)].rect(wx, wy, 5, 8); x += w; }
  const hills = polyPath([[-BLEED, 1080], [-BLEED, 960], [160, 920], [360, 990], [560, 1000], [800, 1040], [AW + BLEED, 1050], [AW + BLEED, 1080]]);
  const br = new Path2D(); for (const x of [200, 760]) { br.rect(x - 16, 640, 32, 440); br.rect(x - 26, 700, 52, 10); br.rect(x - 26, 820, 52, 10); }
  br.rect(-BLEED, 1000, AW + 2 * BLEED, 18);
  const cab = new Path2D(); const curve = (x0, x1, y0, sag) => { const p = []; for (let k = 0; k <= 30; k++) { const u = k / 30; p.push([x0 + (x1 - x0) * u, y0 + sag * 4 * u * (1 - u)]); } return p; };
  for (const [x0, x1, y0, sag] of [[200, 760, 646, 340], [-BLEED, 200, 1000, 0], [760, AW + BLEED, 1000, 0]]) { const top = sag ? curve(x0, x1, y0, sag) : [[x0, x1 === 200 ? 1000 : 646], [x1, x1 === 200 ? 646 : 1000]]; cab.addPath(polyPath([...top, ...top.map(([x, y]) => [x, y + 6]).reverse()])); }
  for (let x = 220; x < 760; x += 30) { const u = (x - 200) / 560, y = 646 + 340 * 4 * u * (1 - u); cab.rect(x, y, 2, 1000 - y); }
  const fog = [new Path2D(), new Path2D()]; for (let k = 0; k < 9; k++) blob(fog[k % 2], -300 + k * 170, 920 + (k % 3) * 30, 150, 34);
  const cars = new Path2D(); for (let x = -40; x < AW + 40; x += 110) { cars.rect(x, 988, 40, 12); }
  const sails = new Path2D(); for (const [x, s] of [[300, 1], [620, .8], [900, .9]]) { sails.addPath(polyPath([[x, 1120], [x, 1040 - 20 * s], [x + 50 * s, 1116]])); sails.addPath(polyPath([[x - 40, 1124], [x + 60, 1124], [x + 50, 1136], [x - 30, 1136]])); }
  return compose(seed, { focus: [500, 860], parts: [
    { pull: 'land', ink: 'mid', path: hills },
    { pull: 'land', ink: 'far', path: city },
    ...lit.map((p, k) => ({ pull: 'land', ink: 'glow', path: p, lit: 1, blink: k })),
    ...water(seed, 1018, 'sky2', 1180, -28),
    { pull: 'land', ink: 'sun', path: unionPath([br, cab]) },
    { pull: 'acc', ink: 'paper', path: fog[0], lit: 1, drift: [40, 0] },
    { pull: 'acc', ink: 'near', path: cars, drift: [-120, 0] },
    { pull: 'acc', ink: 'paper', path: sails, drift: [30, 0] },
    { pull: 'acc', ink: 'sky1', path: fog[1], lit: 1, drift: [60, -4] },
    { pull: 'acc', ink: 'near', path: birds([[1120, 620, .8], [1170, 590, .6]]), drift: [-110, 6] },
  ] }, { mill: null, fence: false });
}

export const SCENES = { cahokia, hall, charter, war, flight, skyline, launch, today };
