<script lang="ts">
  import MusicModal from "./MusicModal.svelte";
  import MusicGrid from "./MusicGrid.svelte";
  import { type MusicItem, MusicType } from "./types";
  import { MagnifyingGlass as Search } from "phosphor-svelte";
  import { matchesQuery, sortByDate } from "./utils";
  import { swapQueue } from "./MusicData.svelte";

  let { music }: { music: MusicItem[] } = $props();
  let query = $state("");
  let sorted = sortByDate(music);
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
