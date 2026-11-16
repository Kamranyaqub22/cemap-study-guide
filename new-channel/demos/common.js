// Shared helpers for the three style demos (1080×1920, deterministic: every frame is a pure function of t).
const W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeOut = k => 1 - Math.pow(1 - clamp(k), 3);
const easeBack = k => { k = clamp(k); const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// a polyline from a parametric function f(u) → [x,y], u in 0..1
function sample(f, n = 60) { const p = []; for (let i = 0; i <= n; i++) p.push(f(i / n)); return p; }
function polyLen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
// draw the first fraction k of polyline p; returns the tip point
function partial(ctx, p, k) {
  k = clamp(k); if (k <= 0) return null;
  const total = polyLen(p), want = total * k; let acc = 0;
  ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length; i++) {
    const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    if (acc + d >= want) { const r = (want - acc) / (d || 1); const x = lerp(p[i - 1][0], p[i][0], r), y = lerp(p[i - 1][1], p[i][1], r); ctx.lineTo(x, y); ctx.stroke(); return [x, y]; }
    acc += d; ctx.lineTo(p[i][0], p[i][1]);
  }
  ctx.stroke(); return p[p.length - 1];
}
function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }

// captions: cfg.caps = [{t0,t1,text}] ; style = {font, size, fill, box, stroke, y}
function wrap(ctx, text, maxW) {
  const out = []; for (const para of text.split('|')) {
    let line = ''; for (const w of para.trim().split(/\s+/)) { const tr = line ? line + ' ' + w : w; if (ctx.measureText(tr).width > maxW && line) { out.push(line); line = w; } else line = tr; }
    if (line) out.push(line);
  } return out;
}
function captions(ctx, t, caps, st) {
  const c = caps.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const a = Math.min(prog(t, c.t0, c.t0 + .12), 1 - prog(t, c.t1 - .1, c.t1));
  const pop = 1 + .06 * (1 - easeOut(prog(t, c.t0, c.t0 + .18)));
  ctx.save(); ctx.globalAlpha = a; ctx.font = `${st.weight || 700} ${st.size}px ${st.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lines = wrap(ctx, c.text, st.maxW || 900), lh = st.size * 1.22, cx = 520, y0 = st.y - (lines.length - 1) * lh / 2;
  ctx.translate(cx, st.y); ctx.scale(pop, pop); ctx.translate(-cx, -st.y);
  if (st.box) { const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 56, h = lines.length * lh + 30; st.box(ctx, cx - w / 2, y0 - lh / 2 - 15, w, h); }
  lines.forEach((l, i) => { const y = y0 + i * lh; if (st.stroke) { ctx.lineWidth = st.strokeW || 10; ctx.lineJoin = 'round'; ctx.strokeStyle = st.stroke; ctx.strokeText(l, cx, y); } ctx.fillStyle = st.fill; ctx.fillText(l, cx, y); });
  ctx.restore();
}
