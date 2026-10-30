#!/usr/bin/env python3
"""Draws the installed-app icons (home screen, desktop) from the game's own sprite art,
so the app icon is a character and the favicon stays the austral mark.
Reads the sprite rows and palette out of src/art.js through node, then scales them.
Writes icons/icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png.
Usage: python3 tools/make_icons.py [teresa|mateu]"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
WHO = sys.argv[1] if len(sys.argv) > 1 else "teresa"
BG = (21, 15, 46, 255)
spr = json.loads(subprocess.check_output(["node", "-e", f"""
const Art=require({json.dumps(str(ROOT / 'src' / 'art.js'))});
process.stdout.write(JSON.stringify({{rows: Art.rows({json.dumps(WHO)}, 'idle0'), pal: Art.palette(Art.ROLES[{json.dumps(WHO)}])}}));"""]))
rows, pal = spr["rows"], spr["pal"]
GW, GH = len(rows[0]), len(rows)

def hexrgb(h):
    h = h.lstrip("#"); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (255,)

def draw(size, pad):
    im = Image.new("RGBA", (size, size), BG)
    d = ImageDraw.Draw(im)
    cell = (size - 2 * pad) // GH            # the sprite is taller than wide; fit the height
    ox = (size - cell * GW) // 2
    oy = (size - cell * GH) // 2
    # a soft ground disc under the feet so the figure stands on something
    d.ellipse([ox - cell * 3, oy + cell * (GH - 1), ox + cell * (GW + 3), oy + cell * (GH + 1)], fill=(42, 33, 87, 255))
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch == "." or ch not in pal: continue
            d.rectangle([ox + x * cell, oy + y * cell, ox + (x + 1) * cell - 1, oy + (y + 1) * cell - 1], fill=hexrgb(pal[ch]))
    return im

out = ROOT / "icons"; out.mkdir(exist_ok=True)
draw(512, 44).save(out / "icon-512.png")
draw(192, 16).save(out / "icon-192.png")
draw(512, 100).save(out / "icon-maskable-512.png")   # safe zone: keep the figure inside the inner 80%
draw(180, 16).save(out / "apple-touch-icon.png")
print("icons written for", WHO)
