<script>
  export let label = "blaqat";
  export let color = "text-black/5";
</script>

{#each Array(10) as _, i}
  <div
    class="{color} -z-10 whitespace-nowrap text-6xl font-bold {i % 2 === 0
      ? 'animate-scroll-left'
      : 'animate-scroll-right'}"
    style="position: absolute; top: {i * 10}%; left: 0; width: 100%;"
    aria-hidden="true"
  >
    {label.repeat(50)}
  </div>
{/each}
