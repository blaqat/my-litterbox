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
  onended={() => controller.forward()}
  onpause={() => controller.pause()}
  onplay={() => controller.unpause()}
  onloadeddata={() => audio?.play()}
  class="hidden"
  {src}
></audio>
