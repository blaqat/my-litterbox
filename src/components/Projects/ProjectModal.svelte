<script lang="ts">
  import { activeProject, closeProject } from "./projectStore";
  import { ProjectState, type Project } from "./ProjectData";

  let project: Project | null;
  $: $activeProject; // establish store subscription
  $: project = $activeProject;

  function duration(p: Project) {
    if (p.status === ProjectState.Completed && p.end)
      return `${p.start} - ${p.end}`;
    return `${p.start} - ${p.status}`;
  }

  function onBackdrop(e: MouseEvent) {
    if ((e.target as HTMLElement).dataset.backdrop === "1") closeProject();
  }
</script>

{#if project}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    data-backdrop="1"
    role="dialog"
    aria-modal="true"
    on:click={onBackdrop}
    on:keydown={(e) => e.key === "Escape" && closeProject()}
    tabindex="-1"
  >
    <div class="absolute inset-0 bg-black/40"></div>
    <div
      class="relative z-10 w-[min(800px,90vw)] max-h-[90vh] overflow-auto rounded-xl bg-white p-6 border border-gray-300"
    >
      <button
        class="absolute right-3 top-3 rounded-md border bg-white px-2 py-1 text-xs"
        on:click={closeProject}
        aria-label="Close">✕</button
      >
      <header class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold">{project.name}</h2>
          <p class="text-xs text-gray-500">{duration(project)}</p>
        </div>
        <span class="text-xs rounded-md border px-2 py-1 bg-gray-50"
          >{project.type}</span
        >
      </header>
      <p class="mt-4 whitespace-pre-wrap text-gray-800">
        {project.description}
      </p>

      {#if project.images && project.images.length}
        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          {#each project.images as img}
            <a href={img.src} target="_blank" class="block">
              <img
                class="w-full aspect-video object-cover rounded-lg border border-gray-300"
                src={img.src}
                alt={img.alt}
                loading="lazy"
              />
            </a>
          {/each}
        </div>
      {/if}

      <div class="mt-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 class="text-sm font-medium text-gray-700">Stack</h3>
          <div class="mt-2 flex gap-2 flex-wrap">
            {#each project.stack as tech}
              <span class="px-2 py-0.5 text-xs bg-gray-100 rounded-full border"
                >{tech}</span
              >
            {/each}
          </div>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-700">Links</h3>
          <div class="mt-2 flex gap-2">
            {#if project.github}
              <a
                class="text-blue-600 underline"
                target="_blank"
                href={project.github}>GitHub</a
              >
            {/if}
            {#if project.view}
              <a
                class="text-blue-600 underline"
                target="_blank"
                href={project.view}>View</a
              >
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
