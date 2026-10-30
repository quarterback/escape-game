/* ============================================================
   Web Audio synth — no samples, no network.
   ============================================================ */
'use strict';
const Sfx = (() => {
  let ctx = null, muted = false, master = null;
  function ensure() {
    if (ctx) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.25; master.connect(ctx.destination);
    } catch (e) { ctx = null; return false; }
    return true;
  }
  function tone(freq, dur, type = 'square', vol = 1, when = 0, slide = 0) {
    if (muted || !ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime + when;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(dur, vol = 0.4, when = 0) {
    if (muted || !ensure()) return;
    const t0 = ctx.currentTime + when;
    const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(); g.gain.value = vol;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900;
    src.connect(f); f.connect(g); g.connect(master); src.start(t0);
  }
  return {
    unlock() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); },
    setMuted(m) { muted = m; }, isMuted() { return muted; },
    click()   { tone(880, 0.05, 'square', 0.5); },
    select()  { tone(660, 0.06, 'triangle', 0.6); tone(990, 0.08, 'triangle', 0.5, 0.05); },
    confirm() { tone(523, 0.08, 'square', 0.5); tone(784, 0.12, 'square', 0.5, 0.08); },
    deny()    { tone(180, 0.18, 'sawtooth', 0.5, 0, -60); },
    coin(up)  { if (up) { tone(1200, 0.05, 'square', 0.4); tone(1800, 0.1, 'square', 0.4, 0.05); } else tone(700, 0.08, 'square', 0.4, 0, -200); },
    heat(up)  { if (up) tone(240, 0.25, 'sawtooth', 0.45, 0, 90); else tone(420, 0.2, 'sine', 0.5, 0, -120); },
    step(i)   { noise(0.04, 0.25 + (i % 2) * 0.1); },
    tick()    { tone(1400, 0.03, 'square', 0.25); },
    work()    { tone(300, 0.04, 'square', 0.3); noise(0.03, 0.2, 0.04); },
    patrol()  { tone(110, 0.4, 'sawtooth', 0.6, 0, 20); tone(165, 0.4, 'sawtooth', 0.4, 0.05, 20); },
    arranged(){ [523, 659, 784].forEach((f, i) => tone(f, 0.12, 'triangle', 0.6, i * 0.07)); },
    whistle() { tone(900, 0.5, 'sine', 0.5, 0, 60); tone(1350, 0.5, 'sine', 0.3, 0.02, 60); },
    win()     { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.18, 'square', 0.5, i * 0.12)); },
    lose()    { [330, 311, 294, 220].forEach((f, i) => tone(f, 0.35, 'sawtooth', 0.5, i * 0.22)); },
  };
})();
