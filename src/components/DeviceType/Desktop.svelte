<script>
  import { Device } from "@lib/device.svelte";
</script>

{#if Device.gt_sm}
  <slot />
{/if}
