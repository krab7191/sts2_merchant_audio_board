# sts2_merchant_audio_board

A Slay the Spire 2 Merchant soundboard — tap a mood, hear a random voice line. Astro (static) + Svelte island, native HTML5 `<audio>`, no backend.

Live at: deployed via rsync to `/opt/projects/merchant/` on push to `main` (see `.github/workflows/ci.yml`).

---

## Architecture

```
src/
  data/
    audioManifest.ts   — The 8 sentiment categories (id, label, description, clipCount).
                          clipCount for each must match the number of files actually
                          committed under public/audio/<id>/ — tests/audioManifest.test.ts
                          enforces this.
  lib/
    soundboard.ts       — Pure logic: pickRandomClip(category, lastPlayedNumber) picks a
                           random clip within a category, avoiding an immediate repeat
                           when the category has more than one clip.
  components/
    Soundboard.svelte   — Renders one button per category; clicking plays a random clip
                           via a single shared <audio> element.
  layouts/
    Layout.astro        — Page shell (meta tags, favicon, global.css).
  pages/
    index.astro         — The one page this site has.
  styles/
    global.css           — StS2 Merchant theme (navy/gold/magenta), matches the extractor
                            repo's original merchant_soundboard.html palette.
public/
  audio/<category>/<n>.mp3  — The 27 committed voice clips, organized by category.
```

## Where the audio came from

Extracted from a legitimately-owned copy of *Slay the Spire 2* using the sibling
[`hermes_sts2_merchant_voice_line_extractor`](../hermes_sts2_merchant_voice_line_extractor)
project. See that repo for how to re-extract if a future game patch changes the Merchant's
lines — if `clipCount` in `audioManifest.ts` needs to change, update it and re-run
`npm run test:coverage` locally; the manifest/disk-count test will fail loudly if they drift.

## Development

```bash
npm install
npm run dev             # http://localhost:4321
npm run lint
npm run typecheck
npm run test:coverage
npm run build            # outputs static site to dist/
npm run preview           # serve the built dist/ locally
```

`npm run ci` runs the full gate sequence (lint → typecheck → test:coverage → build) locally,
matching what GitHub Actions runs on every push/PR.

## Deploy

`.github/workflows/ci.yml` runs lint → typecheck → test:coverage → build as sequential gate
jobs; only if all four pass, and only on a push to `main`, does the `deploy` job rsync
`dist/` to `/opt/projects/merchant/` on the server. Requires two repo secrets:

- `SERVER_HOST` — the Hetzner box's hostname/IP.
- `SSH_PRIVATE_KEY` — a deploy key authorized as `root` on that host.

## Legal

Fan-made, non-commercial. Voice clips are © Mega Crit Games; this project is not affiliated
with or endorsed by Mega Crit Games. See the extractor repo's README for the full fair-use
notice covering how the audio was obtained.
