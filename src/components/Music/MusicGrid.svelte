<script lang="ts">
  import MusicCard from "./MusicCard.svelte";
  import { type MusicItem, type RefdSingle } from "./types";

  let { songs }: { songs: MusicItem[] } = $props();
</script>

<div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
  {#each songs as song, index}
    <MusicCard
      {song}
      showHint={index === 0}
      parent_name={"parentRefData" in song
        ? (song as RefdSingle).parentRefData?.name
        : undefined}
    />
  {/each}
</div>
