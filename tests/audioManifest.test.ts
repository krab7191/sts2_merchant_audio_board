import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { AUDIO_CATEGORIES, getCategory, categoriesByVariant, clipUrl } from '../src/data/audioManifest';

describe('AUDIO_CATEGORIES', () => {
  it('has 8 categories', () => {
    expect(AUDIO_CATEGORIES).toHaveLength(8);
  });

  it('has unique ids', () => {
    const ids = AUDIO_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every category a positive clip count', () => {
    for (const category of AUDIO_CATEGORIES) {
      expect(category.clipCount).toBeGreaterThan(0);
    }
  });

  // Guards against the manifest silently drifting from what's actually
  // committed under public/audio/ (e.g. a file added/removed without
  // updating clipCount).
  it('declared clipCount matches the number of mp3 files committed on disk', () => {
    for (const category of AUDIO_CATEGORIES) {
      const dir = resolve(process.cwd(), 'public', 'audio', category.id);
      const files = readdirSync(dir).filter((f) => f.endsWith('.mp3'));
      expect(files, `public/audio/${category.id}`).toHaveLength(category.clipCount);
    }
  });

  it('every clip number from 1 to clipCount exists on disk', () => {
    for (const category of AUDIO_CATEGORIES) {
      const dir = resolve(process.cwd(), 'public', 'audio', category.id);
      const files = new Set(readdirSync(dir));
      for (let n = 1; n <= category.clipCount; n++) {
        expect(files.has(`${n}.mp3`), `public/audio/${category.id}/${n}.mp3`).toBe(true);
      }
    }
  });
});

describe('getCategory', () => {
  it('finds a category by id', () => {
    expect(getCategory('welcome')?.label).toBe('Welcome');
  });

  it('returns undefined for an unknown id', () => {
    expect(getCategory('nonexistent')).toBeUndefined();
  });
});

describe('clipUrl', () => {
  it('builds a public/ relative path', () => {
    expect(clipUrl('welcome', 2)).toBe('/audio/welcome/2.mp3');
  });
});

describe('categoriesByVariant', () => {
  it('returns the 5 real-Merchant categories', () => {
    const merchant = categoriesByVariant('merchant');
    expect(merchant).toHaveLength(5);
    expect(merchant.every((c) => c.variant === 'merchant')).toBe(true);
  });

  it('returns the 3 Fake-Merchant categories', () => {
    const fake = categoriesByVariant('fake_merchant');
    expect(fake).toHaveLength(3);
    expect(fake.every((c) => c.variant === 'fake_merchant')).toBe(true);
  });

  it('partitions every category into exactly one of the two variants', () => {
    const merchant = categoriesByVariant('merchant');
    const fake = categoriesByVariant('fake_merchant');
    expect(merchant.length + fake.length).toBe(AUDIO_CATEGORIES.length);
  });
});
