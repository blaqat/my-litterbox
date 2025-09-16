<script lang="ts">
  import { activeProject, closeProject } from "./projectStore";
  import { ProjectState, ProjectCategory, type Project } from "./ProjectData";
  import { marked } from "marked";
  import TechTag from "@components/TechTag.svelte";
  import { GithubLogo, X } from "phosphor-svelte";
  import { getProjectDuration as duration } from "@components/Projects/ProjectData";

  let project: Project | null;
  $: $activeProject;
  $: project = $activeProject;

  function onBackdrop(e: MouseEvent) {
    if ((e.target as HTMLElement).dataset.backdrop === "1") closeProject();
  }

  function renderMarkdown(md: string) {
    return marked(md);
  }
</script>

{#if project}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    id="project-modal"
    on:click={onBackdrop}
    on:keydown={(e) => e.key === "Escape" && closeProject()}
    tabindex="-1"
  >
    <div
      class="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"
      data-backdrop="1"
      aria-hidden="true"
    ></div>
    <div
      class="relative z-10 w-[min(900px,92vw)] max-h-[90vh] overflow-auto rounded-2xl p-6 bg-slate-50/90 border-2 backdrop-blur-xs border-slate-200 shadow-lg"
    >
      <button
        class="absolute right-3 top-3 p-1 text-gray-600 hover:text-gray-900"
        on:click={closeProject}
        aria-label="Close"
        title="Close"
      >
        <X size={16} weight="bold" />
      </button>
      <header class="flex items-start justify-between gap-4 pr-8">
        <div>
          <h2 class="text-xl font-semibold">{project.name}</h2>
          <p class="text-xs text-gray-500 flex items-center gap-2">
            <span>{duration(project)}</span>
            {#if project.status !== ProjectState.Completed}
              <span class="-translate-x-1 transform font-medium">
                <span
                  class="status-dot"
                  class:ongoing={project.status === ProjectState.Ongoing}
                  class:paused={project.status === ProjectState.Paused}
                  aria-label={project.status}
                  title={project.status}
                ></span>
                {project.status === ProjectState.Ongoing ? "Ongoing" : "Paused"}
              </span>
            {/if}
          </p>
        </div>
        <span
          class="badge"
          class:badge-personal={project.type === ProjectCategory.Personal}
          class:badge-work={project.type === ProjectCategory.Work}
          class:badge-school={project.type === ProjectCategory.School}
        >
          {project.type}
        </span>
      </header>

      <article class="mt-4 text-gray-800 prose max-w-none">
        {@html renderMarkdown(project.description)}
      </article>

      {#if project.images && project.images.length}
        <h3 class="mt-5 text-sm font-medium text-gray-700">Media</h3>
        <div class="mt-2 grid gap-3 sm:grid-cols-3">
          {#each project.images as img}
            {#if /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(img.src)}
              <div class="block relative group">
                <!-- svelte-ignore a11y_media_has_caption -->
                <video
                  class="w-full aspect-video rounded-lg border border-gray-300"
                  src={img.src}
                  controls
                  preload="metadata"
                  playsinline
                  aria-label={img.alt || "Project video"}
                  title={img.alt || "Project video"}
                >
                  Sorry, your browser doesn't support embedded videos.
                </video>
                <div
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-300/40 border border-slate-300 text-slate-900 backdrop-blur-xl shadow-xs text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
                >
                  {img.alt}
                </div>
              </div>
            {:else}
              <a
                href={img.src}
                target="_blank"
                rel="noopener noreferrer"
                class="block relative group hover:scale-104"
              >
                <img
                  class="w-full aspect-video object-cover rounded-lg border border-gray-300"
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                />
                <div
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-300/40 border border-slate-300 text-slate-900 backdrop-blur-xl shadow-xs text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-full"
                >
                  {img.alt}
                </div>
              </a>
            {/if}
          {/each}
        </div>
      {/if}

      <div class="mt-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 class="text-sm font-medium text-gray-700">Stack</h3>
          <div class="mt-2 flex gap-2 flex-wrap text-sm">
            {#each project.stack as tech}
              <TechTag name={tech} />
            {/each}
          </div>
        </div>
        {#if project.github || project.view}
          <div>
            <h3 class="text-sm font-medium text-gray-700 -translate-x-1">
              Links
            </h3>
            <div class="mt-2 flex items-center gap-3">
              {#if project.github}
                <a
                  class="inline-flex items-center justify-center rounded-full border border-gray-300 p-1.5 hover:border-gray-500"
                  target="_blank"
                  href={project.github}
                  aria-label="Open GitHub"
                >
                  <GithubLogo size={16} />
                </a>
              {/if}
              {#if project.view}
                <a
                  class="text-sm underline underline-offset-2 hover:no-underline"
                  target="_blank"
                  href={project.view}>View</a
                >
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

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
  .status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
    display: inline-block;
  }
  .status-dot.ongoing {
    background: #22c55e;
    border-color: #3a8e58;
  }
  .status-dot.paused {
    background: #facc15;
    border-color: #a5934b;
  }
</style>
