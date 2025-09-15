<script lang="ts">
  import ProjectCard from "./ProjectCard.svelte";
  import type { Project } from "./ProjectData";
  import { getSortedProjects } from "./ProjectData";

  export let projects: Project[] = [];

  type ViewMode = "grid" | "list";
  let view: ViewMode = "grid";

  // Search
  let query = "";
  function matches(p: Project, q: string) {
    if (!q) return true;
    const h = q.toLowerCase();
    return (
      p.name.toLowerCase().includes(h) ||
      p.description.toLowerCase().includes(h) ||
      p.type.toLowerCase().includes(h) ||
      p.stack.some((s) => s.toLowerCase().includes(h))
    );
  }

  $: filtered = projects.filter((p) => matches(p, query));
  $: groups = getSortedProjects([...filtered]);
  $: years = Object.keys(groups)
    .map((y) => parseInt(y))
    .sort((a, b) => b - a);

  function setView(mode: ViewMode) {
    view = mode;
  }

  // List selection state
  let selectedIndex = 0; // across all projects flattened in list view
  $: flat = years.flatMap((y) => groups[y].map((p) => ({ y, p })));
  $: selected = flat[selectedIndex]?.p;
  $: indexByRef = new Map<Project, number>(flat.map((fp, idx) => [fp.p, idx]));

  function onKeyNav(e: KeyboardEvent) {
    if (view !== "list") return;
    if (e.key === "ArrowDown") {
      selectedIndex = Math.min(flat.length - 1, selectedIndex + 1);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      selectedIndex = Math.max(0, selectedIndex - 1);
      e.preventDefault();
    }
  }
</script>

<div class="flex items-center justify-between gap-3 mb-4">
  <input
    type="search"
    placeholder="Search projects..."
    bind:value={query}
    class="w-full max-w-md rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
  />
  <div class="flex gap-2">
    <button
      class="p-2 rounded-md border border-transparent transition-colors aria-pressed:border-gray-900 aria-pressed:bg-transparent"
      aria-pressed={view === "list"}
      title="List view"
      on:click={() => setView("list")}
    >
      <!-- list icon -->
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        ><path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" /></svg
      >
    </button>
    <button
      class="p-2 rounded-md border border-transparent transition-colors aria-pressed:border-gray-900 aria-pressed:bg-transparent"
      aria-pressed={view === "grid"}
      title="Grid view"
      on:click={() => setView("grid")}
    >
      <!-- grid icon -->
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        ><path
          d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z"
        /></svg
      >
    </button>
  </div>
</div>

{#if view === "grid"}
  {#each years as year}
    <section class="mb-8">
      <h2 class="text-lg font-medium text-gray-600 mb-3">{year}</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each groups[year] as p}
          <ProjectCard project={p} />
        {/each}
      </div>
    </section>
  {/each}
{:else}
  <!-- timeline/list view with right gallery on large screens -->
  <div
    class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6"
    role="listbox"
    aria-label="Projects timeline"
    tabindex="0"
    on:keydown={onKeyNav}
  >
    <div class="relative pl-6">
      <div
        class="absolute left-2 top-0 bottom-0 border-l border-dashed border-gray-300"
      ></div>
      {#each years as year}
        <div class="relative mb-6">
          <div
            class="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-white border border-gray-400"
          ></div>
          <h2 class="text-lg font-medium text-gray-600 mb-3">{year}</h2>
          <div class="space-y-4">
            {#each groups[year] as p}
              <div class="relative">
                <div
                  class="absolute -left-3 top-6 w-2.5 h-2.5 rounded-full border"
                  class:border-malibu-500={indexByRef.get(p) === selectedIndex}
                  class:bg-malibu-500={indexByRef.get(p) === selectedIndex}
                  class:border-gray-300={indexByRef.get(p) !== selectedIndex}
                  class:bg-white={indexByRef.get(p) !== selectedIndex}
                ></div>
                <ProjectCard
                  project={p}
                  variant="list"
                  selected={indexByRef.get(p) === selectedIndex}
                />
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    <!-- Right side gallery -->
    <aside class="hidden lg:block">
      {#if selected && selected.images && selected.images.length}
        <div class="flex flex-col gap-4 sticky top-24">
          {#each selected.images as img}
            <img
              class="w-full aspect-video object-cover rounded-2xl border border-gray-300"
              src={img.src}
              alt={img.alt}
              loading="lazy"
            />
          {/each}
        </div>
      {/if}
    </aside>
  </div>
{/if}

<style>
  button[aria-pressed="true"] {
    border-color: rgb(17 24 39);
  }
</style>
