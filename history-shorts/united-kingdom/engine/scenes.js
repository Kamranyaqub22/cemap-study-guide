// scenes.js · UNITED KINGDOM — vertical print (1080×1920 art units, full bleed).
// Base: a soft island sky with rolling cloud banks (rain on the wet eras), a pale sun on the right, chalk downs and a
// patchwork of hedged fields with round hedgerow trees swaying. One era landmark per print.
// Parts: { pull, ink, path, knock?, cut?, lit?, drift?, blink?, sway?, seq?, loop?, spin?, swing? }.
// Landmarks are original stylised silhouettes from simple paths: not traced from photographs, no logos, no flags, no maps.
import { mulberry, polyPath, circlePath, ringPath, rectPath, unionPath, bandSteps } from './silk.js';

export const AW = 1080, AH = 1920, BLEED = 60;
export const GROUND = 1180;
export const BAND = [-BLEED, 1170, AW + 2 * BLEED, AH - 1170 + BLEED];
const FULL = () => rectPath(-BLEED, -BLEED, AW + 2 * BLEED, AH + 2 * BLEED);
const SUN = [790, 560], SR = 84;

function blob(p, x, y, rx, ry, a0 = 0, a1 = Math.PI * 2) { p.moveTo(x + rx * Math.cos(a0), y + ry * Math.sin(a0)); p.ellipse(x, y, rx, ry, 0, a0, a1); p.closePath(); }
const bird = (p, x, y, s) => p.addPath(polyPath([[x - 24 * s, y - 6 * s], [x - 11 * s, y - 10 * s], [x, y], [x + 11 * s, y - 10 * s], [x + 24 * s, y - 6 * s], [x + 11 * s, y - 5 * s], [x, y + 5 * s], [x - 11 * s, y - 5 * s]]));
const birds = (list) => { const p = new Path2D(); for (const [x, y, s] of list) bird(p, x, y, s); return p; };
function line(seed, y0, amp, n = 40) {
  const pts = []; for (let i = 0; i <= n; i++) { const x = -BLEED + (AW + 2 * BLEED) * i / n; pts.push([x, y0 + amp * Math.sin(x / 230 + seed) + amp * .4 * Math.sin(x / 97 + seed * 2.1)]); }
  return pts;
}
const yAt = (pts, x) => { for (let i = 0; i < pts.length - 1; i++) if (x <= pts[i + 1][0]) { const u = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]); return pts[i][1] + u * (pts[i + 1][1] - pts[i][1]); } return pts[pts.length - 1][1]; };
function water(seed, y0, ink = 'mid', y1 = 1180) {
  const glints = new Path2D(), r = mulberry(seed);
  for (let i = 0; i < 6; i++) { const y = y0 + 8 + i * 12; let x = -BLEED - 220 + r() * 60; while (x < AW + BLEED + 220) { const L = 40 + r() * 120; glints.rect(x, y, L, 3 + i * .5); x += L + 60 + r() * 110; } }
  return [{ pull: 'land', ink, path: rectPath(-BLEED, y0, AW + 2 * BLEED, y1 - y0) }, { pull: 'land', ink: 'glow', path: glints, lit: 1, drift: [-22, 0] }];
}
function arches(p, x0, x1, y, h, w, gap) {               // a row of round-headed openings
  for (let x = x0; x + w <= x1; x += w + gap) { p.rect(x, y + w / 2, w, h - w / 2); blob(p, x + w / 2, y + w / 2, w / 2, w / 2, Math.PI, Math.PI * 2); }
}
function crenel(p, x0, x1, y, mw = 22, gap = 16, h = 20) { for (let x = x0; x + mw <= x1 + .1; x += mw + gap) p.rect(x, y - h, mw, h + 1); }
function rain(seed) {                                    // slanted streaks, one tile of 240 px repeated; the part loops down the tile
  const p = new Path2D(), r = mulberry(seed + 9);
  for (let ty = -480; ty < 1200; ty += 240) for (let k = 0; k < 22; k++) {
    const x = -BLEED - 100 + r() * (AW + 2 * BLEED + 200), y = ty + r() * 240, L = 34 + r() * 30;
    p.addPath(polyPath([[x, y], [x + 2.4, y], [x + 2.4 - L * .28, y + L], [x - L * .28, y + L]]));
  }
  return { pull: 'acc', ink: 'far', path: p, lit: 1, loop: [-67, 240, 1.4] };
}

