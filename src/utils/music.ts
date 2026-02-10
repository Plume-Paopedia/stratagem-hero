/**
 * Procedural Helldivers 2-style music engine.
 * Generates a looping military march with synth brass, war drums, and patriotic melody.
 * Everything synthesized in real-time — zero external audio files.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isPlaying = false;
let intervalIds: number[] = [];
let oscillators: OscillatorNode[] = [];
let currentBeat = 0;
let bpm = 140;

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

/** Play a short percussive hit (kick/snare) */
function playDrum(freq: number, decay: number, volume: number, noise = false) {
  const c = getCtx();
  const m = getMaster();
  const now = c.currentTime;

  if (noise) {
    // Snare: noise burst
    const bufferSize = c.sampleRate * decay;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const g = c.createGain();
    g.gain.setValueAtTime(volume * 0.4, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + decay);

    // Also add a tonal hit
    const osc = c.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.3, now + decay * 0.5);
    const og = c.createGain();
    og.gain.setValueAtTime(volume * 0.5, now);
    og.gain.exponentialRampToValueAtTime(0.001, now + decay * 0.5);

    src.connect(g).connect(m);
    osc.connect(og).connect(m);
    src.start(now);
    osc.start(now);
    osc.stop(now + decay);
  } else {
    // Kick drum
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + decay);
    const g = c.createGain();
    g.gain.setValueAtTime(volume, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + decay);
    osc.connect(g).connect(m);
    osc.start(now);
    osc.stop(now + decay);
  }
}

/** Play a synth brass note */
function playBrass(freq: number, duration: number, volume: number, delay = 0) {
  const c = getCtx();
  const m = getMaster();
  const now = c.currentTime + delay;

  // Two detuned sawtooths for thick brass
  const osc1 = c.createOscillator();
  const osc2 = c.createOscillator();
  osc1.type = 'sawtooth';
  osc2.type = 'sawtooth';
  osc1.frequency.setValueAtTime(freq, now);
  osc2.frequency.setValueAtTime(freq * 1.003, now); // Slight detune

  // Low-pass filter for warmth
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, now);
  filter.frequency.linearRampToValueAtTime(800, now + duration);
  filter.Q.value = 1;

  const g = c.createGain();
  g.gain.setValueAtTime(0.001, now);
  g.gain.linearRampToValueAtTime(volume, now + 0.05);
  g.gain.setValueAtTime(volume, now + duration - 0.08);
  g.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(g).connect(m);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration);
  osc2.stop(now + duration);
  oscillators.push(osc1, osc2);
}

/** Play a bass note */
function playBass(freq: number, duration: number, volume: number) {
  const c = getCtx();
  const m = getMaster();
  const now = c.currentTime;

  const osc = c.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, now);

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 300;
  filter.Q.value = 2;

  const g = c.createGain();
  g.gain.setValueAtTime(volume, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(filter).connect(g).connect(m);
  osc.start(now);
  osc.stop(now + duration);
  oscillators.push(osc);
}

// Note frequencies
const NOTE: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, Bb3: 233.08, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 784.0,
};

// Patriotic military melody — reminiscent of HD2 march vibes
// Pattern repeats every 32 beats (2 bars of 4/4 at subdivided 8ths)
const melodyPattern: (string | null)[] = [
  'C4', null, 'C4', 'D4', 'E4', null, 'E4', 'F4',    // Beat 1-8
  'G4', null, 'G4', null, 'E4', null, 'C4', null,     // Beat 9-16
  'F4', null, 'F4', 'E4', 'D4', null, 'D4', 'E4',    // Beat 17-24
  'C4', null, null, null, 'G4', null, 'C5', null,     // Beat 25-32
];

const melodyPattern2: (string | null)[] = [
  'E4', null, 'E4', 'F4', 'G4', null, 'G4', 'A4',    // Beat 1-8
  'C5', null, 'C5', null, 'G4', null, 'E4', null,     // Beat 9-16
  'A4', null, 'G4', 'F4', 'E4', null, 'D4', null,    // Beat 17-24
  'C4', null, null, null, null, null, null, null,      // Beat 25-32
];

const bassPattern: (string | null)[] = [
  'C3', null, null, null, 'G3', null, null, null,
  'C3', null, null, null, 'E3', null, null, null,
  'F3', null, null, null, 'G3', null, null, null,
  'C3', null, null, null, 'G3', null, null, null,
];

// March drum pattern: K = kick, S = snare, H = hihat-ish
// Strong march: BOOM-tap-BOOM-tap
const drumPattern: ('K' | 'S' | 'H' | null)[] = [
  'K', null, 'H', null, 'S', null, 'H', null,
  'K', null, 'H', 'H', 'S', null, 'H', null,
  'K', null, 'H', null, 'S', null, 'H', null,
  'K', 'K', 'H', null, 'S', null, 'S', 'S',
];

let phraseIndex = 0;

function tick() {
  const beatInPattern = currentBeat % 32;
  const melody = phraseIndex % 2 === 0 ? melodyPattern : melodyPattern2;

  // Drums
  const drum = drumPattern[beatInPattern];
  if (drum === 'K') playDrum(150, 0.15, 0.6);
  else if (drum === 'S') playDrum(200, 0.12, 0.5, true);
  else if (drum === 'H') playDrum(800, 0.04, 0.15, true);

  // Bass
  const bassNote = bassPattern[beatInPattern];
  if (bassNote) playBass(NOTE[bassNote], 0.3, 0.35);

  // Melody (brass)
  const melNote = melody[beatInPattern];
  if (melNote) {
    const dur = 0.18;
    playBrass(NOTE[melNote], dur, 0.2);
  }

  currentBeat++;
  if (beatInPattern === 31) {
    phraseIndex++;
  }
}

/** Start the music loop */
export function startMusic(volume: number) {
  if (isPlaying) return;
  isPlaying = true;
  currentBeat = 0;
  phraseIndex = 0;

  getCtx();
  if (masterGain) masterGain.gain.value = volume;

  const beatDuration = 60 / bpm / 2; // 8th note duration
  const id = window.setInterval(tick, beatDuration * 1000);
  intervalIds.push(id);
}

/** Stop the music */
export function stopMusic() {
  isPlaying = false;
  for (const id of intervalIds) clearInterval(id);
  intervalIds = [];
  for (const osc of oscillators) {
    try { osc.stop(); } catch { /* already stopped */ }
  }
  oscillators = [];
}

/** Update music volume (0-1) */
export function setMusicVolume(volume: number) {
  if (masterGain) masterGain.gain.value = volume;
}

/** Check if music is playing */
export function isMusicPlaying(): boolean {
  return isPlaying;
}
