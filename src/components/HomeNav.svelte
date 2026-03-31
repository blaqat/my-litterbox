<script lang="ts">
  import { navigationItems } from "@lib/navigation-colors";
</script>

<nav class="flex gap-3 justify-center py-4 items-center">
  {#each navigationItems as item, i}
    <a
      href={item.href}
      class={`relative px-6 py-3 rounded-full ${item.hover} hover:bg-gray-200 transition font-medium ${item.color}`}
    >
      <span class="flex items-center gap-2">
        {#if item.icon}
          <svelte:component this={item.icon} class="w-4 h-4" weight="bold" />
        {/if}
        {item.label}
      </span>
    </a>
  {/each}
</nav>
