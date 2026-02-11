/**
 * 8-bit Helldivers 2 music engine.
 * Chiptune renditions of HD2-inspired heroic themes.
 * All synthesized in real-time via Web Audio API — zero external files.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isPlaying = false;
let intervalId: number | null = null;
let currentBeat = 0;
let phraseIndex = 0;
const bpm = 150;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
}

// ── Note frequencies ──────────────────────────────────────────────────

const NOTE: Record<string, number> = {
  G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 784.0,
};

// ── 8-bit Instrument voices ──────────────────────────────────────────

/** NES-style pulse lead with vibrato */
function playLead(freq: number, duration: number, volume: number) {
  const c = getCtx();
  const m = getMaster();
  const now = c.currentTime;

  const osc = c.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, now);

  // Vibrato LFO
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 5;
  lfoGain.gain.value = freq * 0.015; // ~1.5% pitch wobble
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  lfo.start(now);
  lfo.stop(now + duration);

  const g = c.createGain();
  g.gain.setValueAtTime(volume, now);
  g.gain.setValueAtTime(volume * 0.9, now + duration * 0.7);
  g.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(g).connect(m);
  osc.start(now);
  osc.stop(now + duration);
}

/** Chiptune arpeggio — rapidly cycles chord tones */
function playArpeggio(notes: number[], speed: number, duration: number, volume: number) {
  const c = getCtx();
  const m = getMaster();
  const now = c.currentTime;

  const osc = c.createOscillator();
  osc.type = 'square';

  // Schedule rapid frequency changes
  const cycleTime = speed;
  let t = now;
  while (t < now + duration) {
    for (const note of notes) {
      if (t >= now + duration) break;
      osc.frequency.setValueAtTime(note, t);
      t += cycleTime;
    }
  }

  const g = c.createGain();
  g.gain.setValueAtTime(volume * 0.5, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(g).connect(m);
  osc.start(now);
  osc.stop(now + duration);
}

/** Triangle wave bass (classic NES) */
function playBass(freq: number, duration: number, volume: number) {
  const c = getCtx();
  const m = getMaster();
  const now = c.currentTime;

  const osc = c.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);

  const g = c.createGain();
  g.gain.setValueAtTime(volume, now);
  g.gain.setValueAtTime(volume * 0.8, now + duration * 0.6);
  g.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(g).connect(m);
  osc.start(now);
  osc.stop(now + duration);
}

/** 8-bit kick drum — short triangle pitch sweep */
function playKick(volume: number) {
  const c = getCtx();
  const m = getMaster();
  const now = c.currentTime;

  const osc = c.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

  const g = c.createGain();
  g.gain.setValueAtTime(volume, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(g).connect(m);
  osc.start(now);
  osc.stop(now + 0.12);
}

/** 8-bit snare — noise + triangle hit */
function playSnare(volume: number) {
  const c = getCtx();
  const m = getMaster();
  const now = c.currentTime;

  // Noise burst
  const bufSize = c.sampleRate * 0.08;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const ng = c.createGain();
  ng.gain.setValueAtTime(volume * 0.5, now);
  ng.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  // Tonal hit
  const osc = c.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
  const og = c.createGain();
  og.gain.setValueAtTime(volume * 0.4, now);
  og.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  src.connect(ng).connect(m);
  osc.connect(og).connect(m);
  src.start(now);
  osc.start(now);
  osc.stop(now + 0.08);
}

/** 8-bit hihat — filtered noise, very short */
function playHihat(volume: number) {
  const c = getCtx();
  const m = getMaster();
  const now = c.currentTime;

  const bufSize = c.sampleRate * 0.03;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  }
  const src = c.createBufferSource();
  src.buffer = buf;

  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 8000;
  bp.Q.value = 1;

  const g = c.createGain();
  g.gain.setValueAtTime(volume * 0.2, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  src.connect(bp).connect(g).connect(m);
  src.start(now);
}

/** Crash cymbal for phrase transitions */
function playCrash(volume: number) {
  const c = getCtx();
  const m = getMaster();
  const now = c.currentTime;

  const bufSize = c.sampleRate * 0.3;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize) ** 0.5;
  }
  const src = c.createBufferSource();
  src.buffer = buf;

  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 4000;

  const g = c.createGain();
  g.gain.setValueAtTime(volume * 0.25, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  src.connect(hp).connect(g).connect(m);
  src.start(now);
}

// ── Composition: HD2-inspired 8-bit themes ───────────────────────────
// 32 steps per phrase at 8th-note resolution

// Theme A: "A Cup of Liber-Tea" inspired — heroic ascending fanfare
const themeA: (string | null)[] = [
  'C4', null, 'C4', 'E4',   'G4', null, 'G4', null,     // Heroic opening C-E-G
  'A4', null, 'G4', null,   'F4', 'E4', 'D4', null,     // Descending answer
  'E4', null, 'E4', 'G4',   'C5', null, 'C5', null,     // Rise to octave
  'B4', null, 'A4', 'G4',   'A4', null, null, null,      // Resolution
];

// Theme B: Military staccato counter-melody
const themeB: (string | null)[] = [
  'G4', 'G4', null, 'G4',   'E4', null, 'C4', null,     // Repeated-note march
  'D4', null, 'D4', 'F4',   'A4', null, 'G4', null,     // Rising tension
  'C5', null, 'B4', 'A4',   'G4', null, 'G4', 'A4',     // Climactic descent
  'G4', null, 'E4', null,   'C4', null, null, null,      // Cadence
];

