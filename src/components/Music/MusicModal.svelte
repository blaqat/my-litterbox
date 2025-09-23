<script lang="ts">
  import { marked } from "marked";
  import {
    type MusicItem,
    MusicType,
    MusicStatus,
    MusicInstrument,
    type LinkLocation,
  } from "./types";
  import controller from "./MusicData.svelte";
  import { getMusicDuration, matchesPlaying, linkMapColors } from "./utils";
  import {
    Play,
    Pause,
    MusicNote,
    PianoKeys,
    WaveSine,
    Circle,
    SpotifyLogo,
    YoutubeLogo,
    SoundcloudLogo,
    Link,
    X,
    Copy,
  } from "phosphor-svelte";
  import {
    getSongIds,
    generatePlaylistUrl,
    copyToClipboard,
  } from "./MusicQueries";

  let {
    song,
    isOpen,
    onClose,
    forcePlay,
  }: {
    song: MusicItem | null;
    isOpen: boolean;
    onClose: () => void;
    forcePlay?: boolean;
  } = $props();

  // derive playing state
  let nowPlaying = $derived(
    controller.queue.songs[
      controller.queue.currentIndex % controller.queue.songs.length
    ]
  );
  let isplaying = $derived(
    forcePlay ||
      (song !== null &&
        controller.queue.isPlaying &&
        matchesPlaying(song, nowPlaying))
  );

  const onplay = controller.playSong;
  const onpause = () => controller.pause();

  let copyFeedback = $state("");

  async function handleCopyPlaylist() {
    if (!song) return;

    const songIds = getSongIds(song);
    if (songIds.length === 0) return;

    const url = generatePlaylistUrl(songIds);
    const success = await copyToClipboard(url);

    if (success) {
      copyFeedback = "Copied!";
      setTimeout(() => (copyFeedback = ""), 2000);
    } else {
      copyFeedback = "Failed to copy";
      setTimeout(() => (copyFeedback = ""), 2000);
    }
  }

  function renderMarkdown(md: string) {
    return marked(md);
  }
</script>