// ---------------- the base print ----------------
function base(seed, o = {}) {
  const sunKnock = unionPath([circlePath(SUN[0], SUN[1], SR + 9), ringPath(SUN[0], SUN[1], SR + 26, SR + 33)]);
  const sky2 = new Path2D(); sky2.rect(-BLEED, -BLEED, AW + 2 * BLEED, 120 + BLEED); sky2.addPath(bandSteps(-BLEED, AW + 2 * BLEED, 110, 800, 6, 14));
  const banks = [new Path2D(), new Path2D()], r = mulberry(seed + 3);
  for (let k = 0; k < 7; k++) {                          // rounded cloud banks (two speeds)
    const g = banks[k % 2], y = 460 + k * 58 + r() * 20, x = -700 + r() * 1600, w = 260 + r() * 260;
    g.rect(x, y, w, 16); for (let j = 0; j < 4; j++) blob(g, x + 40 + j * w / 4.5, y, 34 + r() * 26, 22 + r() * 16, Math.PI, Math.PI * 2);
  }
  const far = line(seed, 975, 22), farP = polyPath([[-BLEED, 1300], ...far, [AW + BLEED, 1300]]);
  const chalk = new Path2D(); for (let i = 2; i < far.length - 2; i += 7) { const [ax, ay] = far[i]; chalk.addPath(polyPath([[ax, ay + 10], [ax + 70, ay + 6], [ax + 64, ay + 24], [ax + 8, ay + 26]])); }
  const mid = line(seed + 1.7, 1062, 16), midP = polyPath([[-BLEED, 1300], ...mid, [AW + BLEED, 1300]]);
  const fields = new Path2D(), hedge = new Path2D(), rr = mulberry(seed + 5);
  let x = -BLEED; let k = 0;
  while (x < AW + BLEED) {                               // patchwork: alternate fields lit, a hedge between each
    const w = 120 + rr() * 140, y0 = yAt(mid, x) + 4;
    if (k % 2) fields.addPath(polyPath([[x, y0], [x + w, yAt(mid, x + w) + 4], [x + w - 30, 1180], [x - 30, 1180]]));
    hedge.addPath(polyPath([[x - 3, y0], [x + 3, y0], [x - 27, 1180], [x - 33, 1180]]));
    x += w; k++;
  }
  hedge.addPath(polyPath([...line(seed + 1.7, 1112, 10), ...line(seed + 1.7, 1117, 10).reverse()]));
  const trees = new Path2D(); for (const tx of o.trees || [60, 330, 470, 980]) { const ty = yAt(mid, tx); blob(trees, tx, ty - 26, 30, 28); trees.rect(tx - 4, ty - 8, 8, 12); }
  return {
    sky: [
      { pull: 'sky1', ink: 'sky1', path: FULL(), knock: sunKnock },
      { pull: 'sky2', ink: 'sky2', path: sky2 },
      { pull: 'sky2', ink: 'sky1', path: banks[0], drift: [-34, 0] },
      { pull: 'sky2', ink: 'glow', path: banks[1], drift: [-58, 0], lit: 1 },
      { pull: 'sun', ink: 'sun', path: circlePath(SUN[0], SUN[1], SR) },
    ],
    far: [{ pull: 'far', ink: 'far', path: farP }, { pull: 'far', ink: 'glow', path: chalk, lit: 1 }],
    mid: [
      { pull: 'mid', ink: 'mid', path: midP }, { pull: 'mid', ink: 'far', path: fields, lit: 1 },
      { pull: 'mid', ink: 'near', path: hedge, lit: 1 },
      { pull: 'mid', ink: 'near', path: trees, sway: [5, 1.2, .9] },
      { pull: 'mid', ink: 'near', path: birds([[-60, 430, .9], [-110, 400, .7], [-20, 380, .6]]), drift: [70, -8] },
      ...(o.rain ? [rain(seed)] : []),
    ],
  };
}
function bandPart() {
  const p = rectPath(...BAND);
  const knock = new Path2D(); for (let x = 30; x < AW - 20; x += 48) { knock.rect(x, BAND[1] + 16, 30, 6); knock.rect(x + 12, BAND[1] + 26, 6, 6); }   // a stitched hem
  return { pull: 'band', ink: 'near', path: p, knock };
}
function compose(seed, land, o = {}) {
  const b = base(seed, o);
  const parts = o.night ? [...b.sky.map(p => p.pull === 'sun' ? { ...p, ink: 'glow' } : p), ...b.far, ...b.mid.filter(p => p.ink !== 'far')] : [...b.sky, ...b.far, ...b.mid];   // night: the sun becomes the moon
  return { focus: land.focus, parts: [...parts, ...land.parts, bandPart()], depth: { sky1: 0, sky2: 0, sun: .1, far: .3, mid: .55, land: .85, acc: .85, band: 1 } };
}