// Theme C: Triumph fanfare — bold and climactic
const themeC: (string | null)[] = [
  'C5', null, 'C5', null,   'G4', null, 'G4', null,     // Bold octave statements
  'A4', 'A4', null, 'A4',   'G4', null, 'E4', null,     // Driving rhythm
  'F4', null, 'E4', 'D4',   'E4', null, 'G4', null,     // Tension builder
  'C5', null, null, 'G4',   'C5', null, 'E5', null,     // Triumphant leap
];

// Bass lines matched to themes
const bassA: (string | null)[] = [
  'C3', null, null, null,   'C3', null, null, null,
  'F3', null, null, null,   'G3', null, null, null,
  'C3', null, null, null,   'E3', null, null, null,
  'F3', null, 'G3', null,   'C3', null, null, null,
];

const bassB: (string | null)[] = [
  'C3', null, 'E3', null,   'G3', null, 'C3', null,
  'D3', null, 'F3', null,   'A3', null, 'G3', null,
  'C3', null, 'B2', null,   'A2', null, 'G2', null,
  'F3', null, 'G3', null,   'C3', null, null, null,
];

const bassC: (string | null)[] = [
  'C3', null, null, 'G3',   'C3', null, null, 'G3',
  'A2', null, null, 'A2',   'G2', null, null, null,
  'F3', null, 'E3', null,   'C3', null, 'G3', null,
  'C3', null, null, null,   'C3', null, 'C3', null,
];

// Arpeggio chord progressions per theme (root, 3rd, 5th)
const arpA: ([string, string, string] | null)[] = [
  ['C4', 'E4', 'G4'], null, null, null,  null, null, null, null,
  ['F4', 'A4', 'C5'], null, null, null,  null, null, null, null,
  ['C4', 'E4', 'G4'], null, null, null,  null, null, null, null,
  ['F4', 'A4', 'C5'], null, null, null,  ['G4', 'B4', 'D5'], null, null, null,
];

// Drum patterns
const drumMain: ('K' | 'S' | 'H' | null)[] = [
  'K', null, 'H', null,   'S', null, 'H', null,
  'K', null, 'H', 'H',   'S', null, 'H', null,
  'K', null, 'H', null,   'S', null, 'H', null,
  'K', 'K', 'H', null,   'S', null, 'S', 'H',
];

const drumIntense: ('K' | 'S' | 'H' | null)[] = [
  'K', null, 'H', 'K',   'S', null, 'K', 'H',
  'K', 'H', 'H', 'K',   'S', null, 'H', 'H',
  'K', null, 'H', 'K',   'S', 'H', 'K', 'H',
  'K', 'K', 'S', 'H',   'S', 'K', 'S', 'S',
];

// Song structure: 8 phrases before full loop (A-A-B-A-B-B-C-A)
const songStructure = [0, 0, 1, 0, 1, 1, 2, 0]; // indexes into theme arrays
const themes = [themeA, themeB, themeC];
const basses = [bassA, bassB, bassC];

// ── Beat tick ─────────────────────────────────────────────────────────

function tick() {
  const beatInPhrase = currentBeat % 32;
  const structureIndex = phraseIndex % songStructure.length;
  const themeIdx = songStructure[structureIndex];

  const melody = themes[themeIdx];
  const bass = basses[themeIdx];
  const drums = themeIdx === 2 ? drumIntense : drumMain;

  // Crash on phrase start
  if (beatInPhrase === 0 && phraseIndex > 0) {
    playCrash(0.5);
  }

  // Drums
  const drum = drums[beatInPhrase];
  if (drum === 'K') playKick(0.55);
  else if (drum === 'S') playSnare(0.45);
  else if (drum === 'H') playHihat(0.4);

  // Bass (triangle)
  const bassNote = bass[beatInPhrase];
  if (bassNote && NOTE[bassNote]) {
    playBass(NOTE[bassNote], 0.25, 0.3);
  }

  // Lead melody (pulse/square with vibrato)
  const melNote = melody[beatInPhrase];
  if (melNote && NOTE[melNote]) {
    playLead(NOTE[melNote], 0.18, 0.18);
  }

  // Arpeggios (only on theme A phrases, every 8 beats)
  if (themeIdx === 0 && arpA[beatInPhrase]) {
    const chord = arpA[beatInPhrase]!;
    const freqs = chord.map((n) => NOTE[n]).filter(Boolean);
    if (freqs.length === 3) {
      playArpeggio(freqs, 0.04, 0.25, 0.12);
    }
  }

  currentBeat++;
  if (beatInPhrase === 31) {
    phraseIndex++;
  }
}

// ── Public API (unchanged signatures) ────────────────────────────────

export function startMusic(volume: number) {
  if (isPlaying) return;
  isPlaying = true;
  currentBeat = 0;
  phraseIndex = 0;

  getCtx();
  if (masterGain) masterGain.gain.value = volume;

  const eighthNote = 60 / bpm / 2;
  intervalId = window.setInterval(tick, eighthNote * 1000);
}

export function stopMusic() {
  isPlaying = false;
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function setMusicVolume(volume: number) {
  if (masterGain) masterGain.gain.value = volume;
}

export function isMusicPlaying(): boolean {
  return isPlaying;
}
