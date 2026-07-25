<script lang="ts">
  import type { Project } from "./ProjectData";
  import ProjectsTimelineItem from "./ProjectsTimelineItem.svelte";
  import ProjectCard from "./ProjectCard.svelte";
  import { activeProject } from "./projectStore";
  import { onMount, tick } from "svelte";
  import {
    buildFlatEntries,
    COLLAPSED_ROW_HEIGHT,
    FOCUS_LINE_RATIO,
    YEAR_SECTION_GAP,
  } from "./timelineLayout";

  let {
    groups,
    years,
  }: {
    groups: { [year: number]: Project[] };
    years: number[];
  } = $props();

  const MARKER_MARGIN = 120;

  type RowGeometry = {
    slug: string;
    index: number;
    anchor: number;
    top: number;
    height: number;
    inRange: boolean;
  };

  type MarkerState = {
    slug: string;
    top: number;
    fill: number;
    isFocused: boolean;
    isCandidate: boolean;
  };

  let focusedSlug = $state("");
  let segmentProgress = $state(0);
  let measuredHeights = $state<Map<string, number>>(new Map());
  let contentWidth = $state(0);
  let viewportHeight = $state(800);
  let viewportWidth = $state(1024);
  let reducedMotion = $state(false);
  let measurementLayerEl = $state<HTMLElement | null>(null);
  let rootEl = $state<HTMLElement | null>(null);
  let markerStates = $state<MarkerState[]>([]);
  const rowEls = new Map<string, HTMLElement>();

  let scrollRafId: number | null = null;
  let lastScrollY = 0;
  let scrollDirection: "up" | "down" | null = null;
  let lastFocusChangeY = 0;
  let lastFlatSignature = "";

  let modalOpen = $derived($activeProject !== null);
  const flatEntries = $derived(buildFlatEntries(groups, years));
  const flatProjects = $derived(flatEntries.map((entry) => entry.project));
  const markerSize = $derived(viewportWidth < 768 ? 20 : 24);

  const focusedIndex = $derived(
    flatProjects.findIndex((project) => project.slug === focusedSlug),
  );

  function syncFocusWithProjects(force = false) {
    if (flatProjects.length === 0) return;

    const signature = flatProjects.map((project) => project.slug).join("|");
    const hasValidFocus = flatProjects.some((project) => project.slug === focusedSlug);
    if (!force && signature === lastFlatSignature && hasValidFocus) return;

    lastFlatSignature = signature;
    focusedSlug = flatProjects[0].slug;
    segmentProgress = 0;
  }

  $effect(() => {
    flatProjects;
    syncFocusWithProjects();
  });

  function registerRowEl(slug: string, el: HTMLElement | null) {
    if (el) {
      rowEls.set(slug, el);
    } else {
      rowEls.delete(slug);
    }
  }

  function setFocusedSlug(slug: string) {
    if (!slug || slug === focusedSlug) return;
    focusedSlug = slug;
    segmentProgress = 0;
    lastFocusChangeY = window.scrollY;
  }

  function readRowGeometry(): RowGeometry[] {
    const vh = viewportHeight;
    const rows: RowGeometry[] = [];

    flatProjects.forEach((project, index) => {
      const el = rowEls.get(project.slug);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const anchor = rect.top + COLLAPSED_ROW_HEIGHT / 2;
      const inRange =
        rect.bottom >= -MARKER_MARGIN && rect.top <= vh + MARKER_MARGIN;
      rows.push({
        slug: project.slug,
        index,
        anchor,
        top: rect.top,
        height: rect.height,
        inRange,
      });
    });

    return rows;
  }

  function adjacentFocusState(rows: RowGeometry[]) {
    const focusedRow = rows.find((row) => row.slug === focusedSlug);
    if (!focusedRow || !scrollDirection) {
      return { nextSlug: "", candidateSlug: "", progress: 0 };
    }

    const directionStep = scrollDirection === "down" ? 1 : -1;
    const candidate =
      rows.find((row) => row.index === focusedRow.index + directionStep) ?? null;
    if (!candidate) {
      return { nextSlug: "", candidateSlug: "", progress: 0 };
    }

    const focusLine = viewportHeight * FOCUS_LINE_RATIO;
    const span = candidate.anchor - focusedRow.anchor;
    const progress =
      Math.abs(span) > 1
        ? Math.min(1, Math.max(0, (focusLine - focusedRow.anchor) / span))
        : 0;
    const cooledDown = Math.abs(window.scrollY - lastFocusChangeY) >= 80;
    const crossedFocusLine =
      scrollDirection === "down"
        ? candidate.anchor <= focusLine
        : candidate.anchor >= focusLine;
    const outgoingIsOffscreen =
      scrollDirection === "down"
        ? focusedRow.top < -viewportHeight * 0.3
        : focusedRow.top + focusedRow.height > viewportHeight * 1.3;

    return {
      nextSlug: cooledDown && crossedFocusLine && outgoingIsOffscreen
        ? candidate.slug
        : "",
      candidateSlug: candidate.slug,
      progress,
    };
  }

  function updateMarkers(rows: RowGeometry[], focusSlug: string, candidateSlug: string, progress: number) {
    const size = markerSize;
    const nextMarkers: MarkerState[] = [];
    const focusIndex = rows.findIndex((row) => row.slug === focusSlug);
    const candidateIndex = candidateSlug
      ? rows.findIndex((row) => row.slug === candidateSlug)
      : -1;
    const markerIndexes = new Set<number>();
    if (focusIndex >= 0) {
      markerIndexes.add(focusIndex);
      markerIndexes.add(focusIndex - 1);
      markerIndexes.add(focusIndex + 1);
    }
    if (candidateIndex >= 0) {
      markerIndexes.add(candidateIndex);
    }

    for (const row of rows) {
      if (!row.inRange || !markerIndexes.has(row.index)) continue;

      let fill = 0;
      if (row.slug === focusSlug) {
        fill = 1 - progress;
      } else if (row.slug === candidateSlug && candidateSlug) {
        fill = progress;
      }

      nextMarkers.push({
        slug: row.slug,
        top: row.top + (COLLAPSED_ROW_HEIGHT - size) / 2,
        fill,
        isFocused: row.slug === focusSlug,
        isCandidate: row.slug === candidateSlug,
      });
    }

    markerStates = nextMarkers;
  }

  function updatePassiveState() {
    if (modalOpen) return;

    const rows = readRowGeometry();
    const { nextSlug, candidateSlug, progress } = adjacentFocusState(rows);

    if (nextSlug) {
      focusedSlug = nextSlug;
      segmentProgress = 0;
      lastFocusChangeY = window.scrollY;
      updateMarkers(rows, nextSlug, candidateSlug, 0);
      return;
    }

    segmentProgress = progress;
    updateMarkers(rows, focusedSlug, candidateSlug, progress);
  }

  function handleScroll() {
    if (scrollRafId !== null) return;
    scrollRafId = requestAnimationFrame(() => {
      scrollRafId = null;
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) scrollDirection = "down";
      if (currentScrollY < lastScrollY) scrollDirection = "up";
      lastScrollY = currentScrollY;
      updatePassiveState();
    });
  }

  async function focusProject(project: Project) {
    setFocusedSlug(project.slug);
    await tick();
    const el = rowEls.get(project.slug);
    if (!el) return;

    const focusLine = viewportHeight * FOCUS_LINE_RATIO;
    const rect = el.getBoundingClientRect();
    const targetY = Math.max(
      0,
      rect.top + window.scrollY - focusLine + COLLAPSED_ROW_HEIGHT / 2,
    );
    window.scrollTo({
      top: targetY,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  async function measureCards() {
    await tick();
    const layer = measurementLayerEl;
    if (!layer) return;

    const next = new Map<string, number>();
    for (const child of layer.querySelectorAll<HTMLElement>("[data-measure-slug]")) {
      const slug = child.dataset.measureSlug;
      if (!slug) continue;
      next.set(slug, Math.ceil(child.getBoundingClientRect().height));
    }
    measuredHeights = next;
  }

  async function remeasureAll() {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready;
    }
    await measureCards();
  }

  function updateLayoutMetrics() {
    viewportHeight = window.innerHeight;
    viewportWidth = window.innerWidth;
    if (rootEl) {
      contentWidth = rootEl.clientWidth;
    }
  }

  function waitForImages(root: HTMLElement) {
    const images = [...root.querySelectorAll("img")];
    return Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalHeight > 0) return Promise.resolve();
        return new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          if (img.decode) {
            img.decode().then(done).catch(done);
          }
        });
      }),
    );
  }

  function fallbackHeight(slug: string) {
    return measuredHeights.get(slug) ?? Math.min(viewportHeight * 0.55, 520);
  }

  onMount(() => {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    updateLayoutMetrics();
    lastScrollY = window.scrollY;
    syncFocusWithProjects(true);
    void remeasureAll();

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
    };
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);

    const resizeObserver = new ResizeObserver(() => {
      updateLayoutMetrics();
      void remeasureAll();
      handleScroll();
    });

    if (rootEl) {
      resizeObserver.observe(rootEl);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => {
      updateLayoutMetrics();
      handleScroll();
    }, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateLayoutMetrics);
      reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
      resizeObserver.disconnect();
      if (scrollRafId !== null) cancelAnimationFrame(scrollRafId);
    };
  });

  $effect(() => {
    flatProjects;
    contentWidth;
    void remeasureAll();
  });

  $effect(() => {
    const layer = measurementLayerEl;
    if (!layer) return;
    void waitForImages(layer).then(() => measureCards());
  });

  $effect(() => {
    if (modalOpen) return;
    handleScroll();
  });
