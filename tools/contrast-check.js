#!/usr/bin/env node
/* WCAG 2.2 AA contrast check on the built game, at phone and desktop widths.
   1. axe-core's color-contrast rule on every screen state it can reach (text on solid backgrounds).
   2. Text over pictures (the scene, the runway art, the title still): axe cannot judge these, so the text
      is hidden, the pixels behind each line are sampled from a screenshot, and contrast is measured
      against the worst 5% of the background (the lightest pixels for light text).
   Thresholds: 4.5:1 for normal text, 3:1 for large text (24px, or 18.66px bold).
   Setup once: cd tools && npm install.   Run: node tools/contrast-check.js [--json] */
'use strict';
const path = require('path'), fs = require('fs');
const req = (m) => { try { return require(m); } catch (e) { return require(path.join(__dirname, 'node_modules', m)); } };
const { chromium } = req('playwright'), { PNG } = req('pngjs');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js', { paths: [__dirname, path.join(__dirname, 'node_modules')] }), 'utf8');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');

const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// text that sits on a picture: selector of the text, and whether it is large
const OVER_ART = {
  title: ['.title-word', '.title-line', '.title-foot'], // the Start button has its own solid fill; axe checks it
  start: ['.art-text h2'],
  scene: ['#clockbox .clock', '#clockbox .left', '#goalbox .lbl', '#goalbox .txt', '#sosa .name', '#sosa .where', '#sosa .row2', '#expline'],
};

