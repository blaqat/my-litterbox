<script lang="ts">
  import MusicModal from "./MusicModal.svelte";
  import MusicTypeFilter from "./MusicTypeFilter.svelte";
  import {
    type MusicData,
    MusicType,
    MusicInstrument,
    type CollectionSingle,
  } from "./types";
  import { MagnifyingGlass as Search } from "phosphor-svelte";
  import { matchesQuery, sortByDate, matchesInstrumentFilter } from "./utils";
  import { swapQueue, play, queue, pause } from "./MusicData.svelte";
  import { onMount } from "svelte";
  import {
    parseMusicQueries,
    findSongsByIds,
    findSongById,
  } from "./MusicQueries";
  import MusicCard from "./MusicCard.svelte";

  let { music }: { music: MusicData[] } = $props();

  // Modal state
  let modalOpen = $state(false);
  let modalSong = $state<MusicData | null>(null);
  let modalIsPlaying = $derived(
    modalSong &&
      queue.isPlaying &&
      queue.songs[queue.currentIndex % queue.songs.length]?.name ===
        modalSong?.name
  );

  // Music list state
  let query = $state("");

  let selectedInstruments = $state([
    MusicInstrument.Piano,
    MusicInstrument.Beepbox,
    MusicInstrument.DAW,
  ]);

  let sorted = $state(sortByDate(music));

  // Final filtered list of music to display (based on search, query, and instrument filter)
  let filtered = $derived(
    sorted
      .filter((item) => matchesQuery(item, query))
      .filter((item) => matchesInstrumentFilter(item, selectedInstruments))
      .map((item) => {
        if (item.type === MusicType.Collection) {
          let s = {
            ...item,
            songs: item.songs
              .filter((song) => matchesQuery(song, query))
              .filter((song) =>
                matchesInstrumentFilter(song, selectedInstruments)
              ),
          };
          return s.songs.length > 0 ? s : item;
        } else {
          return item;
        }
      })
  );

  // Handles updating the queue and playing song based on URL query parameters
  onMount(() => {
    swapQueue();
    handleQueryParameters();
  });

  /**
   * Handles the "c" (continue) URL parameter to continue playing a specific song at a given time.
   * @param c Continue parameter in the format "songId,timeInSeconds"
   * @example c=song1,90 (to continue song1 at 90 seconds)
   */
  function handleContinueParam(c: string) {
    const [songId, timeStr] = c.split(",");
    const timeSeconds = parseInt(timeStr, 10);

    if (songId && !isNaN(timeSeconds)) {
      const allSingles = sorted
        .flatMap((item) =>
          item.type === MusicType.Single ? [item] : item.songs
        )
        .filter((song) => song.url);

      const foundSongs = findSongsByIds([songId], allSingles);
      if (foundSongs.length > 0) {
        const songIndex = queue.songs.findIndex(
          (s) => s.url === foundSongs[0].url
        );
        if (songIndex >= 0) {
          play(songIndex, timeSeconds);
          setTimeout(() => {
            pause();
          }, 100);
        }
      }
    }
  }

  /**
   * Handles the "s" (playlist) URL parameter to create a custom playlist.
   * @param s Comma-separated list of song IDs
   * @example s=song1,song2,song3
   */
  function handlePlaylistParam(s: string) {
    const songIds = s.split(",").filter(Boolean);
    // Create a flat list of all collection's songs
    const allSingles = sorted
      .flatMap((item) => {
        if (item.type === MusicType.Single) {
          return [item];
        } else {
          return item.songs.map((song, index) => ({
            ...song,
            parentRefData: {
              name: item.name,
              index: index,
              total: item.songs.length,
            },
          }));
        }
      })
      .filter((song) => song.url);

    const foundSongs = findSongsByIds(songIds, allSingles);
    if (foundSongs.length > 0) {
      const playlistItems: MusicData[] = foundSongs.map((song) => ({
        ...song,
        type: MusicType.Single,
      }));
      // Updates the displayed list to only show the playlist items
      sorted = playlistItems;
      // Updates the queue with the new raw playlist
      swapQueue(playlistItems, { sort: false });
    }
  }

  /**
   * Handles URL query parameters for search, continue, playlist, and open modal.
   */
  function handleQueryParameters() {
    const queries = parseMusicQueries();

    if (queries.q) {
      query = queries.q;
    }

    if (queries.c) {
      handleContinueParam(queries.c);
    }

    if (queries.s) {
      handlePlaylistParam(queries.s);
    }

    if (queries.o) {
      const songToOpen = findSongById(queries.o, music);
      if (songToOpen) {
        modalSong = songToOpen;
        modalOpen = true;
      }
    }
  }
</script>

<MusicModal
  song={modalSong}
  isOpen={modalOpen}
  onClose={() => {
    modalOpen = false;
    modalSong = null;
  }}
  forcePlay={modalIsPlaying || undefined}
/>

<div class="flex flex-col gap-4 mb-6">
  <!-- Search bar -->
  <div class="relative w-full">
    <Search
      size={18}
      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    />
    <input
      type="search"
      placeholder="Search music..."
      bind:value={query}
      class="w-full rounded-md border border-gray-300 bg-white pr-3 pl-9 py-2 sm:text-[16px] md:text-sm"
      oninput={() => {
        if (filtered && filtered.length > 0) {
          swapQueue(filtered);
        }
      }}
    />
  </div>
  <!-- Filters -->
  <MusicTypeFilter
    bind:selectedInstruments
    onChange={(instruments) => {
      if (filtered && filtered.length > 0) {
        swapQueue(filtered);
      }
    }}
  />
</div>

{#if filtered.length === 0}
  <p class="text-center text-gray-500">No results found.</p>
  <hr class="my-2 border-gray-500 border-dashed mb-5" />
{/if}

<!-- Music Grid -->
<div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
  {#each filtered.length !== 0 ? filtered : sorted as song, index}
    <MusicCard
      {song}
      showHint={index === 0}
      parent_name={"parentRefData" in song
        ? (song as CollectionSingle).parentRefData?.name
        : undefined}
    />
  {/each}
</div>

<!-- Padding -->
<div class="pb-35"></div>
