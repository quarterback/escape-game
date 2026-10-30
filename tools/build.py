import pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'src'
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'index.html'
shell = (src / 'shell.html').read_text()
parts = {'CSS': src / 'style.css', 'P5': root / 'vendor' / 'p5.min.js', 'DATA': src / 'data.js', 'SIM': src / 'sim.js', 'AUDIO': src / 'audio.js', 'RENDER': src / 'render.js', 'UI': src / 'ui.js'}
for k, p in parts.items():
    txt = p.read_text()
    assert '</script' not in txt.lower(), k
    shell = shell.replace('/*__%s__*/' % k, txt)
out.write_text(shell)
print(out, len(shell))
