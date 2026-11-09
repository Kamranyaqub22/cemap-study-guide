// scenes.js · UAE — vertical print (1080×1920 art units, full bleed).
// Base: stepped sky with drifting haze bands, a sun, low rocky mountains on the horizon, stepped desert dunes.
// One era landmark per print. A part = { pull, ink, path, knock?, cut?, lit?, drift?, blink?, mov? }.
// Landmarks are original stylised silhouettes built from simple paths: not traced from photographs, no logos, no flags.
import { mulberry, polyPath, circlePath, ringPath, rectPath, unionPath, bandSteps, ridgeLine, lerp } from './silk.js';

export const AW = 1080, AH = 1920, BLEED = 60;
export const GROUND = 1180;
export const BAND = [-BLEED, 1170, AW + 2 * BLEED, AH - 1170 + BLEED];
const FULL = () => rectPath(-BLEED, -BLEED, AW + 2 * BLEED, AH + 2 * BLEED);
const SUN = [790, 540], SR = 104;

function blob(p, x, y, rx, ry, a0 = 0, a1 = Math.PI * 2) { p.moveTo(x + rx * Math.cos(a0), y + ry * Math.sin(a0)); p.ellipse(x, y, rx, ry, 0, a0, a1); p.closePath(); }
const bird = (p, x, y, s) => p.addPath(polyPath([[x - 24 * s, y - 6 * s], [x - 11 * s, y - 10 * s], [x, y], [x + 11 * s, y - 10 * s], [x + 24 * s, y - 6 * s], [x + 11 * s, y - 5 * s], [x, y + 5 * s], [x - 11 * s, y - 5 * s]]));
function palm(p, x, base, h, s = 1, seed = 1, trunk = true) {            // a date palm: a leaning trunk and a crown of drooping fronds
  const r = mulberry(seed), lean = (r() - .5) * 40 * s;
  if (trunk) p.addPath(polyPath([[x - 9 * s, base], [x + 9 * s, base], [x + lean + 5 * s, base - h], [x + lean - 5 * s, base - h]]));
  const cx = x + lean, cy = base - h;
  for (let k = 0; k < 9; k++) {
    const a = -Math.PI + (k / 8) * Math.PI + (r() - .5) * .2, L = (70 + r() * 30) * s, droop = 26 * s;
    const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([cx + Math.cos(a) * L * u, cy + Math.sin(a) * L * u * .55 + droop * u * u]); }
    const back = pts.slice().reverse().map(([px, py], i) => [px, py + 9 * s * Math.sin((1 - i / 8) * Math.PI)]);
    p.addPath(polyPath([...pts, ...back]));
  }
  blob(p, cx, cy + 4 * s, 12 * s, 9 * s);
}
function sea(seed, y0 = 1080) {                            // the Gulf: a flat body with drifting glint bars (paper-bright in the glow ink)
  const body = rectPath(-BLEED, y0, AW + 2 * BLEED, 1300 - y0), glints = new Path2D(), r = mulberry(seed);
  for (let i = 0; i < 8; i++) { const y = y0 + 10 + i * 13; let x = -BLEED - 200 + r() * 60; while (x < AW + BLEED + 200) { const L = 50 + r() * 130; glints.rect(x, y, L, 3 + i * .5); x += L + 60 + r() * 120; } }
  return [{ pull: 'land', ink: 'mid', path: body }, { pull: 'land', ink: 'glow', path: glints, lit: 1, drift: [-16, 0] }];
}

