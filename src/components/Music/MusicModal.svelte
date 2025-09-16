<script lang="ts">
  import { activeMusic, closeMusic } from "./musicStore";
  import { isCollection, toQueueTrack } from "./types";
  import { player } from "./playerStore";
  import { marked } from "marked";
  import {
    Play,
    Pause,
    X,
    MusicNotesSimple,
    PianoKeys,
    Circle,
    YoutubeLogo,
    SoundcloudLogo,
    Link as LinkIcon,
  } from "phosphor-svelte";
  import { getMusicDuration, isBeepbox, isPiano } from "./musicUtils";

  let item: any;
  $: $activeMusic;
  $: item = $activeMusic;

  const { current, isPlaying } = player;
  $: $current, $isPlaying;

  function renderMarkdown(md: string) {
    return marked(md || "");
  }

  function togglePlay() {
    if (!item) return;
    if (isCollection(item)) {
      const tracks = item.songs.map((s) => toQueueTrack(s, item.name));
      player.replaceAndPlay(tracks, 0);
    } else {
      player.toggle(toQueueTrack(item));
    }
  }

  function preferredLink(links?: Record<string, string>) {
    if (!links) return null;
    const order = ["youtube", "soundcloud", "beepbox"];
    for (const k of order) {
      const match = Object.entries(links).find(
        ([key]) => key.toLowerCase() === k
      );
      if (match) return { key: match[0], url: match[1] as string };
    }
    const first = Object.entries(links)[0];
    return first ? { key: first[0], url: first[1] as string } : null;
  }
</script>

{#if item}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click={(e) =>
      (e.target as HTMLElement).dataset.backdrop === "1" && closeMusic()}
    on:keydown={(e) => e.key === "Escape" && closeMusic()}
  >
    <div
      class="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"
      data-backdrop="1"
    ></div>
    <div
      class="relative z-10 w-[min(900px,92vw)] max-h-[90vh] overflow-auto rounded-2xl p-6 bg-slate-50/90 border-2 backdrop-blur-xs border-slate-200 shadow-lg"
    >
      <button
        class="absolute right-3 top-3 p-1 text-gray-600 hover:text-gray-900"
        on:click={() => closeMusic()}
        aria-label="Close"><X size={16} weight="bold" /></button
      >
      <header class="flex items-start justify-between gap-4 pr-8">
        <div class="flex items-start gap-3">
          <span
            class="badge"
            class:piano={isPiano(item)}
            class:beep={isBeepbox(item)}
            class:other={!isPiano(item) && !isBeepbox(item)}
          >
            {#if isPiano(item)}
              <PianoKeys size={16} weight="bold" />
            {:else if isBeepbox(item)}
              <Circle size={14} weight="bold" />
            {:else}
              <MusicNotesSimple size={16} weight="bold" />
            {/if}
          </span>
          <div>
            <h2 class="text-xl font-semibold">{item.name}</h2>
            <p class="text-xs text-gray-600 mt-0.5 flex items-center gap-2">
              <span>{getMusicDuration(item)}</span>
              {#if item.status && item.status !== "complete"}
                <span class="status"
                  ><span class="dot" class:ongoing={item.status === "wip"}
                  ></span>{item.status}</span
                >
              {/if}
            </p>
            {#if item.artist?.length || item.instrument}
              <p class="text-xs text-gray-600 mt-0.5">
                {#if item.artist?.length}<span>{item.artist.join(", ")}</span
                  >{/if}
                {#if item.instrument}
                  <span
                    class="ml-2 px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700 text-[11px]"
                    >{item.instrument}</span
                  >
                {/if}
              </p>
            {/if}
          </div>
        </div>
        <button class="btn" on:click={togglePlay} aria-label="Play/Pause">
          {#if $current && !$isPlaying}
            <Play size={16} weight="bold" />
          {:else}
            <Pause size={16} weight="bold" />
          {/if}
        </button>
      </header>
      {#if item.description}
        <article class="mt-3 prose max-w-none">
          {@html renderMarkdown(item.description)}
        </article>
      {/if}

      {#if item.links}
        <div class="mt-3 flex flex-wrap gap-2">
          {#each Object.entries(item.links) as [k, v]}
            <a class="link" href={v as string} target="_blank">
              {#if k.toLowerCase() === "youtube"}
                <YoutubeLogo size={16} />
              {:else if k.toLowerCase() === "soundcloud"}
                <SoundcloudLogo size={16} />
              {:else if k.toLowerCase() === "beepbox"}
                <Circle size={14} weight="bold" />
              {:else}
                <LinkIcon size={16} />
              {/if}
              <span class="ml-1 text-sm">{k}</span>
            </a>
          {/each}
        </div>
      {/if}
      {#if isCollection(item)}
        <div class="mt-4 overflow-x-auto">
          <div class="flex gap-2">
            {#each item.songs as s}
              <div class="song-chip">
                <button
                  class="text-sm underline"
                  on:click={() => player.toggle(toQueueTrack(s, item.name))}
                  >Play</button
                >
                <button
                  class="text-sm underline"
                  on:click={() => activeMusic.set(s)}>Open</button
                >
                <span class="ml-2">{s.name}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: #fff;
  }
  /* chip styles removed (unused) */
  .link {
    display: inline-flex;
    align-items: center;
    border: 1px solid #e5e7eb;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    background: #fff;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
  }
  .badge.piano {
    background: var(--color-malibu-100);
    border-color: var(--color-malibu-300);
    color: var(--color-malibu-900);
  }
  .badge.beep {
    background: #f3e8ff;
    border-color: #e9d5ff;
    color: #6b21a8;
  }
  .badge.other {
    background: #f3f4f6;
    border-color: #e5e7eb;
    color: #111827;
  }
  .status {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
    display: inline-block;
  }
  .dot.ongoing {
    background: #22c55e;
    border-color: #3a8e58;
  }
</style>
