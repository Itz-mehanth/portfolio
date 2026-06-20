// Lightweight Web Audio sound effects — synthesized, no asset files needed
// (robust on locked-down networks). Each call is fire-and-forget.

let _ctx = null;
function ctx() {
  if (typeof window === 'undefined') return null;
  if (!_ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _ctx = new AC();
  }
  // Browsers suspend the context until a user gesture; resume on demand.
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
  return _ctx;
}

// Classic descending-pitch laser "pew" with two detuned oscillators for body.
export function playLaser(volume = 0.22) {
  const ac = ctx();
  if (!ac) return;
  const t = ac.currentTime;
  const master = ac.createGain();
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(volume, t + 0.008);
  master.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
  master.connect(ac.destination);

  [0, 7].forEach((detune, i) => {
    const osc = ac.createOscillator();
    osc.type = i === 0 ? 'sawtooth' : 'square';
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(1100 - i * 120, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.2);
    osc.connect(master);
    osc.start(t);
    osc.stop(t + 0.26);
  });
}

// Menacing robotic shout — distorted detuned roar + static burst + descending
// laser zaps. Used when the Ultron-style mascot gets annoyed.
export function playUltronShout(volume = 0.5) {
  const ac = ctx();
  if (!ac) return;
  const t = ac.currentTime;

  // soft distortion for menace
  const shaper = ac.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const x = (i / 255) * 2 - 1; curve[i] = Math.tanh(x * 3.2); }
  shaper.curve = curve;
  shaper.oversample = '2x';

  const out = ac.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(volume, t + 0.04);
  out.gain.exponentialRampToValueAtTime(volume * 0.35, t + 0.45);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 0.92);
  shaper.connect(out);
  out.connect(ac.destination);

  // vibrato LFO modulating the roar pitch
  const lfo = ac.createOscillator();
  lfo.frequency.value = 19;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 16;
  lfo.connect(lfoGain);
  lfo.start(t); lfo.stop(t + 0.95);

  // two detuned sawtooths sweeping downward = robotic roar
  [115, 98].forEach((f) => {
    const o = ac.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f * 2.0, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.7);
    lfoGain.connect(o.frequency);
    o.connect(shaper);
    o.start(t); o.stop(t + 0.9);
  });

  // static/rage noise burst
  const nb = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.5), ac.sampleRate);
  const data = nb.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.8);
  const ns = ac.createBufferSource();
  ns.buffer = nb;
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 850; bp.Q.value = 0.7;
  const ng = ac.createGain(); ng.gain.value = 0.22;
  ns.connect(bp); bp.connect(ng); ng.connect(ac.destination);
  ns.start(t);

  // descending laser zaps over the roar
  [0.0, 0.13, 0.27].forEach((off, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(1500 - i * 220, t + off);
    o.frequency.exponentialRampToValueAtTime(210, t + off + 0.14);
    g.gain.setValueAtTime(0.0001, t + off);
    g.gain.exponentialRampToValueAtTime(0.16, t + off + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.17);
    o.connect(g); g.connect(ac.destination);
    o.start(t + off); o.stop(t + off + 0.2);
  });
}

// Low menacing power-up hum (subtle, on hover/charge).
export function playMenaceHum(volume = 0.12) {
  const ac = ctx();
  if (!ac) return;
  const t = ac.currentTime;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.15);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
  g.connect(ac.destination);
  const o = ac.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(70, t);
  o.frequency.exponentialRampToValueAtTime(130, t + 0.6);
  const o2 = ac.createOscillator();
  o2.type = 'sine';
  o2.frequency.setValueAtTime(140, t);
  o2.frequency.exponentialRampToValueAtTime(260, t + 0.6);
  o.connect(g); o2.connect(g);
  o.start(t); o.stop(t + 0.72);
  o2.start(t); o2.stop(t + 0.72);
}

// Short bright "blip" for a balloon hit.
export function playHit(volume = 0.2) {
  const ac = ctx();
  if (!ac) return;
  const t = ac.currentTime;
  const g = ac.createGain();
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  g.connect(ac.destination);

  const osc = ac.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(420, t);
  osc.frequency.exponentialRampToValueAtTime(1200, t + 0.09);
  osc.connect(g);
  osc.start(t);
  osc.stop(t + 0.2);
}
