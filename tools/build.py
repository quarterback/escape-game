import pathlib, sys
here = pathlib.Path(__file__).resolve().parent.parent/'src'
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else here.parent/'index.html'
shell = (here/'shell.html').read_text()
parts = {'CSS': here/'style.css', 'P5': here.parent/"vendor"/"p5.min.js", 'SIM': here/'sim.js', 'AUDIO': here/'audio.js', 'RENDER': here/'render.js', 'UI': here/'ui.js'}
for k, p in parts.items():
    txt = p.read_text()
    assert '</script' not in txt.lower(), k
    shell = shell.replace('/*__%s__*/' % k, txt)
out.write_text(shell)
print(out, len(shell))
