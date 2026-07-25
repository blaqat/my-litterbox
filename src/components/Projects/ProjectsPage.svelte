<script lang="ts">
  import ProjectCard from "./ProjectCard.svelte";
  import ProjectsTimeline from "./ProjectsTimeline.svelte";
  import {
    type Project,
    projectMatches as matches,
    ProjectCategory,
  } from "./ProjectData";
  import { initializeProjects } from "./projectStore";
  import { getSortedProjects } from "./ProjectData";
  import {
    MagnifyingGlass as Search,
    Rows,
    SquaresFour,
  } from "phosphor-svelte";
  import { onMount } from "svelte";
  import ProjectsFilter from "./ProjectsFilter.svelte";
  import { Device } from "@lib/device.svelte";

  let { projects }: { projects: Project[] } = $props();

  const STORAGE_KEYS = {
    mobile: "projects-view-mode-mobile",
    desktop: "projects-view-mode-desktop",
  } as const;

  type ViewMode = "list" | "grid";

  function getStorageKey() {
    return Device.lt_md ? STORAGE_KEYS.mobile : STORAGE_KEYS.desktop;
  }

  function getDefaultViewMode(): ViewMode {
    return Device.lt_md ? "list" : "grid";
  }

  let query = $state("");
  let viewMode = $state<ViewMode>(getDefaultViewMode());

  let selectedCategories = $state<ProjectCategory[]>([
    ProjectCategory.Personal,
    ProjectCategory.Work,
    ProjectCategory.School,
  ]);

  let filtered = $derived(
    projects.filter((p) => matches(p, query)).filter((p) => matchesFilters(p))
  );

  let groups = $derived(getSortedProjects([...filtered]));

  let years = $derived(
    Object.keys(groups)
      .map((y) => parseInt(y))
      .sort((a, b) => b - a)
  );

  function matchesFilters(p: Project) {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(p.type);
  }

  function setViewMode(mode: ViewMode) {
    viewMode = mode;
    if (typeof window !== "undefined") {
      localStorage.setItem(getStorageKey(), mode);
    }
  }

  onMount(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(getStorageKey());
      if (stored === "list" || stored === "grid") {
        viewMode = stored;
      }
      queueMicrotask(() => initializeProjects(projects));
    }
  });
</script>

<div class="flex items-center justify-between mb-4">
  <h1 class="text-2xl font-bold">Projects</h1>
  <div class="flex gap-1">
    <button
      type="button"
      class="p-1.5 rounded-lg border transition-all duration-200 focus:outline-none"
      class:bg-malibu-100={viewMode === "list"}
      class:border-malibu-300={viewMode === "list"}
      class:text-malibu-900={viewMode === "list"}
      class:shadow-sm={viewMode === "list"}
      class:border-transparent={viewMode !== "list"}
      class:opacity-70={viewMode !== "list"}
      class:text-gray-600={viewMode !== "list"}
      aria-label="Scroll list view"
      aria-pressed={viewMode === "list"}
      onclick={() => setViewMode("list")}
    >
      {#if viewMode === "list"}
        <Rows size={20} weight="fill" />
      {:else}
        <Rows size={20} weight="regular" />
      {/if}
    </button>
    <button
      type="button"
      class="p-1.5 rounded-lg border transition-all duration-200 focus:outline-none"
      class:bg-malibu-100={viewMode === "grid"}
      class:border-malibu-300={viewMode === "grid"}
      class:text-malibu-900={viewMode === "grid"}
      class:shadow-sm={viewMode === "grid"}
      class:border-transparent={viewMode !== "grid"}
      class:opacity-70={viewMode !== "grid"}
      class:text-gray-600={viewMode !== "grid"}
      aria-label="Grid view"
      aria-pressed={viewMode === "grid"}
      onclick={() => setViewMode("grid")}
    >
      {#if viewMode === "grid"}
        <SquaresFour size={20} weight="fill" />
      {:else}
        <SquaresFour size={20} weight="regular" />
      {/if}
    </button>
  </div>
</div>

<div class="flex flex-col gap-3 mb-4">
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
  <ProjectsFilter bind:selectedCategories onChange={() => {}} />
</div>

{#if filtered.length === 0}
  <p class="text-center text-gray-500">no projects found...</p>
  <hr class="my-2 border-gray-500 border-dashed" />
{/if}

<div class="w-full min-w-0 pb-25">
  {#if viewMode === "grid"}
    {#each years as year, yearIndex}
      <section class="mb-8">
        <h2 class="text-lg font-medium text-gray-600 mb-3">{year}</h2>
        <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {#each groups[year] as p, projectIndex}
            <ProjectCard
              project={p}
              showHint={yearIndex === 0 && projectIndex === 0}
            />
          {/each}
        </div>
      </section>
    {/each}
  {:else}
    <ProjectsTimeline {groups} {years} />
  {/if}
</div>
