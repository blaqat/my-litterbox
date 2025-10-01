<script lang="ts">
  import type { QueueController } from "./MusicData.svelte";

  let {
    controller,
    src,
  }: {
    controller: QueueController;
    src: string;
  } = $props();

  let audio: HTMLAudioElement | null = null;

  // Handle play/pause sync based on controller state
  $effect(() => {
    if (audio?.paused && controller.queue.isPlaying) {
      audio.play();
    } else if (!audio?.paused && !controller.queue.isPlaying) {
      audio?.pause();
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
