<script lang="ts">
  import type { MusicItem, Single } from "./types";
  import { toQueueTrack, isCollection } from "./types";
  import { player } from "./playerStore";
  import { getMusicDuration, isBeepbox, isPiano } from "./musicUtils";
  import { marked } from "marked";
  import { openMusic } from "./musicStore";
  import {
    MusicNotesSimple,
    Play,
    Pause,
    PianoKeys,
    Circle,
    YoutubeLogo,
    SoundcloudLogo,
    Link as LinkIcon,
  } from "phosphor-svelte";

  export let items: MusicItem[] = [];
  export let filter: string = "";

  let expanded: string | null = null; // collection name expanded
  let rowEl: HTMLDivElement | null = null;
  let userScrolled = false;

  const { current, isPlaying } = player;
  $: $current, $isPlaying;

  function isCurrent(url?: string) {
    return !!url && $current?.url === url;
  }

  function togglePlay(item: MusicItem) {
    if (isCollection(item)) {
      // Expand and start playing the collection
      if (expanded !== item.name) expanded = item.name;
      const tracks = item.songs.map((s) => toQueueTrack(s, item.name));
      player.replaceAndPlay(tracks, 0);
    } else {
      player.toggle(toQueueTrack(item as Single));
    }
  }

  function toggleCollection(c: MusicItem) {
    expanded = expanded === c.name ? null : c.name;
  }

  function playSingleInCollection(collName: string, s: Single) {
    const tracks = items
      .filter(isCollection)
      .find((c) => c.name === collName)!
      .songs.map((x) => toQueueTrack(x, collName));
    const idx = tracks.findIndex((t) => t.url === s.url);
    player.replaceAndPlay(tracks, Math.max(0, idx));
    expanded = collName; // ensure open
  }

  // auto-scroll in collection row to current track when applicable
  $: if (rowEl && $current?.parentCollection === expanded && !userScrolled) {
    const target = rowEl.querySelector(
      `[data-url="${CSS.escape($current.url)}"]`
    ) as HTMLElement | null;
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }

  function onRowScroll() {
    userScrolled = true;
    clearTimeout((onRowScroll as any)._t);
    (onRowScroll as any)._t = setTimeout(() => (userScrolled = false), 1200);
  }

  $: normalized = filter.trim().toLowerCase();
  function preferredLink(
    links?: Record<string, string>
  ): { key: string; url: string } | null {
    if (!links) return null;
    const order = ["youtube", "soundcloud", "beepbox"];
    for (const k of order) {
      const match = Object.entries(links).find(
        ([key]) => key.toLowerCase() === k
      );
      if (match) return { key: match[0], url: match[1] as string };
    }
    const first = Object.entries(links)[0];
    return first ? { key: first[0], url: first[1] as string } : null;
  }
  $: list = normalized
    ? items.filter((it) => {
        const hay = [
          it.name,
          it.instrument,
          it.status,
          ...("songs" in it ? it.songs.map((s) => s.name) : []),
        ]
          .filter(Boolean)
          .join("\n")
          .toLowerCase();
        return hay.includes(normalized);
      })
    : items;
</script>

