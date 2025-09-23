<script lang="ts">
  import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    SpeakerHigh,
    SpeakerLow,
    SpeakerX,
    CaretRight,
    MusicNotes,
  } from "phosphor-svelte";
  import controller from "./MusicData.svelte";
  import Audio from "./Audio.svelte";
  import Desktop from "@components/DeviceType/Desktop.svelte";
  import { Device } from "@lib/device.svelte";
  import { flip } from "svelte/animate";
  import Mobile from "@components/DeviceType/Mobile.svelte";
  import { collapsed as PC } from "./PlayerCollapse.svelte.ts";

  const nowPlaying = $derived(
    controller.queue.songs[
      controller.queue.currentIndex % controller.queue.songs.length
    ]
  );

  let scrubHighlight: HTMLSpanElement;
  let hoverTimeout: ReturnType<typeof setTimeout>;
  let showVolumeControls = $state(false);
  let collapsed = $derived(PC.collapsed);

  function handleHoverVolume() {
    hoverTimeout = setTimeout(() => {
      showVolumeControls = true;
    }, 300);
  }

  function clearHoverVolume() {
    clearTimeout(hoverTimeout);
    showVolumeControls = false;
  }

  function timeify(sec: number | undefined | null) {
    if (!sec || isNaN(sec)) return "00:00";
    return new Date(sec * 1000).toISOString().substring(14, 19);
  }
</script>

<Audio src={nowPlaying?.url} {controller} />

{#snippet controllerButton(
  icon: typeof Play,
  hint: string,
  onclick: () => void,
  bg: boolean = false
)}
  <button
    class="rounded-full p-2 hover:scale-110 text-light-wisteria-950 transition-all duration-200 active:scale-95 hover:bg-light-wisteria-300/50 {!!bg
      ? 'border bg-light-wisteria-100/22 border-light-wisteria-700/30'
      : 'bg-transparent'} "
    {onclick}
    aria-label={hint}
    title={hint}
  >
    <!-- svelte-ignore svelte_component_deprecated -->
    <svelte:component this={icon} size="1.5em" weight="fill"></svelte:component>
  </button>
{/snippet}

