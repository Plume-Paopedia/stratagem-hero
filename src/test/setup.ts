import '@testing-library/jest-dom/vitest';

// Mock AudioContext for tests
class MockAudioContext {
  createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, type: '', frequency: { value: 0 } }; }
  createGain() { return { connect: () => {}, gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
  get currentTime() { return 0; }
  get destination() { return {}; }
}

Object.defineProperty(globalThis, 'AudioContext', {
  value: MockAudioContext,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
