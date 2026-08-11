// Manifest of Merchant voice clips, generated from a manual extraction pass
// against Slay the Spire 2's sfx.bank (see the sibling hermes_sts2_merchant_
// voice_line_extractor repo). clipCount for each category must match the
// number of files actually committed under public/audio/<id>/ (1.mp3 through
// N.mp3) -- tests/audioManifest.test.ts checks this invariant.
//
// variant: confirmed by decompiling the game's own C# (sts2.dll), not
// inferred from filenames. The 'merchant' events are the real shopkeeper.
// The 'fake_merchant' events (originally named "reverse_merchant" in the
// sound bank) belong to a hidden impostor merchant: `laugh` is its
// unconditional greeting sound (plays every time you meet one, before you'd
// otherwise know it's fake), and `hurt`/`die` are FakeMerchantMonster's
// combat sounds -- reachable by throwing a Foul Potion at it, which starts a
// fight; defeating it drops all of its stocked inventory as loot.

export type MerchantVariant = 'merchant' | 'fake_merchant';

export interface AudioCategory {
  id: string;
  label: string;
  variant: MerchantVariant;
  clipCount: number;
}

export const AUDIO_CATEGORIES: AudioCategory[] = [
  { id: 'welcome', label: 'Welcome', variant: 'merchant', clipCount: 4 },
  { id: 'thank_yous', label: 'Thank You', variant: 'merchant', clipCount: 3 },
  { id: 'dissapointment', label: 'Disappointed', variant: 'merchant', clipCount: 3 },
  { id: 'passive', label: 'Passive', variant: 'merchant', clipCount: 2 },
  { id: 'laughter', label: 'Laughter', variant: 'merchant', clipCount: 2 },
  { id: 'hehe', label: 'Laugh', variant: 'fake_merchant', clipCount: 6 },
  { id: 'hurt_sad', label: 'Hurt', variant: 'fake_merchant', clipCount: 4 },
  { id: 'die', label: 'Die', variant: 'fake_merchant', clipCount: 3 },
];

export function getCategory(id: string): AudioCategory | undefined {
  return AUDIO_CATEGORIES.find((c) => c.id === id);
}

export function categoriesByVariant(variant: MerchantVariant): AudioCategory[] {
  return AUDIO_CATEGORIES.filter((c) => c.variant === variant);
}

export function clipUrl(categoryId: string, clipNumber: number): string {
  return `/audio/${categoryId}/${clipNumber}.mp3`;
}
