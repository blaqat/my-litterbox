<script lang="ts">
  import { Device } from "@lib/device.svelte";
</script>

<p>sm: {Device.sm ? "yes" : "no"}</p>
<p>md: {Device.md ? "yes" : "no"}</p>
<p>lg: {Device.lg ? "yes" : "no"}</p>
<p>xl: {Device.xl ? "yes" : "no"}</p>
<p>2xl: {Device.two_xl ? "yes" : "no"}</p>

<hr />

{#if Device.gt_sm}
  <p>≥ md</p>
{:else}
  <p>{"< md"}</p>
{/if}