// ---------------- the eras ----------------
// 1 · c. 2500 BC: a ring of standing stones and lintels on the plain, a shaft of sunrise, a crew hauling a stone on rollers
function stones(seed = 11) {
  const st = new Path2D(), sh = new Path2D(), lin = new Path2D();
  const up = (x, w, h, lean = 0) => { const top = 1150 - h; st.addPath(polyPath([[x - w / 2, 1152], [x - w / 2 + 4 + lean, top + 8], [x - w / 2 + 12 + lean, top], [x + w / 2 - 6 + lean, top + 4], [x + w / 2, 1152]])); sh.rect(x - w / 2 + 10, top + 24, 6, h - 40); return top; };
  const tri = (x, gap, w, h) => { const t1 = up(x - gap / 2 - w / 2, w, h), t2 = up(x + gap / 2 + w / 2, w, h + 6); lin.addPath(polyPath([[x - gap / 2 - w - 10, Math.min(t1, t2) + 2], [x + gap / 2 + w + 10, Math.min(t1, t2) - 4], [x + gap / 2 + w + 8, Math.min(t1, t2) - 44], [x - gap / 2 - w - 8, Math.min(t1, t2) - 38]])); };
  tri(540, 54, 74, 370);                                  // the great trilithon, the sun shining through its gap
  tri(300, 40, 62, 290); tri(790, 40, 62, 300);
  up(110, 60, 220, 3); up(185, 56, 210); lin.addPath(polyPath([[74, 934], [218, 944], [216, 912], [76, 902]]));   // the outer ring, lintels still on
  up(960, 60, 230, -3); up(1040, 56, 200);
  up(440, 40, 120, 6); up(660, 40, 110, -5);              // low bluestones inside
  const fallen = polyPath([[600, 1150], [790, 1146], [796, 1168], [596, 1172]]);
  const shaft = polyPath([[522, 800], [558, 800], [600, 1150], [480, 1150]]);   // dawn light through the great trilithon's gap
  const crew = new Path2D(); for (let k = 0; k < 5; k++) { const x = 60 + k * 36; blob(crew, x, 1112, 8, 9); crew.addPath(polyPath([[x - 8, 1120], [x + 8, 1120], [x + 14, 1160], [x - 2, 1160]])); }
  crew.addPath(polyPath([[230, 1128], [380, 1118], [384, 1150], [232, 1156]])); crew.rect(60, 1124, 172, 3);
  const rollers = new Path2D(); for (const x of [250, 300, 350]) blob(rollers, x, 1162, 9, 9);
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'far', path: unionPath([st, lin]) },
    { pull: 'land', ink: 'glow', path: shaft, lit: 1, sway: [6, .9, 0] },
    { pull: 'land', ink: 'near', path: sh, lit: 1 },
    { pull: 'land', ink: 'far', path: fallen },
    { pull: 'acc', ink: 'near', path: unionPath([crew, rollers]), drift: [34, 0] },
    { pull: 'acc', ink: 'near', path: birds([[1130, 640, .8], [1180, 600, .6], [1220, 660, .7]]), drift: [-90, 5] },
  ] }, { trees: [] });
}
// 2 · AD 122: the wall riding the crags, a milecastle with its gate, soldiers marching along the top, rain sweeping in
function wall(seed = 13) {
  const crag = polyPath([[-BLEED, 1180], [-BLEED, 1020], [140, 980], [260, 1000], [380, 930], [470, 900], [520, 960], [660, 1010], [800, 960], [920, 900], [AW + BLEED, 940], [AW + BLEED, 1180]]);
  const top = [[-BLEED, 990], [140, 950], [260, 970], [380, 900], [470, 870], [520, 930], [660, 980], [800, 930], [920, 870], [AW + BLEED, 905]];
  const wl = polyPath([...top, ...top.map(([x, y]) => [x, y + 46]).reverse()]);
  const merl = new Path2D(); for (let i = 0; i < top.length - 1; i++) { const [ax, ay] = top[i], [bx, by] = top[i + 1]; for (let x = ax; x < bx - 18; x += 34) { const y = ay + (by - ay) * (x - ax) / (bx - ax); merl.rect(x, y - 14, 18, 15); } }
  const fort = new Path2D(); fort.rect(640, 880, 150, 110); crenel(fort, 640, 790, 880); const gate = new Path2D(); blob(gate, 715, 960, 26, 26, Math.PI, Math.PI * 2); gate.rect(689, 960, 52, 32);
  const courses = new Path2D(); for (const y of [12, 26]) courses.addPath(polyPath([...top.map(([x, yy]) => [x, yy + y]), ...top.map(([x, yy]) => [x, yy + y + 3]).reverse()]));
  const men = new Path2D(); for (let k = 0; k < 5; k++) { const x = 150 + k * 46, y = 950 + 20 * (x - 140) / 120; blob(men, x, y - 50, 7, 8); men.rect(x - 7, y - 42, 14, 28); men.rect(x - 15, y - 44, 4, 46); blob(men, x + 10, y - 30, 7, 12); }
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'mid', path: crag },
    { pull: 'land', ink: 'far', path: unionPath([wl, merl]) },
    { pull: 'land', ink: 'near', path: courses, lit: 1 },
    { pull: 'land', ink: 'far', path: fort, knock: gate },
    { pull: 'land', ink: 'near', path: gate, lit: 1 },
    { pull: 'acc', ink: 'near', path: men, drift: [26, -4] },
  ] }, { rain: true, trees: [60, 1010] });
}
// 3 · 1066: a stone keep on its mound, a timber palisade, torches in the arrow slits, riders crossing the field
function castle(seed = 17) {
  const motte = polyPath([[180, 1170], [360, 1040], [720, 1040], [900, 1170]]);
  const keep = new Path2D(); keep.rect(380, 760, 320, 290); for (const x of [360, 660]) keep.rect(x, 730, 60, 320); crenel(keep, 380, 700, 760, 26, 18, 24); crenel(keep, 360, 420, 730, 16, 6, 18); crenel(keep, 660, 720, 730, 16, 6, 18);
  const slits = new Path2D(); for (const [x, y] of [[450, 820], [530, 820], [610, 820], [450, 920], [610, 920], [383, 800], [683, 800]]) slits.rect(x, y, 12, 40);
  const door = new Path2D(); blob(door, 540, 990, 34, 34, Math.PI, Math.PI * 2); door.rect(506, 990, 68, 60);
  const pal = new Path2D(); for (let x = -BLEED; x < AW + BLEED; x += 26) { if (x > 160 && x < 920) continue; pal.addPath(polyPath([[x, 1170], [x, 1080], [x + 10, 1066], [x + 20, 1080], [x + 20, 1170]])); }
  const torch = new Path2D(); for (const [x, y] of [[450, 820], [610, 920], [683, 800]]) torch.rect(x + 2, y + 6, 8, 28);
  const riders = new Path2D(); for (const x of [-20, 120]) { blob(riders, x, 1130, 44, 18); riders.rect(x - 34, 1140, 7, 30); riders.rect(x + 28, 1140, 7, 30); riders.addPath(polyPath([[x + 34, 1122], [x + 62, 1094], [x + 74, 1100], [x + 50, 1132]])); riders.rect(x - 8, 1080, 18, 38); blob(riders, x + 1, 1072, 9, 10); riders.rect(x + 14, 1030, 4, 80); }
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'mid', path: motte },
    { pull: 'land', ink: 'far', path: keep, knock: unionPath([slits, door]) },
    { pull: 'land', ink: 'near', path: unionPath([slits, door]), lit: 1 },
    { pull: 'acc', ink: 'sun', path: torch, blink: 0, lit: 1 },
    { pull: 'land', ink: 'near', path: pal },
    { pull: 'acc', ink: 'near', path: riders, drift: [120, 0] },
    { pull: 'acc', ink: 'near', path: birds([[880, 640, .8], [930, 610, .6], [830, 600, .7], [960, 660, .5]]), drift: [-60, -10] },
  ] }, { trees: [40, 1000] });
}
// 4 · 1599: a round timber playhouse with a thatched roof by the river, rooftops and spires behind, a wherry rowing past
function globe(seed = 19) {
  const city = new Path2D(), r = mulberry(seed);
  for (let x = -BLEED; x < AW + BLEED;) { const w = 60 + r() * 60, h = 40 + r() * 60; city.rect(x, 1010 - h, w - 4, h + 60); city.addPath(polyPath([[x - 2, 1010 - h], [x + w - 2, 1010 - h], [x + w / 2 - 2, 980 - h]])); x += w; }
  city.rect(860, 780, 50, 200); city.addPath(polyPath([[856, 782], [914, 782], [885, 640]]));
  const cx = 470, body = new Path2D(); body.rect(cx - 250, 860, 500, 190);
  const roof = polyPath([[cx - 270, 870], [cx - 230, 820], [cx + 230, 820], [cx + 270, 870]]);
  const hut = new Path2D(); hut.rect(cx - 50, 750, 100, 72); hut.addPath(polyPath([[cx - 62, 754], [cx + 62, 754], [cx, 706]]));
  const beams = new Path2D(); for (let x = cx - 240; x <= cx + 230; x += 54) beams.rect(x, 870, 10, 180); for (const y of [930, 990]) beams.rect(cx - 250, y, 500, 9);
  for (let x = cx - 240; x < cx + 230; x += 54) beams.addPath(polyPath([[x + 10, 880], [x + 16, 880], [x + 54, 926], [x + 48, 926]]));
  const thatch = new Path2D(); for (let x = cx - 250; x < cx + 260; x += 26) thatch.addPath(polyPath([[x, 868], [x + 4, 868], [x + 18, 826], [x + 14, 826]]));
  const boat = new Path2D(); boat.addPath(polyPath([[100, 1132], [300, 1136], [326, 1112], [312, 1146], [116, 1150], [86, 1122]])); blob(boat, 190, 1110, 10, 11); boat.rect(182, 1118, 16, 16); boat.addPath(polyPath([[150, 1150], [156, 1150], [236, 1100], [230, 1098]]));
  const smoke = new Path2D(); for (const x0 of [140, 760]) for (let k = 0; k < 4; k++) blob(smoke, x0 + k * 20, 900 - k * 34, 12 + k * 5, 9 + k * 3);
  return compose(seed, { focus: [500, 900], parts: [
    { pull: 'land', ink: 'far', path: city },
    { pull: 'acc', ink: 'glow', path: smoke, lit: 1, drift: [22, -26] },
    { pull: 'land', ink: 'paper', path: body },
    { pull: 'land', ink: 'near', path: beams, lit: 1 },
    { pull: 'land', ink: 'sun', path: unionPath([roof, hut]) },
    { pull: 'land', ink: 'near', path: thatch, lit: 1 },
    ...water(seed, 1060, 'mid', 1180),
    { pull: 'acc', ink: 'near', path: boat, drift: [70, 0] },
    { pull: 'acc', ink: 'near', path: birds([[1100, 620, .8], [1150, 590, .6], [1060, 580, .6]]), drift: [-100, 6] },
  ] }, { trees: [] });
}
// 5 · 1707: highland peaks on the left, rolling hills on the right, a stone bridge joining the banks, a coach crossing,
//          a thistle and a rose growing side by side in the foreground
function union(seed = 23) {
  const peaks = polyPath([[-BLEED, 1080], [-BLEED, 800], [80, 700], [180, 790], [300, 640], [430, 820], [520, 900], [520, 1080]]);
  const snow = new Path2D(); snow.addPath(polyPath([[60, 720], [80, 700], [104, 722], [90, 730]])); snow.addPath(polyPath([[270, 670], [300, 640], [334, 678], [300, 690]]));
  const br = new Path2D(), bh = new Path2D(); br.addPath(polyPath([[-BLEED, 1040], [200, 1016], [540, 1000], [880, 1016], [AW + BLEED, 1040], [AW + BLEED, 1110], [-BLEED, 1110]]));
  for (const x of [130, 400, 680, 950]) blob(bh, x, 1112, 110, 64, Math.PI, Math.PI * 2);
  const parapet = new Path2D(); parapet.addPath(polyPath([[-BLEED, 1030], [200, 1006], [540, 990], [880, 1006], [AW + BLEED, 1030], [AW + BLEED, 1040], [880, 1016], [540, 1000], [200, 1016], [-BLEED, 1040]]));
  const coach = new Path2D(); coach.rect(400, 930, 110, 62); coach.rect(392, 922, 126, 10); blob(coach, 420, 994, 16, 16); blob(coach, 490, 994, 16, 16);
  for (const x of [540, 610]) { blob(coach, x, 966, 30, 14); coach.rect(x - 22, 972, 6, 24); coach.rect(x + 16, 972, 6, 24); coach.addPath(polyPath([[x + 22, 960], [x + 40, 940], [x + 48, 946], [x + 32, 968]])); }
  const cwin = new Path2D(); cwin.rect(416, 944, 30, 24); cwin.rect(462, 944, 30, 24);
  const stems = new Path2D(); stems.addPath(polyPath([[150, 1170], [158, 1170], [166, 1080], [160, 1080]])); stems.addPath(polyPath([[900, 1170], [908, 1170], [916, 1090], [910, 1090]]));
  for (const [x, y, d] of [[160, 1130, -1], [162, 1110, 1], [910, 1140, 1], [912, 1120, -1]]) stems.addPath(polyPath([[x, y], [x + d * 50, y - 16], [x + d * 40, y - 2]]));
  const thistle = new Path2D(); blob(thistle, 163, 1066, 20, 18); thistle.addPath(polyPath([[143, 1060], [183, 1060], [163, 1084]]));
  const tuft = new Path2D(); for (let k = -3; k <= 3; k++) tuft.addPath(polyPath([[163 + k * 5 - 3, 1052], [163 + k * 5 + 3, 1052], [163 + k * 9, 1018]]));
  const rose = new Path2D(); blob(rose, 913, 1072, 26, 22); const petals = new Path2D(); blob(petals, 913, 1072, 14, 12); petals.addPath(polyPath([[893, 1062], [913, 1056], [933, 1062], [913, 1066]]));
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'far', ink: 'far', path: peaks }, { pull: 'far', ink: 'paper', path: snow, lit: 1 },
    ...water(seed, 1100, 'sky2', 1180),
    { pull: 'land', ink: 'near', path: br, knock: bh },
    { pull: 'land', ink: 'glow', path: parapet, lit: 1 },
    { pull: 'acc', ink: 'near', path: coach, knock: cwin, drift: [-150, 0] },
    { pull: 'acc', ink: 'mid', path: stems, sway: [5, 1.6, .3] },
    { pull: 'acc', ink: 'mid', path: thistle, sway: [6, 1.6, .3] },
    { pull: 'acc', ink: 'sun', path: tuft, sway: [6, 1.6, .3] },
    { pull: 'acc', ink: 'sun', path: rose, sway: [6, 1.5, 1.4] },
    { pull: 'acc', ink: 'glow', path: petals, sway: [6, 1.5, 1.4], lit: 1 },
    { pull: 'acc', ink: 'near', path: birds([[820, 640, .8], [870, 610, .6], [780, 600, .6]]), drift: [-70, -6] },
  ] }, { trees: [700, 1000] });
}
// 6 · 1830: a brick viaduct, a steam engine and carriages crossing it, mill chimneys smoking behind, rain on the town
function railway(seed = 29) {
  const mills = new Path2D(), r = mulberry(seed), lit = [new Path2D(), new Path2D()];
  for (let x = -BLEED; x < AW + BLEED;) { const w = 90 + r() * 80, h = 60 + r() * 80; mills.rect(x, 990 - h, w - 6, h + 30); for (let wy = 1000 - h; wy < 990; wy += 24) for (let wx = x + 10; wx < x + w - 20; wx += 20) if (r() < .45) lit[Math.floor(r() * 2)].rect(wx, wy, 8, 12); x += w; }
  const stacks = new Path2D(); for (const [x, h] of [[140, 300], [520, 340], [930, 280]]) stacks.addPath(polyPath([[x - 16, 990], [x + 16, 990], [x + 10, 990 - h], [x - 10, 990 - h]]));
  const smoke = new Path2D(); for (const [x, h] of [[140, 300], [520, 340], [930, 280]]) for (let k = 0; k < 5; k++) blob(smoke, x + 30 + k * 38, 990 - h - 20 - k * 22, 18 + k * 7, 12 + k * 4);
  const via = new Path2D(), vh = new Path2D(); via.rect(-BLEED, 1010, AW + 2 * BLEED, 170); arches(vh, -40, AW + 60, 1050, 140, 74, 30);
  const deck = rectPath(-BLEED, 1000, AW + 2 * BLEED, 12);
  const tr = new Path2D(), x0 = 120;
  tr.rect(x0, 920, 150, 64); tr.rect(x0 + 150, 900, 60, 84); tr.rect(x0 + 6, 860, 24, 64); tr.addPath(polyPath([[x0 - 2, 856], [x0 + 38, 856], [x0 + 32, 870], [x0 + 4, 870]]));
  for (const [cx, rr] of [[x0 + 50, 26], [x0 + 120, 30], [x0 + 185, 24]]) blob(tr, cx, 990, rr, rr);
  for (const cx of [-140, -330, -520]) { tr.rect(x0 + cx, 924, 170, 60); tr.rect(x0 + cx + 6, 916, 158, 10); blob(tr, x0 + cx + 30, 992, 18, 18); blob(tr, x0 + cx + 140, 992, 18, 18); tr.rect(x0 + cx + 170, 960, 20, 6); }
  const twin = new Path2D(); for (const cx of [-140, -330, -520]) for (let k = 0; k < 4; k++) twin.rect(x0 + cx + 14 + k * 40, 936, 24, 22);
  const puff = new Path2D(); for (let k = 0; k < 6; k++) blob(puff, x0 + 18 - k * 54, 830 - k * 18, 24 + k * 8, 18 + k * 5);
  return compose(seed, { focus: [540, 900], parts: [
    { pull: 'land', ink: 'far', path: unionPath([mills, stacks]) },
    ...lit.map((p, k) => ({ pull: 'land', ink: 'glow', path: p, lit: 1, blink: k })),
    { pull: 'acc', ink: 'glow', path: smoke, lit: 1, drift: [40, -24] },
    { pull: 'land', ink: 'sun', path: via, knock: vh },
    { pull: 'land', ink: 'near', path: deck },
    { pull: 'acc', ink: 'near', path: tr, knock: twin, drift: [130, 0] },
    { pull: 'acc', ink: 'paper', path: puff, lit: 1, drift: [100, -14] },
  ] }, { rain: true, trees: [] });
}
// 7 · 1940: night; a great dome stands above the smoke, searchlights swing, fires flicker in the skyline
function blitz(seed = 31) {
  const r = mulberry(seed), city = new Path2D(), fires = [new Path2D(), new Path2D(), new Path2D()];
  for (let x = -BLEED; x < AW + BLEED;) { const w = 50 + r() * 70, h = 60 + r() * 120; city.rect(x, 1070 - h, w - 4, h + 110); if (r() < .5) fires[Math.floor(r() * 3)].addPath(polyPath([[x + 6, 1072 - h], [x + w * .3, 1040 - h - r() * 30], [x + w * .5, 1060 - h], [x + w * .7, 1030 - h - r() * 30], [x + w - 10, 1072 - h]])); x += w; }
  const cx = 540, dome = new Path2D(); dome.rect(cx - 210, 920, 420, 150); dome.rect(cx - 140, 860, 280, 64); blob(dome, cx, 864, 130, 150, Math.PI, Math.PI * 2);
  dome.rect(cx - 24, 680, 48, 46); blob(dome, cx, 682, 26, 20, Math.PI, Math.PI * 2); dome.rect(cx - 4, 620, 8, 50); dome.rect(cx - 14, 640, 28, 6);
  for (const x of [cx - 190, cx + 130]) { dome.rect(x, 830, 60, 100); dome.addPath(polyPath([[x - 4, 832], [x + 64, 832], [x + 30, 770]])); }
  const cols = new Path2D(); for (let x = cx - 120; x <= cx + 110; x += 30) cols.rect(x, 870, 10, 50); for (let x = cx - 190; x < cx + 200; x += 40) cols.rect(x, 950, 14, 110);
  const beam = (bx, a) => { const p = new Path2D(), L = 600; p.addPath(polyPath([[bx - 4, 1090], [bx + 4, 1090], [bx + L * Math.sin(a + .022), 1090 - L * Math.cos(a + .022)], [bx + L * Math.sin(a - .022), 1090 - L * Math.cos(a - .022)]])); return p; };
  const smoke = new Path2D(); for (let k = 0; k < 9; k++) blob(smoke, -100 + k * 150, 1000 - (k % 3) * 40, 120, 46);
  const balloons = new Path2D(); for (const [x, y] of [[180, 520], [860, 460], [1180, 580]]) { blob(balloons, x, y, 50, 22); balloons.addPath(polyPath([[x - 50, y], [x - 80, y - 16], [x - 80, y + 16]])); balloons.rect(x, y + 20, 2, 300); }
  const stars = new Path2D(); for (let i = 0; i < 30; i++) blob(stars, r() * AW, 130 + r() * 600, 2.4, 2.4);
  return compose(seed, { focus: [540, 860], parts: [
    { pull: 'land', ink: 'paper', path: stars, blink: 1 },
    { pull: 'land', ink: 'glow', path: beam(200, .45), swing: [200, 1090, .35, .55, 0], lit: 1 },
    { pull: 'land', ink: 'glow', path: beam(880, -.4), swing: [880, 1090, .3, .7, 2.1], lit: 1 },
    { pull: 'land', ink: 'glow', path: beam(620, .1), swing: [620, 1090, .4, .45, 4.0], lit: 1 },
    { pull: 'land', ink: 'far', path: balloons, drift: [-14, 4] },
    { pull: 'land', ink: 'far', path: dome, knock: cols },
    { pull: 'land', ink: 'near', path: cols, lit: 1 },
    { pull: 'acc', ink: 'mid', path: smoke, lit: 1, drift: [-50, -10] },
    { pull: 'land', ink: 'near', path: city },
    ...fires.map((p, k) => ({ pull: 'acc', ink: k === 1 ? 'glow' : 'sun', path: p, blink: k, lit: 1 })),
  ] }, { night: true, trees: [] });
}
// 8 · today: a big observation wheel turning by the river, a Gothic clock tower, glass towers, a red bus crossing the bridge
function today(seed = 37) {
  const r = mulberry(seed), towers = new Path2D(), lit = [new Path2D(), new Path2D(), new Path2D()];
  for (const [x, w, h, tip] of [[560, 90, 360, 1], [700, 70, 260, 0], [800, 110, 420, 1], [930, 80, 300, 0], [-20, 90, 220, 0]]) {
    if (tip) towers.addPath(polyPath([[x, 1060 - h], [x + w, 1060 - h], [x + w / 2, 1060 - h - 90]])); towers.rect(x, 1060 - h, w, h);
    for (let wy = 1070 - h; wy < 1040; wy += 22) for (let wx = x + 8; wx < x + w - 12; wx += 16) if (r() < .35) lit[Math.floor(r() * 3)].rect(wx, wy, 7, 10);
  }
  const ct = new Path2D(); ct.rect(110, 760, 90, 300); ct.rect(100, 700, 110, 70); ct.addPath(polyPath([[100, 702], [210, 702], [155, 560]])); ct.rect(152, 520, 6, 44);
  const face = circlePath(155, 735, 30);
  const hands = new Path2D(); hands.rect(153, 712, 4, 24); hands.rect(155, 733, 20, 4);
  const W0 = [640, 800], WR = 250;
  const rim = unionPath([ringPath(W0[0], W0[1], WR - 10, WR), ringPath(W0[0], W0[1], 40, 52)]);
  const spokes = new Path2D(); for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; spokes.addPath(polyPath([[W0[0] + 46 * Math.cos(a - .04), W0[1] + 46 * Math.sin(a - .04)], [W0[0] + WR * Math.cos(a - .01), W0[1] + WR * Math.sin(a - .01)], [W0[0] + WR * Math.cos(a + .01), W0[1] + WR * Math.sin(a + .01)], [W0[0] + 46 * Math.cos(a + .04), W0[1] + 46 * Math.sin(a + .04)]])); }
  const pods = new Path2D(); for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8 + .2; blob(pods, W0[0] + (WR + 10) * Math.cos(a), W0[1] + (WR + 10) * Math.sin(a), 16, 11); }
  const legs = new Path2D(); legs.addPath(polyPath([[W0[0] - 6, W0[1]], [W0[0] + 6, W0[1]], [W0[0] - 90, 1070], [W0[0] - 108, 1070]])); legs.addPath(polyPath([[W0[0] - 6, W0[1]], [W0[0] + 6, W0[1]], [W0[0] + 108, 1070], [W0[0] + 90, 1070]]));
  const bridge = new Path2D(), bh = new Path2D(); bridge.rect(-BLEED, 1070, AW + 2 * BLEED, 34); for (const x of [160, 520, 880]) blob(bh, x, 1106, 140, 34, Math.PI, Math.PI * 2);
  const bus = new Path2D(); bus.rect(0, 990, 150, 80); blob(bus, 30, 1072, 13, 13); blob(bus, 120, 1072, 13, 13);
  const bwin = new Path2D(); for (let k = 0; k < 5; k++) { bwin.rect(10 + k * 28, 1000, 20, 18); bwin.rect(10 + k * 28, 1032, 20, 18); }
  const boat = new Path2D(); boat.addPath(polyPath([[700, 1140], [920, 1140], [940, 1120], [900, 1152], [714, 1154]])); boat.rect(740, 1116, 140, 24);
  return compose(seed, { focus: [560, 860], parts: [
    { pull: 'land', ink: 'mid', path: towers },
    ...lit.map((p, k) => ({ pull: 'land', ink: 'glow', path: p, lit: 1, blink: k })),
    { pull: 'land', ink: 'far', path: legs },
    { pull: 'land', ink: 'far', path: unionPath([rim, spokes]), spin: [W0[0], W0[1], .1] },
    { pull: 'acc', ink: 'glow', path: pods, spin: [W0[0], W0[1], .1] },
    { pull: 'land', ink: 'near', path: ct, knock: face },
    { pull: 'land', ink: 'glow', path: face },
    { pull: 'acc', ink: 'near', path: hands, spin: [155, 735, .5] },
    ...water(seed, 1100, 'sky2', 1180),
    { pull: 'land', ink: 'near', path: bridge, knock: bh },
    { pull: 'acc', ink: 'sun', path: bus, knock: bwin, drift: [150, 0] },
    { pull: 'acc', ink: 'near', path: boat, drift: [-40, 0] },
    { pull: 'acc', ink: 'near', path: birds([[1140, 600, .8], [1190, 570, .6], [1100, 560, .6]]), drift: [-110, 4] },
  ] }, { trees: [] });
}

export const SCENES = { stones, wall, castle, globe, union, railway, blitz, today };
