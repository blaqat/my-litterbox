<script lang="ts">
  import { activeProject, closeProject } from "./projectStore";
  import {
    ProjectState,
    ProjectCategory,
    type ProjectImage,
  } from "./ProjectData";
  import { marked } from "marked";
  import TechTag from "@components/TechTag.svelte";
  import { GithubLogo, Link, X } from "phosphor-svelte";
  import { getProjectDuration as duration } from "@components/Projects/ProjectData";
  import { highlightCodeBlocks } from "./highlightCode";
  import BiggerPicture, { type BiggerPictureInstance } from "bigger-picture";
  import { onMount, tick } from "svelte";
  import "bigger-picture/css";

  let project = $derived($activeProject);
  let projectModal: HTMLDivElement;
  let modalArticleEl = $state<HTMLElement | null>(null);
  let mediaGallery: HTMLDivElement;
  let lightbox: BiggerPictureInstance | undefined;
  let lightboxOpen = false;

  const isVideo = (src: string) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src);

  function getVideoMimeType(src: string) {
    const extension = src.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      mov: "video/quicktime",
      mp4: "video/mp4",
      ogg: "video/ogg",
      webm: "video/webm",
    };
    return mimeTypes[extension ?? ""] ?? "video/mp4";
  }

  function getMediaDescription(media: ProjectImage, index: number) {
    const mediaType = isVideo(media.src) ? "video" : "image";
    return (
      media.alt.trim() ||
      `${project?.name ?? "Project"} ${mediaType} ${index + 1}`
    );
  }

  function escapeHtml(value: string) {
    return value.replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[character]!,
    );
  }

  function openMediaGallery(event: MouseEvent, selectedMedia: ProjectImage) {
    event.preventDefault();
    if (!lightbox || !project || !mediaGallery) return;

    const media = project.images;
    const triggers = Array.from(
      mediaGallery.querySelectorAll<HTMLAnchorElement>("[data-lightbox-media]"),
    );
    const position = media.indexOf(selectedMedia);

    lightbox.open({
      items: media.map((item, index) => {
        const trigger = triggers[index];
        const preview = trigger?.querySelector("img, video");
        const video = isVideo(item.src);
        const description = getMediaDescription(item, index);
        const width =
          preview instanceof HTMLVideoElement
            ? preview.videoWidth
            : preview instanceof HTMLImageElement
              ? preview.naturalWidth
              : 0;
        const height =
          preview instanceof HTMLVideoElement
            ? preview.videoHeight
            : preview instanceof HTMLImageElement
              ? preview.naturalHeight
              : 0;
        const common = {
          caption: escapeHtml(description),
          width: width || 1920,
          height: height || 1080,
          element: trigger,
        };

        return video
          ? {
              ...common,
              sources: [
                {
                  src: item.src,
                  type: getVideoMimeType(item.src),
                },
              ],
              attr: {
                "aria-label": description,
                title: description,
              },
            }
          : {
              ...common,
              img: item.src,
              thumb: item.src,
              alt: description,
            };
      }),
      position: Math.max(position, 0),
      onOpen(container) {
        lightboxOpen = true;
        container.setAttribute("role", "dialog");
        container.setAttribute("aria-modal", "true");
        container.setAttribute("aria-label", `${project.name} media gallery`);
        // Move focus out of the modal before marking it inert, otherwise the
        // browser dumps focus to <body> and scrolls the page to the top.
        container
          .querySelector<HTMLButtonElement>(".bp-x")
          ?.focus({ preventScroll: true });
        projectModal.inert = true;
      },
      onClose() {
        projectModal.inert = false;
      },
      onClosed() {
        lightboxOpen = false;
        projectModal.inert = false;
      },
    });
  }

  function onBackdrop(e: MouseEvent) {
    if ((e.target as HTMLElement).dataset.backdrop === "1") closeProject();
  }

  function renderMarkdown(md: string) {
    return marked(md);
  }

  onMount(() => {
    lightbox = BiggerPicture({ target: document.body });

    return () => {
      if (lightboxOpen) lightbox?.close();
    };
  });

  $effect(() => {
    // highlights code blocks with Prism when a modal is opened
    if (project) {
      tick().then(() => {
        if (modalArticleEl) highlightCodeBlocks(modalArticleEl);
      });
    }
  });

  // Pin the page in place while the modal is open. Using position:fixed (not
  // just overflow:hidden) keeps scrollY stable when BiggerPicture later adds
  // `bp-lock` to <html>, which would otherwise jump the page to the top.
  $effect(() => {
    if (!project) return;

    const body = document.body;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const scrollY = window.scrollY;
    const prev = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  });
