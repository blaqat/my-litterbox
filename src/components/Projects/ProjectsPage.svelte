<script lang="ts">
  import ProjectCard from "./ProjectCard.svelte";
  import { type Project, projectMatches as matches } from "./ProjectData";
  import { initializeProjects } from "./projectStore";
  import { getSortedProjects } from "./ProjectData";
  import { MagnifyingGlass as Search } from "phosphor-svelte";
  import { onMount } from "svelte";

  let { projects }: { projects: Project[] } = $props();

  let query = $state("");
  let filtered = $derived(projects.filter((p) => matches(p, query)));
  let groups = $derived(
    getSortedProjects(filtered.length > 0 ? [...filtered] : projects)
  );
  let years = $derived(
    Object.keys(groups)
      .map((y) => parseInt(y))
      .sort((a, b) => b - a)
  );

  onMount(() => {
    if (typeof window !== "undefined") {
      queueMicrotask(() => initializeProjects(projects));
    }
  });
</script>

<div class="flex items-center justify-between gap-3 mb-4">
  <div class="relative w-full">
    <Search
      size={18}
      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    />
    <input
      type="search"
      placeholder="Search projects..."
      bind:value={query}
      class="w-full rounded-md border border-gray-300 bg-white pr-3 pl-9 py-2 sm:text-[16px] md:text-sm"
    />
  </div>
</div>

{#if filtered.length === 0}
  <p class="text-center text-gray-500">no projects found...</p>
  <hr class="my-2 border-gray-500 border-dashed" />
{/if}

<div class="pb-25">
  {#each years as year}
    <section class="mb-8">
      <h2 class="text-lg font-medium text-gray-600 mb-3">{year}</h2>
      <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {#each groups[year] as p}
          <ProjectCard project={p} />
        {/each}
      </div>
    </section>
  {/each}
</div>
