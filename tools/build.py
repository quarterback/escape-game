import pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'src'
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'index.html'
shell = (src / 'shell.html').read_text()
import base64, re
FONTS = [  # family names match the kits' font-family strings exactly
    ('Little Grandad Fat', 'little-grandad-fat.woff', 'normal', 'font/woff', 'woff'),
    ('Kurdis-Regular', 'kurdis-regular.woff2', 'normal', 'font/woff2', 'woff2'),
    ('Kurdis-Condensed', 'kurdis-condensed.woff2', 'normal', 'font/woff2', 'woff2'),
    ('Embro', 'embro-regular.woff', 'normal', 'font/woff', 'woff'),
    ('Embro', 'embro-bold.woff', 'bold', 'font/woff', 'woff'),
]
lic = (root / 'fonts' / 'LICENSES.md').read_text()
headers = re.findall(r'/\*.*?\*/', lic, re.S)  # the YouWorkForThem headers must stay visible in the CSS
faces = [headers[0] if headers else '', headers[1] if len(headers) > 1 else '']
css_fonts = []
for fam, fn, weight, mime, fmt in FONTS:
    b64 = base64.b64encode((root / 'fonts' / fn).read_bytes()).decode()
    if fam == 'Kurdis-Regular': css_fonts.append(faces[0])
    if fam == 'Kurdis-Condensed': css_fonts.append(faces[1])
    css_fonts.append(f"@font-face{{font-family:'{fam}';src:url(data:{mime};base64,{b64}) format('{fmt}');font-weight:{weight};font-style:normal;font-display:block}}")
shell = shell.replace('/*__FONTS__*/', '\n'.join(css_fonts))
parts = {'CSS': src / 'style.css', 'P5': root / 'vendor' / 'p5.min.js', 'DATA': src / 'data.js', 'SIM': src / 'sim.js', 'AUDIO': src / 'audio.js', 'RENDER': src / 'render.js', 'UI': src / 'ui.js'}
for k, p in parts.items():
    txt = p.read_text()
    assert '</script' not in txt.lower(), k
    shell = shell.replace('/*__%s__*/' % k, txt)
out.write_text(shell)
print(out, len(shell))
