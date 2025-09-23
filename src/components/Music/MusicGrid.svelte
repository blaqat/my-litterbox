<script lang="ts">
  import MusicCard from "./MusicCard.svelte";
  import { type MusicItem } from "./types";

  let { songs }: { songs: MusicItem[] } = $props();
</script>

<div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
  {#each songs as song}
    <MusicCard {song} />
  {/each}
</div>