async function overArt(page, selectors) {
  const out = [];
  for (const sel of selectors) {
    const info = await page.evaluate((sel) => {
      const el = document.querySelector(sel); if (!el) return null;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden' || el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return null;
      const cs = getComputedStyle(el), px = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
      const m = cs.color.match(/[\d.]+/g).map(Number);
      return { x: r.x, y: r.y, w: r.width, h: r.height, color: m.slice(0, 3), large: px >= 24 || (bold && px >= 18.66), px };
    }, sel);
    if (!info) continue;
    // hide every text glyph on the page, keep backgrounds and shading, then sample behind this element
    await page.addStyleTag({ content: '*{color:transparent!important;text-shadow:none!important;-webkit-text-stroke:0!important} svg{visibility:hidden!important}' });
    const clip = { x: Math.max(0, info.x), y: Math.max(0, info.y), width: Math.max(1, info.w), height: Math.max(1, info.h) };
    const png = PNG.sync.read(await page.screenshot({ clip, timeout: 60000 }));
    await page.evaluate(() => { const s = document.querySelectorAll('style'); s[s.length - 1].remove(); });
    const ls = []; for (let i = 0; i < png.data.length; i += 4) ls.push([png.data[i], png.data[i + 1], png.data[i + 2]]);
    const sorted = ls.map(p => [lum(p), p]).sort((a, b) => a[0] - b[0]);
    const textLight = lum(info.color) > 0.18;
    const worst = textLight ? sorted[Math.floor(sorted.length * 0.95)][1] : sorted[Math.floor(sorted.length * 0.05)][1];
    const r = ratio(info.color, worst), need = info.large ? 3 : 4.5;
    out.push({ kind: 'over-art', target: sel, ratio: +r.toFixed(2), need, pass: r >= need, fg: info.color, worstBg: worst, px: info.px });
  }
  return out;
}
async function axe(page) {
  await page.addScriptTag({ content: AXE });
  const all = await page.evaluate(async () => { const r = await axe.run(document, { runOnly: ['color-contrast'] }); return { v: r.violations, inc: r.incomplete.flatMap(i => i.nodes.map(n => ({ target: n.target.join(' '), why: ((n.any[0] || {}).data || {}).messageKey || 'unknown', text: (n.html || '').replace(/<[^>]+>/g, '').trim().slice(0, 50) }))), passes: r.passes.reduce((s, p) => s + p.nodes.length, 0) }; });
  const res = all.v; const out = [];
  for (const n of all.inc) out.push({ kind: 'axe-incomplete', target: n.target, why: n.why, text: n.text, pass: true });
  out.push({ kind: 'axe-passes', count: all.passes, pass: true });
  for (const v of res) for (const n of v.nodes) { const d = (n.any[0] || {}).data || {}; out.push({ kind: 'axe', target: n.target.join(' '), ratio: d.contrastRatio, need: +String(d.expectedContrastRatio || '4.5').replace(':1', ''), pass: false, fg: d.fgColor, bg: d.bgColor, px: d.fontSize, text: (n.html || '').replace(/<[^>]+>/g, '').trim().slice(0, 60) }); }
  return out;
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const results = [];
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const page = await b.newPage({ viewport: { width: w, height: h } });
    const run = async (screen, fn) => { try { const r = await fn(); for (const x of r) results.push(Object.assign({ width: w, screen }, x)); } catch (e) { results.push({ width: w, screen, kind: 'error', target: String(e.message).slice(0, 120), pass: false }); } };
    const click = (sel) => page.evaluate((s) => document.querySelector(s).click(), sel);
    const idle = async () => { for (let i = 0; i < 100; i++) { if (!await page.evaluate(() => typeof Render !== 'undefined' && Render.busy())) break; await page.waitForTimeout(120); } await page.waitForTimeout(400); };
    await page.goto(URL); await page.waitForTimeout(2600);
    await run('title', async () => [...await axe(page), ...await overArt(page, OVER_ART.title)]);
    await click('#title-start'); await page.waitForSelector('#start:not([hidden])'); await page.waitForTimeout(600);
    await run('start', async () => [...await axe(page), ...await overArt(page, OVER_ART.start)]);
    await click('#start-credits'); await page.waitForTimeout(400);
    await run('credits', () => axe(page));
    await click('#credits-close'); await page.waitForTimeout(200);
    // the escape side: a run, every tab, every phase card the first rounds reach
    await page.evaluate(() => document.querySelector('#start-chars > :first-child').click()); await page.waitForTimeout(1800); await idle();
    await run('escape scene', () => overArt(page, OVER_ART.scene));
    for (let step = 0; step < 6; step++) {
      const ph = await page.evaluate(() => (document.querySelector('#phases li.now') || {}).textContent || '');
      for (const tab of ['here', 'phone', 'route', 'hand']) { if (w < 1000) await click(`#tabs [data-tab=${tab}]`); await page.waitForTimeout(150); await run(`escape ${ph} / ${w < 1000 ? tab : 'all panels'}`, () => axe(page)); if (w >= 1000) break; }
      if (w < 1000) await click('#tabs [data-tab=here]');
      const next = await page.evaluate(() => { const q = (s) => { const e = document.querySelector(s); return e && !e.disabled && e.offsetParent ? e : null; };
        const e = q('#phasecard .choice:not([disabled])') || q('#phasecard .next') || q('#inbox .opt:not([disabled])') || q('#approaches button.approach:not([disabled]):not(.no)') || q('#wait'); if (e) { e.click(); return true; } return false; });
      await page.waitForTimeout(300); await page.evaluate(() => { const c = document.querySelector('#approaches .commit'); if (c) c.click(); }); await idle(); if (!next) break;
    }
    // the help box and the guided run's coach
    await page.evaluate(() => document.getElementById('help').click()); await page.waitForTimeout(200); await run('help', () => axe(page)); await page.evaluate(() => document.getElementById('help').click());
    await click('#startscreen'); await page.waitForTimeout(400); await click('#start-tutorial'); await page.waitForTimeout(1800); await idle();
    await run('tutorial coach', () => axe(page));
    // the government side
    await click('#startscreen'); await page.waitForTimeout(400); await page.evaluate(() => document.querySelector('#start-chars > :nth-child(3)').click()); await page.waitForTimeout(1800); await idle();
    await run('government scene', () => overArt(page, OVER_ART.scene));
    for (const tab of ['here', 'phone', 'route', 'hand']) { if (w < 1000) await click(`#tabs [data-tab=${tab}]`); await page.waitForTimeout(150); await run(`government / ${w < 1000 ? tab : 'all panels'}`, () => axe(page)); if (w >= 1000) break; }
    // both ending screens, filled with sample text
    for (const cls of ['win', 'lose']) { await page.evaluate((cls) => { const o = document.getElementById('over'); o.hidden = false; o.className = cls; document.getElementById('overtitle').textContent = cls === 'win' ? 'Out' : 'House arrest'; document.getElementById('overtext').textContent = 'You sit by the window and watch the officers change shifts.'; }, cls); await page.waitForTimeout(200); await run(`ending ${cls}`, () => axe(page)); }
    await page.close();
  }
  await b.close();
  const fails = results.filter(r => !r.pass);
  if (process.argv.includes('--json')) { console.log(JSON.stringify(results, null, 1)); process.exit(fails.length ? 1 : 0); }
  const seen = new Set();
  for (const f of fails) { const k = `${f.width} ${f.target} ${f.ratio}`; if (seen.has(k)) continue; seen.add(k); console.log(`FAIL ${f.width}px ${f.screen} ${f.target}${f.text ? ` "${f.text}"` : ''}: ${f.ratio}:1, needs ${f.need}:1${f.fg ? ` (text ${f.fg} on ${f.bg || f.worstBg})` : ''}`); }
  const art = results.filter(r => r.kind === 'over-art');
  const inc = results.filter(r => r.kind === 'axe-incomplete'), incU = new Map(); for (const r of inc) incU.set(`${r.width} ${r.target}`, r);
  if (process.argv.includes('--incomplete')) for (const r of incU.values()) console.log(`UNSURE ${r.width}px ${r.screen} ${r.target} "${r.text}" (${r.why})`);
  console.log(`contrast-check: ${results.filter(r => r.kind === 'axe-passes').reduce((s, r) => s + r.count, 0)} text checks passed by axe, ${incU.size} that axe could not judge (see --incomplete);`);
  console.log(`contrast-check: ${seen.size} distinct failures; ${art.filter(r => r.pass).length}/${art.length} text-over-picture checks pass; ${results.filter(r => r.kind === 'error').length} errors`);
  process.exit(fails.length ? 1 : 0);
})();
