// film.js · "History in 60 Seconds" (silkscreen travel poster, vertical 1080×1920).
// One print of the country, re-inked era by era. Everything is driven by timeline.json (tools/timeline.py),
// which is built from the narration, so the picture, score, mix and subtitles share one clock.
import { makeTextures, paperSheet, ink, wipeRegion, wipeFront, squeegee, inkFinish, rectPath, clamp, lerp, hash, hex2rgb } from './engine/silk.js';
import { SCENES, AW, AH, BLEED, BAND } from './engine/scenes.js';

const W = 1080, H = 1920;
const FONT_D = 'BigShoulders', FONT_T = 'Outfit';
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const seg = (t, a, b) => clamp((t - a) / (b - a));

// ---------------- contrast-picked inks ----------------
const lum = (h) => { const c = hex2rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
function pickInk(bgs, cands, need = 3) { bgs = [].concat(bgs); for (const c of cands) if (c && bgs.every(b => contrast(c, b) >= need)) return c; return cands.filter(Boolean).sort((a, b) => Math.min(...bgs.map(x => contrast(b, x))) - Math.min(...bgs.map(x => contrast(a, x))))[0]; }
const R2 = (seed, amp) => [(hash(seed * 3.1 + 1) - .5) * 2 * amp, (hash(seed * 7.7 + 1.3) - .5) * 2 * amp];
function inverse(p) { const q = new Path2D(); q.rect(-1e4, -1e4, 2e4, 2e4); q.addPath(p); return q; }

let ctx, T, TL, ERAS, SC, PAPER, EV = [];
const ANG = -.1;                                         // squeegee travels slightly off-vertical

// ---------------- one print (art units) ----------------
// st = { prog(pull) 0..1, off(pull, depth) → [dx,dy], header 0..1, label 0..1, year 0..1, finish }
function drawPrint(c, i, st) {
  const E = ERAS[i], S = SC[i], pal = { ...E.pal, paper: PAPER, ...Object.fromEntries((E.fountain || []).map((c, k) => ['f' + k, c])) }, seed = 7 + i * 13;
  const prog = st.prog || (() => 1);
  paperSheet(c, T, -BLEED, -BLEED, AW + 2 * BLEED, AH + 2 * BLEED, .6);
  const box = [-300, -300, AW + 600, AH + 600];
  const region = (p, sd) => { if (p >= 1) return null; const m = new DOMMatrix().translate(AW / 2, AH / 2).rotate(ANG * 180 / Math.PI).translate(-AW / 2, -AH / 2); const o = new Path2D(); o.addPath(wipeRegion(box, 'down', p, sd, 34, 6), m); return o; };
  S.parts.forEach((pt, j) => {
    const p = prog(pt.pull); if (p <= 0) return;
    if (pt.seq != null && st.age != null && st.age < pt.seq) return;   // route stamped segment by segment
    if (pt.blink != null && st.age != null && (Math.floor(st.age * 2.5) + pt.blink) % 3 === 0) return;   // windows switch on and off
    const d = S.depth[pt.pull] ?? .5, off = st.off ? st.off(pt.pull, d) : [0, 0];
    c.save(); c.translate(off[0], off[1]);
    if (pt.drift) c.translate(pt.drift[0] * (st.age || 0), pt.drift[1] * (st.age || 0));   // clouds, birds, smoke keep moving
    if (pt.mov) c.translate(st.trainX || 0, 0);
    if (pt.sway) c.translate(pt.sway[0] * Math.sin((st.age || 0) * pt.sway[1] + pt.sway[2]), pt.sway[0] * .25 * Math.sin((st.age || 0) * pt.sway[1] * 1.3 + pt.sway[2]));   // fronds in the wind
    if (pt.cut) c.clip(inverse(pt.cut), 'evenodd');
    if (st.off && (off[0] || off[1]) && d >= .25 && !pt.lit) {          // loose stencil: paper sliver + thickness shadow
      c.save(); c.translate(0, -8 * d); c.globalAlpha = .22; c.fillStyle = '#140f14'; c.fill(pt.path); c.restore();
    }
    ink(c, pt, { color: pal[pt.ink], reg: R2(seed + j * 5, 2.2), clip: region(p, seed + j * 3), sheen: 1, trap: pt.lit ? 0 : 1, lw: 1.8 });
    c.restore();
  });
  // header: the country, printed into the sky
  if ((st.header ?? 1) > 0) {
    const hp = st.header ?? 1, col = pickInk([pal.sky1, pal.sky2], [pal.near, pal.mid, pal.sun, PAPER], 3);
    const clip = hp < 1 ? wipeRegion([60, 120, 960, 300], 'right', hp, 13, 40) : null;
    ink(c, { paint: (g) => {
      g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.font = `900 214px ${FONT_D}`; g.letterSpacing = '20px'; g.fillText(TL.country, AW / 2 + 10, 352);
      g.font = `700 38px ${FONT_T}`; g.letterSpacing = '12px'; g.fillText(TL.sub, AW / 2 + 6, 410);
    } }, { color: col, reg: R2(seed + 44, 1.4), clip });
  }
  // the band's text: era label and year (the band panel itself is a part of the scene)
  const lab = pickInk(pal.near, [pal.sky1, pal.glow, PAPER], 4.5), key = pickInk(pal.near, [pal.sun, pal.glow, pal.sky1], 3);
  const lp = st.label ?? 1, yp = st.year ?? 1;
  if (lp > 0) ink(c, { paint: (g) => { g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = `600 36px ${FONT_T}`; g.letterSpacing = '6px'; g.fillText(E.label, 64, 1252); } },
    { color: lab, reg: R2(seed + 51, 1.2), clip: lp < 1 ? wipeRegion([40, 1200, 1000, 70], 'right', lp, 31, 24) : null });
  if (yp > 0) ink(c, { paint: (g) => {
      g.textAlign = 'left'; g.textBaseline = 'alphabetic'; let fs = 158; g.font = `900 ${fs}px ${FONT_D}`; g.letterSpacing = '4px';
      while (g.measureText(E.year).width > 800 && fs > 70) { fs -= 4; g.font = `900 ${fs}px ${FONT_D}`; }
      g.fillText(E.year, 58, 1396); g.fillRect(64, 1412, 150, 7);
    } }, { color: key, reg: R2(seed + 57, 1.2), clip: yp < 1 ? wipeRegion([40, 1260, 1000, 170], 'right', yp, 37, 30) : null });
  if (st.finish !== false) inkFinish(c, T, -BLEED, -BLEED, AW + 2 * BLEED, AH + 2 * BLEED, .6, 1);
}

// the country and the handle, printed into the sky (art units; at zoom 1 these are also screen pixels)
function headerInk(c, i, hp = 1) {
  const pal = ERAS[i].pal, seed = 7 + i * 13, col = pickInk([pal.sky1, pal.sky2], [pal.near, pal.mid, pal.sun, PAPER], 3);
  ink(c, { paint: (g) => {
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = `900 214px ${FONT_D}`; g.letterSpacing = '20px'; g.fillText(TL.country, AW / 2 + 10, 352);
    g.font = `700 38px ${FONT_T}`; g.letterSpacing = '12px'; g.fillText(TL.sub, AW / 2 + 6, 410);
  } }, { color: col, reg: R2(seed + 44, 1.4), clip: hp < 1 ? wipeRegion([60, 120, 960, 300], 'right', hp, 13, 40) : null });
}
// ---------------- camera: zoom about an anchor inside the print, so the view never leaves it ----------------
let CAM = { z: 1, ax: 540, ay: 1290 };
function cam(z, ax, ay) { CAM = { z, ax, ay }; ctx.setTransform(z, 0, 0, z, ax - ax * z, ay - ay * z); }
const toScreen = (x, y) => [CAM.ax + (x - CAM.ax) * CAM.z, CAM.ay + (y - CAM.ay) * CAM.z];
// push in on one era, ease out on the next: z is continuous across every sweep
const ZK = [1.0, 1.05, 1.0, 1.05, 1.0, 1.08, 1.0, 1.0, 1.07];
function camEra(i, t) {
  const E = ERAS[i], t0 = E.sweep, z0 = ZK[i], z1 = ZK[i + 1];
  if (E.snap_t) {                                       // hold close while the layers float, then a fast pull-back on the snap
    const shake = t > E.snap_t ? Math.exp(-Math.pow((t - E.snap_t) / .12, 2)) : 0;
    return [lerp(z0, z1, eo(seg(t, E.snap_t, E.snap_t + .7))) + .05 * eio(seg(t, E.snap_t + .7, E.t1)), 0, shake];   // then a slow push while the palms sway
  }
  return [lerp(z0, z1, eio(seg(t, t0, E.t1))), 0, 0];
}

// ---------------- the screen over the print (opening only) ----------------
function mesh(lift) {
  if (lift >= 1) return;
  const y1 = AH + 40 - ss(lift) * (AH + 260);
  ctx.save();
  ctx.beginPath(); ctx.rect(-100, -100, AW + 200, y1 + 100); ctx.clip();
  ctx.fillStyle = 'rgba(236,214,128,.06)'; ctx.fillRect(-100, -100, AW + 200, AH + 200);
  ctx.strokeStyle = 'rgba(60,52,30,.13)'; ctx.lineWidth = .4; ctx.beginPath();
  for (let x = -60; x < AW + 60; x += 6) { ctx.moveTo(x, -60); ctx.lineTo(x, AH + 60); }
  for (let y = -60; y < AH + 60; y += 6) { ctx.moveTo(-60, y); ctx.lineTo(AW + 60, y); }
  ctx.stroke(); ctx.restore();
  if (lift > 0) {
    ctx.save();
    ctx.globalAlpha = .22; ctx.fillStyle = '#000'; ctx.fillRect(-100, y1 + 34, AW + 200, 26 + 30 * lift);
    ctx.globalAlpha = 1; ctx.fillStyle = '#B7B2A6'; ctx.fillRect(-100, y1, AW + 200, 34);
    ctx.fillStyle = '#D6D1C4'; ctx.fillRect(-100, y1, AW + 200, 5); ctx.fillStyle = '#8E897E'; ctx.fillRect(-100, y1 + 28, AW + 200, 6);
    ctx.fillStyle = '#3C6E9E'; ctx.fillRect(-100, y1 - 10, AW + 200, 10);
    ctx.restore();
  }
}
function tiltFront(p) {
  const BOX = [-300, -300, AW + 600, AH + 600], y = wipeFront(BOX, 'down', p, 34);
  const m = new DOMMatrix().translate(AW / 2, AH / 2).rotate(ANG * 180 / Math.PI).translate(-AW / 2, -AH / 2);
  const a = m.transformPoint(new DOMPoint(-300, y)), b = m.transformPoint(new DOMPoint(AW + 300, y)), d = m.transformPoint(new DOMPoint(0, 1)), o = m.transformPoint(new DOMPoint(0, 0));
  return { a: [a.x, a.y], b: [b.x, b.y], lead: [d.x - o.x, d.y - o.y] };
}

// ---------------- the opening and the first era ----------------
// ---------------- a re-ink sweep in screen space: behind the blade is the next era ----------------
const SW_BOX = [-500, -500, W + 1000, H + 1000];
const swM = () => new DOMMatrix().translate(W / 2, H / 2).rotate(ANG * 1.4 * 180 / Math.PI).translate(-W / 2, -H / 2);
function swRegion(p, seed) { const o = new Path2D(); o.addPath(wipeRegion(SW_BOX, 'down', p, seed, 50, 7), swM()); return o; }
function swFront(p) {
  const y = -500 - 50 + p * (H + 1000 + 100), m = swM();
  const a = m.transformPoint(new DOMPoint(-500, y)), b = m.transformPoint(new DOMPoint(W + 500, y)), d = m.transformPoint(new DOMPoint(0, 1)), o = m.transformPoint(new DOMPoint(0, 0));
  return { a: [a.x, a.y], b: [b.x, b.y], lead: [d.x - o.x, d.y - o.y] };
}
function eraAt(t) { let i = 0; for (let k = 1; k < ERAS.length; k++) if (t >= ERAS[k].sweep) i = k; return i; }
function drawEra(i, t, texts = true) {
  const E = ERAS[i];
  const [z, , shake] = camEra(i, t);
  cam(z, 540, 1290);
  if (shake) ctx.translate(0, 6 * shake * Math.sin(t * 90));
  let off = null;
  if (E.snap_t && t < E.snap_t)                          // loose layers float until the registration snap
    off = (pull, d) => pull === 'band' || pull === 'sky1' || pull === 'sky2' ? [0, 0] : [(hash(d * 11 + 1) - .5) * 40 * d + 10 * d * Math.sin(t * 2.1 + d * 5), -26 * d + 6 * Math.sin(t * 1.7 + d * 3)];
  const lp = texts ? seg(t, E.label_t, E.label_t + .25) : 0, yp = texts ? seg(t, E.year_t, E.year_t + .3) : 0;
  const trainX = E.snap_t ? (t < E.snap_t ? -620 * (1 - eo(seg(t, E.sweep, E.snap_t))) : 110 * Math.pow(t - E.snap_t, 1.3)) : 0;   // then accelerates away   // the train arrives on the snap
  drawPrint(ctx, i, { off, label: lp, year: yp, age: t - E.sweep, trainX });
}
let COLD = 0;                                           // index of the era shown in the cold open (the bullet train)
function cold(t) {
  const C = TL.cold;
  if (C && C.from) {                                    // a fast pull-back from a close-up (e.g. down the height of a tower)
    const [x, y, z0] = C.from, u = eo(seg(t, 0, C.dur));   // fast at first (the hook), settling as the narration starts
    const v = C.to ? eio(seg(t, 0, C.dur)) : 0, ax = C.to ? lerp(x, C.to[0], v) : x, ay = C.to ? lerp(y, C.to[1], v) : y;
    cam(C.to ? Math.exp(lerp(Math.log(z0), 0, eio(seg(t, C.dur * .45, C.dur)))) : Math.exp(lerp(Math.log(z0), 0, u)), ax, ay);
    drawPrint(ctx, COLD, { label: 0, year: 0, age: t + 3, header: 0 });
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); headerInk(ctx, COLD); ctx.restore();   // title pinned to the screen: whole from frame one
    return;
  }
  cam(lerp(1.0, ZK[0], eio(seg(t, 0, ERAS[0].sweep))), 540, 1290);
  drawPrint(ctx, COLD, { label: 0, year: 0, age: t + 3, trainX: -560 * (1 - eo(seg(t, 0, 2.2))) + 30 * t });
}
function eras(t) {
  const i = eraAt(t), E = ERAS[i];
  if (t < ERAS[0].sweep) { cold(t); return; }
  const p = seg(t, E.sweep, E.sweep + E.swdur);
  if (p >= 1) { drawEra(i, t); return; }
  if (i === 0) cold(t); else drawEra(i - 1, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clip(swRegion(p, 3 + i)); drawEra(i, t, false); ctx.restore();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const f = swFront(p), o = 22, pal = E.pal, beads = E.fountain || [pal.sky2, pal.far, pal.mid, pal.near];   // split fountain: one bead per ink
  const bd = beads.map((c, k) => ({ t0: k / beads.length + .004, t1: (k + 1) / beads.length, color: c }));
  squeegee(ctx, [f.a[0] + f.lead[0] * o, f.a[1] + f.lead[1] * o], [f.b[0] + f.lead[0] * o, f.b[1] + f.lead[1] * o], f.lead, { beads: bd, seed: i, roll: p * 40, scale: 1.6, handle: .35, shadow: .16 });
  ctx.restore();
}

// ---------------- subtitles: a printed strip inside the band (screen space) ----------------
function subtitles(t) {
  if (t >= TL.end.wall) return;
  const s = TL.subs.find(s => t >= s.t0 && t < s.t1); if (!s) return;
  const pal = ERAS[t < ERAS[0].sweep ? COLD : eraAt(t)].pal, col = pickInk(pal.near, [PAPER, pal.sky1], 7);
  const p = s.t0 <= 0 ? 1 : seg(t, s.t0, s.t0 + .12);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (t < ERAS[0].sweep)                                 // cold open: the art fills the frame, so print a strip under the words
    ink(ctx, { path: rectPath(-20, 1400, W + 40, 180) }, { color: pal.near, reg: [.6, -.4], clip: p < 1 ? wipeRegion([-20, 1380, W + 40, 220], 'right', p, 21, 24) : null, sheen: 1 });
  ink(ctx, { paint: (g) => {
    g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.letterSpacing = '0px';
    let fs = 60; g.font = `700 ${fs}px ${FONT_T}`;
    while (Math.max(...s.lines.map(l => g.measureText(l).width)) > 840 && fs > 44) { fs -= 2; g.font = `700 ${fs}px ${FONT_T}`; }
    s.lines.forEach((ln, k) => g.fillText(ln, 60, (s.lines.length > 1 ? 1476 : 1500) + k * (fs + 8)));
  } }, { color: col, reg: [.8, -.5], clip: p < 1 ? wipeRegion([40, 1420, 960, 150], 'right', p, 17, 24) : null });
}

// ---------------- the ending: every print on the drying line ----------------
const CELL = { w: 225, h: 400 }, GX = 18;
const cellXY = (k) => [63 + (k % 4) * (CELL.w + GX), 250 + Math.floor(k / 4) * (CELL.h + 70)];
const MINI = [];
function mini(k) {
  if (MINI[k]) return MINI[k];
  const cv = document.createElement('canvas'); cv.width = CELL.w * 2; cv.height = CELL.h * 2;
  const c = cv.getContext('2d'); c.scale(cv.width / AW, cv.height / AH);
  drawPrint(c, k, {});
  return (MINI[k] = cv);
}
function wall(t) {
  const N = ERAS.length, last = N - 1, E = TL.end, pal = ERAS[last].pal;
  const u = eio(seg(t, E.wall, E.wall + E.wall_dur));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#17151F'; ctx.fillRect(0, 0, W, H);                       // the print-shop wall
  ctx.save(); ctx.globalAlpha = .5; paperSheet(ctx, T, 0, 0, W, H, .9); ctx.restore();
  ctx.fillStyle = 'rgba(23,21,31,.86)'; ctx.fillRect(0, 0, W, H);
  for (const row of [0, 1]) { const y = cellXY(row * 4)[1] - 26; ctx.fillStyle = '#8E897E'; ctx.fillRect(20, y, W - 40, 3); }
  const s = CELL.w / AW, [cx, cy] = cellXY(last);
  for (let k = 0; k < N; k++) {
    const [x, y] = cellXY(k);
    if (k !== last || u >= 1) {
      ctx.save(); ctx.translate(x + 6, y + 8); ctx.globalAlpha = .35; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CELL.w, CELL.h); ctx.restore();
      const sw = .04 * Math.sin(t * 2.1 + k * 1.7);       // prints sway on the drying line
      ctx.save(); ctx.translate(x + CELL.w / 2, y - 20); ctx.rotate(sw); ctx.drawImage(mini(k), -CELL.w / 2, 20, CELL.w, CELL.h); ctx.restore();
    }
    if (k !== last || u > .9) for (const dx of [36, CELL.w - 50]) { ctx.fillStyle = '#B7B2A6'; ctx.fillRect(x + dx, y - 34, 14, 40); ctx.fillStyle = '#8E897E'; ctx.fillRect(x + dx, y - 8, 14, 6); }
  }
  if (u < 1) {                                                               // the last print shrinks onto the line
    const sc = Math.exp(lerp(0, Math.log(s), u)), k = (1 - sc) / (1 - s);
    ctx.save(); ctx.setTransform(sc, 0, 0, sc, cx * k, cy * k);
    drawPrint(ctx, last, {});
    ctx.restore();
  }
  if (TL.brand) {                                        // the channel name, printed above the drying line
    const bp = seg(t, E.wall + .05, E.wall + .4);
    if (bp > 0) ink(ctx, { paint: (g) => { g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.font = `600 40px ${FONT_T}`; g.letterSpacing = '14px'; g.fillText(TL.brand, 480, 196); } },
      { color: pickInk('#17151F', [PAPER], 7), reg: [.6, .4], clip: bp < 1 ? wipeRegion([60, 140, 900, 80], 'right', bp, 11, 24) : null });
  }
  // the card: printed straight onto the wall in two pulls
  const key = pickInk('#17151F', [pal.sun, pal.glow], 4.5), lo = pickInk('#17151F', [PAPER], 7);
  const p1 = seg(t, E.card, E.card + .35), p2 = seg(t, E.card + .1, E.card + .35);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const CX = 480;
  if (p1 > 0) ink(ctx, { paint: (g) => { g.textAlign = 'center'; g.textBaseline = 'alphabetic'; let fs = 150; g.letterSpacing = '6px'; g.font = `900 ${fs}px ${FONT_D}`;
      while (Math.max(...E.text.map(x => g.measureText(x).width)) > 780 && fs > 80) { fs -= 4; g.font = `900 ${fs}px ${FONT_D}`; }
      g.fillText(E.text[0], CX, 1310); g.fillText(E.text[1], CX, 1310 + fs); } },
    { color: key, reg: [1.2, -.6], clip: p1 < 1 ? wipeRegion([40, 1150, 1000, 340], 'right', p1, 9, 40) : null });
  if (p2 > 0) ink(ctx, { paint: (g) => { g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.font = `600 34px ${FONT_T}`; g.letterSpacing = '9px'; g.fillText('TELL US IN THE COMMENTS', CX, 1530); } },
    { color: lo, reg: [.8, .5], clip: p2 < 1 ? wipeRegion([40, 1490, 1000, 60], 'right', p2, 5, 24) : null });
}

