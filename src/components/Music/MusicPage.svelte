<script lang="ts">
  import MusicModal from "./MusicModal.svelte";
  import MusicGrid from "./MusicGrid.svelte";
  import { type MusicItem, MusicType } from "./types";
  import { MagnifyingGlass as Search } from "phosphor-svelte";
  import { matchesQuery, sortByDate } from "./utils";
  import { swapQueue, play, queue, playSong } from "./MusicData.svelte";
  import { onMount } from "svelte";
  import {
    parseMusicQueries,
    findSongsByIds,
    songIdToUrlPattern,
    type MusicQueryParams,
  } from "./MusicQueries";

  let { music }: { music: MusicItem[] } = $props();
  let query = $state("");
  let sorted = $state(sortByDate(music));
  let filtered = $derived(
    sorted
      .filter((item) => matchesQuery(item, query))
      .map((item) => {
        if (item.type === MusicType.Collection) {
          let s = {
            ...item,
            songs: item.songs.filter((song) => matchesQuery(song, query)),
          };
          return s.songs.length > 0 ? s : item;
        } else {
          return item;
        }
      })
  );

  onMount(() => {
    swapQueue();
    handleQueryParameters();
  });

  function handleQueryParameters() {
    const queries = parseMusicQueries();

    // Handle search query parameter
    if (queries.q) {
      query = queries.q;
    }

    // Handle playlist parameter
    if (queries.p) {
      const songIds = queries.p.split(",").filter(Boolean);
      // Create a flat list of all singles from the music collection
      const allSingles = sorted
        .flatMap((item) =>
          item.type === MusicType.Single ? [item] : item.songs
        )
        .filter((song) => song.url);

      const foundSongs = findSongsByIds(songIds, allSingles);
      if (foundSongs.length > 0) {
        // Create a temporary music items array for swapQueue
        const playlistItems: MusicItem[] = foundSongs.map((song) => ({
          ...song,
          type: MusicType.Single,
        }));
        sorted = playlistItems;
        swapQueue(playlistItems, false);
      }
    }

    // Handle continue parameter (song,time)
    if (queries.c) {
      const [songId, timeStr] = queries.c.split(",");
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
            play(songIndex);
            // Set the time after a brief delay to ensure the audio is loaded
            setTimeout(() => {
              queue.time = timeSeconds;
            }, 250);
          }
        }
      }
    }
  }
</script>

<div class="flex items-center justify-between gap-3 mb-6">
  <div class="relative w-full">
    <Search
      size={18}
      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    />
    <input
      type="search"
      placeholder="Search music..."
      bind:value={query}
      class="w-full rounded-md border border-gray-300 bg-white pr-3 pl-9 py-2 text-sm"
      oninput={() => {
        if (filtered && filtered.length > 0) {
          swapQueue(filtered);
        }
      }}
    />
  </div>
</div>

{#if filtered.length === 0}
  <p class="text-center text-gray-500">No results found.</p>
  <hr class="my-2 border-gray-500 border-dashed mb-5" />
{/if}

<MusicGrid songs={filtered.length !== 0 ? filtered : sorted} />
<div class="pb-35"></div>
