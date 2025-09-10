<script>
  import blaqatLogo from "@assets/blaqat.svg";
  import { navigationItems } from "@data/NavigationItems";

  let currentPath = "";

  $: currentPath = window.location.pathname;
</script>

<nav class="flex gap-3 justify-center py-4 items-center">
  {#each navigationItems as item, i}
    <a
      href={item.href}
      class={`relative px-4 py-2 rounded-full ${item.hover} hover:bg-gray-200 hover:translate-y-2 text-sm transition ${
        currentPath.startsWith(item.href)
          ? `bg-gray-200 font-bold translate-y-1 ${item.color}`
          : `bg-gray-100 font-medium`
      }`}
    >
      {item.label}
    </a>

    {#if i === 1}
      <a href="/" class="mx-2">
        <img src={blaqatLogo.src} alt="Blaqat Logo" class="w-10 h-10" />
      </a>
    {/if}
  {/each}
</nav>
