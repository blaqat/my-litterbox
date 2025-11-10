<script lang="ts">
	import { getIconUrl } from "@lib/devicons";
  import { BracketsCurly } from "phosphor-svelte";

  // export let a: string;
  let { dark = false, name }: { dark?: boolean; name: string } = $props();

  let url = $derived(getIconUrl(name));
</script>

<span class="tag" class:bg-[#f3f4f6]={!dark} class:bg-white={dark}>
  {#if url}
    <img class="icon" src={url} alt={name + " icon"} loading="lazy" />
  {:else}
    <BracketsCurly size={14} class="icon-fallback" />
  {/if}
  <span class="whitespace-nowrap">{name}</span>
</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
  }
  .icon {
    width: 14px;
    height: 14px;
    border-radius: 2px;
  }
</style>