</script>

{#if project}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="project-modal-title"
    bind:this={projectModal}
    id="project-modal"
    onclick={onBackdrop}
    onkeydown={(e) => e.key === "Escape" && !lightboxOpen && closeProject()}
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
        onclick={() => closeProject()}
        aria-label="Close"
        title="Close"
      >
        <X size={16} weight="bold" />
      </button>

      <!-- modal header (name, duration, status, type) -->
      <header class="flex items-start justify-between gap-4 pr-8">
        <div>
          <h2 id="project-modal-title" class="text-xl font-semibold">
            {project.name}
          </h2>
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
          class="shrink-0 text-xs px-2 py-1 rounded-lg border font-medium"
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

      <!-- description -->
      <article
        bind:this={modalArticleEl}
        class="mt-4 text-gray-800 prose max-w-none"
      >
        {@html renderMarkdown(project.description)}
      </article>

      <!-- media -->
      {#if project.images && project.images.length}
        <h3 class="mt-5 text-sm font-medium text-gray-700">Media</h3>
        <div class="mt-2 grid gap-3 sm:grid-cols-3" bind:this={mediaGallery}>
          {#each project.images as img, mediaIndex}
            <a
              href={img.src}
              class="block relative group rounded-lg transition-transform hover:scale-104 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-malibu-600"
              data-lightbox-media
              aria-haspopup="dialog"
              aria-label={`${
                isVideo(img.src) ? "Play video" : "Open full-size image"
              }: ${getMediaDescription(img, mediaIndex)}`}
              onclick={(event) => openMediaGallery(event, img)}
            >
              {#if isVideo(img.src)}
                <!-- svelte-ignore a11y_media_has_caption -->
                <video
                  class="w-full aspect-video object-cover rounded-lg border border-gray-300"
                  src={img.src}
                  preload="metadata"
                  playsinline
                  muted
                  aria-hidden="true"
                  tabindex="-1"
                >
                  Sorry, your browser doesn't support embedded videos.
                </video>
              {:else}
                <img
                  class="w-full aspect-video object-cover rounded-lg border border-gray-300"
                  src={img.src}
                  alt={getMediaDescription(img, mediaIndex)}
                  loading="lazy"
                />
              {/if}
              <div
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-300/40 border border-slate-300 text-slate-900 backdrop-blur-xl shadow-xs text-xs rounded opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-full"
              >
                {getMediaDescription(img, mediaIndex)}
              </div>
              <span
                class="absolute right-2 top-2 rounded-md border border-white/30 bg-slate-950/70 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                aria-hidden="true"
              >
                {isVideo(img.src) ? "Play" : "View"}
              </span>
            </a>
          {/each}
        </div>
      {/if}

      <!-- tech stack -->
      <div class="mt-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 class="text-sm font-medium text-gray-700">Stack</h3>
          <div class="mt-2 flex gap-2 flex-wrap text-sm">
            {#each project.stack as tech}
              <TechTag name={tech} dark />
            {/each}
          </div>
        </div>

        <!-- external links -->
        {#if project.github || project.view}
          <div>
            <h3 class="text-sm font-medium text-gray-700 -translate-x-1">
              Links
            </h3>

            <div class="mt-2 flex items-center gap-3">
              {#if project.github}
                <a
                  href={project.github}
                  class="inline-flex items-center justify-center rounded-full border p-1.5 hover:border-gray-500 text-slate-700 hover:bg-slate-200 hover:scale-110 hover:shadow-md bg-slate-50/40 backdrop-blur-xs border-slate-300 no-underline transition-all duration-200 active:scale-95"
                  target="_blank"
                  aria-label="Open GitHub"
                  title="Open GitHub"
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
                  title="View Project"
                >
                  <Link size={16} weight="duotone" />
                </a>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

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
</style>
