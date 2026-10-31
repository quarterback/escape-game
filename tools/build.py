import pathlib, sys
import shutil, subprocess
_root = pathlib.Path(__file__).resolve().parent.parent
# Every source file must parse before anything else runs.
if shutil.which('node'):
    for _f in sorted((_root / 'src').glob('*.js')):
        _c = subprocess.run(['node', '--check', str(_f)], capture_output=True, text=True)
        if _c.returncode != 0: sys.stderr.write(_c.stderr); raise SystemExit(f'build stopped: {_f.name} does not parse')
# The content check runs first; a content error stops the build (docs/content/patterns.md).
if shutil.which('node'):
    _r = subprocess.run(['node', str(_root / 'tools' / 'content-check.js')], capture_output=True, text=True)
    if _r.returncode != 0:
        sys.stdout.write(_r.stdout); sys.stderr.write(_r.stderr); raise SystemExit('build stopped: content check failed')
    print(_r.stdout.strip().splitlines()[-1])
else:
    print('warning: node not found; content check skipped')
root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'src'
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'index.html'
shell = (src / 'shell.html').read_text()
import base64, re
shell = shell.replace('/*__FAVICON__*/', base64.b64encode((root / 'og' / 'favicon.svg').read_bytes()).decode())
# Read licensed kits locally; embed every active face for offline play.
FONTS = [
    ('Little Grandad Fat', 'little-grandad-fat.woff', '400', 'font/woff', 'woff', None),
    ('GCNorthSans-Regular', 'gc-north-sans-regular.woff2', '400', 'font/woff2', 'woff2', 'gc-north-sans-regular.license.css'),
    ('GCNorthSans-SemiBold', 'gc-north-sans-semi-bold.woff2', '400', 'font/woff2', 'woff2', 'gc-north-sans-semi-bold.license.css'),
    ('Overbit-Regular', 'overbit-regular.woff2', '400', 'font/woff2', 'woff2', 'overbit-regular.license.css'),
    ('Overbit-Shadow', 'overbit-shadow.woff2', '400', 'font/woff2', 'woff2', 'overbit-shadow.license.css'),
    ('Overbit-ShadowBold', 'overbit-shadow-bold.woff2', '400', 'font/woff2', 'woff2', 'overbit-shadow-bold.license.css'),
]
css_fonts = []
for fam, fn, weight, mime, fmt, license_file in FONTS:
    if license_file:
        css_fonts.append((root / 'fonts' / license_file).read_text())
    b64 = base64.b64encode((root / 'fonts' / fn).read_bytes()).decode()
    css_fonts.append(f"@font-face{{font-family:'{fam}';src:url(data:{mime};base64,{b64}) format('{fmt}');font-weight:{weight};font-style:normal;font-display:swap}}")
shell = shell.replace('/*__FONTS__*/', '\n'.join(css_fonts))
# Content package: fill {{c:id}} (plain) and {{b:id}} (with **bold**) from the interface catalog,
# then inline the package for the runtime. An unknown ID stops the build (rule C02).
import json, html as _html
cdir = root / 'content' / 'coalition'
manifest = json.loads((cdir / 'manifest.json').read_text())
pkg = {'manifest': manifest}
for k, f in manifest['files'].items(): pkg[k] = json.loads((cdir / f).read_text())
catalog = {e['id']: e['text'] for e in pkg['ui']['entries']}
def _fill(m):
    kind, cid = m.group(1), m.group(2)
    if cid not in catalog: raise SystemExit(f'C02 unknown content id in shell.html: {cid}')
    txt = _html.escape(catalog[cid], quote=True)
    return re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', txt) if kind == 'b' else txt
shell = re.sub(r'\{\{([cb]):([a-z0-9_.]+)\}\}', _fill, shell)
# The credits screen, rendered from credits.json; the PixiJS MIT notice ships with it as its license asks.
cr = pkg['credits']; E = lambda s: _html.escape(s, quote=True)
def _item(it):
    name = f'<a href="{E(it["href"])}" rel="noopener" target="_blank">{E(it["name"])}</a>' if it.get('href') else E(it['name'])
    return f'<li><span class="role">{E(it["role"])}</span><span class="nm">{name}</span>' + (f'<span class="note">{E(it["note"])}</span>' if it.get('note') else '') + '</li>'
