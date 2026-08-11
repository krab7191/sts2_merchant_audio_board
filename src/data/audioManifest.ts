// Manifest of Merchant voice clips, generated from a manual extraction pass
// against Slay the Spire 2's sfx.bank (see the sibling hermes_sts2_merchant_
// voice_line_extractor repo). clipCount for each category must match the
// number of files actually committed under public/audio/<id>/ (1.mp3 through
// N.mp3) -- tests/audioManifest.test.ts checks this invariant.

export interface AudioCategory {
  id: string;
  label: string;
  description: string;
  clipCount: number;
}

export const AUDIO_CATEGORIES: AudioCategory[] = [
  { id: 'welcome', label: 'Welcome', description: 'Greeting a customer', clipCount: 4 },
  { id: 'thank_yous', label: 'Thank You', description: 'After a purchase', clipCount: 3 },
  {
    id: 'dissapointment',
    label: 'Disappointed',
    description: 'Walking away empty-handed',
    clipCount: 3,
  },
  { id: 'passive', label: 'Passive Mumble', description: 'Idle background muttering', clipCount: 2 },
  { id: 'laughter', label: 'Laughter', description: 'Amused cackle', clipCount: 2 },
  {
    id: 'die',
    label: 'Reversed: Death Cry',
    description: 'Backwards death cry',
    clipCount: 3,
  },
  {
    id: 'hehe',
    label: 'Reversed: Cackle',
    description: 'Backwards cackle',
    clipCount: 6,
  },
  {
    id: 'hurt_sad',
    label: 'Reversed: Pained',
    description: 'Backwards pained cry',
    clipCount: 4,
  },
];

export function getCategory(id: string): AudioCategory | undefined {
  return AUDIO_CATEGORIES.find((c) => c.id === id);
}

export function clipUrl(categoryId: string, clipNumber: number): string {
  return `/audio/${categoryId}/${clipNumber}.mp3`;
}
