<script lang="ts">
  import MusicGrid from "./MusicGrid.svelte";
  import type { MusicItem } from "./types";
  export let items: MusicItem[] = [];
  let q = "";
</script>

<div class="mb-3">
  <input
    type="search"
    placeholder="Search music..."
    bind:value={q}
    class="w-full rounded-md border border-gray-300 bg-white pr-3 pl-3 py-2 text-sm"
  />
  {#if items.length === 0}
    <p class="text-sm text-gray-500 mt-2">no music yet...</p>
  {/if}
  {#if items.length > 0}
    <p class="sr-only">{items.length} items</p>
  {/if}
</div>
<MusicGrid {items} filter={q} />
