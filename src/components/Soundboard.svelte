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
  <div class="figure" class:playing={isPlaying}>
    <svg viewBox="0 0 180 200" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <path
        d="M90 10 C40 10, 25 55, 28 110 C30 140, 35 165, 45 180 L135 180 C145 165, 150 140, 152 110 C155 55, 140 10, 90 10 Z"
        fill="#1e2a5c"
        stroke="#2d3b73"
        stroke-width="1.5"
      />
      <path
        d="M90 20 C52 20, 40 58, 43 105 C45 130, 50 152, 58 168 L122 168 C130 152, 135 130, 137 105 C140 58, 128 20, 90 20 Z"
        fill="#141b3d"
      />
      <ellipse cx="90" cy="85" rx="32" ry="40" fill="#e8dcc0" opacity="0.95" />
      <ellipse cx="90" cy="87" rx="28" ry="36" fill="#d4c4a0" opacity="0.5" />
      <g transform="translate(90, 85)">
        <path
          d="M0 -18 C8 -18, 14 -10, 14 0 C14 8, 8 16, 0 16 C-6 16, -10 12, -10 6 C-10 2, -7 -1, -3 -1 C0 -1, 2 1, 2 4"
          fill="none"
          stroke="#b22222"
          stroke-width="2.5"
          stroke-linecap="round"
          opacity="0.9"
        />
        <circle cx="0" cy="0" r="2.5" fill="#e04040" />
      </g>
      <path d="M62 78 C60 72, 62 65, 66 60 L66 95 C63 92, 62 85, 62 78 Z" fill="#8ec7c7" opacity="0.6" />
      <path d="M118 78 C120 72, 118 65, 114 60 L114 95 C117 92, 118 85, 118 78 Z" fill="#8ec7c7" opacity="0.6" />
      <circle cx="78" cy="78" r="3" fill="#8ec7c7" opacity="0.5" />
      <circle cx="102" cy="78" r="3" fill="#8ec7c7" opacity="0.5" />
      <path
        d="M28 110 C25 120, 20 135, 18 150 L22 180 L45 180 C40 160, 35 135, 38 115 Z"
        fill="#141b3d"
        stroke="#1e2a5c"
        stroke-width="1"
      />
      <path
        d="M152 110 C155 120, 160 135, 162 150 L158 180 L135 180 C140 160, 145 135, 142 115 Z"
        fill="#141b3d"
        stroke="#1e2a5c"
        stroke-width="1"
      />
      <path
        d="M28 110 C25 120, 20 135, 18 150 L22 180"
        fill="none"
        stroke="#c0437a"
        stroke-width="2"
        opacity="0.5"
        stroke-linecap="round"
      />
      <path
        d="M90 10 C50 12, 32 50, 28 100"
        fill="none"
        stroke="#c0437a"
        stroke-width="1.5"
        opacity="0.35"
        stroke-linecap="round"
      />
    </svg>
  </div>

  <div class="grid">
    {#each AUDIO_CATEGORIES as category (category.id)}
      <button
        type="button"
        class="tile"
        class:playing={isPlaying && currentCategoryId === category.id}
        on:click={(): void => playCategory(category.id)}
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
    filter: drop-shadow(0 0 14px rgba(192, 67, 122, 0.4));
    transition: filter 0.3s ease;
  }

  .figure.playing {
    filter: drop-shadow(0 0 22px rgba(192, 67, 122, 0.55)) drop-shadow(0 0 8px rgba(142, 199, 199, 0.35));
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

  .grid {
    flex: 1;
    min-height: 0;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 0.5rem;
  }

  @media (min-width: 480px), (orientation: landscape) {
    .grid {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
    }
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.15rem;
    overflow: hidden;
    padding: 0.4rem 0.5rem;
    border-radius: var(--radius-sm);
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

  .tile-label {
    font-size: clamp(0.68rem, 2.6vh, 1rem);
    font-weight: bold;
    letter-spacing: 0.01em;
    color: var(--gold-bright);
  }

  .tile-description {
    font-size: clamp(0.55rem, 1.7vh, 0.72rem);
    color: var(--cream-dim);
    line-height: 1.2;
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
