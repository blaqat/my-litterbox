<script lang="ts">
  import type { Project } from "./ProjectData";
  import {
    ProjectState,
    ProjectCategory,
    getProjectDuration as duration,
  } from "./ProjectData";
  import TechTag from "@components/TechTag.svelte";
  import ClickHint from "@components/ClickHint.svelte";
  import { GithubLogo, Link } from "phosphor-svelte";
  import { openProject } from "./projectStore";
  import { marked } from "marked";

  let { project, showHint = false }: { project: Project; showHint?: boolean } =
    $props();

  let mouseOverChild = $state(false);
  let dismissHint = $state(false);

  function handleMouseEnterChild() {
    mouseOverChild = true;
  }

  function handleMouseLeaveCHild() {
    mouseOverChild = false;
  }

  function handleCardClick(e: MouseEvent) {
    e.stopPropagation();
    openProject(project);

    // Dismiss "click me" hint when card is clicked
    if (showHint || dismissHint === false) {
      dismissHint = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("hint-dismissed-project-card-click", "true");
      }
    }
  }
</script>

<div class="relative group min-w-0">
  <button
    type="button"
    class="border-gray-300 text-left h-full w-full relative border p-4 rounded-xl transition cursor-pointer hover:bg-slate-50 hover:shadow-sm hover:shadow-slate-200 bg-white hover:scale-102 {!mouseOverChild &&
      'active:scale-99'}"
    onclick={handleCardClick}
    data-project-slug={project.slug}
    aria-controls="project-modal"
  >
    <!-- Click Me Hint -->
    {#if showHint}
      <ClickHint
        hintKey="project-card-click"
        class="border-malibu-500 hover:bg-malibu-100"
        cursorClass="text-malibu-800"
        dismiss={dismissHint}
      />
    {/if}

    <!-- header -->
    <header class="flex items-start justify-between">
      <h3 class="font-semibold text-lg leading-tight pr-2">{project.name}</h3>
      <span
        class="shrink-0 text-xs px-2 py-0.5 rounded-lg border font-medium"
        class:bg-malibu-100={project.type === ProjectCategory.Personal}
        class:border-malibu-300={project.type === ProjectCategory.Personal}
        class:text-malibu-900={project.type === ProjectCategory.Personal}
        class:bg-harvest-gold-100={project.type === ProjectCategory.Work}
        class:border-harvest-gold-300={project.type === ProjectCategory.Work}
        class:text-harvest-gold-900={project.type === ProjectCategory.Work}
        class:bg-orange-100={project.type === ProjectCategory.School}
        class:border-orange-300={project.type === ProjectCategory.School}
        class:text-orange-900={project.type === ProjectCategory.School}
      >
        {project.type}
      </span>
    </header>

    <!-- duration and status -->
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

    <!-- description -->
    <article class="mt-2 text-gray-700 line-clamp-5 prose prose-sm">
      {@html marked(project.description)}
    </article>

    <!-- footer -->
    <footer class="justify-between mt-8">
      <div class="h-[30px]"></div>

      <!-- tech stack tags -->
      <div class="ml-auto absolute bottom-3 left-4">
        <div class="flex gap-2 flex-wrap min-w-0">
          {#each project.stack.slice(0, 3) as tech}
            <TechTag name={tech} />
          {/each}
          {#if project.stack.length > 3}
            <span
              class="text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-300"
            >
              +{project.stack.length - 3}
            </span>
          {/if}
        </div>
      </div>

      <!-- external link buttons -->
      <div class="ml-auto absolute bottom-3 right-4">
        <div class="flex gap-2.5 items-center shrink-0 whitespace-nowrap">
          {#if project.github}
            <a
              href={project.github}
              class="inline-flex items-center justify-center rounded-full border p-1.5 hover:border-gray-500 text-slate-700 hover:bg-slate-200 hover:scale-110 hover:shadow-md bg-slate-50/40 backdrop-blur-xs border-slate-300 no-underline transition-all duration-200 active:scale-95"
              target="_blank"
              aria-label="Open GitHub"
              title="Open GitHub"
              onclick={(e) => e.stopPropagation()}
              onmouseenter={handleMouseEnterChild}
              onmouseleave={handleMouseLeaveCHild}
            >
              <GithubLogo size={16} weight="duotone" />
            </a>
          {/if}
          {#if project.view}
            <a
              href={project.view}
              class="inline-flex items-center justify-center rounded-full border p-1.5 hover:border-malibu-500 text-slate-700 hover:scale-110 hover:shadow-md bg-slate-50/40 backdrop-blur-xs border-slate-300 no-underline transition-all duration-200 active:scale-95 hover:text-malibu-900 hover:bg-malibu-100"
              target="_blank"
              aria-label="View Project"
              onclick={(e) => e.stopPropagation()}
              onmouseenter={handleMouseEnterChild}
              onmouseleave={handleMouseLeaveCHild}
              title="View Project"
            >
              <Link size={16} weight="duotone" />
            </a>
          {/if}
        </div>
      </div>
    </footer>
  </button>
</div>

<style>
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

  .line-clamp-5 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    line-clamp: 5;
  }
</style>
