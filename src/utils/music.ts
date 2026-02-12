/**
 * Helldivers 2 music player.
 * Plays official OST tracks with contextual switching and crossfade.
 * Uses HTML5 Audio — files loaded on demand from public/audio/.
 */

export type TrackName = 'menu' | 'gameplay' | 'countdown' | 'gameover';

const BASE = import.meta.env.BASE_URL;

const TRACKS: Record<TrackName, string> = {
  menu: `${BASE}audio/a-cup-of-liber-tea.webm`,
  gameplay: `${BASE}audio/the-super-destroyer.webm`,
  countdown: `${BASE}audio/hellpods-primed.webm`,
  gameover: `${BASE}audio/mission-review.webm`,
};

const CROSSFADE_MS = 800;

let currentAudio: HTMLAudioElement | null = null;
let currentTrack: TrackName | null = null;
let volume = 0.3;
let playing = false;

// Preload cache — avoids re-creating Audio objects
const cache = new Map<TrackName, HTMLAudioElement>();

function getAudio(track: TrackName): HTMLAudioElement {
  let audio = cache.get(track);
  if (!audio) {
    audio = new Audio(TRACKS[track]);
    audio.loop = true;
    audio.preload = 'auto';
    cache.set(track, audio);
  }
  return audio;
}

function fadeOut(audio: HTMLAudioElement, durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    const startVol = audio.volume;
    const steps = 20;
    const stepMs = durationMs / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      audio.volume = Math.max(0, startVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(interval);
        audio.pause();
        audio.volume = startVol;
        resolve();
      }
    }, stepMs);
  });
}

function fadeIn(audio: HTMLAudioElement, targetVol: number, durationMs: number) {
  audio.volume = 0;
  audio.play().catch(() => {});
  const steps = 20;
  const stepMs = durationMs / steps;
  let step = 0;
  const interval = setInterval(() => {
    step++;
    audio.volume = Math.min(targetVol, targetVol * (step / steps));
    if (step >= steps) {
      clearInterval(interval);
    }
  }, stepMs);
}

// ── Public API (same signatures as old chiptune engine) ─────────────

export function startMusic(vol: number) {
  volume = vol;
  if (playing) return;
  playing = true;
  // Default to menu track
  if (!currentTrack) currentTrack = 'menu';
  const audio = getAudio(currentTrack);
  audio.volume = volume;
  audio.play().catch(() => {});
  currentAudio = audio;
}

export function stopMusic() {
  playing = false;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
}

export function setMusicVolume(vol: number) {
  volume = vol;
  if (currentAudio && playing) {
    currentAudio.volume = vol;
  }
}

export function isMusicPlaying(): boolean {
  return playing;
}

// ── New: contextual track switching ─────────────────────────────────

export function switchTrack(track: TrackName) {
  if (track === currentTrack) return;
  currentTrack = track;

  if (!playing) return;

  const next = getAudio(track);
  next.currentTime = 0;

  if (currentAudio && !currentAudio.paused) {
    // Crossfade: fade out current, fade in next
    const prev = currentAudio;
    fadeOut(prev, CROSSFADE_MS);
    fadeIn(next, volume, CROSSFADE_MS);
  } else {
    next.volume = volume;
    next.play().catch(() => {});
  }

  currentAudio = next;
}
