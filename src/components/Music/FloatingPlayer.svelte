<script lang="ts">
  import { player } from "./playerStore";
  import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    SpeakerHigh,
  } from "phosphor-svelte";

  const { current, isPlaying, volume } = player;
  $: $current, $isPlaying, $volume;

  function toggle() {
    player.toggle();
  }
  function onVolume(e: Event) {
    const v = Number((e.target as HTMLInputElement).value) / 100;
    player.volume.set(v);
  }
</script>

{#if $current}
  <div class="floating">
    <div class="info">
      <div class="title">
        {#if $current.parentCollection}
          <span class="collection">{$current.parentCollection} • </span>
        {/if}
        <span>{$current.name}</span>
      </div>
      {#if $current.artist?.length}
        <div class="artists">{$current.artist.join(", ")}</div>
      {/if}
    </div>
    <div class="controls">
      <button class="icon" on:click={() => player.prev()} aria-label="Previous"
        ><SkipBack size={18} weight="bold" /></button
      >
      <button
        class="icon play"
        on:click={toggle}
        aria-label={$isPlaying ? "Pause" : "Play"}
      >
        {#if $isPlaying}
          <Pause size={18} weight="bold" />
        {:else}
          <Play size={18} weight="bold" />
        {/if}
      </button>
      <button class="icon" on:click={() => player.next()} aria-label="Next"
        ><SkipForward size={18} weight="bold" /></button
      >
    </div>
    <div class="vol">
      <SpeakerHigh size={16} />
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={Math.round($volume * 100)}
        on:input={onVolume}
      />
    </div>
  </div>
{/if}

<style>
  .floating {
    position: fixed;
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.75rem;
    z-index: 45; /* under mobile header (z-50), above overlays */
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 0.75rem;
    align-items: center;
    background: rgba(248, 250, 252, 0.6);
    border: 2px solid #e2e8f0;
    backdrop-filter: blur(4px);
    padding: 0.5rem 0.75rem;
    border-radius: 9999px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
  .info .title {
    font-weight: 600;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .info .collection {
    color: #64748b;
    font-weight: 500;
  }
  .info .artists {
    font-size: 0.75rem;
    color: #6b7280;
  }
  .controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .icon {
    width: 2rem;
    height: 2rem;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
    display: grid;
    place-items: center;
    background: white;
  }
  .icon:hover {
    background: #f3f4f6;
  }
  .icon.play {
    width: 2.5rem;
    height: 2.5rem;
  }
  .vol {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .vol input {
    width: 80px;
  }

  @media (min-width: 768px) {
    .floating {
      left: 50%;
      right: auto;
      transform: translateX(-50%);
      width: min(720px, 92vw);
      bottom: 1rem;
    }
  }
</style>
