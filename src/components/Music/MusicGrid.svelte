<script lang="ts">
  import MusicCard from "./MusicCard.svelte";
  import { type MusicItem, type RefdSingle } from "./types";

  let { songs }: { songs: MusicItem[] } = $props();
</script>

<div
  class="grid gap-6 {songs.length === 1
    ? 'grid-cols-[repeat(auto-fit,minmax(500px,1fr))] h-max'
    : 'sm:grid-cols-1 md:grid-cols-2'}"
>
  {#each songs as song}
    <MusicCard
      {song}
      parent_name={"parentRefData" in song
        ? (song as RefdSingle).parentRefData?.name
        : undefined}
    />
  {/each}
</div>
