#!/usr/bin/env node
/* Writes the credits theme the game composes (src/audio.js, seed 1991) as a standard MIDI file.
   node tools/credits-midi.js [out.mid]   Tracks: square lead, pulse arpeggio, bass, drums (channel 10). */
'use strict';
const fs = require('fs'), path = require('path');
const Sfx = new Function('window', fs.readFileSync(path.join(__dirname, '..', 'src', 'audio.js'), 'utf8') + ';return Sfx;')({});
const song = Sfx._creditsScore(), PPQ = 480, S = PPQ / 4, BPM = 132;
const vlq = (n) => { const b = [n & 0x7f]; while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80); return b; };
const u32 = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255], u16 = (n) => [(n >> 8) & 255, n & 255];
function track(events, head) { // events: [{ t, bytes }]
  events.sort((a, b) => a.t - b.t || a.order - b.order); let last = 0; const data = [...(head || [])];
  for (const e of events) { data.push(...vlq(e.t - last), ...e.bytes); last = e.t; }
  data.push(0, 0xff, 0x2f, 0); return [0x4d, 0x54, 0x72, 0x6b, ...u32(data.length), ...data];
}
const notes = (list, ch, vel, scale) => list.flatMap(x => [{ t: x.at * S, order: 1, bytes: [0x90 | ch, x.n, vel] }, { t: Math.round((x.at + x.len * scale) * S), order: 0, bytes: [0x80 | ch, x.n, 0] }]);
const prog = (ch, p) => [0, 0xc0 | ch, p];
const tempo = Math.round(60000000 / BPM);
const name = (s) => { const b = Buffer.from(s); return [0, 0xff, 0x03, b.length, ...b]; };
const tracks = [
  track([], [...name('Coalition credits'), 0, 0xff, 0x51, 3, (tempo >> 16) & 255, (tempo >> 8) & 255, tempo & 255, 0, 0xff, 0x58, 4, 4, 2, 24, 8]),
  track(notes(song.lead, 0, 100, 0.95), [...name('Lead (pulse 50%)'), ...prog(0, 80)]),
  track(notes(song.arp, 1, 60, 0.8), [...name('Arpeggio (pulse 25%)'), ...prog(1, 80)]),
  track(notes(song.bass, 2, 100, 0.9), [...name('Bass (triangle)'), ...prog(2, 38)]),
  track(song.drums.flatMap(d => { const n = { kick: 36, snare: 38, hat: 42 }[d.k]; return [{ t: d.at * S, order: 1, bytes: [0x99, n, d.k === 'hat' ? 50 : 100] }, { t: d.at * S + S / 2, order: 0, bytes: [0x89, n, 0] }]; }), name('Drums (noise)')),
];
const file = Buffer.from([0x4d, 0x54, 0x68, 0x64, ...u32(6), ...u16(1), ...u16(tracks.length), ...u16(PPQ), ...tracks.flat()]);
const out = process.argv[2] || 'coalition-credits.mid';
fs.writeFileSync(out, file); console.log(`${out}: ${song.steps / 16} bars at ${BPM} BPM, ${(song.steps * 60 / BPM / 4).toFixed(0)} seconds, ${file.length} bytes`);
