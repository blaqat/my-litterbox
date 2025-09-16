import { writable, derived, get } from "svelte/store";
import type { QueueTrack } from "./types";

type RepeatMode = "off" | "one" | "all";

function createPlayerStore() {
  const audio = typeof window !== "undefined" ? new Audio() : ({} as any);
  audio.preload = "metadata";
  let autostartNext = false; // ensure new tracks start playing automatically

  const queue = writable<QueueTrack[]>([]);
  const index = writable<number>(-1);
  const isPlaying = writable<boolean>(false);
  const repeat = writable<RepeatMode>("off");
  const volume = writable<number>(1);

  const current = derived([queue, index], ([$queue, $index]) => {
    if ($index < 0 || $index >= $queue.length) return null;
    return $queue[$index];
  });

  function load(track: QueueTrack | null) {
    if (!track || typeof window === "undefined") return;
    audio.src = track.url;
    audio.load();
    const onCanPlay = async () => {
      audio.removeEventListener("canplay", onCanPlay);
      if (autostartNext) {
        autostartNext = false;
        await play();
      }
    };
    audio.addEventListener("canplay", onCanPlay, { once: true } as any);
  }

  async function play() {
    if (typeof window === "undefined") return;
    try {
      await audio.play();
      isPlaying.set(true);
    } catch (e) {
      // autoplay might be blocked; ignore
    }
  }

  function pause() {
    if (typeof window === "undefined") return;
    audio.pause();
    isPlaying.set(false);
  }

  function setQueue(tracks: QueueTrack[], startAt = 0) {
    queue.set(tracks);
    index.set(
      tracks.length > 0 ? Math.min(Math.max(startAt, 0), tracks.length - 1) : -1
    );
  }

  function replaceAndPlay(tracks: QueueTrack[] | QueueTrack, startAt = 0) {
    const arr = Array.isArray(tracks) ? tracks : [tracks];
    autostartNext = true;
    setQueue(arr, startAt);
  }

  function enqueue(tracks: QueueTrack[] | QueueTrack) {
    const arr = Array.isArray(tracks) ? tracks : [tracks];
    queue.update((q) => [...q, ...arr]);
  }

  function next(auto = false) {
    const q = get(queue);
    const i = get(index);
    const r = get(repeat);
    if (q.length === 0) return;

    if (r === "one" && auto) {
      // replay same track
      audio.currentTime = 0;
      play();
      return;
    }

    let ni = i + 1;
    if (ni >= q.length) {
      if (r === "all") ni = 0;
      else {
        pause();
        return;
      }
    }
    index.set(ni);
    // always continue playback on next
    autostartNext = true;
  }

  function prev() {
    const q = get(queue);
    const i = get(index);
    if (q.length === 0) return;
    const ni = i - 1 < 0 ? 0 : i - 1;
    index.set(ni);
    autostartNext = true;
  }

  function toggle(track?: QueueTrack | QueueTrack[]) {
    const cur = get(current);
    if (track) {
      const arr = Array.isArray(track) ? track : [track];
      // if the first provided is the same as current, toggle play/pause
      if (cur && arr.length === 1 && arr[0].url === cur.url) {
        return get(isPlaying) ? pause() : play();
      }
      replaceAndPlay(arr, 0);
      return;
    }
    get(isPlaying) ? pause() : play();
  }

  // wire audio element events
  if (typeof window !== "undefined") {
    audio.addEventListener("ended", () => next(true));
    audio.addEventListener("pause", () => isPlaying.set(false));
    audio.addEventListener("play", () => isPlaying.set(true));
    audio.addEventListener("loadedmetadata", () => {
      audio.volume = get(volume);
    });
  }

  // react to current track changes
  current.subscribe((t) => load(t));

  volume.subscribe((v) => {
    if (typeof window !== "undefined") audio.volume = v;
  });

  return {
    audio,
    queue,
    index,
    current,
    isPlaying,
    repeat,
    volume,
    play,
    pause,
    next,
    prev,
    toggle,
    enqueue,
    replaceAndPlay,
    setQueue,
  };
}

export const player = createPlayerStore();
