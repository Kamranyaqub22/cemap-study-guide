// node render.mjs <page.html> <cfg.json> <out.mp4> [stillTimes,comma]   → silent H.264 at 24 fps (or PNG stills)
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'child_process';
import fs from 'fs'; import path from 'path';
const [page_, cfgPath, out, stills] = process.argv.slice(2);
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')), fps = 24;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', e => console.error('PAGE', e.message)); await page.goto(page_.startsWith('http') ? page_ : 'file://' + path.resolve(page_)); await page.waitForFunction(() => window.draw && (window.ready !== false), null, { timeout: 30000 });
await page.evaluate(async c => { window.CFG = c; await document.fonts.load('700 50px Cinzel').catch(()=>{}); await document.fonts.load('50px "Alfa Slab One"').catch(()=>{}); await document.fonts.ready; }, cfg);
const grab = t => page.evaluate(t => { draw(t); return document.getElementById('c').toDataURL('image/jpeg', .94).split(',')[1]; }, t);
if (stills) { for (const t of stills.split(',')) fs.writeFileSync(`${out}_${t}.jpg`, Buffer.from(await grab(+t), 'base64')); await browser.close(); process.exit(0); }
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const n = Math.round(cfg.dur * fps);
for (let i = 0; i < n; i++) { const b = Buffer.from(await grab(i / fps), 'base64'); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close(); console.log('video', out, n, 'frames');
