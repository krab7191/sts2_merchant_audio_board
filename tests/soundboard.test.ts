import { describe, it, expect, vi, afterEach } from 'vitest';
import { pickRandomClip } from '../src/lib/soundboard';
import type { AudioCategory } from '../src/data/audioManifest';

function category(overrides: Partial<AudioCategory>): AudioCategory {
  return {
    id: 'test',
    label: 'Test',
    description: 'A test category',
    clipCount: 3,
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('pickRandomClip', () => {
  it('builds a url from the category id and chosen clip number', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { url, clipNumber } = pickRandomClip(category({ id: 'welcome', clipCount: 4 }), null);
    expect(clipNumber).toBe(1);
    expect(url).toBe('/audio/welcome/1.mp3');
  });

  it('picks the last clip when Math.random resolves to just under 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999);
    const { clipNumber } = pickRandomClip(category({ clipCount: 4 }), null);
    expect(clipNumber).toBe(4);
  });

  it('never repeats the immediately-previous clip when more than one clip exists', () => {
    const cat = category({ clipCount: 3 });
    for (let i = 0; i < 200; i++) {
      const { clipNumber } = pickRandomClip(cat, 2);
      expect(clipNumber).not.toBe(2);
    }
  });

  it('has no choice but to repeat when the category has exactly one clip', () => {
    const cat = category({ clipCount: 1 });
    const { clipNumber } = pickRandomClip(cat, 1);
    expect(clipNumber).toBe(1);
  });

  it('treats lastPlayedNumber = null as "no exclusion" (can return any clip)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { clipNumber } = pickRandomClip(category({ clipCount: 5 }), null);
    expect(clipNumber).toBe(1);
  });

  it('throws for a misconfigured category with zero clips', () => {
    const cat = category({ clipCount: 0 });
    expect(() => pickRandomClip(cat, null)).toThrow(/no clips configured/);
  });

  it('only ever returns numbers within [1, clipCount]', () => {
    const cat = category({ clipCount: 6 });
    for (let i = 0; i < 300; i++) {
      const { clipNumber } = pickRandomClip(cat, null);
      expect(clipNumber).toBeGreaterThanOrEqual(1);
      expect(clipNumber).toBeLessThanOrEqual(6);
    }
  });
});
