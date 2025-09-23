<!-- <span class="block md:hidden max-md:landscape:block">
  <slot />
</span> -->

<script>
  import { Device } from "@lib/device.svelte";
</script>

{#if Device.lt_md}
  <slot />
{/if}
