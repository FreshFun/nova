/* =========================================================
   FRESH'S PULSES OF HELL — a timing tower
   Difficulty chart colors follow the EToH / JToH chart.
   No assets: music and charts are generated at runtime.
   ========================================================= */
'use strict';

const BUILD = 'b11';

/* ---------------------------------------------------------
   0. DIAGNOSTICS
   The console outside this page only ever sees "Script error." — details are
   stripped crossing the origin boundary. Catching errors in here keeps the
   message, line and stack intact and puts them on screen.
   --------------------------------------------------------- */
const ERRORS = [];

function logError(where, err) {
  const msg = (err && err.message) ? err.message : String(err);
  const stack = (err && err.stack) ? String(err.stack).split('\n').slice(0, 3).join(' | ') : '';
  const last = ERRORS[ERRORS.length - 1];
  if (last && last.msg === msg && last.where === where) { last.count++; }
  else ERRORS.push({ where, msg, stack, count: 1 });
  if (ERRORS.length > 12) ERRORS.shift();
  showErrorBadge();
}

/* Wraps any callback the browser calls into, so one failure never kills a loop. */
function guard(where, fn) {
  return function () {
    try { return fn.apply(this, arguments); }
    catch (err) { logError(where, err); }
  };
}

window.addEventListener('error', ev => {
  logError('page', ev.error || { message: `${ev.message} @ line ${ev.lineno}:${ev.colno}` });
});
window.addEventListener('unhandledrejection', ev => logError('promise', ev.reason));

function showErrorBadge() {
  const btn = document.querySelector('#diagBtn');
  if (!btn) return;
  btn.hidden = false;
  document.querySelector('#diagCount').textContent =
    ERRORS.reduce((n, e) => n + e.count, 0);
}

