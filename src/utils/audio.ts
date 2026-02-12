let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

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

export function playInputBeep(volume: number) {
  playTone(800, 0.05, volume * 0.3, 'square');
}

export function playSuccessJingle(volume: number) {
  const ctx = getContext();
  const v = volume * 0.25;

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

    setTimeout(() => playTone(523, 0.06, v * 0.5, 'square'), 50);
    setTimeout(() => playTone(659, 0.06, v * 0.5, 'square'), 90);
    setTimeout(() => playTone(784, 0.08, v * 0.5, 'square'), 130);
  } else if (level === 3) {
    playSweep(300, 1200, 0.15, v, 'square');

    playChord([523, 659, 784], 0.2, v * 0.6, 'square');
    playTone(80, 0.15, v * 0.8, 'sine');
  } else if (level >= 4) {

    playSweep(400, 1600, 0.2, v, 'square');
    playSweep(600, 1800, 0.15, v * 0.6, 'sine');
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.1, v * 0.6, 'square'), i * 60);
    });

    playTone(60, 0.2, v * 0.9, 'sine');
    setTimeout(() => playTone(80, 0.15, v * 0.7, 'sine'), 100);

    setTimeout(() => playNoise(0.08, v * 0.4), 280);
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

  setTimeout(() => playTone(523, 0.12, v, 'square'), 0);
  setTimeout(() => playTone(659, 0.12, v, 'square'), 80);
  setTimeout(() => playTone(784, 0.12, v, 'square'), 160);
  setTimeout(() => playTone(1047, 0.2, v, 'square'), 240);
}

export function playPowerSurge(multiplier: number, volume: number) {
  const v = volume * 0.15;
  const ctx = getContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(v, now + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.35);

  if (multiplier >= 4) {
    [160, 240].forEach((freq) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(v * 0.4, now + 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.3);
    });
  }
}

export function playLetterTick(volume: number) {
  playTone(1200, 0.015, volume * 0.12, 'square');
}

export function playSlotConfirm(volume: number) {
  playTone(880, 0.08, volume * 0.2, 'square');
  setTimeout(() => playTone(1100, 0.06, volume * 0.15, 'square'), 50);
}

export function playOrbitalStrike(volume: number) {
  const v = volume * 0.25;

  playSweep(4000, 200, 0.4, v, 'sawtooth');

  setTimeout(() => {
    playNoise(0.15, v * 0.6);
    playTone(60, 0.3, v * 0.8, 'sine');
  }, 350);
}
