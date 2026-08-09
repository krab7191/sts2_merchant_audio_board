<script lang="ts">
  import { AUDIO_CATEGORIES } from '../data/audioManifest';
  import { pickRandomClip } from '../lib/soundboard';

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
  <div class="grid">
    {#each AUDIO_CATEGORIES as category (category.id)}
      <button
        type="button"
        class="tile"
        class:playing={isPlaying && currentCategoryId === category.id}
        on:click={() => playCategory(category.id)}
      >
        <span class="tile-label">{category.label}</span>
        <span class="tile-description">{category.description}</span>
      </button>
    {/each}
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
    on:playing={() => (isPlaying = true)}
    on:pause={() => (isPlaying = false)}
    on:ended={() => (isPlaying = false)}
    on:error={() => {
      isPlaying = false;
      errorMessage = 'Failed to play that clip.';
    }}
  ></audio>
</div>

<style>
  .board {
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.9rem;
  }

  @media (min-width: 560px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    padding: 1.1rem 0.8rem;
    min-height: 96px;
    border-radius: var(--radius);
    border: 2px solid var(--border);
    background: radial-gradient(circle at 50% 30%, var(--indigo-light) 0%, var(--indigo) 60%, var(--navy-deep) 100%);
    color: var(--cream);
    font-family: inherit;
    cursor: pointer;
    text-align: center;
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

  .tile.playing {
    border-color: var(--magenta);
    box-shadow: 0 0 24px var(--magenta-glow);
    animation: pulse 1.1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 0 18px var(--magenta-glow);
    }
    50% {
      box-shadow: 0 0 30px var(--magenta-glow);
    }
  }

  .tile-label {
    font-size: 1rem;
    font-weight: bold;
    letter-spacing: 0.02em;
    color: var(--gold-bright);
  }

  .tile-description {
    font-size: 0.72rem;
    color: var(--cream-dim);
    line-height: 1.3;
  }

  .status {
    margin-top: 1.5rem;
    min-height: 1.4em;
    text-align: center;
    font-size: 0.9rem;
    color: var(--cream-dim);
    letter-spacing: 0.04em;
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
