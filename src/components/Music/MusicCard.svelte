<script lang="ts">
  import { slide } from "svelte/transition";
  import { marked } from "marked";
  import MusicCard from "./MusicCard.svelte";
  import {
    MusicInstrument,
    MusicStatus,
    MusicType,
    type LinkLocation,
    type LinkMap,
    type MusicItem,
  } from "./types";
  import { getMusicDuration, linkMapColors, matchesPlaying } from "./utils";
  import {
    MusicNote,
    Play,
    PianoKeys,
    Circle,
    SoundcloudLogo,
    YoutubeLogo,
    SpotifyLogo,
    WaveSine,
    Link,
    Pause,
    Copy,
  } from "phosphor-svelte";
  import controller from "./MusicData.svelte";
  import MusicModal from "./MusicModal.svelte";
  import {
    getSongIds,
    generatePlaylistUrl,
    copyToClipboard,
  } from "./MusicQueries";

  let {
    song,
    forcePlay = false,
    mini = false,
    parent_name = "",
    onmouseover,
    onmouseleave,
    class: _class = "",
  }: {
    forcePlay?: boolean;
    parent_name?: string;
    song: MusicItem;
    mini?: boolean;
    class?: string;
    onmouseover?: () => void;
    onmouseleave?: () => void;
  } = $props();

  let mouse_is_over_child = $state(false);
  let collection_is_opened = $state(false);
  let collectionScrollContainer: HTMLDivElement | undefined = $state();
  let copyFeedback = $state("");

  async function handleCopyPlaylist(e: Event) {
    e.stopPropagation();

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

  const links = $derived(
    Object.entries(song.links ?? {}) as [LinkLocation, string][]
  );

  function hover() {
    mouse_is_over_child = true;
    onmouseover?.();
  }
  function unhover() {
    mouse_is_over_child = false;
    onmouseleave?.();
  }

  let nowPlaying = $derived(
    controller.queue.songs[
      controller.queue.currentIndex % controller.queue.songs.length
    ]
  );
  let isplaying = $derived(
    forcePlay ||
      (controller.queue.isPlaying && matchesPlaying(song, nowPlaying))
  );

  // let isplaying = true

  const onplay = controller.playSong;
  const onpause = () => controller.pause();
  let modalOpen = $state(false);

  // Function to scroll to currently playing song in collection
  function scrollToCurrentlyPlaying() {
    if (!collectionScrollContainer || song.type !== MusicType.Collection)
      return;

    const playingIndex = song.songs.findIndex(
      (c_song) => c_song.url === nowPlaying?.url && isplaying
    );

    if (playingIndex === -1) return;

    // Calculate scroll position to center the playing song
    const cardWidth =
      collectionScrollContainer
        .querySelector(".collection-card")
        ?.getBoundingClientRect().width || 0;

    const gap = 8; // gap-2 = 8px
    const scrollLeft =
      (cardWidth + gap) * playingIndex -
      collectionScrollContainer.clientWidth / 2 +
      cardWidth / 2;

    collectionScrollContainer.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: "smooth",
    });
  }

  // Auto-scroll when collection opens and there's a currently playing song
  $effect(() => {
    if (collection_is_opened && song.type === MusicType.Collection) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => scrollToCurrentlyPlaying(), 150);
    }
  });

  // Auto-scroll when currently playing song changes and collection is open
  $effect(() => {
    if (collection_is_opened && nowPlaying) {
      scrollToCurrentlyPlaying();
    }
  });
</script>

