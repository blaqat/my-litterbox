<script>
  import { Device } from "@lib/device.svelte";
</script>

{#if Device.lt_md}
  <slot />
{/if}