{#if isOpen && song}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    id="music-modal"
    onclick={(e) =>
      (e.target as HTMLElement).dataset.backdrop === "1" && onClose()}
    onkeydown={(e) => e.key === "Escape" && onClose()}
    tabindex="-1"
  >
    <div
      class="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"
      data-backdrop="1"
      aria-hidden="true"
    ></div>

    <div
      class="relative z-10 w-[min(800px,92vw)] max-h-[90vh] overflow-auto rounded-2xl p-6 bg-slate-50/90 border-2 backdrop-blur-xs border-slate-200 shadow-lg"
    >
      <button
        class="absolute right-3 top-3 p-1 text-gray-600 hover:text-gray-900"
        onclick={onClose}
        aria-label="Close"
        title="Close"
      >
        <X size={16} weight="bold" />
      </button>

      <!-- Header -->
      <header class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold">{song.name}</h2>
          <p class="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
            <span>{getMusicDuration(song)}</span>
            {#if song.status !== MusicStatus.Complete}
              <span class="-translate-x-1 font-medium">
                <span
                  class="status-dot"
                  class:ongoing={song.status === MusicStatus.WIP}
                  class:dropped={song.status === MusicStatus.Dropped}
                  class:planned={song.status === MusicStatus.Planned}
                >
                </span>
                {song.status}
              </span>
            {/if}
          </p>
        </div>
        <div
          class="text-gray-400 shrink-0 mt-0.5 border rounded-lg p-1"
          class:bg-malibu-100={song.instrument === MusicInstrument.Piano}
          class:border-malibu-300={song.instrument === MusicInstrument.Piano}
          class:bg-light-wisteria-100={song.instrument ===
            MusicInstrument.Beepbox}
          class:border-light-wisteria-300={song.instrument ===
            MusicInstrument.Beepbox}
          class:bg-sea-pink-100={song.instrument === MusicInstrument.DAW}
          class:border-sea-pink-300={song.instrument === MusicInstrument.DAW}
          class:bg-slate-100={song.instrument === MusicInstrument.Misc}
          class:border-slate-300={song.instrument === MusicInstrument.Misc}
          aria-label="Made with {song.instrument}"
        >
          {#if song.instrument === MusicInstrument.Piano}
            <PianoKeys size={18} class="text-malibu-900" weight="bold" />
          {:else if song.instrument === MusicInstrument.Beepbox}
            <Circle size={18} class="text-light-wisteria-900" weight="bold" />
          {:else if song.instrument === MusicInstrument.DAW}
            <WaveSine size={18} class="text-sea-pink-900" weight="bold" />
          {:else if song.instrument === MusicInstrument.Misc}
            <MusicNote size={18} class="text-slate-900" weight="bold" />
          {:else}
            <MusicNote size={18} />
          {/if}
        </div>
      </header>

      <!-- Description -->
      {#if song.description}
        <article class="mt-4 text-gray-800 prose max-w-none">
          {@html renderMarkdown(song.description)}
        </article>
      {/if}

      <!-- Collection songs -->
      {#if song.type === MusicType.Collection}
        <section class="mt-5">
          <h3 class="text-sm font-semibold text-gray-700">Tracks</h3>
          <ul class="mt-2 flex flex-col gap-2">
            {#each song.songs as track, i}
              <li
                class="flex items-center justify-between rounded border p-2 bg-slate-100 hover:bg-slate-200 transition"
              >
                <span class="text-sm font-medium">{i + 1}. {track.name}</span>
                <span class="text-xs text-gray-500"
                  >{getMusicDuration(track)}</span
                >
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <!-- Links -->
      {#if song.links}
        {@const links = Object.entries(song.links ?? {}) as [
          LinkLocation,
          string,
        ][]}
        <section class="mt-5">
          <h3 class="text-sm font-semibold text-gray-700">Links</h3>
          <div class="mt-2 flex gap-3 flex-wrap">
            {#each links as [loc, url]}
              <a
                href={url}
                target="_blank"
                class="flex px-2 items-center gap-1 justify-center rounded-sm border p-1 hover:border-gray-500 text-slate-700 hover:scale-105 hover:shadow-md bg-slate-50/40 border-slate-300 transition-all duration-200 active:scale-95 {linkMapColors[
                  loc
                ] ?? ''}"
              >
                {#if loc === "spotify"}
                  <SpotifyLogo size={18} weight="duotone" /> Spotify
                {:else if loc === "youtube"}
                  <YoutubeLogo size={18} weight="duotone" /> YouTube
                {:else if loc === "soundcloud"}
                  <SoundcloudLogo size={18} weight="duotone" /> SoundCloud
                {:else if loc === "beepbox"}
                  <Circle size={18} weight="duotone" /> BeepBox
                {:else}
                  <Link size={18} weight="duotone" /> {loc}
                {/if}
              </a>
            {/each}
          </div>
        </section>
      {/if}

      {#if song.url}
        <div class="flex items-center gap-2 absolute bottom-3 right-4">
          <!-- Copy playlist link button -->
          <button
            class="rounded-full p-2 hover:scale-110 hover:shadow-lg bg-slate-50/40 border border-slate-300 text-slate-600 backdrop-blur-xs transition-all duration-200 hover:border-blue-400 hover:bg-blue-100/50 hover:text-blue-800 active:scale-95"
            onclick={handleCopyPlaylist}
            title="Copy playlist link"
            tabindex="0"
          >
            <Copy size={16} weight="bold" />
          </button>

          <!-- Play button -->
          <button
            class="rounded-full {'p-3 hover:scale-110'} hover:shadow-lg {isplaying
              ? 'border-light-wisteria-400 bg-light-wisteria-200 text-light-wisteria-800'
              : 'bg-slate-50/40 border-slate-300 text-slate-600'} 
            border backdrop-blur-xs no-underline transition-all duration-200 hover:border-light-wisteria-400 hover:bg-light-wisteria-300/50 hover:text-light-wisteria-800 active:scale-95"
            onclick={(e) => {
              e.stopPropagation();
              if (!isplaying) {
                onplay(song);
              } else {
                onpause();
              }
            }}
            tabindex="0"
          >
            {#if !isplaying}
              <span class="flex items-center gap-2">
                <Play size={20} aria-label="Play" weight="fill" />
              </span>
            {:else}
              <Pause size={20} aria-label="Play" weight="fill" />
            {/if}
          </button>

          <!-- Copy feedback -->
          {#if copyFeedback}
            <div
              class="absolute -top-8 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded"
            >
              {copyFeedback}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
    display: inline-block;
    border: 1px solid #e5e7eb;
  }
  .status-dot.ongoing {
    background: #22c55e;
    border-color: #3a8e58;
  }
  .status-dot.dropped {
    background: #fa1515;
    border-color: #a54b4b;
  }
  .status-dot.planned {
    background: #facc15;
    border-color: #a5934b;
  }
  .btn-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0.25rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.85rem;
    background: #f9fafb;
    transition: background 0.2s;
    text-decoration: none;
    color: #1f2937;
  }
  .btn-link:hover {
    background: #e5e7eb;
  }
</style>