{#if song.type === MusicType.Collection && song.songs.length === 1}
  {@const c_song = song.songs[0]}
  {@const playing = isplaying && c_song.url === nowPlaying?.url}
  <MusicCard song={c_song} parent_name={song.name} forcePlay={playing} />
{:else}
  <MusicModal
    {song}
    isOpen={modalOpen}
    onClose={() => (modalOpen = false)}
    {forcePlay}
  />
  <div
    class="relative group min-w-0 {collection_is_opened &&
      'md:col-span-2 sm:col-span-1'} {_class}"
  >
    <div
      role="button"
      tabindex="0"
      class:hover:translate-y-1={song.type === MusicType.Collection &&
        !collection_is_opened}
      class:group-hover:translate-y-1={song.type === MusicType.Collection &&
        !collection_is_opened}
      class:group-hover:bg-slate-50={!isplaying &&
        song.type === MusicType.Collection &&
        !collection_is_opened}
      class:group-hover:bg-light-wisteria-50={isplaying &&
        song.type === MusicType.Collection &&
        !collection_is_opened}
      class=" {isplaying
        ? 'border-light-wisteria-300 border-double bg-[#FBF9FC] hover:bg-light-wisteria-50'
        : 'border-gray-300 bg-white hover:bg-slate-50'} text-left {!collection_is_opened &&
        'h-full'} w-full relative border {mini
        ? 'p-3 rounded-lg'
        : 'p-4 rounded-xl'} transition cursor-pointer hover:shadow-sm hover:shadow-slate-200 z-5 {song.type !==
        MusicType.Collection && 'hover:scale-102'} {!mouse_is_over_child &&
        'active:scale-99'}"
      aria-controls="song-modal"
      onclick={() =>
        song.type === MusicType.Collection
          ? (collection_is_opened = !collection_is_opened)
          : (modalOpen = true)}
      onkeydown={() => {}}
    >
      <header class="flex items-start justify-between">
        <h3
          class="gap-2 flex items-center font-semibold {mini
            ? 'text-md'
            : 'text-lg'} leading-tight pr-2"
        >
          <span>
            {#if parent_name}
              <span class="text-gray-600 font-normal">{parent_name} - </span>
            {/if}
            {song.name}
          </span>

          {#if song.type === MusicType.Collection}
            <span
              class="text-sm text-gray-500 font-normal {mini
                ? 'hidden'
                : ''} select-none"
            >
              ({song.songs.length}
              {song.songs.length === 1 ? "track" : "tracks"})
            </span>
          {/if}
        </h3>

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
            <PianoKeys
              size={mini ? 14 : 18}
              class="text-malibu-900"
              weight="bold"
            />
          {:else if song.instrument === MusicInstrument.Beepbox}
            <Circle
              size={mini ? 14 : 18}
              class="text-light-wisteria-900"
              weight="bold"
            />
          {:else if song.instrument === MusicInstrument.DAW}
            <WaveSine
              size={mini ? 14 : 18}
              class="text-sea-pink-900"
              weight="bold"
            />
          {:else if song.instrument === MusicInstrument.Misc}
            <MusicNote
              size={mini ? 14 : 18}
              class="text-slate-900"
              weight="bold"
            />
          {:else}
            <MusicNote size={mini ? 14 : 18} />
          {/if}
        </div>
      </header>

      {#if !mini}
        <p class="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
          <span>{getMusicDuration(song)}</span>
          {#if song.status !== MusicStatus.Complete}
            <span class="-translate-x-1 transform font-medium">
              <span
                class="status-dot"
                class:ongoing={song.status === MusicStatus.WIP}
                class:dropped={song.status === MusicStatus.Dropped}
                aria-label={song.status}
                title={song.status}
              ></span>
              {song.status === MusicStatus.WIP ? "WIP" : "Dropped"}
            </span>
          {/if}
        </p>
      {/if}

      <article
        class="{!mini && 'mt-2'} text-gray-700 {mini
          ? 'line-clamp-2'
          : 'line-clamp-3'} prose prose-sm"
      >
        {#if song.description}
          {@html marked(song.description)}
        {/if}
      </article>

      <footer class="justify-between {mini ? 'mt-4' : 'mt-8'}">
        <div class="h-[30px]"></div>
        <div class="ml-auto absolute bottom-3 left-4">
          <div
            class="flex {mini
              ? 'gap-1.5'
              : 'gap-2.5'} items-center shrink-0 whitespace-nowrap"
          >
            {#each links as [loc, url]}
              <a
                href={url}
                class="inline-flex items-center justify-center rounded-full border p-1.5 hover:border-gray-500 text-slate-700 hover:scale-110 hover:shadow-md bg-slate-50/40 backdrop-blur-xs border-slate-300 no-underline transition-all duration-200 active:scale-95 {linkMapColors[
                  loc
                ] ?? ''}"
                target="_blank"
                aria-label="Open {loc} Link"
                onclick={(e) => e.stopPropagation()}
                onmouseenter={hover}
                onmouseleave={unhover}
              >
                {#if loc === "spotify"}
                  <SpotifyLogo size={16} weight="duotone" />
                {:else if loc === "youtube"}
                  <YoutubeLogo size={16} weight="duotone" />
                {:else if loc === "soundcloud"}
                  <SoundcloudLogo size={16} weight="duotone" />
                {:else if loc === "beepbox"}
                  <Circle size={16} weight="duotone" />
                {:else}
                  <Link size={16} weight="duotone" />
                {/if}
              </a>
            {/each}
          </div>
        </div>
        <div class="flex items-center gap-2 absolute bottom-3 right-4">
          <!-- Copy playlist link button for collections -->
          {#if song.type === MusicType.Collection}
            <button
              class="rounded-full p-2 hover:scale-110 hover:shadow-lg bg-slate-50/40 border border-slate-300 text-slate-600 backdrop-blur-xs transition-all duration-200 hover:border-blue-400 hover:bg-blue-100/50 hover:text-blue-800 active:scale-95"
              onclick={handleCopyPlaylist}
              onmouseenter={hover}
              onmouseleave={unhover}
              title="Copy playlist link"
              tabindex="0"
            >
              <Copy size={mini ? 14 : 16} weight="bold" />
            </button>
          {/if}

          <!-- Play button -->
          {#if song.type === MusicType.Collection || !!song.url}
            <button
              class="rounded-full {mini
                ? 'p-2 hover:scale-120'
                : 'p-3 hover:scale-110'} hover:shadow-lg {isplaying
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
              onmouseenter={hover}
              onmouseleave={unhover}
              tabindex="0"
            >
              {#if !isplaying}
                <span
                  class="flex items-center gap-2 {song.type ===
                    MusicType.Collection && 'mr-1'}"
                >
                  <Play
                    size={mini ? 16 : 20}
                    aria-label="Play"
                    weight="fill"
                  />{song.type === MusicType.Collection ? `Play All` : ""}
                </span>
              {:else}
                <Pause size={mini ? 15 : 20} aria-label="Play" weight="fill" />
              {/if}
            </button>
          {/if}

          <!-- Copy feedback -->
          {#if copyFeedback}
            <div
              class="absolute -top-8 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded z-10"
            >
              {copyFeedback}
            </div>
          {/if}
        </div>
      </footer>
    </div>

    {#if song.type === MusicType.Collection}
      <span class="z-0 isloate translate-y-50">
        {#each song.songs as c_song, i}
          {@const c_playing = isplaying && c_song.url === nowPlaying?.url}
          <div
            class="w-[calc(25%)] hover:-translate-y-1 hover:z-3 transition-all duration-220 absolute -top-3 rounded-xl border {c_playing
              ? 'bg-light-wisteria-100 border-light-wisteria-300'
              : 'bg-gray-100 border-slate-300'} z-1 h-10 shadow-lg shadow-black/50"
            class:translate-y-20={collection_is_opened}
            class:-translate-y-2={c_playing}
            class:z-2={c_playing}
            style:left={song.songs.length <= 8
              ? `calc(${i * 10 + 1}% + var(--spacing) * 3)`
              : `calc(${i * 7 + 1}% + var(--spacing) * 3)`}
          >
            <p
              class="text-xs font-medium text-gray-400 truncate p-1"
              class:text-light-wisteria-900={c_playing}
            >
              {c_song.name}
            </p>
          </div>
        {/each}
        <div
          class="absolute h-10 -z-5 rounded-xl transition-all duration-75
        {collection_is_opened
            ? 'w-full h-full top-0 bg-slate-200 border-slate-300 border'
            : 'w-[calc(100%-10px)] left-[5px] -top-1 bg-slate-300 border-slate-400'}"
        ></div>
      </span>
    {/if}

    {#if collection_is_opened && song.type === MusicType.Collection}
      <div
        bind:this={collectionScrollContainer}
        class="w-full min-w-0 max-w-full overflow-x-auto px-2 py-2 rounded-lg pr-[25%] md:pr-[33%]"
      >
        <div
          class="grid grid-flow-col gap-2 md:auto-cols-[33.33%] auto-cols-[50%]"
          in:slide={{ duration: 100 }}
          out:slide={{ duration: 100 }}
        >
          {#each song.songs as c_song}
            {@const c_playing = isplaying && c_song.url === nowPlaying?.url}
            <MusicCard
              song={c_song}
              mini
              forcePlay={c_playing}
              class="collection-card"
            />
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
    display: inline-block;
  }
  .status-dot.ongoing {
    background: #facc15;
    border-color: #a5934b;
  }
  .status-dot.dropped {
    background: #fa1515;
    border-color: #a54b4b;
  }
</style>
