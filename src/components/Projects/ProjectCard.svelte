<script lang="ts">
  import type { Project } from "./ProjectData";
  import {
    ProjectState,
    ProjectCategory,
    getProjectDuration as duration,
  } from "./ProjectData";
  import TechTag from "@components/TechTag.svelte";
  import { GithubLogo } from "phosphor-svelte";
  import { openProject } from "./projectStore";
  import { marked } from "marked";

  export let project: Project;
</script>

<button
  type="button"
  class="border-gray-300 group text-left w-full relative rounded-xl border bg-white p-4 transition cursor-pointer hover:bg-slate-50 hover:shadow-sm hover:shadow-slate-200 hover:scale-102 active:scale-99"
  on:click|stopPropagation={() => openProject(project)}
  data-project-slug={project.slug}
  aria-controls="project-modal"
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

  <p class="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
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
  <article class="mt-2 text-gray-700 line-clamp-5 prose prose-sm">
    {@html marked(project.description)}
  </article>

  <div class="flex items-center justify-between mt-4 gap-3 flex-wrap">
    <div class="flex gap-2 flex-wrap min-w-0">
      {#each project.stack.slice(0, 3) as tech}
        <TechTag name={tech} />
      {/each}
      {#if project.stack.length > 3}
        <span class="more-chip">+{project.stack.length - 3}</span>
      {/if}
    </div>
    <div class="flex gap-3 items-center shrink-0 whitespace-nowrap">
      {#if project.github}
        <a
          class="inline-flex items-center justify-center rounded-full border border-gray-300 p-1.5 hover:border-gray-500"
          href={project.github}
          target="_blank"
          aria-label="Open GitHub"
          on:click|stopPropagation
        >
          <GithubLogo size={16} />
        </a>
      {/if}
      {#if project.view}
        <a
          class="text-sm underline underline-offset-2 hover:no-underline"
          href={project.view}
          target="_blank"
          on:click|stopPropagation
        >
          View
        </a>
      {/if}
    </div>
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
  .more-chip {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
  }

  .line-clamp-5 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    line-clamp: 5;
  }
</style>
