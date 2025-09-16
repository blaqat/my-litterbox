<script>
  export let song;
</script>

<div class="rounded-lg bg-gray-100 p-4 flex flex-col gap-2 shadow">
  <h3 class="font-bold text-lg">{song.title}</h3>
  <audio controls src={song.url} class="w-full"></audio>
</div>
