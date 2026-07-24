<script lang="ts">
  import type { QueueController } from "./MusicData.svelte";
  import type { CollectionSingle } from "./types";

  let {
    controller,
    src,
    song,
  }: {
    controller: QueueController;
    src: string;
    song: CollectionSingle | undefined;
  } = $props();

  let audio: HTMLAudioElement | null = null;

  function hasMediaSession(): boolean {
    return typeof navigator !== "undefined" && "mediaSession" in navigator;
  }

  function clampTime(time: number, duration: number) {
    return Math.min(Math.max(time, 0), duration);
  }

  // Handle play/pause sync based on controller state
  $effect(() => {
    if (audio?.paused && controller.queue.isPlaying) {
      audio.play();
    } else if (!audio?.paused && !controller.queue.isPlaying) {
      audio?.pause();
    }
  });

  // Media Session metadata
  $effect(() => {
    if (!hasMediaSession()) return;

    if (!song) {
      navigator.mediaSession.metadata = null;
      return;
    }

    const artist = song.artist?.join(", ")?.trim() || "blaqat.net";

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.name,
      artist,
      album: song.parentRefData?.name ?? "",
      artwork: [
        { src: "/now-playing.png", sizes: "512x512", type: "image/png" },
      ],
    });
  });

  // Media Session action handlers (register once, clear on destroy)
  $effect(() => {
    if (!hasMediaSession()) return;

    const actions: [
      MediaSessionAction,
      MediaSessionActionHandler,
    ][] = [
      ["play", () => controller.resume()],
      ["pause", () => controller.pause()],
      ["stop", () => controller.pause()],
      ["nexttrack", () => controller.skip()],
      ["previoustrack", () => controller.previous()],
      [
        "seekbackward",
        (details) => {
          const offset = details.seekOffset ?? 10;
          controller.queue.time = clampTime(
            controller.queue.time - offset,
            controller.queue.duration
          );
        },
      ],
      [
        "seekforward",
        (details) => {
          const offset = details.seekOffset ?? 10;
          controller.queue.time = clampTime(
            controller.queue.time + offset,
            controller.queue.duration
          );
        },
      ],
      [
        "seekto",
        (details) => {
          if (details.seekTime == null) return;
          controller.queue.time = clampTime(
            details.seekTime,
            controller.queue.duration
          );
        },
      ],
    ];

    for (const [action, handler] of actions) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Unsupported action (e.g. older Safari)
      }
    }

    return () => {
      for (const [action] of actions) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // Unsupported action
        }
      }
    };
  });

  // Media Session playback state
  $effect(() => {
    if (!hasMediaSession()) return;
    navigator.mediaSession.playbackState = controller.queue.isPlaying
      ? "playing"
      : "paused";
  });

  // Media Session position state
  $effect(() => {
    if (!hasMediaSession()) return;

    const duration = controller.queue.duration;
    const position = controller.queue.time;

    if (!Number.isFinite(duration) || duration <= 0) return;

    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: clampTime(position, duration),
        playbackRate: 1,
      });
    } catch {
      // Chrome throws on invalid position state during track switches
    }
  });
</script>

<audio
  bind:this={audio}
  bind:volume={controller.queue.volume}
  bind:duration={controller.queue.duration}
  bind:currentTime={controller.queue.time}
  onended={() => controller.skip()}
  onpause={() => controller.pause()}
  onplay={() => controller.resume()}
  onloadeddata={() => audio?.play()}
  class="hidden"
  {src}
></audio>
