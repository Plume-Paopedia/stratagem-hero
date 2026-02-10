let audioCtx: AudioContext | null = null;

/** Get or create the shared AudioContext */
function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Play a pure tone */
function playTone(
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
  fadeOut = true,
) {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);

  if (fadeOut) {
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  }

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Play a frequency sweep */
function playSweep(
  startFreq: number,
  endFreq: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
) {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Play white noise burst */
function playNoise(duration: number, volume: number) {
  const ctx = getContext();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();

  source.buffer = buffer;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime);
}

/** Play a chord (multiple tones at once) */
function playChord(
  frequencies: number[],
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
) {
  const perNote = volume / frequencies.length;
  for (const freq of frequencies) {
    playTone(freq, duration, perNote, type);
  }
}

// ── Public sound functions ────────────────────────────────

export function playInputBeep(volume: number) {
  playTone(800, 0.05, volume * 0.3, 'square');
}

export function playSuccessJingle(volume: number) {
  const ctx = getContext();
  const v = volume * 0.25;
  // C-E-G ascending quick arpeggio
  setTimeout(() => playTone(523, 0.15, v, 'square'), 0);
  setTimeout(() => {
    if (ctx.state === 'running') playTone(659, 0.15, v, 'square');
  }, 60);
  setTimeout(() => {
    if (ctx.state === 'running') playTone(784, 0.2, v, 'square');
  }, 120);
}

export function playErrorBuzz(volume: number) {
  playTone(200, 0.15, volume * 0.3, 'sawtooth');
  playTone(210, 0.15, volume * 0.15, 'square');
}

export function playStreakUp(level: number, volume: number) {
  const v = volume * 0.25;
  if (level === 2) {
    playSweep(400, 800, 0.1, v, 'square');
  } else if (level === 3) {
    playSweep(400, 1200, 0.15, v, 'square');
  } else if (level >= 4) {
    playSweep(400, 1600, 0.2, v, 'square');
    setTimeout(() => playSweep(600, 1800, 0.15, v * 0.6, 'sine'), 50);
  }
}

export function playStreakLost(volume: number) {
  playSweep(800, 200, 0.2, volume * 0.25, 'sawtooth');
}

export function playTimerWarning(volume: number) {
  playTone(1000, 0.08, volume * 0.2, 'square');
}

export function playGameOver(volume: number) {
  const v = volume * 0.2;
  playChord([220, 261, 311], 0.5, v, 'sawtooth');
}

export function playMenuClick(volume: number) {
  playTone(2000, 0.02, volume * 0.15, 'square');
}

export function playCountdownBeep(num: number, volume: number) {
  if (num > 1) {
    playTone(300, 0.15, volume * 0.25, 'square');
  } else {
    playTone(600, 0.2, volume * 0.3, 'square');
  }
}

export function playDeploySound(volume: number) {
  playNoise(0.15, volume * 0.2);
  playSweep(200, 2000, 0.3, volume * 0.25, 'sine');
}

export function playRecordFanfare(volume: number) {
  const v = volume * 0.2;
  // Quick major arpeggio: C-E-G-C
  setTimeout(() => playTone(523, 0.12, v, 'square'), 0);
  setTimeout(() => playTone(659, 0.12, v, 'square'), 80);
  setTimeout(() => playTone(784, 0.12, v, 'square'), 160);
  setTimeout(() => playTone(1047, 0.2, v, 'square'), 240);
}
