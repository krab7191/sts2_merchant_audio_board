import { clipUrl, type AudioCategory } from '../data/audioManifest';

export interface PickedClip {
  url: string;
  clipNumber: number;
}

// Picks a random clip within a category, avoiding an immediate repeat of
// lastPlayedNumber when the category has more than one clip to choose from
// (a category with exactly one clip has no other option but to repeat it).
export function pickRandomClip(
  category: AudioCategory,
  lastPlayedNumber: number | null
): PickedClip {
  if (category.clipCount <= 0) {
    throw new Error(`Category "${category.id}" has no clips configured`);
  }

  const allNumbers = Array.from({ length: category.clipCount }, (_, i) => i + 1);
  const candidates =
    category.clipCount > 1 && lastPlayedNumber !== null
      ? allNumbers.filter((n) => n !== lastPlayedNumber)
      : allNumbers;

  const clipNumber = candidates[Math.floor(Math.random() * candidates.length)];
  return { url: clipUrl(category.id, clipNumber), clipNumber };
}
