<script lang="ts">
  import { getIconUrl } from "@lib/devicons";

  const langs = ["Java", "Python", "Rust"];
</script>

<span class="inline-flex flex-wrap items-baseline gap-x-1 gap-y-1">
  {#each langs as lang, i}
    <!-- <TechTag name={lang} dark /> -->
    <img
      class="icon w-6 h-6 translate-y-1.5"
      src={getIconUrl(lang)}
      alt={lang + " icon"}
      loading="lazy"
      style="color: #60aaff;"
    />
    {#if i < langs.length - 1}<span class="text-slate-800 text-sm">,</span>{/if}
  {/each}
</span>
