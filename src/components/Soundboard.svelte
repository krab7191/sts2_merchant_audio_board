<script lang="ts">
  import { AUDIO_CATEGORIES, categoriesByVariant } from '../data/audioManifest';
  import { pickRandomClip } from '../lib/soundboard';

  const merchantCategories = categoriesByVariant('merchant');
  const fakeMerchantCategories = categoriesByVariant('fake_merchant');

  let audioEl: HTMLAudioElement;
  let lastPlayed: Record<string, number> = {};
  let currentCategoryId: string | null = null;
  let currentClipNumber: number | null = null;
  let isPlaying = false;
  let errorMessage: string | null = null;

  function playCategory(categoryId: string): void {
    const category = AUDIO_CATEGORIES.find((c) => c.id === categoryId);
    if (!category) return;

    const { url, clipNumber } = pickRandomClip(category, lastPlayed[categoryId] ?? null);
    lastPlayed = { ...lastPlayed, [categoryId]: clipNumber };
    currentCategoryId = categoryId;
    currentClipNumber = clipNumber;
    errorMessage = null;

    audioEl.pause();
    audioEl.src = url;
    audioEl.play().catch(() => {
      errorMessage = 'Playback blocked — tap again.';
      isPlaying = false;
    });
  }

  $: currentCategory = AUDIO_CATEGORIES.find((c) => c.id === currentCategoryId) ?? null;
</script>

<div class="board">
  <div class="figure" class:playing={isPlaying}>
    <img src="/images/merchant-figure.webp" alt="" />
  </div>

  <div class="grids">
    <div class="group merchant">
      <div class="group-header">Merchant</div>
      <div class="group-grid">
        {#each merchantCategories as category (category.id)}
          <button
            type="button"
            class="tile"
            class:playing={isPlaying && currentCategoryId === category.id}
            on:click={(): void => playCategory(category.id)}
          >
            {category.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="group fake">
      <div class="group-header">Fake Merchant</div>
      <div class="group-grid">
        {#each fakeMerchantCategories as category (category.id)}
          <button
            type="button"
            class="tile fake"
            class:playing={isPlaying && currentCategoryId === category.id}
            on:click={(): void => playCategory(category.id)}
          >
            {category.label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div class="status" aria-live="polite">
    {#if errorMessage}
      <span class="error">{errorMessage}</span>
    {:else if currentCategory && currentClipNumber !== null}
      <span class="now-playing-label">{isPlaying ? 'Playing' : 'Played'}:</span>
      {currentCategory.label} <span class="clip-num">#{currentClipNumber}</span> of {currentCategory.clipCount}
    {:else}
      Tap a mood to hear the Merchant
    {/if}
  </div>

  <audio
    bind:this={audioEl}
    on:playing={(): void => {
      isPlaying = true;
    }}
    on:pause={(): void => {
      isPlaying = false;
    }}
    on:ended={(): void => {
      isPlaying = false;
    }}
    on:error={(): void => {
      isPlaying = false;
      errorMessage = 'Failed to play that clip.';
    }}
  ></audio>
</div>

<style>
  .board {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    padding: 0.4rem 1rem 0.75rem;
    gap: 0.5rem;
  }

  .figure {
    flex-shrink: 0;
    width: clamp(56px, 12vh, 110px);
    height: clamp(62px, 13.3vh, 122px);
    filter: drop-shadow(0 0 14px rgba(58, 86, 212, 0.4));
    transition: filter 0.3s ease;
  }

  .figure img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: -webkit-optimize-contrast;
  }

  .figure.playing {
    filter: drop-shadow(0 0 20px rgba(58, 86, 212, 0.5)) drop-shadow(0 0 12px rgba(194, 59, 79, 0.4));
    animation: figureFloat 2s ease-in-out infinite;
  }

  @keyframes figureFloat {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  .grids {
    flex: 1;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .group {
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  /* Flex-grow proportional to each group's row count, so a grid row ends up
     the same height in both groups (2 rows for merchant on narrow screens,
     1 row for fake-merchant, always) -- see the matching breakpoint below,
     which flips merchant back to a single row and its flex-grow to match. */
  .group.merchant {
    flex-grow: 2;
  }

  .group.fake {
    flex-grow: 1;
  }

  .group-header {
    flex-shrink: 0;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0 0.2rem;
  }

  .group.merchant .group-header {
    color: var(--gold);
  }

  .group.fake .group-header {
    color: var(--magenta);
  }

  .group-grid {
    flex: 1;
    min-height: 0;
    display: grid;
    gap: 0.4rem;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }

  .group.fake .group-grid {
    grid-template-rows: 1fr;
  }

  @media (min-width: 480px), (orientation: landscape) {
    .group.merchant .group-grid {
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: 1fr;
    }

    .group.merchant {
      flex-grow: 1;
    }
  }

  .tile {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 0.3rem 0.4rem;
    border-radius: var(--radius-sm);
    border: 2px solid var(--border);
    background: radial-gradient(circle at 50% 30%, var(--indigo-light) 0%, var(--indigo) 60%, var(--navy-deep) 100%);
    color: var(--cream);
    font-family: inherit;
    font-size: clamp(0.68rem, 2.4vh, 0.95rem);
    font-weight: bold;
    letter-spacing: 0.01em;
    text-align: center;
    cursor: pointer;
    transition:
      transform 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .tile:hover {
    border-color: var(--gold);
  }

  .tile:active {
    transform: scale(0.96);
  }

  .tile.fake {
    color: var(--gold-bright);
  }

  .tile.playing {
    border-color: var(--magenta);
    box-shadow: 0 0 18px var(--magenta-glow);
    animation: pulse 1.1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 0 14px var(--magenta-glow);
    }
    50% {
      box-shadow: 0 0 24px var(--magenta-glow);
    }
  }

  .status {
    flex-shrink: 0;
    min-height: 1.3em;
    text-align: center;
    font-size: 0.82rem;
    color: var(--cream-dim);
    letter-spacing: 0.03em;
  }

  .now-playing-label {
    color: var(--gold);
  }

  .clip-num {
    color: var(--gold-bright);
    font-weight: bold;
  }

  .error {
    color: #e04040;
  }
</style>
