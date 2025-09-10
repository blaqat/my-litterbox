<script>
  export let project;
</script>

<div class="rounded-lg border bg-white p-4 shadow">
  <h3 class="font-semibold text-lg">{project.name}</h3>
  <p class="text-xs text-gray-500">{project.year} — {project.status}</p>
  <p class="mt-2 text-gray-700">{project.description}</p>

  <div class="flex gap-2 mt-4">
    {#each project.stack as tech}
      <span class="px-2 py-1 text-xs bg-gray-100 rounded">{tech}</span>
    {/each}
  </div>

  <div class="flex gap-2 mt-3">
    {#each project.links as link}
      <a href={link} target="_blank" class="text-blue-600 underline">Link</a>
    {/each}
  </div>
</div>