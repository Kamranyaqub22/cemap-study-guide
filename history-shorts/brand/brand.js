// Channel art in the series' silkscreen style: ?which=logo (800×800 emblem, no text) or ?which=banner (2560×1440).
import { makeTextures, paperSheet, ink, inkFinish, polyPath, circlePath, ringPath, rectPath, unionPath, bandSteps } from './silk.js';
const Q = new URLSearchParams(location.search), which = Q.get('which') || 'logo';
const W = innerWidth, H = innerHeight, cv = document.getElementById('c'); cv.width = W; cv.height = H;
const ctx = cv.getContext('2d'), PAPER = '#F3EAD8', T = makeTextures(PAPER, 7);
const P = { sky1: '#F6CD98', sky2: '#E9876A', far: '#2E5E73', near: '#17223A', sun: '#D8432B', glow: '#F7D9A8' };
await Promise.all(['900 40px BigShoulders', '600 40px Outfit'].map(f => document.fonts.load(f, 'A1')));

// a row of world landmarks (pagoda, pyramid, dome and minaret, temple columns, needle tower) standing on a ground line
function skyline(x0, w, base, h) {
  const p = new Path2D(), u = w / 10;
  const tri = (cx, bw, th) => p.addPath(polyPath([[cx - bw / 2, base], [cx + bw / 2, base], [cx, base - th]]));
  // pyramid
  tri(x0 + u * 1.2, u * 2.4, h * .62);
  // pagoda
  const pc = x0 + u * 3.3; let y = base;
  for (let k = 0; k < 4; k++) { const bw = u * (1.2 - k * .2), bh = h * .1; p.rect(pc - bw * .3, y - bh, bw * .6, bh); y -= bh; p.addPath(polyPath([[pc - bw * .7, y + 4], [pc + bw * .7, y + 4], [pc + bw * .4, y - h * .06], [pc - bw * .4, y - h * .06]])); y -= h * .06; }
  p.rect(pc - 3, y - h * .16, 6, h * .16);
  // dome and minaret
  const dc = x0 + u * 5.2; p.rect(dc - u * .8, base - h * .3, u * 1.6, h * .3); p.moveTo(dc - u * .55, base - h * .3); p.ellipse(dc, base - h * .3, u * .55, h * .24, 0, Math.PI, Math.PI * 2); p.closePath();
  p.rect(dc + u * .95, base - h * .72, u * .22, h * .72); p.addPath(polyPath([[dc + u * .9, base - h * .72], [dc + u * 1.22, base - h * .72], [dc + u * 1.06, base - h * .84]]));
  // temple with columns
  const tc = x0 + u * 7.2; p.addPath(polyPath([[tc - u * 1.1, base - h * .36], [tc + u * 1.1, base - h * .36], [tc, base - h * .5]])); p.rect(tc - u * 1.1, base - h * .36, u * 2.2, h * .05);
  for (let k = 0; k < 5; k++) p.rect(tc - u * .95 + k * u * .45, base - h * .31, u * .18, h * .27); p.rect(tc - u * 1.15, base - h * .04, u * 2.3, h * .04);
  // needle tower
  const nc = x0 + u * 9.1; p.addPath(polyPath([[nc - u * .35, base], [nc + u * .35, base], [nc + u * .08, base - h * .8], [nc, base - h * 1.0], [nc - u * .08, base - h * .8]]));
  return p;
}
const reg = (k) => [Math.sin(k * 7.1) * 1.6, Math.cos(k * 3.3) * 1.6];
function scene(x, y, w, h, sun, sr, ground, skyH) {
  paperSheet(ctx, T, x, y, w, h, .6);
  const knock = unionPath([circlePath(sun[0], sun[1], sr + sr * .09), ringPath(sun[0], sun[1], sr * 1.28, sr * 1.37), ringPath(sun[0], sun[1], sr * 1.6, sr * 1.66)]);
  ink(ctx, { path: rectPath(x, y, w, h), knock }, { color: P.sky1, reg: reg(1), sheen: 1 });
  const b = new Path2D(); b.rect(x, y, w, skyH * .12); b.addPath(bandSteps(x, w, y + skyH * .1, y + skyH, 7, 6)); ink(ctx, { path: b, knock }, { color: P.sky2, reg: reg(2), sheen: 1 });
  ink(ctx, { path: circlePath(sun[0], sun[1], sr) }, { color: P.sun, reg: reg(3), sheen: 1, trap: 1 });
  return knock;
}
window.READY = false; window.DUR = 1;
window.render = () => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (which === 'logo') {                     // profile picture: shown as a circle, so everything sits inside the central 82 %
    scene(0, 0, W, H, [W * .5, H * .4], W * .2, H * .72, H * .66);
    ink(ctx, { path: skyline(W * .1, W * .8, H * .74, H * .34) }, { color: P.near, reg: reg(4), sheen: 1, trap: 1 });
    ink(ctx, { path: rectPath(0, H * .735, W, H) }, { color: P.near, reg: reg(5), sheen: 1 });
    const dots = new Path2D(); for (let x = W * .14; x < W * .87; x += W * .045) { dots.moveTo(x + 5, H * .8); dots.arc(x, H * .8, 5, 0, 7); }
    ink(ctx, { path: dots }, { color: P.glow, reg: reg(6) });
    inkFinish(ctx, T, 0, 0, W, H, .6, 1);
  } else {                                    // banner: art across the full width; text inside the 1546×423 safe area in the middle
    scene(0, 0, W, H, [W * .5, H * .24], H * .1, H * .62, H * .6);
    ink(ctx, { path: skyline(W * .005, W * .19, H * .66, H * .3) }, { color: P.near, reg: reg(4), sheen: 1, trap: 1 });
    ink(ctx, { path: skyline(W * .805, W * .19, H * .66, H * .3) }, { color: P.near, reg: reg(7), sheen: 1, trap: 1 });
    ink(ctx, { path: rectPath(0, H * .655, W, H) }, { color: P.near, reg: reg(5), sheen: 1 });
    ink(ctx, { paint: (g) => { g.textAlign = 'center'; g.textBaseline = 'alphabetic'; let fs = 200; g.letterSpacing = '10px'; g.font = `900 ${fs}px BigShoulders`; while (g.measureText('HISTORY IN 60 SECONDS').width > 1440) { fs -= 4; g.font = `900 ${fs}px BigShoulders`; } g.fillText('HISTORY IN 60 SECONDS', W / 2, 800); } }, { color: P.near, reg: [1.4, -.8] });
    ink(ctx, { paint: (g) => { g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.font = `600 46px Outfit`; g.letterSpacing = '12px'; g.fillText('ONE COUNTRY · ONE MINUTE · EVERY DAY', W / 2, 895); } }, { color: P.sun, reg: [.8, .6] });
    inkFinish(ctx, T, 0, 0, W, H, .6, 1);
  }
};
window.READY = true;
