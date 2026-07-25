<script lang="ts">
  import type { Project } from "./ProjectData";
  import { ProjectCategory } from "./ProjectData";
  import ProjectCard from "./ProjectCard.svelte";
  import { COLLAPSED_ROW_HEIGHT } from "./timelineLayout";

  let {
    project,
    focused = false,
    measuredHeight = COLLAPSED_ROW_HEIGHT,
    showHint = false,
    reducedMotion = false,
    onFocus,
    onRowEl,
  }: {
    project: Project;
    focused?: boolean;
    measuredHeight?: number;
    showHint?: boolean;
    reducedMotion?: boolean;
    onFocus: (project: Project) => void;
    onRowEl?: (el: HTMLElement | null) => void;
  } = $props();

  let rowEl = $state<HTMLElement | null>(null);

  const rowHeight = $derived(
    focused ? Math.max(measuredHeight, COLLAPSED_ROW_HEIGHT) : COLLAPSED_ROW_HEIGHT,
  );

  $effect(() => {
    onRowEl?.(rowEl);
  });
</script>

<div
  bind:this={rowEl}
  class="timeline-row mb-4 min-w-0"
  data-timeline-slug={project.slug}
  style="height: {rowHeight}px; overflow: hidden; overflow-anchor: auto;"
>
  {#if focused}
    <div
      class="timeline-expanded h-full min-w-0"
      class:timeline-expanded-animate={!reducedMotion}
    >
      <ProjectCard {project} {showHint} expanded inlineExpanded />
    </div>
  {:else}
    <button
      type="button"
      class="flex h-11 w-full min-w-0 items-center gap-2 rounded-lg px-2 text-left hover:bg-slate-50"
      style="height: {COLLAPSED_ROW_HEIGHT}px;"
      onclick={() => onFocus(project)}
    >
      <span class="truncate font-medium text-gray-900">{project.name}</span>
      <span
        class="shrink-0 rounded-lg border px-2 py-0.5 text-xs font-medium"
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
    </button>
  {/if}
</div>

<style>
  .timeline-expanded-animate {
    animation: timeline-row-in 140ms ease-out;
  }

  @keyframes timeline-row-in {
    from {
      opacity: 0.72;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .timeline-expanded-animate {
      animation: none;
    }
  }
</style>
