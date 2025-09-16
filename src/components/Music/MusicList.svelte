<script lang="ts">
  import type { MusicItem, Single } from "./types";
  import { isCollection, toQueueTrack } from "./types";
  import { player } from "./playerStore";
  import {
    Play,
    Pause,
    CaretDown,
    Link as LinkIcon,
    MusicNotesSimple,
  } from "phosphor-svelte";

  export let items: MusicItem[] = [];
  export let filter: string = "";

  let openIndex: number | null = null; // accordion open item

  function toggleAccordion(i: number) {
    openIndex = openIndex === i ? null : i;
  }

  function playSingle(item: Single, parent?: string) {
    player.toggle(toQueueTrack(item, parent));
  }

  function playCollection(coll: MusicItem) {
    if (!isCollection(coll)) return;
    const tracks = coll.songs.map((s) => toQueueTrack(s, coll.name));
    player.replaceAndPlay(tracks, 0);
  }

  const { current, isPlaying } = player;
  $: $current, $isPlaying; // ensure reactivity

  function isCurrent(url?: string) {
    return !!url && $current?.url === url;
  }

  $: normalized = filter.trim().toLowerCase();
  $: list = normalized
    ? items.filter((it) => {
        const hay = [
          it.name,
          it.instrument,
          it.status,
          ...(isCollection(it) ? it.songs.map((s) => s.name) : []),
        ]
          .filter(Boolean)
          .join("\n")
          .toLowerCase();
        return hay.includes(normalized);
      })
    : items;
</script>

<div class="music-list">
  {#each list as item, i}
    <section class="card">
      <div class="head">
        <button
          type="button"
          class="toggle"
          on:click={() => toggleAccordion(i)}
          aria-expanded={openIndex === i}
        >
          <div class="title">
            <MusicNotesSimple size={18} class="mr-2 text-gray-500" />
            <h3>{item.name}</h3>
          </div>
          <span class="icon rotate"><CaretDown size={16} /></span>
        </button>
        {#if isCollection(item)}
          <button
            class="chip"
            title="Play collection"
            on:click={() => playCollection(item)}>Play all</button
          >
        {/if}
      </div>

      {#if openIndex === i}
        <div class="body">
          {#if isCollection(item)}
            <ul class="tracks">
              {#each item.songs as s}
                <li class="track">
                  <button
                    class="play"
                    on:click={() => playSingle(s, item.name)}
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
                  <div class="meta">
                    <div class="name">{s.name}</div>
                    {#if s.description}
                      <div class="desc">{s.description}</div>
                    {/if}
                  </div>
                  {#if s.links}
                    <div class="links">
                      {#each Object.entries(s.links) as [k, v]}
                        <a
                          class="link"
                          href={v}
                          target="_blank"
                          rel="noreferrer"
                          on:click|stopPropagation
                          title={k}
                        >
                          <LinkIcon size={14} />
                          <span class="sr-only">{k}</span>
                        </a>
                      {/each}
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          {:else}
            <div class="single">
              <button
                class="play"
                on:click={() => playSingle(item as Single)}
                aria-label={isCurrent((item as Single).url) && $isPlaying
                  ? "Pause"
                  : "Play"}
              >
                {#if isCurrent((item as Single).url) && $isPlaying}
                  <Pause size={16} />
                {:else}
                  <Play size={16} />
                {/if}
              </button>
              <div class="meta">
                <div class="name">{(item as Single).name}</div>
                {#if (item as Single).description}
                  <div class="desc">{(item as Single).description}</div>
                {/if}
                {#if (item as Single).artist?.length}
                  <div class="desc">{(item as Single).artist?.join(", ")}</div>
                {/if}
              </div>
              {#if (item as Single).links}
                <div class="links">
                  {#each Object.entries((item as Single).links!) as [k, v]}
                    <a
                      class="link"
                      href={v}
                      target="_blank"
                      rel="noreferrer"
                      on:click|stopPropagation
                      title={k}
                    >
                      <LinkIcon size={14} />
                      <span class="sr-only">{k}</span>
                    </a>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </section>
  {/each}
</div>

<style>
  .music-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .card {
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 0.75rem;
    overflow: hidden;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.5rem 0.5rem 0.75rem;
    gap: 0.5rem;
  }
  .toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    flex: 1;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
  }
  .toggle:hover {
    background: #f3f4f6;
  }
  .title {
    display: flex;
    align-items: center;
    font-weight: 600;
  }
  .icon {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
    display: grid;
    place-items: center;
    background: #f8fafc;
  }
  .chip {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
  }
  .body {
    padding: 0.5rem;
    border-top: 1px dashed #e5e7eb;
    background: #f8fafc;
  }
  .tracks {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .track,
  .single {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.5rem;
    align-items: start;
    padding: 0.5rem;
    border-radius: 0.5rem;
  }
  .track:hover,
  .single:hover {
    background: #ffffff;
  }
  .play {
    width: 2rem;
    height: 2rem;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
    display: grid;
    place-items: center;
    background: white;
  }
  .meta .name {
    font-weight: 600;
  }
  .meta .desc {
    color: #6b7280;
    font-size: 0.85rem;
  }
  .links {
    display: flex;
    gap: 0.25rem;
  }
  .link {
    width: 1.75rem;
    height: 1.75rem;
    display: grid;
    place-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    background: white;
  }
</style>