</script>

<div class="timeline-root relative w-full min-w-0" bind:this={rootEl}>
  <div
    bind:this={measurementLayerEl}
    class="pointer-events-none fixed -left-[10000px] top-0 -z-50 overflow-hidden opacity-0"
    style="width: {contentWidth || '100%'};"
    aria-hidden="true"
  >
    {#each flatProjects as project (project.slug)}
      <div data-measure-slug={project.slug}>
        <ProjectCard {project} expanded measurementMode />
      </div>
    {/each}
  </div>

  {#each years as year, yearIndex (year)}
    <section
      class="timeline-year-section min-w-0"
      style={yearIndex > 0 ? `margin-top: ${YEAR_SECTION_GAP}px;` : undefined}
    >
      <div class="pointer-events-none sticky top-0 z-20 py-1 year-label-gradient">
        <span class="px-1 text-lg font-medium text-gray-600">{year}</span>
      </div>

      {#each groups[year] ?? [] as project, projectIndex (project.slug)}
        {@const entryIndex = flatProjects.findIndex((entry) => entry.slug === project.slug)}
        <ProjectsTimelineItem
          {project}
          focused={focusedSlug === project.slug}
          measuredHeight={fallbackHeight(project.slug)}
          showHint={yearIndex === 0 && projectIndex === 0}
          {reducedMotion}
          onFocus={focusProject}
          onRowEl={(el) => registerRowEl(project.slug, el)}
        />
      {/each}
    </section>
  {/each}
</div>

{#if !modalOpen && markerStates.length > 0}
  <div class="pointer-events-none fixed left-0 top-0 z-40 h-0 w-0" aria-hidden="true">
    {#each markerStates as marker (marker.slug)}
      <div
        class="timeline-marker"
        class:timeline-marker-focused={marker.isFocused}
        class:timeline-marker-candidate={marker.isCandidate}
        style="top: {marker.top}px; --marker-fill: {marker.fill};"
      ></div>
    {/each}
  </div>
{/if}

<style>
  .year-label-gradient {
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.92) 0%,
      rgba(255, 255, 255, 0.72) 55%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  .timeline-marker {
    position: fixed;
    left: -1px;
    width: 24px;
    height: 24px;
    border-radius: 0 999px 999px 0;
    border: 2px dashed rgb(148 163 184);
    background: linear-gradient(
      to bottom,
      rgb(37 99 235) calc(var(--marker-fill, 0) * 100%),
      rgb(255 255 255 / 0.2) calc(var(--marker-fill, 0) * 100%)
    );
  }

  .timeline-marker-focused {
    border-style: solid;
    border-color: rgb(147 197 253);
    box-shadow: 0 0 0 1px rgb(191 219 254 / 0.9);
  }

  .timeline-marker-candidate {
    border-style: solid;
    border-color: rgb(148 163 184);
  }

  @media (max-width: 767px) {
    .timeline-marker {
      width: 20px;
      height: 20px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .timeline-marker {
      transition: none;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .timeline-marker {
      transition: background 120ms linear, border-color 120ms linear;
    }
  }
</style>
