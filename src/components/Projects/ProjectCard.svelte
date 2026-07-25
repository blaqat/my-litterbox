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
  import { highlightCodeBlocks } from "./highlightCode";
  import { tick } from "svelte";

  let {
    project,
    showHint = false,
    expanded = false,
    measurementMode = false,
    inlineExpanded = false,
  }: {
    project: Project;
    showHint?: boolean;
    expanded?: boolean;
    measurementMode?: boolean;
    inlineExpanded?: boolean;
  } = $props();

  let mouseOverChild = $state(false);
  let dismissHint = $state(false);
  let articleEl = $state<HTMLElement | null>(null);

  // Highlight fenced code blocks as soon as the description renders, so they
  // are readable in grid cards and expanded timeline cards without opening
  // the modal.
  $effect(() => {
    void project.description;
    void expanded;
    const el = articleEl;
    if (!el) return;
    tick().then(() => highlightCodeBlocks(el));
  });

  const imageMedia = $derived(
    project.images.filter(
      (img) => !/\.(mp4|webm|mov)$/i.test(img.src.split("?")[0])
    )
  );

  function openCard() {
    if (measurementMode) return;
    openProject(project);

    if (showHint || dismissHint === false) {
      dismissHint = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("hint-dismissed-project-card-click", "true");
      }
    }
  }

  function handleMouseEnterChild() {
    mouseOverChild = true;
  }

  function handleMouseLeaveCHild() {
    mouseOverChild = false;
  }

  function handleCardClick(e: MouseEvent) {
    e.stopPropagation();
    openCard();
  }

  function handleCardKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openCard();
    }
  }
</script>

<div class="relative group min-w-0" aria-hidden={measurementMode ? "true" : undefined}>
  <div
    role={measurementMode ? undefined : "button"}
    tabindex={measurementMode ? undefined : 0}
    class="border-gray-300 text-left w-full relative border p-4 rounded-xl bg-white {measurementMode
      ? 'pointer-events-none'
      : 'transition cursor-pointer hover:bg-slate-50 hover:shadow-sm hover:shadow-slate-200 hover:scale-102'} {!mouseOverChild &&
      !measurementMode &&
      'active:scale-99'} {expanded
      ? 'max-h-[150vh] overflow-hidden'
      : 'h-full'}"
    onclick={measurementMode ? undefined : handleCardClick}
    onkeydown={measurementMode ? undefined : handleCardKeydown}
    data-project-slug={measurementMode ? undefined : project.slug}
    aria-controls={measurementMode ? undefined : "project-modal"}
  >
    {#if expanded && !measurementMode && !inlineExpanded}
      <div
        class="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent z-10"
        aria-hidden="true"
      ></div>
    {/if}

    {#if showHint}
      <ClickHint
        hintKey="project-card-click"
        class="border-malibu-500 hover:bg-malibu-100"
        cursorClass="text-malibu-800"
        dismiss={dismissHint}
      />
    {/if}

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

    <article
      bind:this={articleEl}
      class="mt-2 text-gray-700 prose prose-sm max-w-full [&_*]:max-w-full"
      class:line-clamp-5={!expanded}
    >
      {@html marked(project.description)}
    </article>

    {#if expanded && imageMedia.length > 0}
      <div
        class="mt-4 grid gap-2 {imageMedia.length > 1
          ? 'grid-cols-2'
          : 'grid-cols-1'}"
      >
        {#each imageMedia as img}
          <img
            src={img.src}
            alt={img.alt}
            class="rounded-lg object-cover max-h-48 w-full"
            loading={measurementMode ? "eager" : "lazy"}
          />
        {/each}
      </div>
    {/if}

    {#if expanded}
      <footer class="mt-6 flex flex-wrap items-end justify-between gap-3">
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
      </footer>
    {:else}
      <footer class="justify-between mt-8">
        <div class="h-[30px]"></div>

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
    {/if}
  </div>
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
