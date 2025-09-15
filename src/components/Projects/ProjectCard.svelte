<script lang="ts">
  import type { Project } from "./ProjectData";
  import { ProjectState, ProjectCategory } from "./ProjectData";
  import { openProject } from "./projectStore";

  export let project: Project;
  export let variant: "grid" | "list" = "grid";
  export let selected: boolean = false;

  function duration(p: Project) {
    if (p.status === ProjectState.Completed && p.end)
      return `${p.start} - ${p.end}`;
    // Move status into duration brackets per feedback
    return `${p.start} - [${p.status}]`;
  }

  function onOpen() {
    openProject(project);
  }
</script>

<button
  type="button"
  class="group text-left w-full relative rounded-xl border bg-white p-4 transition cursor-pointer"
  class:list={variant === "list"}
  class:border-gray-200={variant === "grid"}
  class:shadow-sm={variant === "grid"}
  class:hover:shadow-md={variant === "grid"}
  class:bg-malibu-50={variant === "list" && selected}
  class:border-malibu-500={variant === "list" && selected}
  class:border-dashed={variant === "list"}
  on:click|stopPropagation={onOpen}
>
  <header class="flex items-start justify-between">
    <h3 class="font-semibold text-lg leading-tight pr-2">{project.name}</h3>
    <span
      class="badge"
      class:badge-personal={project.type === ProjectCategory.Personal}
      class:badge-work={project.type === ProjectCategory.Work}
      class:badge-school={project.type === ProjectCategory.School}
    >
      {project.type}
    </span>
  </header>

  <p class="text-xs text-gray-500 mt-0.5">{duration(project)}</p>
  {#if variant === "grid" || selected}
    <p class="mt-2 text-gray-700 line-clamp-5">{project.description}</p>
  {/if}

  <div class="flex items-center justify-between mt-4">
    <div class="flex gap-2 flex-wrap">
      {#each project.stack as tech}
        <span
          class="px-2 py-0.5 text-xs bg-gray-100 rounded-full border border-gray-200"
          >{tech}</span
        >
      {/each}
    </div>
    {#if variant === "grid" || selected}
      <div class="flex gap-2">
        {#if project.github}
          <a
            class="link-chip"
            href={project.github}
            target="_blank"
            on:click|stopPropagation
          >
            GitHub
          </a>
        {/if}
        {#if project.view}
          <a
            class="link-chip"
            href={project.view}
            target="_blank"
            on:click|stopPropagation
          >
            View
          </a>
        {/if}
      </div>
    {/if}
  </div>
</button>

<style>
  .badge {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
  }
  .badge-personal {
    background: var(--color-malibu-100);
    color: var(--color-malibu-900);
    border-color: var(--color-malibu-300);
  }
  .badge-work {
    background: var(--color-harvest-gold-100);
    color: var(--color-harvest-gold-900);
    border-color: var(--color-harvest-gold-300);
  }
  .badge-school {
    background: #ffe7d6;
    color: #7a3410;
    border-color: #febf8e;
  }
  .link-chip {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
  }
  .line-clamp-5 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    line-clamp: 5;
  }
  .list {
    background-color: #eff6ff; /* blue-50 */
    border-style: dashed;
  }
</style>
