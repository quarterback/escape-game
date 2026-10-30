#!/usr/bin/env node
/* Records a run as video without anyone at the controls: opens the built game on a replay
   link, lets it play itself, and saves webm plus mp4 and gif when ffmpeg is present.
     node tools/record-run.js run.json [--size phone|desktop|square] [--speed MS] [--out DIR] [--name NAME] [--max SEC]
   run.json is what "Save this run" downloads, or tools/sample-run.js writes. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { chromium } = require('playwright');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const file = process.argv[2]; if (!file || file.startsWith('--')) { console.error('usage: node tools/record-run.js run.json [--size phone|desktop|square] [--speed MS] [--out DIR] [--name NAME] [--max SEC] [--cut N] [--gifsec SEC]'); process.exit(2); }
const rec = JSON.parse(fs.readFileSync(file, 'utf8'));
if (arg('cut')) { rec.actions = rec.actions.slice(0, +arg('cut')); rec.ended = null; } // stop early so a clip gives nothing away
const SIZES = { phone: { width: 390, height: 844 }, desktop: { width: 1280, height: 800 }, square: { width: 720, height: 720 } };
const size = SIZES[arg('size', 'phone')] || SIZES.phone, speed = +arg('speed', 900), outDir = path.resolve(arg('out', 'media')), maxSec = +arg('max', 300);
const name = arg('name', `coalition-${rec.kind}-${rec.seed}-${arg('size', 'phone')}`);
const b64u = (s) => Buffer.from(s, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const url = 'file://' + path.resolve(__dirname, '..', 'index.html') + `#replay=${b64u(JSON.stringify(rec))}&speed=${speed}`;
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1, recordVideo: { dir: outDir, size } });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(url); await page.waitForFunction(() => document.fonts.status === 'loaded');
  await page.waitForFunction(() => document.body.classList.contains('replay-done'), null, { timeout: maxSec * 1000 }).catch(() => console.error('record: replay did not finish within --max; saving what ran'));
  await page.waitForTimeout(3500);
  const vid = page.video(); await ctx.close(); await browser.close();
  const webm = path.join(outDir, name + '.webm'); fs.renameSync(await vid.path(), webm);
  console.log('wrote', webm, errs.length ? `(page errors: ${errs.join(' | ')})` : '');
  try { cp.execSync('ffmpeg -version', { stdio: 'ignore' }); } catch (e) { console.log('ffmpeg not found; webm only'); return; }
  const mp4 = path.join(outDir, name + '.mp4'), gif = path.join(outDir, name + '.gif');
  cp.execSync(`ffmpeg -y -loglevel error -i "${webm}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${mp4}"`);
  // the gif is a loop for feeds: the first --gifsec seconds (default 20) at 8 fps, 360 wide
  const gw = Math.min(size.width, 360), gsec = +arg('gifsec', 20);
  cp.execSync(`ffmpeg -y -loglevel error -t ${gsec} -i "${webm}" -vf "fps=8,scale=${gw}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" "${gif}"`);
  for (const f of [webm, mp4, gif]) console.log(path.basename(f), (fs.statSync(f).size / 1e6).toFixed(1) + ' MB');
})();