// ---------------- setup, events, render, texts ----------------
export function setup(canvas, timeline) {
  TL = timeline; ERAS = TL.eras; PAPER = TL.paper;
  ctx = canvas.getContext('2d'); T = makeTextures(PAPER, 7);
  SC = ERAS.map((e, i) => SCENES[e.scene]());
  COLD = TL.cold ? ERAS.findIndex(e => e.scene === TL.cold.scene) : Math.max(0, ERAS.findIndex(e => e.snap_t));                       // cold open on the snap era (the bullet train)
  const ev = [], E = (t, type, o = {}) => ev.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  E(0, 'cold', { scene: ERAS[COLD].scene });
  ERAS.forEach((e, i) => {
    E(e.sweep, 'sweep', { dur: e.swdur, era: i, scene: e.scene });
    E(e.label_t, 'item', { k: 0 }); E(e.year_t, 'item', { k: 1, accent: 1 });
    if (e.snap_t) E(e.snap_t, 'snap');
    if (e.silence) E(e.silence_t ?? e.sweep - .35, 'silence', { until: ERAS[i + 1].sweep });
  });
  E(TL.end.wall, 'wall', { dur: TL.end.wall_dur }); E(TL.end.wall + TL.end.wall_dur - .05, 'clip');
  E(TL.end.card, 'card', { dur: .35 }); E(TL.end.card + .1, 'card', { dur: .25, small: 1 });
  for (const [id, t] of Object.entries(TL.vo)) E(t, 'vo', { id });
  ERAS.forEach((e, i) => E(e.sweep, 'era', { i, scene: e.scene, t1: e.t1 }));
  ev.sort((a, b) => a.t - b.t); EV = ev;
  return { dur: TL.dur, ev };
}
export function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (t >= TL.end.wall) { wall(t); return; }
  eras(t);
  subtitles(t);
}
export function texts(t) {
  const out = [];
  const box = (b) => { const a = toScreen(b[0], b[1]), c = toScreen(b[2], b[3]); return { x0: a[0], y0: a[1], x1: c[0], y1: c[1] }; };
  if (t >= TL.end.wall) {
    if (t >= TL.end.card + .35) out.push({ id: 'card', text: TL.end.text.join(' '), x0: 90, y0: 1180, x1: 870, y1: 1470 });
    if (TL.brand && t >= TL.end.wall + .4) out.push({ id: 'brand', text: TL.brand, x0: 160, y0: 150, x1: 800, y1: 205 });
    if (t >= TL.end.card + .35) out.push({ id: 'card2', text: 'TELL US IN THE COMMENTS', x0: 160, y0: 1500, x1: 800, y1: 1540 });
    return out;
  }
  render(t);                                            // sets the camera for this time
  const i = eraAt(t), E = ERAS[i];
  out.push({ id: 'header', text: TL.country + ' ' + TL.sub, ...box([100, 160, 980, 416]) });
  if (t < ERAS[0].sweep) return out;
  const inSweep = t < E.sweep + E.swdur;
  const lt = E.label_t + .25, yt = E.year_t + .3;
  if (!inSweep && t >= lt) out.push({ id: 'label', text: E.label, ...box([60, 1215, 1000, 1262]) });
  if (!inSweep && t >= yt) out.push({ id: 'year', text: E.year, ...box([56, 1250, 960, 1420]) });
  return out;
}
