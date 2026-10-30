/* ============================================================
   Web Audio synth. No samples, no network.
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

  /* The theme. The owner's 80s synthwave engine: two detuned saws for the lead, a filtered saw bass
     that chugs in 16ths, a kick, a gated snare and an offbeat hat, 115 BPM in D minor. It runs on the
     game's context through its own gain so it can fade under the sound effects. */
  const THEME = (() => {
    const BPM = 115, step = 60 / BPM / 4;
    const N = { D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, C2: 65.41, C3: 130.81, D3: 146.83, F3: 174.61, G3: 196.0, A3: 220.0, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, C5: 523.25 };
    const lead = ['D4','','D4','','A4','','F4','','G4','','','F4','E4','','','', 'D4','','D4','','A4','','F4','','G4','','A4','','F4','','','', 'C4','','C4','','G4','','E4','','F4','','','E4','D4','','','', 'A3','','A3','','E4','','C4','','D4','','E4','','D4','','',''];
    const bass = ['D2','D2','','D2','D2','D2','','D2','D2','D2','','D2','D2','D2','','D2', 'F2','F2','','F2','F2','F2','','F2','F2','F2','','F2','F2','F2','','F2', 'C2','C2','','C2','C2','C2','','C2','C2','C2','','C2','C2','C2','','C2', 'A2','A2','','A2','A2','A2','','A2','A2','A2','','A2','G2','G2','F2','E2'];
    let out = null, timer = null, i = 0;
    function brass(freq, t, dur) {
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o1.type = o2.type = 'sawtooth'; o1.frequency.setValueAtTime(freq, t); o2.frequency.setValueAtTime(freq * 1.006, t);
      f.type = 'lowpass'; f.frequency.setValueAtTime(800, t); f.frequency.exponentialRampToValueAtTime(2200, t + 0.04); f.frequency.exponentialRampToValueAtTime(700, t + dur);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.08, t + 0.1); g.gain.setValueAtTime(0.08, t + dur - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(out); o1.start(t); o2.start(t); o1.stop(t + dur + 0.1); o2.stop(t + dur + 0.1);
    }
    function bassNote(freq, t) {
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(freq, t);
      f.type = 'lowpass'; f.frequency.setValueAtTime(350, t); f.frequency.exponentialRampToValueAtTime(120, t + 0.08);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.28, t + 0.01); g.gain.exponentialRampToValueAtTime(0.15, t + 0.07); g.gain.setValueAtTime(0.15, t + 0.09); g.gain.linearRampToValueAtTime(0.0001, t + 0.11);
      o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + 0.12);
    }
    function drum(kind, t) {
      if (kind === 'kick') { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); g.gain.setValueAtTime(0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.16); return; }
      const n = Math.floor(ctx.sampleRate * 0.25), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0); for (let k = 0; k < n; k++) d[k] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf; const f = ctx.createBiquadFilter(), g = ctx.createGain();
      if (kind === 'snare') { f.type = 'bandpass'; f.frequency.setValueAtTime(1100, t); g.gain.setValueAtTime(0.35, t); g.gain.linearRampToValueAtTime(0.25, t + 0.1); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18); }
      else { f.type = 'highpass'; f.frequency.setValueAtTime(7000, t); g.gain.setValueAtTime(0.04, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04); }
      src.connect(f); f.connect(g); g.connect(out); src.start(t);
    }
    function tick() {
      if (muted) { i++; return; }
      const t = ctx.currentTime + 0.03, k = i % lead.length, b = i % 16;
      if (lead[k]) brass(N[lead[k]], t, step * 3);
      if (bass[k]) bassNote(N[bass[k]], t);
      if (b % 4 === 0) drum('kick', t); if (b === 4 || b === 12) drum('snare', t); if (b % 2 === 1) drum('hihat', t);
      i++;
    }
    function play() {
      if (timer || !ensure()) return; if (ctx.state === 'suspended') ctx.resume();
      out = ctx.createGain(); out.gain.setValueAtTime(0.0001, ctx.currentTime); out.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 1.5); out.connect(master);
      i = 0; timer = setInterval(tick, step * 1000);
    }
    function stop(fade = 1.2) {
      if (!timer) return; clearInterval(timer); timer = null;
      const o = out; o.gain.cancelScheduledValues(ctx.currentTime); o.gain.setValueAtTime(Math.max(0.0001, o.gain.value), ctx.currentTime); o.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + fade);
      setTimeout(() => o.disconnect(), fade * 1000 + 200);
    }
    return { play, stop, playing: () => !!timer };
  })();
  return {
    theme(on) { on ? THEME.play() : THEME.stop(); }, themePlaying() { return THEME.playing(); },
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
    ring()    { tone(1200, 0.08, 'sine', 0.4); tone(1500, 0.08, 'sine', 0.4, 0.1); tone(1200, 0.08, 'sine', 0.3, 0.25); tone(1500, 0.08, 'sine', 0.3, 0.35); },
    dice()    { noise(0.05, 0.3); noise(0.04, 0.25, 0.07); tone(900, 0.04, 'square', 0.3, 0.14); },
    jet()     { noise(1.6, 0.5); tone(90, 1.6, 'sawtooth', 0.5, 0, 400); },
    win()     { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.18, 'square', 0.5, i * 0.12)); },
    lose()    { [330, 311, 294, 220].forEach((f, i) => tone(f, 0.35, 'sawtooth', 0.5, i * 0.22)); },
  };
})();
