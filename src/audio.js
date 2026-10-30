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
  /* The credits theme. The game composes it: a seeded generator writes 32 bars as MIDI note numbers
     (lead, arpeggio, bass, drums), and four voices in the style of an 80s console play it: a 50% pulse
     lead, a 25% pulse arpeggio, a triangle bass and noise drums. The seed is 1991, the year the
     Nelosphere began, so the piece is the same every time. Notes are scheduled ahead on the audio clock. */
  const CREDITS = (() => {
    const BPM = 132, SIXTEENTH = 60 / BPM / 4, LOOK = 0.12;
    const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
    function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
    // compose once: C major, an end-titles lift. Each section is four bars of chords, written as scale degrees.
    function compose() {
      const r = rng(1991), KEY = 60, SCALE = [0, 2, 4, 5, 7, 9, 11];
      const deg = (d, oct = 0) => KEY + SCALE[((d % 7) + 7) % 7] + 12 * (Math.floor(d / 7) + oct);
      const triad = (root) => [root, root + 2, root + 4];
      const sections = [[0, 5, 3, 4], [0, 5, 3, 4], [3, 4, 2, 5], [3, 4, 0, 0], [5, 3, 0, 4], [5, 3, 1, 4], [0, 5, 3, 4], [3, 4, 0, 0]];
      const RHYTHMS = [[0, 4, 6, 8, 12], [0, 3, 6, 8, 10, 12], [0, 4, 8, 10, 12, 14], [0, 2, 4, 8, 12], [0, 6, 8, 12]];
      const song = { lead: [], arp: [], bass: [], drums: [], steps: sections.length * 4 * 16 };
      let prev = 7 + 2; // start the melody on E above middle C, as a scale index
      const motif = RHYTHMS.map(() => null);
      sections.forEach((sec, si) => sec.forEach((root, bi) => {
        const bar = (si * 4 + bi) * 16, chord = triad(root), tones = chord.map(d => d + 7);
        // melody: a rhythm chosen per section, chord tones on the beat, nearest scale steps between
        const rh = RHYTHMS[(si + (bi === 3 ? 1 : 0)) % RHYTHMS.length];
        rh.forEach((s, k) => {
          const onBeat = s % 4 === 0;
          let target;
          if (onBeat) { target = tones.reduce((best, d) => { for (const o of [-7, 0, 7]) { const c = d + o; if (Math.abs(c - prev) < Math.abs(best - prev)) best = c; } return best; }, tones[0] + 7); if (r() < 0.25) target += r() < 0.5 ? 2 : -2; }
          else target = prev + (r() < 0.5 ? 1 : -1) * (r() < 0.7 ? 1 : 2);
          target = Math.max(5, Math.min(13, target)); prev = target;
          const len = (rh[k + 1] !== undefined ? rh[k + 1] : 16) - s;
          song.lead.push({ at: bar + s, n: deg(target), len: Math.min(len, 6) });
        });
        // the last bar of each section holds a long note on the root
        if (bi === 3) { song.lead = song.lead.filter(x => x.at < bar + 8); const home = [chord[0], chord[0] + 7, chord[0] + 14].reduce((b, d) => Math.abs(d - prev) < Math.abs(b - prev) ? d : b); prev = home; song.lead.push({ at: bar + 8, n: deg(home), len: 8 }); }
        // arpeggio: the chord broken in 16ths, up and down, an octave below the lead
        const arp = [0, 1, 2, 1].map(i => deg(chord[i]));
        for (let s = 0; s < 16; s++) song.arp.push({ at: bar + s, n: arp[s % 4] + (s >= 8 && si % 2 ? 12 : 0), len: 1 });
        // bass: root and fifth in eighths, a walk into the next bar
        const b = deg(root, -2), f5 = deg(root + 4, -2);
        [b, b + 12, f5, b + 12, b, b + 12, f5, b + 12].forEach((n, k) => song.bass.push({ at: bar + k * 2, n, len: 2 }));
        // drums: kick on 1 and 3, snare on 2 and 4, hats on the offbeats, a fill at section ends
        for (let s = 0; s < 16; s++) {
          if (s % 8 === 0) song.drums.push({ at: bar + s, k: 'kick' });
          if (s % 8 === 4) song.drums.push({ at: bar + s, k: 'snare' });
          if (s % 2 === 1) song.drums.push({ at: bar + s, k: 'hat' });
          if (bi === 3 && s >= 12) song.drums.push({ at: bar + s, k: 'snare' });
        }
      }));
      return song;
    }
    let song = null, out = null, timer = null, startAt = 0, nextStep = 0, pulse25 = null;
    function wave25() { // a 25% duty pulse from its Fourier series
      if (pulse25) return pulse25; const N = 32, re = new Float32Array(N), im = new Float32Array(N);
      for (let k = 1; k < N; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
      return (pulse25 = ctx.createPeriodicWave(re, im));
    }
    function voice(kind, n, t, dur, vol) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      if (kind === 'p25') o.setPeriodicWave(wave25()); else o.type = kind;
      o.frequency.setValueAtTime(midi(n), t);
      if (kind === 'square') { const v = ctx.createOscillator(), vg = ctx.createGain(); v.frequency.value = 5.5; vg.gain.value = midi(n) * 0.006; v.connect(vg); vg.connect(o.frequency); v.start(t + 0.12); v.stop(t + dur + 0.05); }
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.006); g.gain.setValueAtTime(vol * 0.8, t + Math.min(0.08, dur * 0.5)); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.02);
    }
    function hit(kind, t) {
      if (kind === 'kick') { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.1); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.13); return; }
      const len = kind === 'snare' ? 0.12 : 0.03, n = Math.floor(ctx.sampleRate * len), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      let v = 0; for (let k = 0; k < n; k++) { if (k % (kind === 'snare' ? 6 : 2) === 0) v = Math.random() * 2 - 1; d[k] = v * (1 - k / n); } // stepped noise, like a console noise channel
      const src = ctx.createBufferSource(), g = ctx.createGain(); src.buffer = buf; g.gain.value = kind === 'snare' ? 0.22 : 0.06; src.connect(g); g.connect(out); src.start(t);
    }
    function schedule() {
      const until = ctx.currentTime + LOOK;
      while (startAt + nextStep * SIXTEENTH < until) {
        const t = startAt + nextStep * SIXTEENTH, s = nextStep % song.steps;
        if (!muted) {
          for (const x of song.lead) if (x.at === s) voice('square', x.n, t, x.len * SIXTEENTH * 0.95, 0.16);
          for (const x of song.arp) if (x.at === s) voice('p25', x.n, t, SIXTEENTH * 0.8, 0.05);
          for (const x of song.bass) if (x.at === s) voice('triangle', x.n, t, x.len * SIXTEENTH * 0.9, 0.3);
          for (const x of song.drums) if (x.at === s) hit(x.k, t);
        }
        nextStep += 1;
      }
    }
    function play() {
      if (timer || !ensure()) return; if (ctx.state === 'suspended') ctx.resume();
      song = song || compose();
      out = ctx.createGain(); out.gain.setValueAtTime(0.0001, ctx.currentTime); out.gain.exponentialRampToValueAtTime(0.85, ctx.currentTime + 0.8); out.connect(master);
      startAt = ctx.currentTime + 0.1; nextStep = 0; timer = setInterval(schedule, 25); schedule();
    }
    function stop(fade = 1) {
      if (!timer) return; clearInterval(timer); timer = null;
      const o = out; o.gain.cancelScheduledValues(ctx.currentTime); o.gain.setValueAtTime(Math.max(0.0001, o.gain.value), ctx.currentTime); o.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + fade);
      setTimeout(() => o.disconnect(), fade * 1000 + 300);
    }
    return { play, stop, playing: () => !!timer, compose };
  })();
  /* Place ambience. One quiet bed per scene, day and night, built from a looping noise buffer,
     filters, a few oscillators and one-shots scheduled at random. Beds crossfade over 1.5 s.
     A bed is built by a function (ac, out, night, every) so the same code renders live and in an
     OfflineAudioContext for tests; `every(fn, minS, maxS)` schedules fn(time) repeatedly. */
  const AMB = (() => {
    const LEVEL = 0.12, FADE = 1.5;
    const bufs = new WeakMap();
    function noiseBuf(ac) {
      if (bufs.has(ac)) return bufs.get(ac);
      const n = ac.sampleRate * 2, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      bufs.set(ac, b); return b;
    }
    const rnd = (a, b) => a + Math.random() * (b - a);
    // A continuous filtered noise layer. lfo: { rate, depth, on: 'gain'|'freq' } for wind, surf and water.
    function bed(ac, out, type, freq, q, vol, lfo, nodes) {
      const src = ac.createBufferSource(); src.buffer = noiseBuf(ac); src.loop = true; src.loopStart = Math.random();
      const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = ac.createGain(); g.gain.value = vol;
      src.connect(f); f.connect(g); g.connect(out); src.start(ac.currentTime, Math.random() * 1.5);
      nodes.push(src);
      if (lfo) {
        const o = ac.createOscillator(), d = ac.createGain(); o.frequency.value = lfo.rate; d.gain.value = lfo.depth;
        o.connect(d); d.connect(lfo.on === 'freq' ? f.frequency : g.gain); o.start(); nodes.push(o);
      }
      return { f, g };
    }
    function hum(ac, out, freq, type, vol, nodes, lp) {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = freq; g.gain.value = vol;
      if (lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; o.connect(f); f.connect(g); } else o.connect(g);
      g.connect(out); o.start(); nodes.push(o); return { o, g };
    }
    // ---- one-shots: fn(ac, out, t) ----
    function env(ac, g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
    function burst(ac, out, t, type, freq, q, a, peak, d, sweepTo) {
      const src = ac.createBufferSource(); src.buffer = noiseBuf(ac);
      const f = ac.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
      if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + a + d);
      const g = ac.createGain(); env(ac, g, t, a, peak, d);
      src.connect(f); f.connect(g); g.connect(out); src.start(t, Math.random()); src.stop(t + a + d + 0.05);
    }
    function blip(ac, out, t, freq, type, a, peak, d, slideTo) {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + a + d);
      env(ac, g, t, a, peak, d); o.connect(g); g.connect(out); o.start(t); o.stop(t + a + d + 0.05);
    }
    const carPass = (ac, out, t) => burst(ac, out, t, 'bandpass', 300, 0.7, 1.4, 0.35, 1.6, 900);
    const cricket = (ac, out, t) => { for (let i = 0; i < 3; i++) blip(ac, out, t + i * 0.09, 4600 + rnd(-150, 150), 'sine', 0.01, 0.06, 0.05); };
    const dog = (ac, out, t) => { const n = 1 + Math.floor(rnd(0, 3)); for (let i = 0; i < n; i++) blip(ac, out, t + i * 0.32, 420, 'sawtooth', 0.01, 0.05, 0.12, 300); };
    const truck = (ac, out, t) => { burst(ac, out, t, 'lowpass', 180, 0.5, 1.6, 0.5, 2.2, 120); blip(ac, out, t, 55, 'sawtooth', 1.4, 0.06, 2.2, 48); };
    const bird = (ac, out, t) => { const n = 2 + Math.floor(rnd(0, 4)), b = rnd(2400, 3600); for (let i = 0; i < n; i++) blip(ac, out, t + i * rnd(0.08, 0.16), b + rnd(-300, 400), 'sine', 0.01, 0.07, 0.07, b * rnd(1.15, 1.4)); };
    const frog = (ac, out, t) => { for (let i = 0; i < 4; i++) blip(ac, out, t + i * 0.045, 170 + rnd(-10, 10), 'square', 0.005, 0.04, 0.03); };
    const bell = (ac, out, t) => { for (const [m, v] of [[1, 0.09], [2.01, 0.05], [2.76, 0.035], [5.4, 0.015]]) blip(ac, out, t, 392 * m, 'sine', 0.005, v, 3.2 / Math.sqrt(m)); };
    const clank = (ac, out, t) => { for (const fr of [310, 797, 1489, 2240]) blip(ac, out, t, fr * rnd(0.97, 1.03), 'triangle', 0.002, 0.05, rnd(0.25, 0.6)); burst(ac, out, t, 'bandpass', 2500, 2, 0.002, 0.15, 0.08); };
    const steam = (ac, out, t) => burst(ac, out, t, 'highpass', 3500, 0.5, 0.15, 0.22, rnd(0.8, 1.6));
    const horn = (ac, out, t) => { for (const fr of [233, 277]) { const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = fr; f.type = 'lowpass'; f.frequency.value = 500; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.3); g.gain.setValueAtTime(0.05, t + 1.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4); o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + 2.5); } };
    const crackle = (ac, out, t) => { const n = 3 + Math.floor(rnd(0, 6)); for (let i = 0; i < n; i++) burst(ac, out, t + rnd(0, 0.5), 'highpass', 2000, 1, 0.001, rnd(0.08, 0.25), 0.02); };
    const gust = (ac, out, t) => burst(ac, out, t, 'bandpass', 500, 0.8, 1.2, 0.3, 2.2, 1100);
    const gull = (ac, out, t) => { const n = 1 + Math.floor(rnd(0, 3)); for (let i = 0; i < n; i++) blip(ac, out, t + i * 0.35, 1500, 'sawtooth', 0.03, 0.025, 0.28, 900); };
    const beaconTick = (ac, out, t) => blip(ac, out, t, 2100, 'square', 0.002, 0.025, 0.03);
    const wave = (ac, out, t) => burst(ac, out, t, 'lowpass', 600, 0.4, 1.8, 0.4, 2.6, 1800);

    const BEDS = {
      residence(ac, out, night, every, nodes) {
        bed(ac, out, 'lowpass', 220, 0.6, 0.85, { rate: 0.07, depth: 0.2, on: 'gain' }, nodes); // city hum
        hum(ac, out, 58, 'sawtooth', 0.025, nodes, 160);
        every(carPass, night ? 9 : 4, night ? 20 : 10);
        if (night) { every(cricket, 0.4, 1.4); every(dog, 12, 30); }
      },
      road(ac, out, night, every, nodes) {
        bed(ac, out, 'bandpass', 900, 0.5, 0.5, { rate: 0.3, depth: 0.12, on: 'gain' }, nodes); // river
        bed(ac, out, 'bandpass', 2600, 1.2, 0.12, { rate: 0.9, depth: 0.06, on: 'gain' }, nodes); // ripples
        bed(ac, out, 'lowpass', 400, 0.5, 0.25, { rate: 0.05, depth: 0.18, on: 'gain' }, nodes); // wind
        every(truck, 10, 22);
        if (night) every(cricket, 0.8, 2.2);
      },
      colonia(ac, out, night, every, nodes) {
        bed(ac, out, 'lowpass', 700, 0.4, 0.32, { rate: 0.06, depth: 0.12, on: 'gain' }, nodes); // breeze in the vines
        if (night) { every(cricket, 0.25, 0.8); every(frog, 0.8, 2.4); every(bell, 22, 45); }
        else { every(bird, 1.2, 4); every(bell, 40, 80); }
      },
      salta(ac, out, night, every, nodes) {
        const r = hum(ac, out, 42, 'sawtooth', 0.09, nodes, 140); // idling locomotive
        const lfo = ac.createOscillator(), d = ac.createGain(); lfo.frequency.value = 5.5; d.gain.value = 0.04; lfo.connect(d); d.connect(r.g.gain); lfo.start(); nodes.push(lfo);
        bed(ac, out, 'lowpass', 160, 0.7, 0.35, null, nodes);
        every(clank, 2.5, 7); every(steam, 4, 10); every(horn, 25, 50);
      },
      border(ac, out, night, every, nodes) {
        bed(ac, out, 'bandpass', 650, 0.6, 0.55, { rate: 0.11, depth: 0.3, on: 'gain' }, nodes); // mountain wind
        bed(ac, out, 'highpass', 5000, 0.4, 0.08, null, nodes); // snow hiss
        every(gust, 4, 9); every(crackle, 0.7, 2.2);
      },
      airfield(ac, out, night, every, nodes) {
        bed(ac, out, 'lowpass', 500, 0.4, 0.4, { rate: 0.12, depth: 0.25, on: 'gain' }, nodes); // surf
        hum(ac, out, 1150, 'sine', 0.008, nodes); // distant jet idle whine
        bed(ac, out, 'bandpass', 180, 1.2, 0.15, null, nodes); // turbine rumble
        every(wave, 5, 9); every(beaconTick, 1.4, 1.4);
        if (!night) every(gull, 6, 15);
      },
    };

    // ---- live playback ----
    let bus = null, cur = null, want = null, unlocked = false;
    function busNode() {
      if (!bus) { bus = ctx.createGain(); bus.gain.value = muted ? 0.0001 : LEVEL; bus.connect(ctx.destination); }
      return bus;
    }
    function startBed(scene, night) {
      const out = ctx.createGain(), nodes = [], timers = [];
      out.gain.setValueAtTime(0.0001, ctx.currentTime); out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + FADE); out.connect(busNode());
      const every = (fn, a, b) => { const go = () => { if (!muted) fn(ctx, out, ctx.currentTime + 0.05); timers.push(setTimeout(go, rnd(a, b) * 1000)); }; timers.push(setTimeout(go, rnd(0.2, Math.min(b, 4)) * 1000)); };
      BEDS[scene](ctx, out, night, every, nodes);
      return { scene, night, out, nodes, timers };
    }
    function stopBed(b) {
      if (!b) return;
      b.timers.forEach(clearTimeout); b.timers.length = 0;
      const t = ctx.currentTime; b.out.gain.cancelScheduledValues(t); b.out.gain.setValueAtTime(Math.max(0.0001, b.out.gain.value), t); b.out.gain.exponentialRampToValueAtTime(0.0001, t + FADE);
      setTimeout(() => { b.nodes.forEach(n => { try { n.stop(); } catch (e) { /* already stopped */ } }); b.out.disconnect(); }, FADE * 1000 + 150);
    }
    function apply() {
      if (!unlocked || !ensure()) return;
      if (ctx.state === 'suspended') ctx.resume();
      const w = want;
      if (cur && w && cur.scene === w.scene && cur.night === w.night) return;
      stopBed(cur); cur = null;
      if (w && BEDS[w.scene]) cur = startBed(w.scene, w.night);
    }
    function set(scene, night) {
      const w = scene ? { scene, night: !!night } : null;
      if (w && !BEDS[scene]) return;
      if (want && w && want.scene === w.scene && want.night === w.night) return;
      want = w; apply();
    }
    function onUnlock() { unlocked = true; apply(); }
    function onMute(m) {
      if (!bus || !ctx) return;
      const t = ctx.currentTime; bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(Math.max(0.0001, bus.gain.value), t);
      bus.gain.exponentialRampToValueAtTime(m ? 0.0001 : LEVEL, t + 0.3);
    }
    // ---- offline render for tests: RMS and peak of one bed at the bus level ----
    function render(scene, night, secs = 4) {
      const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!OAC || !BEDS[scene]) return Promise.resolve(null);
      const ac = new OAC(1, Math.floor(44100 * secs), 44100), out = ac.createGain(); out.gain.value = LEVEL; out.connect(ac.destination);
      const every = (fn, a, b) => { for (let t = rnd(0.2, Math.min(b, 2)); t < secs; t += rnd(a, b)) fn(ac, out, t); };
      BEDS[scene](ac, out, !!night, every, []);
      return ac.startRendering().then(buf => { const d = buf.getChannelData(0); let s = 0, p = 0; for (let i = 0; i < d.length; i++) { s += d[i] * d[i]; p = Math.max(p, Math.abs(d[i])); } return { rms: Math.sqrt(s / d.length), peak: p }; });
    }
    return { set, onUnlock, onMute, render, current: () => (cur ? { scene: cur.scene, night: cur.night } : null) };
  })();

  /* Short stings for the turn system. */
  function sting(kind) {
    if (muted || !ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime + 0.01;
    const hit = (freq, to, vol, dur) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(to, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05); };
    const thud = (vol, dur, freq = 200) => { const n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2; const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = b; f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = vol; s.connect(f); f.connect(g); g.connect(master); s.start(t); };
    switch (kind) {
      case 'phase': { const n = Math.floor(ctx.sampleRate * 0.12), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n); const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = b; f.type = 'highpass'; f.frequency.value = 2500; g.gain.value = 0.25; s.connect(f); f.connect(g); g.connect(master); s.start(t); tone(1250, 0.05, 'sine', 0.15, 0.08); break; }
      case 'questioned': hit(90, 45, 0.7, 0.6); thud(0.6, 0.3, 300); tone(155, 0.5, 'sawtooth', 0.18, 0.02); tone(164, 0.5, 'sawtooth', 0.18, 0.02); break;
      case 'held': thud(0.7, 0.25, 500); for (const fr of [220, 563, 1043, 1720]) tone(fr, 0.6, 'triangle', 0.16, 0.01); break;
      case 'arrest': {
        hit(70, 32, 0.9, 0.9); thud(0.8, 0.4, 250);
        const o = ctx.createOscillator(), l = ctx.createOscillator(), ld = ctx.createGain(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.value = 700; l.frequency.value = 1.6; ld.gain.value = 140; l.connect(ld); ld.connect(o.frequency);
        f.type = 'lowpass'; f.frequency.value = 1800; g.gain.setValueAtTime(0.0001, t + 0.2); g.gain.exponentialRampToValueAtTime(0.12, t + 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
        o.connect(f); f.connect(g); g.connect(master); o.start(t + 0.2); l.start(t + 0.2); o.stop(t + 2.3); l.stop(t + 2.3); break;
      }
      case 'event': for (let i = 0; i < 3; i++) tone(1800, 0.04, 'square', 0.2, i * 0.08); break;
    }
  }

  return {
    theme(on) { on ? THEME.play() : THEME.stop(); }, themePlaying() { return THEME.playing(); },
    // The credits theme: Sfx.credits(true) plays it, false fades it out. _creditsScore() returns the composed MIDI notes.
    credits(on) { on ? CREDITS.play() : CREDITS.stop(); }, creditsPlaying() { return CREDITS.playing(); }, _creditsScore() { return CREDITS.compose(); },
    unlock() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); AMB.onUnlock(); },
    setMuted(m) { muted = m; AMB.onMute(m); }, isMuted() { return muted; },
    // Place ambience: Sfx.ambience('salta', true) crossfades to the Salta night bed; Sfx.ambience(null) stops.
    ambience(scene, night) { AMB.set(scene, night); }, ambienceNow() { return AMB.current(); },
    // Test hook: render one bed offline and resolve to { rms, peak }.
    _renderAmbience(scene, night, secs) { return AMB.render(scene, night, secs); },
    sting,
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