// ---------------- the base print ----------------
function base(seed) {
  const sunKnock = unionPath([circlePath(SUN[0], SUN[1], SR + 9), ringPath(SUN[0], SUN[1], SR + 30, SR + 39), ringPath(SUN[0], SUN[1], SR + 62, SR + 68)]);
  const sky2 = new Path2D(); sky2.rect(-BLEED, -BLEED, AW + 2 * BLEED, 150 + BLEED); sky2.addPath(bandSteps(-BLEED, AW + 2 * BLEED, 140, 860, 7, 8));
  const haze = new Path2D(), r = mulberry(seed + 3);                // long thin heat-haze bands that drift across the sky
  for (let k = 0; k < 7; k++) { const y = 470 + k * 58 + r() * 20, x = -700 + r() * 1600; haze.rect(x, y, 260 + r() * 340, 7 + r() * 5); }
  // far: a low rocky ridge on the horizon, jagged lit faces
  const ridge = ridgeLine([-BLEED, 905], [AW + BLEED, 925], 120, 7, seed + 5).map(([x, y]) => [x, Math.min(y, 960)]);
  const mtn = polyPath([[-BLEED, 1300], ...ridge, [AW + BLEED, 1300]]);
  const mlit = new Path2D(); for (let i = 1; i < ridge.length - 1; i++) { const [x, y] = ridge[i], [x2, y2] = ridge[i + 1]; if (y2 > y + 6) mlit.addPath(polyPath([[x, y], [x2, y2], [x2 - 10, y2 + 40], [x - 6, y + 46]])); }
  // mid: stepped dunes — two crests with lit (glow) and shaded faces
  const crest = (y0, amp, ph) => { const pts = []; for (let i = 0; i <= 40; i++) { const x = -BLEED + (AW + 2 * BLEED) * i / 40; pts.push([x, y0 + amp * Math.sin(x / 210 + ph) + amp * .5 * Math.sin(x / 97 + ph * 2)]); } return pts; };
  const c1 = crest(1010, 26, seed), c2 = crest(1085, 22, seed + 2);
  const dunes = polyPath([[-BLEED, 1300], ...c1, [AW + BLEED, 1300]]);
  const lit = new Path2D(); for (let i = 0; i < c1.length - 1; i++) { const [x, y] = c1[i], [x2, y2] = c1[i + 1]; if (y2 < y) lit.addPath(polyPath([[x, y], [x2, y2], [x2, y2 + 34], [x, y + 30]])); }
  const dunes2 = polyPath([[-BLEED, 1300], ...c2, [AW + BLEED, 1300]]);
  const ripples = new Path2D(); for (let k = 0; k < 4; k++) { const pts = crest(1110 + k * 18, 6, seed + k).map(([x, y]) => [x, y]); ripples.addPath(polyPath([...pts, ...pts.slice().reverse().map(([x, y]) => [x, y + 3])])); }
  const birds = new Path2D(); bird(birds, 230, 470, 1); bird(birds, 280, 440, .75); bird(birds, 196, 420, .6);
  const birds2 = new Path2D(); bird(birds2, 1160, 640, .8); bird(birds2, 1210, 610, .6); bird(birds2, 1250, 660, .7);
  return {
    sky: [
      { pull: 'sky1', ink: 'sky1', path: FULL(), knock: sunKnock },
      { pull: 'sky2', ink: 'sky2', path: sky2 },
      { pull: 'sky2', ink: 'sky1', path: haze, drift: [42, 0] },
      { pull: 'sun', ink: 'sun', path: circlePath(SUN[0], SUN[1], SR) },
    ],
    far: [{ pull: 'far', ink: 'far', path: mtn }, { pull: 'far', ink: 'glow', path: mlit, lit: 1 }],
    mid: [
      { pull: 'mid', ink: 'mid', path: dunes }, { pull: 'mid', ink: 'glow', path: lit, lit: 1 },
      { pull: 'mid', ink: 'far', path: dunes2, lit: 1 }, { pull: 'mid', ink: 'mid', path: ripples, lit: 1 },
      { pull: 'mid', ink: 'near', path: birds, drift: [44, -5] },
      { pull: 'mid', ink: 'near', path: birds2, drift: [-58, -4] },
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
// 1 · Magan: a round stone tomb, stacks of copper bun ingots, palms
function magan(seed = 11) {
  const cx = 720, tomb = new Path2D();
  tomb.rect(cx - 190, 1000, 380, 180); blob(tomb, cx, 1000, 190, 26);
  const courses = new Path2D(); for (let y = 1022; y < 1180; y += 26) courses.rect(cx - 188, y, 376, 5);
  const door = new Path2D(); door.addPath(polyPath([[cx - 22, 1180], [cx + 22, 1180], [cx + 22, 1110], [cx, 1092], [cx - 22, 1110]]));
  const ingots = new Path2D(); for (const [x, y] of [[180, 1160], [250, 1160], [320, 1160], [215, 1128], [285, 1128], [250, 1096]]) blob(ingots, x, y, 34, 15);
  const ilit = new Path2D(); for (const [x, y] of [[180, 1160], [250, 1160], [320, 1160], [215, 1128], [285, 1128], [250, 1096]]) blob(ilit, x - 6, y - 5, 18, 5);
  const palms = new Path2D(); palm(palms, 470, 1180, 300, 1, seed); palm(palms, 1000, 1180, 360, 1.1, seed + 1);
  const lit = new Path2D(); lit.rect(cx + 40, 1000, 150, 180);
  return compose(seed, { focus: [700, 950], parts: [
    { pull: 'land', ink: 'near', path: tomb, knock: door },
    { pull: 'land', ink: 'near', path: palms, sway: [10, 1.6, .4] },
    { pull: 'land', ink: 'far', path: courses, cut: door, lit: 1 },
    { pull: 'acc', ink: 'glow', path: lit, cut: unionPath([courses, door]), lit: 1 },
    { pull: 'acc', ink: 'sun', path: ingots },
    { pull: 'acc', ink: 'glow', path: ilit, lit: 1 },
  ] });
}
// 2 · Islam arrives: a small whitewashed mosque (bare paper) with a dome and a minaret, palms
function mosque(seed = 13) {
  const cx = 700, walls = new Path2D();
  walls.rect(cx - 220, 1030, 440, 150); blob(walls, cx, 1032, 92, 96, Math.PI, Math.PI * 2);
  walls.rect(cx + 250, 760, 56, 420); blob(walls, cx + 278, 760, 34, 40, Math.PI, Math.PI * 2);
  const arches = new Path2D();
  for (let k = -3; k <= 3; k++) { const x = cx + k * 58; arches.addPath(polyPath([[x - 18, 1180], [x + 18, 1180], [x + 18, 1092], [x, 1070], [x - 18, 1092]])); }
  for (let y = 820; y < 1100; y += 80) arches.rect(cx + 268, y, 20, 40);
  const trim = new Path2D(); trim.rect(cx - 226, 1022, 452, 12); trim.rect(cx + 244, 792, 68, 14); trim.rect(cx - 4, 920, 8, 18); blob(trim, cx, 914, 9, 9); trim.rect(cx + 275, 700, 6, 22);
  const shade = new Path2D(); shade.rect(cx + 120, 1030, 100, 150); shade.rect(cx + 284, 760, 22, 420); blob(shade, cx + 30, 1032, 62, 92, Math.PI * 1.5, Math.PI * 2);
  const palms = new Path2D(); palm(palms, 170, 1180, 380, 1.1, seed); palm(palms, 330, 1180, 270, .9, seed + 4);
  return compose(seed, { focus: [720, 950], parts: [
    { pull: 'land', ink: 'paper', path: walls, knock: arches },
    { pull: 'land', ink: 'glow', path: shade, cut: arches, lit: 1 },
    { pull: 'land', ink: 'near', path: arches },
    { pull: 'land', ink: 'near', path: palms, sway: [10, 1.5, 1.1] },
    { pull: 'acc', ink: 'sun', path: trim },
  ] });
}
// 3 · the 1500s: a Portuguese carrack under square sails, a coastal fort on the headland
function carrack(seed = 17) {
  const hull = polyPath([[300, 1070], [880, 1070], [930, 1010], [960, 1000], [940, 1060], [860, 1125], [370, 1125], [300, 1100], [250, 1040], [270, 1030]]);
  const castle = new Path2D(); castle.rect(270, 990, 150, 50); castle.rect(800, 1000, 90, 40);
  const masts = new Path2D(); for (const [x, top] of [[420, 690], [600, 610], [760, 700]]) masts.rect(x - 6, top, 12, 1072 - top); masts.addPath(polyPath([[900, 1004], [1040, 900], [1046, 908], [906, 1012]]));
  const sails = new Path2D(); for (const [x, top, w] of [[420, 720, 170], [600, 640, 210], [760, 730, 160]]) { sails.addPath(polyPath([[x - w / 2, top], [x + w / 2, top], [x + w / 2 + 12, top + 140], [x - w / 2 - 12, top + 140]])); sails.addPath(polyPath([[x - w / 2 + 14, top + 160], [x + w / 2 - 14, top + 160], [x + w / 2, top + 260], [x - w / 2, top + 260]])); }
  const sshade = new Path2D(); for (const [x, top, w] of [[420, 720, 170], [600, 640, 210], [760, 730, 160]]) { sshade.rect(x + w * .18, top, w * .32, 140); sshade.rect(x + w * .14, top + 160, w * .3, 100); }
  const pennant = new Path2D(); for (const [x, top] of [[420, 690], [600, 610], [760, 700]]) pennant.addPath(polyPath([[x + 6, top], [x + 70, top + 10], [x + 6, top + 20]]));
  const ports = new Path2D(); for (let x = 400; x < 860; x += 52) ports.rect(x, 1086, 18, 14);
  const fort = new Path2D(); fort.addPath(polyPath([[-BLEED, 1090], [60, 1060], [170, 1080], [170, 1300], [-BLEED, 1300]])); fort.rect(10, 960, 110, 110); for (let x = 10; x < 120; x += 28) fort.rect(x, 944, 16, 18);
  return compose(seed, { focus: [600, 900], parts: [
    ...sea(seed),
    { pull: 'land', ink: 'far', path: fort },
    { pull: 'land', ink: 'near', path: unionPath([hull, castle, masts]), knock: ports, drift: [10, 0] },
    { pull: 'land', ink: 'paper', path: sails, drift: [10, 0] },
    { pull: 'land', ink: 'glow', path: sshade, lit: 1, drift: [10, 0] },
    { pull: 'acc', ink: 'sun', path: pennant, drift: [10, 0] },
  ] });
}
// 4 · 1820: a coastal fort (a round and a square tower) and a wind-tower house
function fort(seed = 19) {
  const cx = 660, walls = new Path2D();
  walls.rect(cx - 230, 1010, 460, 170);
  walls.rect(cx + 180, 860, 120, 320); walls.rect(cx - 300, 900, 110, 280);
  blob(walls, cx + 240, 862, 60, 16);
  const cren = new Path2D(); for (let x = cx - 230; x < cx + 230; x += 34) cren.rect(x, 990, 18, 22); for (let x = cx - 300; x < cx - 190; x += 30) cren.rect(x, 880, 16, 22);
  for (let k = -2; k <= 2; k++) cren.rect(cx + 240 + k * 26 - 8, 836, 16, 26);
  const gate = polyPath([[cx - 40, 1180], [cx + 40, 1180], [cx + 40, 1090], [cx, 1060], [cx - 40, 1090]]);
  const slits = new Path2D(); for (const [x, y] of [[cx + 240, 930], [cx + 240, 1010], [cx - 245, 960], [cx - 245, 1040], [cx - 130, 1060], [cx + 110, 1060]]) slits.rect(x - 5, y, 10, 32);
  const shade = new Path2D(); shade.rect(cx + 240, 860, 60, 320); shade.rect(cx - 245, 900, 55, 280); shade.rect(cx + 100, 1010, 80, 170);
  const house = new Path2D(); house.rect(60, 1040, 230, 140); house.rect(150, 860, 90, 190);
  const vents = new Path2D(); for (let k = 0; k < 3; k++) vents.rect(162 + k * 26, 880, 12, 90);
  const palms = new Path2D(); palm(palms, 1010, 1180, 300, 1, seed);
  const flag = polyPath([[cx + 240, 760], [cx + 246, 760], [cx + 246, 836], [cx + 240, 836]]);
  return compose(seed, { focus: [640, 940], parts: [
    { pull: 'land', ink: 'far', path: unionPath([walls, cren, house]), knock: unionPath([gate, slits, vents]) },
    { pull: 'land', ink: 'mid', path: shade, cut: unionPath([gate, slits]), lit: 1 },
    { pull: 'land', ink: 'near', path: unionPath([gate, slits, vents, flag]) },
    { pull: 'land', ink: 'near', path: palms, sway: [12, 1.7, .2] },
    { pull: 'acc', ink: 'glow', path: rectPath(cx - 230, 1010, 460, 10), lit: 1 },
  ] });
}
// 5 · the 1930s: a pearling dhow under a lateen sail, an open oyster with its pearl (bare paper)
function pearl(seed = 23) {
  const hull = polyPath([[360, 1060], [900, 1060], [960, 990], [970, 1000], [920, 1120], [420, 1120], [330, 1040], [300, 1000], [318, 996]]);
  const mast = polyPath([[640, 1062], [652, 1062], [600, 640], [590, 640]]);
  const yard = polyPath([[330, 900], [880, 610], [888, 622], [338, 912]]);
  const sail = polyPath([[340, 906], [882, 618], [770, 1050], [460, 1050]]);
  const sshade = polyPath([[620, 760], [882, 618], [770, 1050], [640, 1050]]);
  const ox = 210, oy = 1150, oyster = new Path2D();
  blob(oyster, ox, oy, 150, 52, 0, Math.PI);                                     // lower bowl
  oyster.addPath(polyPath([[ox - 150, oy - 6], [ox - 120, oy - 120], [ox - 30, oy - 168], [ox + 70, oy - 160], [ox + 150, oy - 110], [ox + 150, oy - 6], [ox + 120, oy - 40], [ox - 120, oy - 40]]));   // raised lid
  const inner = new Path2D(); blob(inner, ox, oy, 122, 34, 0, Math.PI); inner.addPath(polyPath([[ox - 124, oy - 44], [ox - 100, oy - 112], [ox - 26, oy - 146], [ox + 62, oy - 138], [ox + 126, oy - 100], [ox + 126, oy - 44]]));
  const ridges = new Path2D(); for (let k = 0; k < 5; k++) ridges.addPath(polyPath([[ox - 100 + k * 50, oy - 50], [ox - 80 + k * 44, oy - 140 + Math.abs(k - 2) * 8], [ox - 74 + k * 44, oy - 140 + Math.abs(k - 2) * 8], [ox - 94 + k * 50, oy - 50]]));
  const pearlP = circlePath(ox, oy - 26, 42), glint = circlePath(ox - 14, oy - 40, 11);
  const rope = new Path2D(); for (const x of [470, 520, 790]) rope.rect(x, 1060, 4, 70);
  return compose(seed, { focus: [560, 920], parts: [
    ...sea(seed, 1070),
    { pull: 'land', ink: 'near', path: unionPath([hull, mast, yard, rope]), drift: [8, 0] },
    { pull: 'land', ink: 'glow', path: sail, drift: [8, 0] },
    { pull: 'land', ink: 'far', path: sshade, lit: 1, drift: [8, 0] },
    { pull: 'acc', ink: 'near', path: oyster },
    { pull: 'acc', ink: 'far', path: inner, lit: 1 },
    { pull: 'acc', ink: 'near', path: ridges, lit: 1 },
    { pull: 'acc', ink: 'paper', path: pearlP },
    { pull: 'acc', ink: 'glow', path: glint, lit: 1 },
  ] });
}
// 6 · 1958: an offshore platform, its derrick, and a gas flare that flickers
function oil(seed = 29) {
  const deck = new Path2D(); deck.rect(360, 960, 520, 40); deck.rect(400, 920, 160, 42);
  for (const x of [390, 520, 700, 840]) deck.addPath(polyPath([[x - 10, 1000], [x + 10, 1000], [x + 14, 1200], [x - 14, 1200]]));
  deck.addPath(polyPath([[380, 1060], [860, 1060], [860, 1072], [380, 1072]]));
  const derrick = polyPath([[600, 962], [760, 962], [690, 560], [670, 560]]);
  const lattice = new Path2D(); for (let y = 920; y > 600; y -= 54) { const w = lerp(80, 12, (920 - y) / 360), w2 = lerp(80, 12, (920 - y + 46) / 360); lattice.addPath(polyPath([[680 - w + 14, y], [680 + w - 14, y], [680, y - 40]])); lattice.addPath(polyPath([[680 - w2 + 8, y - 48], [680 + w2 - 8, y - 48], [680, y - 12]])); }
  const boom = polyPath([[870, 970], [960, 800], [972, 806], [882, 982]]);
  const flame1 = new Path2D(); flame1.addPath(polyPath([[950, 805], [980, 750], [968, 700], [1004, 640], [996, 720], [1014, 768], [980, 812]]));
  const flame2 = new Path2D(); flame2.addPath(polyPath([[950, 805], [972, 740], [994, 690], [986, 630], [1018, 700], [1008, 776], [980, 812]]));
  const glowF = new Path2D(); blob(glowF, 982, 755, 20, 38);
  const tanker = new Path2D(); tanker.addPath(polyPath([[60, 1100], [330, 1100], [310, 1130], [80, 1130]])); tanker.rect(250, 1068, 50, 34);
  return compose(seed, { focus: [660, 880], parts: [
    ...sea(seed, 1050),
    { pull: 'land', ink: 'near', path: unionPath([deck, derrick, boom]), knock: lattice },
    { pull: 'land', ink: 'far', path: tanker, drift: [30, 0] },
    { pull: 'acc', ink: 'far', path: (() => { const p = new Path2D(); for (let k = 0; k < 6; k++) blob(p, 1000 + k * 30, 640 - k * 52, 26 + k * 9, 18 + k * 6); return p; })(), drift: [26, -20] },
    { pull: 'acc', ink: 'sun', path: flame1, blink: 0 },
    { pull: 'acc', ink: 'sun', path: flame2, blink: 1 },
    { pull: 'acc', ink: 'glow', path: glowF, lit: 1 },
  ] });
}
// 7 · 1971: seven palms, one per emirate, each crown in its own ink of a split-fountain pull
function union(seed = 31) {
  const trunks = [], crowns = [];
  for (let k = 0; k < 7; k++) {
    const x = 90 + k * 150 - (k === 6 ? 40 : 0), h = 330 + (k % 2 ? -40 : 30) + (k === 3 ? 80 : 0);
    const p = new Path2D(); palm(p, x, 1180, h, 1.05, seed + k, false);
    const lean = (mulberry(seed + k)() - .5) * 40 * 1.05; trunks.push(polyPath([[x - 10, 1180], [x + 10, 1180], [x + lean + 5, 1180 - h], [x + lean - 5, 1180 - h]]));
    crowns.push({ pull: 'acc', ink: 'f' + k, path: p, sway: [16, 1.9 + .23 * k, k * 1.3] });
  }
  const ground = polyPath([[-BLEED, 1150], [AW + BLEED, 1150], [AW + BLEED, 1300], [-BLEED, 1300]]);
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'near', path: unionPath([...trunks, ground]) },
    ...crowns,
  ] });
}
// 8 · today: a night skyline, the needle tower, and a small probe beside a red Mars (the sun disc)
function today(seed = 37) {
  const r = mulberry(seed), blocks = new Path2D(), lits = [new Path2D(), new Path2D(), new Path2D()];
  let x = -BLEED;
  while (x < AW + BLEED) {
    const w = 60 + r() * 80, h = 140 + r() * 300, y = GROUND - h;
    if (!(x > 810 && x < 950)) {
      blocks.rect(x, y, w - 6, h + 20);
      for (let wy = y + 16; wy < GROUND - 16; wy += 24) for (let wx = x + 8; wx < x + w - 16; wx += 16) if (r() < .34) lits[Math.floor(r() * 3)].rect(wx, wy, 8, 12);
    }
    x += w;
  }
  // the needle tower: stepped setbacks tapering to a spire
  const tx = 880, steps = [[150, 1180, 1040], [120, 1040, 880], [96, 880, 720], [72, 720, 560], [50, 560, 430], [30, 430, 340]];
  const tower = new Path2D();
  for (const [w, y0, y1] of steps) tower.addPath(polyPath([[tx - w / 2, y0], [tx + w / 2, y0], [tx + w / 2 - 8, y1], [tx - w / 2 + 8, y1]]));
  tower.addPath(polyPath([[tx - 8, 342], [tx + 8, 342], [tx + 1.5, 200], [tx - 1.5, 200]]));
  const tlit = new Path2D(); for (const [w, y0, y1] of steps) tlit.addPath(polyPath([[tx + 2, y0], [tx + w / 2, y0], [tx + w / 2 - 8, y1], [tx + 2, y1]]));
  const tdash = new Path2D(); for (let y = 1160; y > 360; y -= 26) tdash.rect(tx - 3, y, 6, 12);
  const probe = new Path2D(); probe.rect(582, 492, 26, 20); probe.rect(538, 497, 40, 9); probe.rect(612, 497, 40, 9); blob(probe, 595, 488, 14, 6, Math.PI, Math.PI * 2);
  const stars = new Path2D(); for (let i = 0; i < 30; i++) blob(stars, r() * AW, 110 + r() * 600, 2.4, 2.4);
  return compose(seed, { focus: [760, 820], parts: [
    { pull: 'land', ink: 'paper', path: stars },
    { pull: 'land', ink: 'mid', path: blocks },
    ...lits.map((p, k) => ({ pull: 'land', ink: 'glow', path: p, lit: 1, blink: k })),
    { pull: 'land', ink: 'near', path: tower },
    { pull: 'land', ink: 'far', path: tlit, lit: 1 },
    { pull: 'acc', ink: 'glow', path: tdash, lit: 1 },
    { pull: 'acc', ink: 'paper', path: probe, drift: [-6, -3] },
    { pull: 'acc', ink: 'glow', path: (() => { const p = new Path2D(); p.rect(1150, 300, 46, 7); p.addPath(polyPath([[1166, 300], [1180, 300], [1168, 280], [1160, 280]])); p.addPath(polyPath([[1166, 307], [1180, 307], [1168, 324], [1160, 324]])); return p; })(), drift: [-95, -12] },
  ] });
}

export const SCENES = { magan, mosque, carrack, fort, pearl, oil, union, today };