function renderDiagnostics() {
  document.querySelector('#diagBuild').textContent = BUILD;
  const list = document.querySelector('#diagList');
  list.innerHTML = '';
  if (!ERRORS.length) {
    const li = document.createElement('li');
    li.textContent = 'Nothing caught in here. Any error you saw came from outside the game.';
    list.appendChild(li);
  }
  ERRORS.forEach(e => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${e.where}${e.count > 1 ? ` ×${e.count}` : ''}</b> — ${e.msg}` +
                   (e.stack ? `<span>${e.stack}</span>` : '');
    list.appendChild(li);
  });
  document.querySelector('#diagPanel').hidden = false;
}

/* ---------------------------------------------------------
   1. THE DIFFICULTY CHART
   --------------------------------------------------------- */
const DIFFICULTIES = [
  { id:'effortless',   name:'Effortless',   color:'#8AAB85', band:'Standard',
    blurb:'The bottom ring. A beat, a key, and enough room to think between them.' },
  { id:'easy',         name:'Easy',         color:'#5B9A4C', band:'Standard',
    blurb:'Two keys, steady eighths, generous windows. Where everyone actually starts.' },
  { id:'medium',       name:'Medium',       color:'#FFB000', band:'Standard',
    blurb:'Three lanes. The rests stop being polite and the tempo stops waiting.' },
  { id:'hard',         name:'Hard',         color:'#AA5500', band:'Standard',
    blurb:'Full four-lane layout. Short bursts arrive before your hands are ready.' },
  { id:'difficult',    name:'Difficult',    color:'#C4281C', band:'Standard',
    blurb:'Sixteenths in every phrase and a hit window that no longer forgives a shrug.' },
  { id:'challenging',  name:'Challenging',  color:'#750000', band:'Standard',
    blurb:'Jumps stacked on streams. Recovering a dropped combo costs half the chart.' },
  { id:'intense',      name:'Intense',      color:'#1B2A35', band:'Standard',
    blurb:'Machine tempo. Nothing is decorative anymore — every note is load-bearing.' },
  { id:'remorseless',  name:'Remorseless',  color:'#FF00BF', band:'Standard',
    blurb:'The last standard ring. Dense, bright, and completely uninterested in your wrists.' },
  { id:'insane',       name:'Insane',       color:'#0000FF', band:'Soul Crushing',
    blurb:'Soul Crushing begins. Timing windows are now measured in single frames.' },
  { id:'extreme',      name:'Extreme',      color:'#2154B9', band:'Soul Crushing',
    blurb:'Continuous streams with jump anchors. There is no bar to breathe on.' },
  { id:'terrifying',   name:'Terrifying',   color:'#00FFFF', band:'Soul Crushing',
    blurb:'Fast enough that reading ahead and reacting become different skills.' },
  { id:'catastrophic', name:'Catastrophic', color:'#FFFFFF', band:'Soul Crushing',
    blurb:'A wall of white. The chart stops being a rhythm and becomes a texture.' },
  { id:'horrific',     name:'Horrific',     color:'#A75E9B', band:'Mind Breaking',
    blurb:'Beyond reasonable. Built to be looked at more than it is ever cleared.' },
  { id:'unreal',       name:'Unreal',       color:'#7B007B', band:'Mind Breaking', rainbow:true,
    blurb:'The top of the canon chart. Good luck. Practice mode exists for a reason.' },
  { id:'nil',          name:'nil',          color:'#635F62', band:'Joke',
    blurb:'Not a real difficulty. Not a real chart. Press keys and see what happens.' },
];

/* Every run on the chart. Edit freely — `name` and `abbr` drive the whole UI.
   kind:'citadel' makes a much longer run, the way citadels work in EToH.
   tutorial:true marks the teaching run: gentler chart, on-screen tips, no fail. */
const PULSES = {
  effortless: [
    { name:'Pulse of A Simple Time',                         abbr:'PoAST', tutorial:true },
  ],
  easy: [
    { name:'Pulse of a New Beginning',                       abbr:'PoFAB' },
    { name:'Pulse of Easy Timing',                           abbr:'PoET' },
  ],
  medium: [
    { name:'Pulse of Inconsiderate Actions',                 abbr:'PoIA' },
    { name:'Pulse of Middle Ground',                         abbr:'PoMG' },
  ],
  hard: [
    { name:'Pulse of Rising Tempo',                          abbr:'PoRT' },
    { name:'Pulse of Harsh Truth',                           abbr:'PoHT' },
  ],
  difficult: [
    { name:'Pulse of Divided Focus',                         abbr:'PoDF' },
    { name:'Pulse of the Broken Metronome',                  abbr:'PoBM' },
  ],
  challenging: [
    { name:'Pulse of Crimson Cadence',                       abbr:'PoCC' },
    { name:'Pulse of Unyielding Beat',                       abbr:'PoUB' },
  ],
  intense: [
    { name:'Pulse of Iron Discipline',                       abbr:'PoID' },
    { name:'Pulse of Silent Machinery',                      abbr:'PoSM' },
  ],
  remorseless: [
    { name:'Pulse of Neon Malice',                           abbr:'PoNM' },
    { name:'Pulse of Endless Repetition',                    abbr:'PoER' },
  ],
  insane: [
    { name:'Citadel of Making The World Better',              abbr:'CoMTWB', kind:'citadel' },
    { name:'Pulse of Shattered Sanity',                      abbr:'PoSS' },
  ],
  extreme: [
    { name:'Pulse of Astral Drift',                          abbr:'PoAD' },
    { name:'Pulse of Violent Currents',                      abbr:'PoVC' },
  ],
  terrifying: [
    { name:'Pulse of Frozen Nerves',                         abbr:'PoFN' },
    { name:'Pulse of Glacial Terror',                        abbr:'PoGT' },
  ],
  catastrophic: [
    { name:'Pulse of Blinding White',                        abbr:'PoBW' },
    { name:'Pulse of Total Collapse',                        abbr:'PoTC' },
  ],
  horrific: [
    { name:'Pulse of Violet Dread',                          abbr:'PoVD' },
    { name:'Pulse of Hollow Echoes',                         abbr:'PoHE' },
  ],
  unreal: [
    { name:'Pulse of Impossible Geometry',                   abbr:'PoIG' },
    { name:'Pulse of the Void Beyond',                       abbr:'PoVB' },
  ],
  nil: [
    { name:'Pulse of nil',                                   abbr:'Ponil' },
    { name:'Pulse of Nothing At All',                        abbr:'PoNAA' },
  ],
};

/* Banner shown on a ring. A difficulty can override its band's warning. */
const BAND_WARNING = {
  'Soul Crushing': { text:'EXTREMELY DIFFICULT', tone:'sc',
    note:'Frame-tight windows and streams that never let up.' },
  'Mind Breaking': { text:'BEYOND HUMAN LIMITS', tone:'mind',
    note:'Charted to be looked at. Clearing one is not the expectation.' },
};

const DIFF_WARNING = {
  intense:     { text:'NOT FOR BEGINNERS', tone:'caution',
    note:'Machine tempo, and nothing decorative left in the chart.' },
  remorseless: { text:'NOT FOR BEGINNERS AT ALL', tone:'caution-hard',
    note:'The last standard ring, and it already plays like a Soul Crushing one.' },
};

/* Per-tier tuning. index = position on the chart. */
const BPMS = [92, 104, 116, 126, 138, 148, 158, 168, 178, 188, 198, 208, 218, 230, 262];

function laneCount(t) {
  if (t <= 0) return 1;   // Effortless
  if (t === 1) return 2;  // Easy
  if (t === 2) return 3;  // Medium
  return 4;               // Hard and up
}

function levelSpec(tier, i) {
  const entry = PULSES[DIFFICULTIES[tier].id][i];
  const citadel = entry.kind === 'citadel';
  const tutorial = !!entry.tutorial;
  const bpm = BPMS[tier] + i * 6;
  const f = tier / (DIFFICULTIES.length - 1);

  let bars = 16 + Math.round(f * 12) + i * 2;
  if (citadel) bars = Math.round(bars * 2.6); // citadels run far longer
  if (tutorial) bars = 12;

  return {
    name: entry.name,
    abbr: entry.abbr,
    kind: citadel ? 'citadel' : 'pulse',
    tutorial, tier, variant: i, bpm, bars,
    lanes: laneCount(tier),
    approach: tutorial ? 1.65 : Math.max(0.42, 1.5 - tier * 0.065 - i * 0.02),
    windowScale: tutorial ? 1.5 : Math.max(0.42, 1.25 - tier * 0.055 - i * 0.015),
    intensity: tutorial ? 0 : Math.min(1, f + i * 0.05),
  };
}

const LEVELS = {};
DIFFICULTIES.forEach((d, t) => {
  LEVELS[d.id] = PULSES[d.id].map((_, i) => levelSpec(t, i));
});

/* ---------------------------------------------------------
   2. CHART GENERATION
   --------------------------------------------------------- */
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick(rng, table) {
  let total = 0;
  for (const k in table) total += table[k];
  let r = rng() * total;
  for (const k in table) { r -= table[k]; if (r <= 0) return k; }
  return Object.keys(table)[0];
}

function finalizeChart(notes, spec) {
  const beatDur = 60 / spec.bpm;
  notes.forEach(n => { n.time = n.beat * beatDur; });
  notes.sort((a, b) => a.time - b.time || a.lane - b.lane);
  return notes;
}

/* The teaching run is hand-written, not generated: one key, plain quarters,
   with room to breathe between the phrases that introduce something new. */
function tutorialChart(spec) {
  const bars = [
    [0, 1, 2, 3],
    [0, 2],
    [0, 1, 2, 3],
    [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
    [0, 2],
    [0, 1, 2, 3],
    [0, 0.5, 1, 2, 2.5, 3],
    [0, 1, 2, 3],
    [0, 0.5, 1, 1.5, 2, 3],
    [0, 2],
    [0, 1, 2, 3],
    [0],
  ];
  const notes = [];
  bars.forEach((bar, i) => bar.forEach(b =>
    notes.push({ beat: i * 4 + b, lane: 0, time: 0, judged: false })));
  return finalizeChart(notes, spec);
}

function generateChart(spec) {
  if (spec.tutorial) return tutorialChart(spec);

  const rng = mulberry32(hashStr(spec.name + spec.bpm));
  const f = spec.intensity;
  const lanes = spec.lanes;
  const notes = [];
  let lane = Math.floor(lanes / 2);

  const weights = {
    rest:       Math.max(0.04, 0.30 - f * 0.28),
    quarters:   Math.max(0.06, 0.46 - f * 0.40),
    eighths:    0.24 + f * 0.20,
    sixteenths: Math.max(0, f * 0.46 - 0.04),
    jumps:      Math.max(0, f * 0.40 - 0.08),
    trill:      Math.max(0, f * 0.34 - 0.06),
  };

  const nextLane = (allowRepeat) => {
    if (lanes === 1) return 0;
    let n = Math.floor(rng() * lanes);
    if (!allowRepeat && n === lane) n = (n + 1 + Math.floor(rng() * (lanes - 1))) % lanes;
    lane = n;
    return n;
  };

  const push = (beat, l) => notes.push({ beat, lane: l, time: 0, judged: false });

  for (let bar = 0; bar < spec.bars; bar++) {
    const b0 = bar * 4;
    // Opening bar is always a gentle count-in phrase.
    const kind = bar === 0 ? 'quarters' : pick(rng, weights);

    if (kind === 'rest') {
      push(b0, nextLane(true));
    } else if (kind === 'quarters') {
      for (let i = 0; i < 4; i++) push(b0 + i, nextLane(rng() < 0.3));
    } else if (kind === 'eighths') {
      for (let i = 0; i < 8; i++) if (i !== 5 || rng() < 0.7) push(b0 + i * 0.5, nextLane(rng() < 0.25));
    } else if (kind === 'sixteenths') {
      for (let i = 0; i < 8; i++) push(b0 + i * 0.25, nextLane(false));
      for (let i = 0; i < 2; i++) push(b0 + 2 + i, nextLane(true));
    } else if (kind === 'trill') {
      const a = nextLane(false), c = nextLane(false);
      for (let i = 0; i < 8; i++) push(b0 + i * 0.5, i % 2 ? c : a);
    } else if (kind === 'jumps') {
      for (let i = 0; i < 4; i++) {
        const a = nextLane(true);
        push(b0 + i, a);
        if (lanes > 1 && rng() < 0.65) push(b0 + i, (a + 1 + Math.floor(rng() * (lanes - 1))) % lanes);
      }
      if (f > 0.5) for (let i = 0; i < 4; i++) push(b0 + 0.5 + i, nextLane(false));
    }
  }

  // Always land the final downbeat.
  push(spec.bars * 4, Math.floor(lanes / 2));
  return finalizeChart(notes, spec);
}

/* ---------------------------------------------------------
   3. COLOR HELPERS
   --------------------------------------------------------- */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function mixHex(hex, target, amt) {
  const a = hexToRgb(hex), b = hexToRgb(target);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * amt));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
/* Very dark chart colors (Intense, nil, Unreal) need a legible playfield twin. */
function playColor(hex) {
  const l = luminance(hex);
  if (l < 0.10) return mixHex(hex, '#FFFFFF', 0.62);
  if (l < 0.22) return mixHex(hex, '#FFFFFF', 0.34);
  return hex;
}
function rgba(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/* Unreal has no fixed color — it cycles the whole spectrum. Everything themed
   off --dif follows along, and the playfield picks the hue up per frame. */
const RAINBOW_PERIOD = 3.4; // seconds for a full turn of the wheel

function hslToHex(h, sPct, lPct) {
  const s = sPct / 100, l = lPct / 100;
  const a = s * Math.min(l, 1 - l);
  const k = n => (n + h / 30) % 12;
  const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return '#' + [f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, '0')).join('');
}

function rainbowHex(tSec) {
  return hslToHex(((tSec / RAINBOW_PERIOD) % 1) * 360, 88, 60);
}

/* ---------------------------------------------------------
   4. AUDIO
   --------------------------------------------------------- */
const Sound = {
  ctx: null, bus: null, music: null, noise: null, volume: 0.7,
  voices: 0, failures: 0, disabled: false,

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.bus = this.ctx.createGain();
    this.bus.gain.value = this.volume;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    this.bus.connect(comp).connect(this.ctx.destination);

    const len = Math.floor(this.ctx.sampleRate * 0.5);
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  },

  /* A browser keeps the audio clock suspended until a gesture, and resume() is
     async. Starting a run before it woke up is what left songs silent. */
  ready(cb) {
    this.init();
    let fired = false;
    const go = () => { if (!fired) { fired = true; cb(); } };
    if (this.ctx.state === 'running') { go(); return; }
    const p = this.ctx.resume();
    if (p && p.then) p.then(go).catch(go);
    setTimeout(go, 350);
  },

  /* Each run gets its own bus so quitting cuts scheduled notes instantly. */
  openRun() {
    this.closeRun();
    if (this.disabled || !this.ctx) return;
    this.music = this.ctx.createGain();
    this.music.gain.value = 1;
    this.music.connect(this.bus);
  },
  closeRun() {
    if (!this.music) return;
    const m = this.music, t = this.ctx.currentTime;
    this.music = null;
    try {
      m.gain.cancelScheduledValues(t);
      m.gain.setValueAtTime(m.gain.value, t);
      m.gain.linearRampToValueAtTime(0, t + 0.05);
    } catch (e) { /* node already torn down */ }
    setTimeout(() => { try { m.disconnect(); } catch (e) {} }, 400);
  },

  out() { return this.music || this.bus; },
  setVolume(v) { this.volume = v; if (this.bus) this.bus.gain.value = v; },
  now() { return this.ctx ? this.ctx.currentTime : 0; },
  safe(t) { return Math.max(t, this.ctx.currentTime + 0.004); },

  /* Mobile Safari caps how many audio nodes may be alive at once and throws
     once you pass it — which killed the whole frame loop on dense charts.
     Voices are counted, released when they end, and optional sounds step
     aside when the budget is tight. */
  free(limit) { return this.voices < (limit || 26); },
  track(src, nodes) {
    this.voices++;
    src.onended = () => {
      this.voices = Math.max(0, this.voices - 1);
      for (const n of nodes) { try { n.disconnect(); } catch (e) {} }
    };
  },
  /* Audio must never be able to take the game down with it. */
  fail() {
    this.voices = 0;
    if (++this.failures > 12) { this.disabled = true; this.closeRun(); }
  },

  tone(t, freq, dur, type, gain, dest) {
    if (this.disabled || !this.ctx) return;
    try {
      t = this.safe(t);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(dest || this.out());
      o.start(t); o.stop(t + dur + 0.02);
      this.track(o, [o, g]);
    } catch (e) { this.fail(); }
  },

  burst(t, dur, freq, q, gain, dest) {
    if (this.disabled || !this.ctx) return;
    try {
      t = this.safe(t);
      const s = this.ctx.createBufferSource();
      s.buffer = this.noise;
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f).connect(g).connect(dest || this.out());
      s.start(t); s.stop(t + dur + 0.02);
      this.track(s, [s, f, g]);
    } catch (e) { this.fail(); }
  },

  kick(t) {
    if (this.disabled || !this.ctx) return;
    try {
      t = this.safe(t);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(44, t + 0.12);
      g.gain.setValueAtTime(0.85, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g).connect(this.out());
      o.start(t); o.stop(t + 0.25);
      this.track(o, [o, g]);
    } catch (e) { this.fail(); }
  },

  snare(t) { this.burst(t, 0.16, 1900, 0.8, 0.35); this.tone(t, 190, 0.09, 'triangle', 0.16); },
  hat(t, loud) { this.burst(t, loud ? 0.05 : 0.03, 8200, 1.2, loud ? 0.14 : 0.07); },
  tick(t) { this.tone(t, 1400, 0.06, 'square', 0.18); },

  /* UNUSED alternative hit sound — swap it back into hit() if you ever want it.
     Pickup chime in the spirit of Terraria's mana star. */
  star(rate, gain) {
    if (this.disabled || !this.ctx) return;
    const t = this.ctx.currentTime + 0.002;
    const f0 = 1245 * rate;
    for (const [m, a] of [[1, 1], [2.02, 0.55], [3.01, 0.30], [4.35, 0.16]]) {
      try {
        const o = this.ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(f0 * m * 0.94, t);
        o.frequency.exponentialRampToValueAtTime(f0 * m, t + 0.035);
        const g = this.ctx.createGain();
        const dur = 0.28 / (1 + (m - 1) * 0.55);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(gain * a, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(this.bus);
        o.start(t); o.stop(t + dur + 0.02);
        this.track(o, [o, g]);
      } catch (e) { this.fail(); }
    }
  },

  hit(kind) {
    if (this.disabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (kind === 'miss') { this.tone(t, 96, 0.16, 'sawtooth', 0.16, this.bus); return; }
    const f = kind === 'perfect' ? 1320 : kind === 'great' ? 1050 : 780;
    this.tone(t, f, 0.075, 'square', 0.11, this.bus);
  },
};

function midiFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
const MINOR = [0, 2, 3, 5, 7, 8, 10];

/* ---------------------------------------------------------
   5. GAME STATE
   --------------------------------------------------------- */
const G = {
  spec: null, diff: null, notes: [], beatDur: 0,
  startTime: 0, raf: 0, timer: 0, nextStep: 0,
  running: false, ended: false, practice: false,
  score: 0, combo: 0, maxCombo: 0,
  counts: { perfect: 0, great: 0, good: 0, miss: 0 },
  offsets: [], health: 100, ghosts: 0, ghostStreak: 0, deathBy: '',
  laneDown: [], flashes: [], sparks: [], popup: null, armed: false,
  perf0: 0, lastFrame: 0, lastAudio: 0,
  endTime: 0, playHex: '#fff',
};

const BEST = {}; // session-only; no storage APIs

const LANE_KEYS = {
  1: [['Space']],
  2: [['KeyF', 'ArrowLeft'], ['KeyJ', 'ArrowRight']],
  3: [['KeyF', 'ArrowLeft'], ['Space', 'ArrowDown'], ['KeyJ', 'ArrowRight']],
  4: [['KeyD', 'ArrowLeft'], ['KeyF', 'ArrowDown'], ['KeyJ', 'ArrowUp'], ['KeyK', 'ArrowRight']],
};
const LANE_LABELS = { 1: ['SPACE'], 2: ['F', 'J'], 3: ['F', 'SPACE', 'J'], 4: ['D', 'F', 'J', 'K'] };

const BASE_WINDOWS = { perfect: 0.055, great: 0.100, good: 0.152 };

/* Shown during the teaching run, keyed to the beat they should appear on. */
const TUTORIAL_TIPS = [
  [0,  'Blocks fall toward the line. Press SPACE the moment one lands on it.'],
  [8,  'The closer to the line, the better the judgment.'],
  [16, 'Minus milliseconds means early. Plus means late.'],
  [24, 'Clean hits in a row build your combo.'],
  [36, 'Nothing here can fail you. Try leaning early, then late.'],
  [44, 'One more rule out there: hitting nothing costs health. Do not mash.'],
];

/* ---------------------------------------------------------
   6. DOM
   --------------------------------------------------------- */
const $ = s => document.querySelector(s);
const screens = { select: $('#screen-select'), game: $('#screen-game'), results: $('#screen-results') };
const canvas = $('#stage');
const ctx2d = canvas.getContext('2d');

let activeDiff = DIFFICULTIES[1]; // Easy selected on load

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('is-active'));
  screens[name].classList.add('is-active');
}

function applyTheme(diff) {
  const root = document.documentElement;
  const hex = diff.rainbow ? rainbowHex(performance.now() / 1000) : diff.color;
  root.style.setProperty('--dif', hex);
  root.style.setProperty('--dif-ink', luminance(hex) > 0.4 ? '#05050A' : '#ECEEF5');
}

const rainbowRungs = [];
function tickRainbow() {
  const hex = rainbowHex(performance.now() / 1000);
  for (const el of rainbowRungs) el.style.setProperty('--rung', hex);
  if (activeDiff && activeDiff.rainbow) {
    const root = document.documentElement;
    root.style.setProperty('--dif', hex);
    root.style.setProperty('--dif-ink', luminance(hex) > 0.4 ? '#05050A' : '#ECEEF5');
  }
}

/* ---------- chart rail ---------- */
function buildRail() {
  const rail = $('#chartRail');
  let lastBand = null;
  DIFFICULTIES.forEach((d, t) => {
    if (d.band !== lastBand) {
      const h = document.createElement('div');
      h.className = 'band-head';
      h.textContent = d.band;
      rail.appendChild(h);
      lastBand = d.band;
    }
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rung';
    b.style.setProperty('--rung', d.color);
    b.dataset.id = d.id;
    b.setAttribute('aria-current', String(d.id === activeDiff.id));
    b.innerHTML =
      `<span class="rung-tier">${String(t + 1).padStart(2, '0')}</span>` +
      `<span class="rung-name">${d.name}</span>` +
      `<span class="rung-portal"></span>`;
    b.addEventListener('click', () => selectDiff(d));
    if (d.rainbow) rainbowRungs.push(b);
    rail.appendChild(b);
  });
}

function selectDiff(d) {
  activeDiff = d;
  applyTheme(d);
  document.querySelectorAll('.rung').forEach(r =>
    r.setAttribute('aria-current', String(r.dataset.id === d.id)));
  renderDetail();
}

function renderDetail() {
  const d = activeDiff;
  const tier = DIFFICULTIES.indexOf(d);
  const levels = LEVELS[d.id];
  const keys = LANE_LABELS[laneCount(tier)].map(k => `<kbd>${k}</kbd>`).join('');
  const warn = DIFF_WARNING[d.id] || BAND_WARNING[d.band];

  const detail = $('#detail');
  detail.innerHTML = `
    <div class="detail-head">
      <div class="detail-orb"></div>
      <div>
        <h2 class="detail-name">${d.name}</h2>
        <p class="detail-meta">Ring ${String(tier + 1).padStart(2, '0')} / ${DIFFICULTIES.length} · ${d.band} · ${laneCount(tier)} lane${laneCount(tier) > 1 ? 's' : ''} · ${BUILD}</p>
      </div>
    </div>
    ${warn ? `<div class="warn warn-${warn.tone}">
      <strong>${warn.text}</strong><span>${warn.note}</span></div>` : ''}
    <p class="detail-blurb">${d.blurb}</p>
    <div class="pulses" id="pulseList"></div>
    <p class="keys-hint">Keys for this ring: ${keys} &nbsp;·&nbsp; arrow keys work too &nbsp;·&nbsp; <kbd>Esc</kbd> leaves a run</p>
  `;

  const list = $('#pulseList');
  levels.forEach(spec => {
    const best = BEST[spec.name];
    const badge = spec.tutorial ? 'Tutorial' : spec.kind === 'citadel' ? 'Citadel' : '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pulse';
    btn.innerHTML = `
      <span class="pulse-text">
        <span class="pulse-abbr">${spec.abbr}${badge ? `<i class="pulse-badge">${badge}</i>` : ''}</span>
        <span class="pulse-name">${spec.name}</span>
        <span class="pulse-specs">
          <span>${spec.bpm} BPM</span>
          <span>${spec.bars} bars</span>
          <span>${spec.lanes} lane${spec.lanes > 1 ? 's' : ''}</span>
          <span>window ×${spec.windowScale.toFixed(2)}</span>
        </span>
      </span>
      <span class="pulse-best ${best ? '' : 'is-empty'}">${best || '—'}</span>`;
    btn.addEventListener('click', () => requestLevel(spec, d));
    list.appendChild(btn);
  });
}

/* Mind Breaking rings stand behind a gate rather than starting on a stray click. */
let pendingRun = null;

function requestLevel(spec, diff) {
  if (diff.band === 'Mind Breaking') {
    pendingRun = { spec, diff };
    $('#gateDiff').textContent = `${diff.name} · ${spec.abbr}`;
    $('#gateBody').textContent =
      `${spec.name} runs at ${spec.bpm} BPM with a ±${(BASE_WINDOWS.good * spec.windowScale * 1000).toFixed(0)} ms window. ` +
      `Nothing about it was built to be fair. Practice mode turns off failing.`;
    $('#gate').hidden = false;
    $('#gateGo').focus();
    return;
  }
  startLevel(spec, diff);
}

function closeGate() { $('#gate').hidden = true; pendingRun = null; }

/* ---------------------------------------------------------
   7. CANVAS SIZING
   --------------------------------------------------------- */
let W = 0, H = 0;
function resize() {
  const wrap = canvas.parentElement;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = wrap.clientWidth; H = wrap.clientHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', guard('resize', resize));

function geometry() {
  const lanes = G.spec.lanes;
  const fieldW = Math.min(W * 0.92, lanes * 132);
  const laneW = fieldW / lanes;
  const x0 = (W - fieldW) / 2;
  const recY = H - Math.max(96, H * 0.17);
  return { lanes, fieldW, laneW, x0, recY };
}

/* ---------------------------------------------------------
   8. START / STOP A RUN
   --------------------------------------------------------- */
function startLevel(spec, diff) {
  stopRun();
  Sound.init();

  G.spec = spec;
  G.diff = diff;
  G.playHex = diff.rainbow ? rainbowHex(performance.now() / 1000) : playColor(diff.color);
  G.notes = generateChart(spec);
  G.beatDur = 60 / spec.bpm;
  G.practice = $('#practiceToggle').checked || spec.tutorial;
  G.score = 0; G.combo = 0; G.maxCombo = 0;
  G.counts = { perfect: 0, great: 0, good: 0, miss: 0 };
  G.offsets = []; G.health = 100;
  G.ghosts = 0; G.ghostStreak = 0; G.deathBy = '';
  frameErrors = 0; Sound.failures = 0;
  G.laneDown = new Array(spec.lanes).fill(0);
  G.flashes = []; G.sparks = []; G.popup = null;
  G.ended = false; G.running = true; G.armed = false;
  G.endTime = G.notes[G.notes.length - 1].time + 1.6;

  $('#quitBtn').textContent = spec.kind === 'citadel' ? 'Leave citadel' : 'Leave pulse';
  $('#hudLevel').textContent = `${spec.abbr} · ${spec.name}`;
  $('#hudDiff').textContent = diff.name;
  $('#hudScore').textContent = '0';
  $('#hudAcc').textContent = '100.00%';
  $('#progressFill').style.width = '0%';
  $('#healthFill').style.width = '100%';

  buildTouchRow(spec.lanes);
  showScreen('game');
  resize();
  $('#countdown').textContent = 'READY';

  Sound.ready(guard('run start', () => {
    if (!G.running || G.spec !== spec) return; // player already left
    Sound.openRun();
    G.armed = true;

    const lead = 4 * G.beatDur + 0.7;
    G.startTime = Sound.now() + lead;
    G.perf0 = performance.now() / 1000 + lead;
    G.lastFrame = 0;
    G.lastAudio = 0;
    G.nextStep = -16; // one bar of count-in

    clearInterval(G.timer);
    G.timer = setInterval(guard('scheduler', scheduleMusic), 60);
    scheduleMusic();

    cancelAnimationFrame(G.raf);
    G.raf = requestAnimationFrame(frame);
  }));
}

function stopRun() {
  G.running = false;
  clearInterval(G.timer);
  cancelAnimationFrame(G.raf);
  if (Sound.ctx) Sound.closeRun();
}

function quitRun() {
  stopRun();
  $('#countdown').textContent = '';
  showScreen('select');
  renderDetail();
}

/* ---------------------------------------------------------
   9. MUSIC SCHEDULER
   --------------------------------------------------------- */
function stepTime(step) { return G.startTime + step * (G.beatDur / 4); }

/* Enough lookahead to survive a throttled timer, small enough that a dense
   chart never has a crowd of live audio nodes. The render loop pumps this too,
   so it does not need to reach far ahead. */
const LOOKAHEAD = 0.45;

function scheduleMusic() {
  try { scheduleMusicInner(); } catch (err) { logError('audio', err); audioPanic(err); }
}

function scheduleMusicInner() {
  if (!G.running || !Sound.music || Sound.disabled) return;
  const horizon = Sound.now() + LOOKAHEAD;
  const totalSteps = G.spec.bars * 16 + 8;
  while (stepTime(G.nextStep) < horizon && G.nextStep < totalSteps) {
    const s = G.nextStep, t = stepTime(s);
    if (s < 0) {
      if (s % 4 === 0) Sound.tick(t);
    } else {
      const inBar = ((s % 16) + 16) % 16;
      const bar = Math.floor(s / 16);
      const f = G.spec.intensity;
      const prog = [0, 5, 3, 4][(bar + G.spec.variant) % 4];
      const rootMidi = 33 + MINOR[prog % 7] + (prog >= 7 ? 12 : 0);

      if (inBar % 4 === 0) Sound.kick(t);
      if (inBar === 4 || inBar === 12) Sound.snare(t);
      if (inBar % 2 === 0 && Sound.free()) Sound.hat(t, inBar % 4 === 2);
      if (inBar === 0) Sound.tone(t, midiFreq(rootMidi), G.beatDur * 1.6, 'sawtooth', 0.10);
      if (inBar === 8) Sound.tone(t, midiFreq(rootMidi + 7), G.beatDur * 0.9, 'sawtooth', 0.07);
      if (f > 0.28 && inBar % 4 === 2 && Sound.free(22)) {
        const arp = [0, 3, 7, 10][(inBar / 4 + bar) % 4];
        Sound.tone(t, midiFreq(rootMidi + 24 + arp), 0.12, 'square', 0.045 + f * 0.03);
      }
    }
    G.nextStep++;
  }
}

/* ---------------------------------------------------------
   10. INPUT
   --------------------------------------------------------- */
function windows() {
  const s = G.spec.windowScale;
  return { perfect: BASE_WINDOWS.perfect * s, great: BASE_WINDOWS.great * s, good: BASE_WINDOWS.good * s };
}

/* Gameplay runs on the wall clock. The audio clock is the better metronome,
   but a browser that refuses to wake it leaves it frozen at zero — and a frozen
   clock meant notes never fell and keys did nothing. Now the run continues
   regardless and gently re-syncs to the audio clock whenever it is alive. */
function songTime() { return performance.now() / 1000 - G.perf0; }

/* Backgrounding a tab stops rAF while time keeps moving. Coming back used to
   dump every note that fell during the gap straight into misses and kill you,
   so a long stall rewinds the clocks and restarts the music cleanly instead. */
function resyncAfterStall(gap) {
  const shift = gap - 1 / 60;
  G.perf0 += shift;
  G.startTime += shift;
  if (Sound.ctx && Sound.music) { Sound.closeRun(); Sound.openRun(); }
  G.lastAudio = 0;
  G.nextStep = Math.floor(songTime() / (G.beatDur / 4)) + 1;
}

function pressLane(lane) {
  if (!G.running || G.ended || !G.armed) return;
  G.laneDown[lane] = performance.now();

  const now = songTime();
  const w = windows();
  let best = null, bestAbs = Infinity;

  for (const n of G.notes) {
    if (n.judged || n.lane !== lane) continue;
    const dt = n.time - now;
    if (dt > w.good) break;
    const a = Math.abs(dt);
    if (a <= w.good && a < bestAbs) { best = n; bestAbs = a; }
  }

  if (!best) { ghostTap(lane); return; }
  const dt = now - best.time;
  const a = Math.abs(dt);
  const kind = a <= w.perfect ? 'perfect' : a <= w.great ? 'great' : 'good';
  judge(best, kind, dt);
}

function releaseLane(lane) { G.laneDown[lane] = 0; }

/* Hitting air costs you. One stray tap is cheap; a mash escalates fast, so
   holding the keys down through a section drains the bar and ends the run. */
function ghostTap(lane) {
  if (G.spec.tutorial) return; // the teaching run invites experimenting
  G.ghosts++;
  G.ghostStreak++;
  G.combo = 0;
  G.score = Math.max(0, G.score - 40);
  if (!G.practice) G.health -= Math.min(16, 3 + G.ghostStreak * 1.6);
  Sound.hit('miss');
  G.popup = { kind: 'spam', t: performance.now(), dt: 0 };
  G.flashes.push({ lane, t: performance.now(), kind: 'spam' });
  if (!G.practice && G.health <= 0) { G.deathBy = 'spam'; finish(true); }
}

function judge(note, kind, dt) {
  if (G.ended) return;
  note.judged = true;
  G.counts[kind]++;
  G.offsets.push(dt * 1000);

  if (kind === 'miss') {
    G.combo = 0;
    G.health -= G.practice ? 0 : 9;
    Sound.hit('miss');
  } else {
    G.combo++;
    G.ghostStreak = 0;
    G.maxCombo = Math.max(G.maxCombo, G.combo);
    const base = kind === 'perfect' ? 350 : kind === 'great' ? 220 : 110;
    G.score += Math.round(base * (1 + Math.min(G.combo, 60) / 120));
    G.health = Math.min(100, G.health + (kind === 'perfect' ? 1.6 : kind === 'great' ? 1.0 : 0.2));
    Sound.hit(kind);
    G.flashes.push({ lane: note.lane, t: performance.now(), kind });
    G.sparks.push({ lane: note.lane, t: performance.now() });
  }
  G.popup = { kind, t: performance.now(), dt };

  if (!G.practice && G.health <= 0) { G.deathBy = G.deathBy || 'misses'; finish(true); }
}

document.addEventListener('pointerdown', guard('wake audio', () => {
  if (Sound.ctx && Sound.ctx.state !== 'running') Sound.ctx.resume();
}));

document.addEventListener('keydown', guard('keydown', e => {
  if (Sound.ctx && Sound.ctx.state !== 'running') Sound.ctx.resume();
  if (e.code === 'Escape' && !$('#gate').hidden) { closeGate(); return; }
  if (e.code === 'Escape' && screens.game.classList.contains('is-active')) { quitRun(); return; }
  if (!G.running || e.repeat) return;
  const map = LANE_KEYS[G.spec.lanes];
  for (let i = 0; i < map.length; i++) {
    if (map[i].includes(e.code)) { e.preventDefault(); pressLane(i); return; }
  }
}));
document.addEventListener('keyup', guard('keyup', e => {
  if (!G.spec) return;
  const map = LANE_KEYS[G.spec.lanes];
  for (let i = 0; i < map.length; i++) if (map[i].includes(e.code)) releaseLane(i);
}));

function buildTouchRow(lanes) {
  const row = $('#touchRow');
  row.innerHTML = '';
  for (let i = 0; i < lanes; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.addEventListener('pointerdown', guard('lane tap', ev => { ev.preventDefault(); pressLane(i); }));
    b.addEventListener('pointerup', () => releaseLane(i));
    b.addEventListener('pointercancel', () => releaseLane(i));
    row.appendChild(b);
  }
}

/* ---------------------------------------------------------
   11. FRAME LOOP
   --------------------------------------------------------- */
/* Audio is the only part of this that talks to the platform, so it is the only
   part that can throw for reasons outside the game. When it does, the run
   continues in silence instead of freezing on the countdown. */
let frameErrors = 0;
function audioPanic(err) {
  if (!Sound.disabled) {
    Sound.disabled = true;
    try { Sound.closeRun(); } catch (e) {}
    clearInterval(G.timer);
    console.warn('Audio stopped; continuing without music.', err);
  }
  if (++frameErrors > 40) quitRun();
}

function frame() {
  if (!G.running) return;
  try { stepFrame(); } catch (err) { logError('frame', err); audioPanic(err); }
  if (G.running) G.raf = requestAnimationFrame(frame);
}

function stepFrame() {
  if (G.diff && G.diff.rainbow) G.playHex = rainbowHex(performance.now() / 1000);

  const wall = performance.now() / 1000;
  const wallDelta = G.lastFrame ? wall - G.lastFrame : 0;
  if (wallDelta > 0.4) resyncAfterStall(wallDelta);
  G.lastFrame = performance.now() / 1000;

  /* Only trust the audio clock if it is actually ticking. A stalled one that
     still reports itself as running would otherwise drag the run backwards
     every frame and pin it on the countdown forever. */
  const aNow = Sound.ctx ? Sound.now() : 0;
  const audioDelta = G.lastAudio ? aNow - G.lastAudio : 0;
  G.lastAudio = aNow;
  const audioAlive = Sound.ctx && Sound.ctx.state === 'running' &&
                     Sound.music && audioDelta > wallDelta * 0.5;
  if (audioAlive) {
    const drift = (aNow - G.startTime) - (performance.now() / 1000 - G.perf0);
    if (Math.abs(drift) > 0.003 && Math.abs(drift) < 0.25) G.perf0 -= drift * 0.03;
  }

  scheduleMusic(); // belt and braces: the interval alone can be throttled
  const now = songTime();
  const w = windows();

  // late misses
  for (const n of G.notes) {
    if (!n.judged && n.time < now - w.good) judge(n, 'miss', w.good);
    if (n.time > now + 0.2) break;
  }

  draw(now);
  updateHud(now);

  if (!G.ended && now > G.endTime) finish(false);
}

function accuracy() {
  const c = G.counts;
  const total = c.perfect + c.great + c.good + c.miss;
  if (!total) return 100;
  return ((c.perfect + c.great * 0.7 + c.good * 0.35) / total) * 100;
}

function updateHud(now) {
  $('#hudScore').textContent = G.score.toLocaleString();
  $('#hudAcc').textContent = accuracy().toFixed(2) + '%';
  const p = Math.max(0, Math.min(1, now / G.endTime));
  $('#progressFill').style.width = (p * 100).toFixed(1) + '%';
  $('#healthFill').style.width = Math.max(0, G.health) + '%';

  const cd = $('#countdown');
  if (now < 0) {
    if (Sound.ctx && Sound.ctx.state !== 'running') { cd.textContent = 'TAP FOR SOUND'; return; }
    const beats = Math.ceil(-now / G.beatDur);
    cd.textContent = beats > 4 ? 'READY' : String(Math.min(4, beats));
  } else if (cd.textContent) {
    cd.textContent = '';
  }
}

/* ---------------------------------------------------------
   12. RENDER
   --------------------------------------------------------- */
function roundRect(x, y, w, h, r) {
  ctx2d.beginPath();
  ctx2d.moveTo(x + r, y);
  ctx2d.arcTo(x + w, y, x + w, y + h, r);
  ctx2d.arcTo(x + w, y + h, x, y + h, r);
  ctx2d.arcTo(x, y + h, x, y, r);
  ctx2d.arcTo(x, y, x + w, y, r);
  ctx2d.closePath();
}

function draw(now) {
  const { lanes, laneW, x0, recY, fieldW } = geometry();
  const hex = G.playHex;
  const approach = G.spec.approach;
  const perf = performance.now();

  ctx2d.clearRect(0, 0, W, H);

  // lane beds
  for (let i = 0; i < lanes; i++) {
    ctx2d.fillStyle = i % 2 ? 'rgba(255,255,255,0.018)' : 'rgba(255,255,255,0.032)';
    ctx2d.fillRect(x0 + i * laneW, 0, laneW, recY + 40);
  }

  // scrolling beat lines
  const firstBeat = Math.floor(now / G.beatDur) - 1;
  for (let b = firstBeat; b < firstBeat + approach / G.beatDur + 3; b++) {
    if (b < 0) continue;
    const t = b * G.beatDur;
    const y = recY * (1 - (t - now) / approach);
    if (y < -10 || y > recY) continue;
    ctx2d.strokeStyle = b % 4 === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.05)';
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    ctx2d.moveTo(x0, y + 0.5);
    ctx2d.lineTo(x0 + fieldW, y + 0.5);
    ctx2d.stroke();
  }

  // hit line
  ctx2d.strokeStyle = rgba(hex, 0.55);
  ctx2d.lineWidth = 2;
  ctx2d.beginPath();
  ctx2d.moveTo(x0, recY + 0.5);
  ctx2d.lineTo(x0 + fieldW, recY + 0.5);
  ctx2d.stroke();

  // receptors
  const size = Math.min(laneW * 0.66, 74);
  for (let i = 0; i < lanes; i++) {
    const cx = x0 + i * laneW + laneW / 2;
    const down = G.laneDown[i] && perf - G.laneDown[i] < 110;
    const flash = G.flashes.find(f => f.lane === i && perf - f.t < 160);

    ctx2d.save();
    ctx2d.translate(cx, recY);
    const s = size * (flash ? 1.12 : down ? 1.05 : 1);
    ctx2d.lineWidth = 2;
    const fcol = flash && flash.kind === 'spam' ? '#D4453A' : hex;
    ctx2d.strokeStyle = down || flash ? fcol : 'rgba(255,255,255,0.28)';
    if (flash) { ctx2d.shadowColor = fcol; ctx2d.shadowBlur = 26; }
    roundRect(-s / 2, -s / 2, s, s, 8);
    ctx2d.stroke();
    if (down || flash) { ctx2d.fillStyle = rgba(flash ? fcol : hex, flash ? 0.35 : 0.16); ctx2d.fill(); }
    ctx2d.restore();

    // key label
    ctx2d.fillStyle = 'rgba(255,255,255,0.30)';
    ctx2d.font = '600 11px "JetBrains Mono", monospace';
    ctx2d.textAlign = 'center';
    ctx2d.fillText(LANE_LABELS[lanes][i], cx, recY + size / 2 + 22);
  }

  // notes
  const nSize = size * 0.86;
  for (const n of G.notes) {
    const dt = n.time - now;
    if (dt > approach) break;
    if (n.judged || dt < -0.25) continue;
    const y = recY * (1 - dt / approach);
    const cx = x0 + n.lane * laneW + laneW / 2;
    const onBeat = Math.abs(n.beat - Math.round(n.beat)) < 0.01;

    ctx2d.save();
    ctx2d.translate(cx, y);
    ctx2d.fillStyle = hex;
    ctx2d.shadowColor = rgba(hex, 0.8);
    ctx2d.shadowBlur = onBeat ? 18 : 8;
    roundRect(-nSize / 2, -nSize / 2, nSize, nSize, 7);
    ctx2d.fill();
    ctx2d.shadowBlur = 0;
    ctx2d.fillStyle = onBeat ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.35)';
    const inner = nSize * (onBeat ? 0.26 : 0.5);
    roundRect(-inner / 2, -inner / 2, inner, inner, 3);
    ctx2d.fill();
    ctx2d.restore();
  }

  // hit sparks
  G.sparks = G.sparks.filter(s => perf - s.t < 320);
  for (const s of G.sparks) {
    const k = (perf - s.t) / 320;
    const cx = x0 + s.lane * laneW + laneW / 2;
    ctx2d.strokeStyle = rgba(hex, (1 - k) * 0.6);
    ctx2d.lineWidth = 2 * (1 - k) + 0.5;
    ctx2d.beginPath();
    ctx2d.arc(cx, recY, size * 0.5 + k * 46, 0, Math.PI * 2);
    ctx2d.stroke();
  }
  G.flashes = G.flashes.filter(f => perf - f.t < 200);

  // combo
  if (G.combo > 2) {
    ctx2d.textAlign = 'center';
    ctx2d.fillStyle = rgba(hex, 0.9);
    ctx2d.font = '700 46px "JetBrains Mono", monospace';
    ctx2d.fillText(String(G.combo), W / 2, recY * 0.46);
    ctx2d.fillStyle = 'rgba(255,255,255,0.32)';
    ctx2d.font = '600 11px "Chakra Petch", sans-serif';
    ctx2d.fillText('COMBO', W / 2, recY * 0.46 + 20);
  }

  // tutorial captions
  if (G.spec.tutorial) {
    const beat = now / G.beatDur;
    let tip = '';
    for (const [b, text] of TUTORIAL_TIPS) if (beat >= b) tip = text;
    if (tip) {
      ctx2d.textAlign = 'center';
      ctx2d.fillStyle = 'rgba(236,238,245,0.72)';
      ctx2d.font = '600 15px "Chakra Petch", sans-serif';
      ctx2d.fillText(tip, W / 2, Math.max(34, recY * 0.16));
    }
  }

  // judgment popup
  if (G.popup && perf - G.popup.t < 520) {
    const k = (perf - G.popup.t) / 520;
    const label = { perfect: 'PERFECT', great: 'GREAT', good: 'GOOD', miss: 'MISS', spam: 'MISS' }[G.popup.kind];
    const col = (G.popup.kind === 'miss' || G.popup.kind === 'spam') ? '#D4453A'
      : G.popup.kind === 'perfect' ? hex
      : G.popup.kind === 'great' ? '#EAECF3' : '#8E93A6';
    ctx2d.globalAlpha = 1 - k * k;
    ctx2d.textAlign = 'center';
    ctx2d.fillStyle = col;
    ctx2d.font = '700 26px "Chakra Petch", sans-serif';
    ctx2d.fillText(label, W / 2, recY * 0.72 - k * 14);
    if (G.popup.kind !== 'miss' && G.popup.kind !== 'spam') {
      ctx2d.font = '400 11px "JetBrains Mono", monospace';
      ctx2d.fillStyle = 'rgba(255,255,255,0.4)';
      const ms = G.popup.dt * 1000;
      ctx2d.fillText(`${ms >= 0 ? '+' : ''}${ms.toFixed(0)} ms`, W / 2, recY * 0.72 + 16 - k * 14);
    }
    ctx2d.globalAlpha = 1;
  }
}

/* ---------------------------------------------------------
   13. RESULTS
   --------------------------------------------------------- */
function rankFor(acc, failed) {
  if (failed) return 'F';
  if (acc >= 99.9) return 'SSS';
  if (acc >= 98) return 'SS';
  if (acc >= 95) return 'S';
  if (acc >= 90) return 'A';
  if (acc >= 80) return 'B';
  if (acc >= 70) return 'C';
  if (acc >= 60) return 'D';
  return 'E';
}
const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];

function finish(failed) {
  if (G.ended) return;
  G.ended = true;
  stopRun();
  $('#countdown').textContent = '';

  const acc = accuracy();
  const rank = rankFor(acc, failed);
  const c = G.counts;
  const mean = G.offsets.length
    ? G.offsets.reduce((a, b) => a + b, 0) / G.offsets.length : 0;

  $('#resVerdict').textContent = failed
    ? (G.deathBy === 'spam' ? 'Mashed out' : 'Tower fallen')
    : (G.practice ? 'Cleared — practice' : 'Cleared');
  $('#resVerdict').classList.toggle('failed', failed);
  $('#resLevel').textContent = `${G.spec.abbr} · ${G.spec.name}`;
  $('#resDiff').textContent = `${G.diff.name} · ${G.spec.bpm} BPM`;
  $('#resRank').textContent = rank;
  $('#resAcc').textContent = acc.toFixed(2) + '%';
  $('#resCombo').textContent = G.maxCombo + 'x';
  $('#resScore').textContent = G.score.toLocaleString();
  $('#resPerfect').textContent = c.perfect;
  $('#resGreat').textContent = c.great;
  $('#resGood').textContent = c.good;
  $('#resMiss').textContent = c.miss;
  $('#resGhost').textContent = G.ghosts;
  $('#resOffset').textContent = `${mean >= 0 ? '+' : ''}${mean.toFixed(1)} ms`;

  if (!failed && !G.practice) {
    const prev = BEST[G.spec.name];
    if (!prev || RANK_ORDER.indexOf(rank) > RANK_ORDER.indexOf(prev)) BEST[G.spec.name] = rank;
  }

  showScreen('results');
}

/* ---------------------------------------------------------
   14. WIRING
   --------------------------------------------------------- */
$('#diagBtn').addEventListener('click', renderDiagnostics);
$('#diagClose').addEventListener('click', () => { $('#diagPanel').hidden = true; });
$('#quitBtn').addEventListener('click', quitRun);
$('#gateBack').addEventListener('click', closeGate);
$('#gateGo').addEventListener('click', () => {
  const run = pendingRun;
  closeGate();
  if (run) startLevel(run.spec, run.diff);
});
$('#backBtn').addEventListener('click', () => { showScreen('select'); renderDetail(); });
$('#retryBtn').addEventListener('click', () => startLevel(G.spec, G.diff));
$('#volume').addEventListener('input', e => Sound.setVolume(e.target.value / 100));

buildRail();
setInterval(guard('rainbow', tickRainbow), 60);
applyTheme(activeDiff);
renderDetail();
