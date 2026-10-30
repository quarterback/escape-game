/* ============================================================
   CONTENT: the runtime side of the content package in content/coalition.
   Code asks for wording by a stable ID and passes the values the rules
   evaluated; it never writes player-facing prose itself. In the browser
   the build inlines the package as CONTENT_PKG; in Node it reads the files.
   Content.t(id, args)      plain text for a catalog entry
   Content.html(id, args)   escaped text with **bold** and blank-line paragraphs
   Content.marker(k, code, args)  an effect marker: { k, code, args, t }
   ============================================================ */
'use strict';
const Content = (() => {
  const P = (typeof CONTENT_PKG !== 'undefined') ? CONTENT_PKG : (() => {
    const fs = require('fs'), path = require('path'), dir = path.join(__dirname, '..', 'content', 'coalition');
    const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')), o = { manifest: m };
    for (const k in m.files) o[k] = JSON.parse(fs.readFileSync(path.join(dir, m.files[k]), 'utf8'));
    return o;
  })();
  const UI = {}, MK = {};
  for (const e of P.ui.entries) UI[e.id] = e;
  for (const e of P.markers.markers) MK[e.code] = e;
  const missing = [];
  const fill = (text, args) => String(text).replace(/\{(\w+)\}/g, (all, k) => (args && args[k] !== undefined && args[k] !== null) ? String(args[k]) : all);
  function t(id, args) { const e = UI[id]; if (!e) { missing.push(id); return id; } return fill(e.text, args); }
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // the only markup content may carry: **bold** and paragraphs separated by a blank line (rule C10)
  function rich(text) { return esc(text).split(/\n\s*\n/).map(p => `<p>${p.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</p>`).join(''); }
  function html(id, args) { const e = UI[id]; if (!e) { missing.push(id); return esc(id); } const a = {}; for (const k in args || {}) a[k] = args[k]; return rich(fill(e.text, a)); }
  function marker(k, code, args) { const e = MK[code]; if (!e) { missing.push(code); return { k, code, args: args || {}, t: code }; } return { k, code, args: args || {}, t: fill(e.text, args) }; }
  const has = (id) => !!UI[id];
  return { t, html, rich, marker, has, fill, esc, tutorials: P.tutorials, glossary: P.glossary, version: P.manifest ? P.manifest.version : '', missing };
})();
if (typeof module !== 'undefined') module.exports = Content;
