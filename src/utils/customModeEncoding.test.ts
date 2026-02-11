import { describe, it, expect } from 'vitest';
import { encodeConfig, decodeConfig } from './customModeEncoding';
import { defaultConfig } from '../stores/customModeStore';

describe('customModeEncoding', () => {
  it('round-trips a config through encode/decode', () => {
    const config = { ...defaultConfig, name: 'Test Mode', timerDuration: 90 };
    const encoded = encodeConfig(config);
    const decoded = decodeConfig(encoded);
    expect(decoded).toBeTruthy();
    expect(decoded!.name).toBe('Test Mode');
    expect(decoded!.timerDuration).toBe(90);
  });

  it('returns null for invalid base64', () => {
    expect(decodeConfig('not-valid-base64!!!')).toBeNull();
  });

  it('returns null for valid base64 but missing required fields', () => {
    const encoded = btoa(JSON.stringify({ foo: 'bar' }));
    expect(decodeConfig(encoded)).toBeNull();
  });

  it('returns null for invalid timerType', () => {
    const encoded = btoa(JSON.stringify({ name: 'test', timerType: 'invalid' }));
    expect(decodeConfig(encoded)).toBeNull();
  });

  it('merges with defaults for partial config', () => {
    const encoded = btoa(JSON.stringify({ name: 'Partial', timerType: 'none' }));
    const decoded = decodeConfig(encoded);
    expect(decoded).toBeTruthy();
    expect(decoded!.shuffle).toBe(defaultConfig.shuffle);
    expect(decoded!.scoreMultiplier).toBe(defaultConfig.scoreMultiplier);
  });
});