{#if nowPlaying}
  {@const isPlaying = controller.queue.isPlaying}
  {@const volMuted = controller.queue.volume === 0}
  {@const volHigh = controller.queue.volume > 0.5}
  {@const time = controller.queue.time}
  {@const duration = controller.queue.duration}
  {@const timeWidth = Math.min(
    (time / duration) * (scrubHighlight?.parentElement?.clientWidth || 0),
    scrubHighlight?.parentElement?.clientWidth || 0
  )}
  {@const parent = nowPlaying?.parentRefData}
  <div
    class="fixed bottom-0 right-0 border-1 backdrop-blur-xs shadow-sm flex justify-between p-2 z-51 m-3 rounded-xl {isPlaying
      ? 'bg-light-wisteria-50/80  border-light-wisteria-300 shadow-light-wisteria-300/20'
      : 'bg-slate-50/80  border-slate-200 shadow-slate-300/20'} "
    class:bottom-22={Device.lt_md}
    class:left-0={Device.lt_md || !collapsed}
    class:left-[20%]={Device.md || !collapsed}
    class:right-[20%]={Device.md || !collapsed}
  >
    {#if Device.md || !collapsed}
      <!-- Song Title -->
      {#if parent}
        <div class="mx-2 text-light-wisteria-950 sm:truncate md:min-w-max">
          <p class="font-medium -mb-2 sm:truncate">
            {nowPlaying?.name}
          </p>
          {#if parent}
            {@const parent_name = parent.name}
            <i class="text-light-wisteria-950/75 font-light text-xs"
              >from "{parent_name}"
            </i>
          {/if}
        </div>
      {:else}
        <div
          class="mx-2 text-light-wisteria-950 flex items-center sm:truncate md:min-w-max"
        >
          <p class="font-medium truncate">{nowPlaying?.name}</p>
        </div>
      {/if}

      <!-- Scrubber -->
      <Desktop>
        <div class="flex items-center justify-between gap-4 w-full px-4">
          <span class="text-sm text-gray-500 w-10 text-right tabular-nums">
            {timeify(time)}
          </span>

          <div class="relative flex w-full">
            <!-- Background of scrubber -->
            <span class="absolute w-full h-1 rounded-lg bg-slate-600 -z-10">
            </span>
            <!-- Highlight/change width where mouse points to on scrubber -->
            <span
              bind:this={scrubHighlight}
              class="absolute h-1 rounded-lg bg-light-wisteria-600 -z-8"
            ></span>
            <!-- Width of scrubber -->
            <span
              class="absolute h-1 rounded-lg bg-light-wisteria-500 -z-9"
              style="width: {timeWidth}px"
            ></span>

            <input
              type="range"
              min="0"
              max={controller.queue.duration}
              value={time}
              oninput={(e) =>
                (controller.queue.time =
                  parseInt((e.currentTarget as HTMLInputElement).value, 10) ||
                  0)}
              onmousemovecapture={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const widthPercent = (offsetX / rect.width) * 100;
                scrubHighlight.style.width = `${widthPercent}%`;
              }}
              onmouseleave={(e) => {
                scrubHighlight.style.width = "0%";
              }}
              class="accent-light-wisteria-400 appearance-none h-1 rounded-lg cursor-pointer w-full"
            />
          </div>
          <span class="text-sm text-gray-500 w-10 text-right tabular-nums">
            {timeify(duration)}
          </span>

          <!-- Mute/Unmuted  -->

          <button
            class="rounded-full p-2 hover:scale-110 text-light-wisteria-950 transition-all duration-200 active:scale-95 hover:bg-light-wisteria-300/50 bg-transparent"
            aria-label={volMuted ? "Unmute" : "Mute"}
            title={volMuted ? "Unmute" : "Mute"}
            onclick={() => controller.toggleMute()}
            onmouseenter={handleHoverVolume}
            onmouseleave={clearHoverVolume}
          >
            <!-- svelte-ignore svelte_component_deprecated -->
            <svelte:component
              this={volMuted ? SpeakerX : volHigh ? SpeakerHigh : SpeakerLow}
              size="20px"
              weight="fill"
            ></svelte:component>
            {#if showVolumeControls}
              <div
                class="absolute bottom-12 left-1/2 -translate-x-1/2 p-2 bg-light-wisteria-50 border border-light-wisteria-300 rounded-lg shadow-lg"
              ></div>
            {/if}
          </button>
        </div>
      </Desktop>
    {/if}

    <!-- Controls -->
    <div class="flex items-center gap-4">
      {#if Device.md || !collapsed}
        <!-- Rev -->
        {@render controllerButton(SkipBack, "Previous", () =>
          controller.back()
        )}

        <!-- Play/Pause -->
        {@render controllerButton(
          isPlaying ? Pause : Play,
          isPlaying ? "Pause" : "Play",
          () => (isPlaying ? controller.pause() : controller.unpause())
        )}

        <!-- Fwd -->
        {@render controllerButton(SkipForward, "Next", () =>
          controller.forward()
        )}
      {/if}

      <!-- Collapse Music Bar for Mobile -->
      <Mobile>
        <button
          class="rounded-md p-2 hover:scale-110 text-light-wisteria-950 transition-all duration-200 active:scale-95 bg-transparent"
          aria-label={"Collapse Player"}
          title={"Collapse Player"}
          onclick={() => (PC.collapsed = !PC.collapsed)}
        >
          <!-- svelte-ignore svelte_component_deprecated -->
          {#if collapsed && Device.lt_md}
            <MusicNotes size="1.5em" weight="bold"></MusicNotes>
          {:else}
            <CaretRight size="1.5em" weight="bold"></CaretRight>
          {/if}
        </button>
      </Mobile>
    </div>
  </div>
{/if}
