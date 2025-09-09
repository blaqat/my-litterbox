<script>
  export let song;
</script>

<div>
  <h3>{song.title} - {song.artist}</h3>
  <audio controls src={song.url}></audio>
</div>