<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
  {#each list as item}
    <div
      class="card"
      class:expanded={expanded === item.name && isCollection(item)}
      class:playing={!isCollection(item) && isCurrent((item as Single).url)}
      class:playing-coll={isCollection(item) &&
        $current?.parentCollection === item.name}
    >
      <div class="card-body">
        <div class="content">
          <header class="flex items-start justify-between">
            <h3 class="font-semibold text-lg leading-tight pr-2">
              {item.name}
            </h3>
            <span
              class="badge"
              class:piano={isPiano(item)}
              class:beep={isBeepbox(item)}
              class:other={!isPiano(item) && !isBeepbox(item)}
            >
              {#if isPiano(item)}
                <PianoKeys size={16} weight="bold" />
              {:else if isBeepbox(item)}
                <Circle size={14} weight="bold" />
              {:else}
                <MusicNotesSimple size={16} weight="bold" />
              {/if}
            </span>
          </header>

          <p class="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
            <span>{getMusicDuration(item)}</span>
            {#if item.status && item.status !== "complete"}
              <span class="status"
                ><span
                  class="dot"
                  class:ongoing={item.status === "wip"}
                  class:dropped={item.status === "dropped"}
                ></span>{item.status}</span
              >
            {/if}
          </p>

          {#if item.description}
            <article
              class="mt-2 text-gray-700 line-clamp-3 prose prose-sm max-w-none"
            >
              {@html marked(item.description)}
            </article>
          {/if}
        </div>

        <div class="footer">
          <div class="left-actions">
            {#if isCollection(item)}
              <!-- <button
                type="button"
                class="chip"
                on:click={() => toggleCollection(item)}
                aria-expanded={expanded === item.name}
              >
                {expanded === item.name ? "Collapse" : "Expand"}
              </button> -->
            {/if}
            <div class="links">
              {#if (item as any).links}
                {#each Object.entries((item as any).links) as [k, v]}
                  <a
                    href={v as string}
                    target="_blank"
                    on:click|stopPropagation
                    class="link"
                    title={k as string}
                  >
                    {#if k.toLowerCase() === "youtube"}
                      <YoutubeLogo
                        size={16}
                        class="text-gray-600 hover:text-red-600"
                      />
                    {:else if k.toLowerCase() === "soundcloud"}
                      <SoundcloudLogo
                        size={16}
                        class="text-gray-600 hover:text-orange-600"
                      />
                    {:else if k.toLowerCase() === "beepbox"}
                      <Circle
                        size={14}
                        class="text-gray-600 hover:text-purple-600"
                        weight="bold"
                      />
                    {:else}
                      <LinkIcon size={16} />
                    {/if}
                  </a>
                {/each}
              {/if}
            </div>
          </div>
          {#if !isCollection(item) && !(item as Single).url}
            {#if (item as any).links}
              {#await Promise.resolve(preferredLink((item as any).links)) then pl}
                {#if pl}
                  {#if pl.key.toLowerCase() === "youtube"}
                    <a
                      class="play primary"
                      href={pl.url}
                      target="_blank"
                      on:click|stopPropagation
                      title="Open YouTube"
                      aria-label="Open YouTube"><YoutubeLogo size={18} /></a
                    >
                  {:else if pl.key.toLowerCase() === "soundcloud"}
                    <a
                      class="play primary"
                      href={pl.url}
                      target="_blank"
                      on:click|stopPropagation
                      title="Open SoundCloud"
                      aria-label="Open SoundCloud"
                      ><SoundcloudLogo size={18} /></a
                    >
                  {:else}
                    <a
                      class="play primary"
                      href={pl.url}
                      target="_blank"
                      on:click|stopPropagation
                      title="Open Link"
                      aria-label="Open Link"
                      ><Circle
                        size={16}
                        class="text-purple-600"
                        weight="bold"
                      /></a
                    >
                  {/if}
                {/if}
              {/await}
            {/if}
          {:else if isCollection(item)}
            <button
              type="button"
              class="play primary"
              on:click|stopPropagation={() => toggleCollection(item)}
              aria-label={expanded === item.name ? "Collapse" : "Expand"}
            >
              {expanded === item.name ? "−" : "+"}
            </button>
          {:else}
            <button
              type="button"
              class="play primary"
              on:click|stopPropagation={() => togglePlay(item)}
              aria-label={isCurrent((item as Single).url) && $isPlaying
                ? "Pause"
                : "Play"}
            >
              {#if isCurrent((item as Single).url) && $isPlaying}
                <Pause size={18} weight="bold" />
              {:else}
                <Play size={18} weight="bold" />
              {/if}
            </button>
          {/if}
        </div>
      </div>

      {#if isCollection(item) && expanded === item.name}
        <div class="collection">
          <header class="coll-title">{item.name}</header>
          <div class="row" bind:this={rowEl} on:scroll={onRowScroll}>
            {#each item.songs as s, idx}
              <div
                class="mini-card snap-start"
                class:playing={isCurrent(s.url)}
                data-url={s.url}
              >
                <div
                  class="mini-content"
                  role="button"
                  tabindex="0"
                  on:click={() => openMusic(s)}
                  on:keydown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    (e.preventDefault(), openMusic(s))}
                >
                  <div class="mini-header">
                    <div class="name">{s.name}</div>
                    <span
                      class="badge"
                      class:piano={isPiano(s)}
                      class:beep={isBeepbox(s)}
                      class:other={!isPiano(s) && !isBeepbox(s)}
                    >
                      {#if isPiano(s)}
                        <PianoKeys size={14} weight="bold" />
                      {:else if isBeepbox(s)}
                        <Circle size={12} weight="bold" />
                      {:else}
                        <MusicNotesSimple size={14} weight="bold" />
                      {/if}
                    </span>
                  </div>
                  {#if s.description}
                    <div class="desc line-clamp-2">
                      {@html marked(s.description)}
                    </div>
                  {/if}
                </div>
                <div class="mini-footer">
                  <div class="links">
                    {#if s.links}
                      {#each Object.entries(s.links) as [k, v]}
                        <a
                          href={v}
                          target="_blank"
                          on:click|stopPropagation
                          class="link"
                          title={k}
                        >
                          {#if k.toLowerCase() === "youtube"}
                            <YoutubeLogo size={14} />
                          {:else if k.toLowerCase() === "soundcloud"}
                            <SoundcloudLogo size={14} />
                          {:else if k.toLowerCase() === "beepbox"}
                            <Circle size={12} weight="bold" />
                          {:else}
                            <LinkIcon size={14} />
                          {/if}
                        </a>
                      {/each}
                    {/if}
                  </div>
                  <button
                    type="button"
                    class="mini-play"
                    on:click|stopPropagation={() =>
                      playSingleInCollection(item.name, s)}
                    aria-label={isCurrent(s.url) && $isPlaying
                      ? "Pause"
                      : "Play"}
                  >
                    {#if isCurrent(s.url) && $isPlaying}
                      <Pause size={16} />
                    {:else}
                      <Play size={16} />
                    {/if}
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/each}
  {#if list.length === 0}
    <p class="text-center text-gray-500 col-span-full">no music found...</p>
  {/if}
</div>

<style>
  .card {
    position: relative;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 0.75rem;
    overflow: hidden;
  }
  .card.expanded {
    grid-column: 1 / -1;
  }
  .card-body {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: left;
    padding: 1rem;
  }
  .content {
    cursor: pointer;
  }
  .card.playing {
    border-color: #a78bfa;
    box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.25) inset;
    background: #faf5ff;
  }
  .card.playing-coll {
    border-color: #c4b5fd;
    background: #faf5ff;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
  }
  .badge.piano {
    background: var(--color-malibu-100);
    border-color: var(--color-malibu-300);
    color: var(--color-malibu-900);
  }
  .badge.beep {
    background: #f3e8ff;
    border-color: #e9d5ff;
    color: #6b21a8;
  }
  .badge.other {
    background: #f3f4f6;
    border-color: #e5e7eb;
    color: #111827;
  }
  .status {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
    display: inline-block;
  }
  .dot.ongoing {
    background: #22c55e;
    border-color: #3a8e58;
  }
  .dot.dropped {
    background: #ef4444;
    border-color: #b91c1c;
  }
  /* removed unused line-clamp-5 */
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 0.75rem;
  }
  .left-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .links {
    display: flex;
    gap: 0.5rem;
  }
  .link {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    background: white;
  }
  .play {
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    background: white;
  }
  .play.primary {
    width: 2.5rem;
    height: 2.5rem;
    border-color: #c4b5fd;
    background: #ede9fe;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
  }
  .collection {
    padding: 0.5rem 0.75rem 0.75rem;
    background: #f8fafc;
    border-top: 1px dashed #e5e7eb;
  }
  .coll-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #334155;
  }
  .row {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    scroll-snap-type: x proximity;
    padding-bottom: 0.25rem;
  }
  .row:focus-within {
    outline: none;
  }
  .mini-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 260px;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    background: white;
    padding: 0.5rem 0.5rem 0.5rem 0.5rem;
    text-align: left;
  }
  .mini-content {
    cursor: pointer;
  }
  .mini-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .mini-card.playing {
    border-color: #a78bfa;
    background: #faf5ff;
  }
  .mini-card .name {
    font-weight: 600;
  }
  .mini-card .desc {
    color: #6b7280;
    font-size: 0.85rem;
  }
  .mini-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .mini-play {
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    background: #fff;
  }
</style>