secs = ''.join(f'<section><h2>{E(s["heading"])}</h2>' + (f'<p class="snote">{E(s["note"])}</p>' if s.get('note') else '') + '<ul>' + ''.join(_item(i) for i in s['items']) + '</ul></section>' for s in cr['sections'])
pixi_notice = E((root / 'vendor' / 'pixi.LICENSE').read_text())
credits_html = (f'<div class="cbox"><h1 class="cword">{E(catalog["title.word"])}</h1><p class="clede" id="credits-title">{E(cr["lede"])}</p>{secs}'
    f'<section><h2>{E(cr["licenses"])}</h2><details><summary>PixiJS</summary><pre>{pixi_notice}</pre></details></section>'
    f'<button id="credits-close" class="primary">{E(cr["back"])}</button><p class="cclosing">{E(cr["closing"])}</p></div>')
shell = shell.replace('{{credits}}', credits_html)
content_js = 'const CONTENT_PKG = ' + json.dumps(pkg, ensure_ascii=False) + ';\n' + (src / 'content.js').read_text()
parts = {'CONTENT': None, 'CSS': src / 'style.css', 'PIXI': root / 'vendor' / 'pixi.min.js', 'DATA': src / 'data.js', 'SIM': src / 'sim.js', 'TUTORIAL': src / 'tutorial.js', 'GOV': src / 'gov.js', 'AUDIO': src / 'audio.js', 'ART': src / 'art.js', 'RENDER': src / 'render.js', 'UI': src / 'ui.js'}
attract = root / 'tools' / 'attract-runs.json'
shell = shell.replace('/*__ATTRACT__*/[]', attract.read_text().strip() if attract.exists() else '[]')
for k, p in parts.items():
    txt = content_js if k == 'CONTENT' else p.read_text()
    if k == 'PIXI': txt = re.sub(r'\n//# sourceMappingURL=\S+\s*$', '\n', txt)
    assert '</script' not in txt.lower(), k
    shell = shell.replace('/*__%s__*/' % k, txt)
out.write_text(shell)
about = (src / 'about.html').read_text()
about = about.replace('/*__FONTS__*/', '\n'.join(css_fonts)).replace('/*__FAVICON__*/', base64.b64encode((root / 'og' / 'favicon.svg').read_bytes()).decode())
about = re.sub(r'\{\{([cb]):([a-z0-9_.]+)\}\}', _fill, about)
(out.parent / 'about.html').write_text(about)
# PWA: a manifest and a service worker beside index.html. The cache name carries a build stamp,
# so each build replaces the previous cache; old caches are deleted on activate. The worker never
# rejects a request: a rejected respondWith is what Chrome shows as ERR_FAILED (owner, 2026-10-31).
import hashlib, json, time
stamp = hashlib.sha1(shell.encode()).hexdigest()[:10]
manifest = {'name': 'Coalition', 'short_name': 'Coalition', 'start_url': './', 'scope': './', 'display': 'standalone', 'orientation': 'portrait',
            'background_color': '#150F2E', 'theme_color': '#150F2E', 'description': 'Escape Valdória or run the government inquiry. A turn-based game about allies, pursuit and getting people to act.',
            'icons': [{'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png'}, {'src': 'icons/icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]}
(out.parent / 'manifest.webmanifest').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n')
sw = '''// Coalition service worker, build %s.
// Rules: a request never dies inside the worker. The page goes network first and falls back to the
// cached copy, then to a short offline note; other files go cache first and fall back to the network.
// Only the game page is treated as the app shell; about.html and anything else load as themselves.
const CACHE = 'coalition-%s';
const SHELL = ['index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
const OFFLINE = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Coalition</title><body style="margin:0;background:#150F2E;color:#F6F1FF;font:18px/1.5 Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px"><div><p>Coalition could not load. Check the connection and try again.</p><p><a href="./" style="color:#FFC93C">Reload</a></p></div></body>';
const isPage = (url) => { const p = new URL(url).pathname; return p.endsWith('/') || p.endsWith('/index.html'); };
self.addEventListener('install', (e) => {
  // the page first, then the rest one by one, so one missing icon never fails the install
  e.waitUntil(caches.open(CACHE).then(async (c) => { await c.add('index.html'); for (const f of SHELL.slice(1)) { try { await c.add(f); } catch (err) { /* served from the network when asked */ } } }));
});
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    if (!isPage(req.url)) { e.respondWith(fetch(req).catch(() => caches.match(req).then(r => r || new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })))); return; }
    e.respondWith(fetch(req).then((res) => { if (res && res.ok) caches.open(CACHE).then(c => c.put('index.html', res.clone())).catch(() => {}); return res; })
      .catch(() => caches.match('index.html').then(r => r || new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then((res) => { if (res && res.ok && new URL(req.url).origin === location.origin) caches.open(CACHE).then(c => c.put(req, res.clone())).catch(() => {}); return res; }))
    .catch(() => new Response('', { status: 503, statusText: 'offline' })));
});
''' % (stamp, stamp)
(out.parent / 'sw.js').write_text(sw)
print(out, len(shell), 'build', stamp)
