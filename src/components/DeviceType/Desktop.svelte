<script>
  import { Device } from "@lib/device.svelte";
</script>

{#if Device.md}
  <slot />
{/if}
