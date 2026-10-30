import pathlib, sys
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
]
css_fonts = []
for fam, fn, weight, mime, fmt, license_file in FONTS:
    if license_file:
        css_fonts.append((root / 'fonts' / license_file).read_text())
    b64 = base64.b64encode((root / 'fonts' / fn).read_bytes()).decode()
    css_fonts.append(f"@font-face{{font-family:'{fam}';src:url(data:{mime};base64,{b64}) format('{fmt}');font-weight:{weight};font-style:normal;font-display:swap}}")
shell = shell.replace('/*__FONTS__*/', '\n'.join(css_fonts))
parts = {'CSS': src / 'style.css', 'P5': root / 'vendor' / 'p5.min.js', 'DATA': src / 'data.js', 'SIM': src / 'sim.js', 'TUTORIAL': src / 'tutorial.js', 'AUDIO': src / 'audio.js', 'RENDER': src / 'render.js', 'UI': src / 'ui.js'}
for k, p in parts.items():
    txt = p.read_text()
    assert '</script' not in txt.lower(), k
    shell = shell.replace('/*__%s__*/' % k, txt)
out.write_text(shell)
print(out, len(shell))
