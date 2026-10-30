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
content_js = 'const CONTENT_PKG = ' + json.dumps(pkg, ensure_ascii=False) + ';\n' + (src / 'content.js').read_text()
parts = {'CONTENT': None, 'CSS': src / 'style.css', 'PIXI': root / 'vendor' / 'pixi.min.js', 'DATA': src / 'data.js', 'SIM': src / 'sim.js', 'TUTORIAL': src / 'tutorial.js', 'GOV': src / 'gov.js', 'AUDIO': src / 'audio.js', 'ART': src / 'art.js', 'RENDER': src / 'render.js', 'UI': src / 'ui.js'}
for k, p in parts.items():
    txt = content_js if k == 'CONTENT' else p.read_text()
    if k == 'PIXI': txt = re.sub(r'\n//# sourceMappingURL=\S+\s*$', '\n', txt)
    assert '</script' not in txt.lower(), k
    shell = shell.replace('/*__%s__*/' % k, txt)
out.write_text(shell)
# PWA: a manifest and a service worker beside index.html. The cache name carries a build stamp,
# so each build replaces the previous cache; old caches are deleted on activate.
import hashlib, json, time
stamp = hashlib.sha1(shell.encode()).hexdigest()[:10]
manifest = {'name': 'Coalition', 'short_name': 'Coalition', 'start_url': './', 'scope': './', 'display': 'standalone', 'orientation': 'portrait',
            'background_color': '#150F2E', 'theme_color': '#150F2E', 'description': 'Escape Valdória or run the government inquiry. A turn-based game about allies, pursuit and getting people to act.',
            'icons': [{'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png'}, {'src': 'icons/icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]}
(out.parent / 'manifest.webmanifest').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n')
sw = '''// Coalition service worker, build %s. Cache first; navigations answer with the cached page.
const CACHE = 'coalition-%s';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') { e.respondWith(caches.match('index.html').then(r => r || fetch(e.request))); return; }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
''' % (stamp, stamp)
(out.parent / 'sw.js').write_text(sw)
print(out, len(shell), 'build', stamp)
