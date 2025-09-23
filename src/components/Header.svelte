<script lang="ts">
  import blaqatLogo from "@assets/blaqat.svg";
  import { navigationItems, type NavigationItem } from "@data/NavigationItems";
  import Desktop from "./DeviceType/Desktop.svelte";
  import Mobile from "./DeviceType/Mobile.svelte";

  // Phosphor icons
  import {
    Envelope,
    Folder,
    MusicNotes,
    Cloud,
    House,
    Question,
  } from "phosphor-svelte";

  let currentPath = "";

  $: currentPath = window.location.pathname;

  let home: NavigationItem = {
    label: "Home",
    href: "/",
    color: "bg-slate-400",
    hover: "hover:bg-slate-300",
    text: "text-slate-900",
    fill: "fill-slate-900",
    icon: House,
  };

  const iconMap: Record<string, typeof Envelope> = {
    Envelope,
    Folder,
    MusicNotes,
    Cloud,
    House,
  };

  function getIconComponent(icon?: any) {
    if (!icon) return Question;
    if (typeof icon === "string") return iconMap[icon] ?? Question;
    return icon;
  }

  export let includeCat = true;
</script>

<Desktop>
  <nav class="flex gap-3 justify-center py-4 items-center">
    {#each navigationItems as item, i}
      <a
        href={item.href}
        class={`relative px-6 py-3 rounded-full ${item.hover} hover:bg-gray-200 transition font-medium ${
          currentPath.startsWith(item.href)
            ? ` translate-y-1 ${item.color}`
            : `bg-slate-100`
        }`}
      >
        <span class="flex items-center gap-2">
          {#if item.icon}
            <svelte:component
              this={getIconComponent(item.icon)}
              class="w-4 h-4"
              weight="bold"
            />
          {/if}
          {item.label}
        </span>
      </a>

      {#if i === 1 && includeCat}
        <a href="/" class="mx-2">
          <img src={blaqatLogo.src} alt="Blaqat Logo" class="w-12 h-12" />
        </a>
      {/if}
    {/each}
  </nav>
</Desktop>

<Mobile>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-slate-50/40 border-2 backdrop-blur-xs border-slate-200 shadow-lg flex justify-around p-2 z-50 m-3 rounded-full"
  >
    {#each [home, ...navigationItems] as item}
      <a
        href={item.href}
        class="flex flex-col items-center justify-center gap-1 rounded-full p-2 text-gray-500 font-medium hover:bg-gray-300/20 hover:scale-103 w-16"
        class:selected={currentPath === item.href}
        aria-current={currentPath === item.href ? "page" : undefined}
      >
        {#if item.icon}
          <svelte:component
            this={getIconComponent(item.icon)}
            class={`w-6 h-6 ${currentPath === item.href ? item.text : "text-gray-500"} ${currentPath === item.href ? item.fill : ""}`}
            weight="fill"
          />
        {/if}
        <span class="text-xs">{item.label}</span>
      </a>
    {/each}
  </nav>
</Mobile>
