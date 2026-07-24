import { type MusicData, MusicType, type CollectionSingle } from "./types";
import music from "../../data/music.json";
import { sortByDate } from "./utils";
import { Device } from "@lib/device.svelte";

// Default list of songs for the queue
const orderedSongList = sortByDate(music as MusicData[])
  .map((item) => {
    if (item.type === MusicType.Collection) {
      item.songs = item.songs.map((song, i) => ({
        ...song,
        parentRefData: { name: item.name, index: i, total: item.songs.length },
      }));
    }
    return item;
  })
  .flatMap((song) => (song.type === MusicType.Single ? [song] : song.songs))
  .filter((song) => !!song.url) as CollectionSingle[];

// Internal volume store for mute toggle
let volStore = 1;
// Deletion sentinel for queue management (makes sure when song list is swapped, current playing song can still play once)
let needsDel = false;
// sentinel for double click timer
let lastBack: ReturnType<typeof setTimeout> | undefined;

export const queue = $state({
  songs: orderedSongList,
  currentIndex: -1,
  isPlaying: false,
  time: 0,
  duration: 0,
  volume: 1,
});

/**
 * Updates the global playback queue to either a provided subset of songs or the full ordered list.
 *
 *
 * @param items - Optional array of `MusicData` (singles or collections). When omitted, the queue is
 *                reset to the full `orderedSongList`.
 * @param opts.sort - When `true` (default), the provided `items` will be passed through `sortByDate`
 *                    before further processing.
 * @returns void
 */
export function swapQueue(
  items: MusicData[] | undefined = undefined,
  opts: { sort: boolean } = { sort: true }
) {
  // Handle reset queue to default ordered list
  if (items === undefined) {
    let oldPlaying = queue.songs[queue.currentIndex];
    queue.songs = orderedSongList;
    let playingIndex = queue.songs.findIndex(
      (s) => s.url === oldPlaying?.url && s.name === oldPlaying?.name
    );
    if (playingIndex === -1) {
      queue.currentIndex = -1;
    } else {
      queue.currentIndex = playingIndex;
    }
    return;
  }

  // Handle setting queue to a specific subset of songs
  let oldPlaying = queue.songs[queue.currentIndex];
  const newSongs = (opts.sort ? sortByDate(items) : items)
    .map((item) => {
      if (item.type === MusicType.Collection) {
        item.songs = item.songs.map((song, i) => ({
          ...song,
          parentRefData: {
            name: item.name,
            index: i,
            total: item.songs.length,
          },
        }));
      }
      return item;
    })
    .flatMap((song) => (song.type === MusicType.Single ? [song] : song.songs))
    .filter((song) => !!song.url) as CollectionSingle[];

  // If new queue is empty, ignore the swap
  if (newSongs.length === 0) {
    console.warn("New queue is empty, ignoring");
    return;
  }

  // Update the queue while trying to keep the same song playing
  queue.songs = newSongs;
  let playingIndex = queue.songs.findIndex(
    (s) => s.url === oldPlaying?.url && s.name === oldPlaying?.name
  );

  // If current song is not in queue, make sure next song goes to first song in new queue
  if (playingIndex === -1) {
    queue.songs.unshift(oldPlaying);
    queue.currentIndex = 0;
    needsDel = true;
  } else {
    // Otherwise, keep playing the same song
    queue.currentIndex = playingIndex;
  }
}

// Toggles mute state between 0 and last non-zero volume
export function toggleMute() {
  if (queue.volume > 0) {
    volStore = queue.volume;
    queue.volume = 0;
  } else {
    queue.volume = volStore;
  }
}

/**
 * Plays a specific song or the first song in a collection.
 */
export function playSong(item: MusicData) {
  const isCollection = item.type === MusicType.Collection;
  let song = !isCollection ? item : item.songs[0];
  const index = queue.songs.findIndex(
    (s) => s?.url === song.url && s.name === song.name
  );
  if (
    isCollection &&
    queue.currentIndex > index &&
    queue.currentIndex <= index + item.songs.filter((s) => !!s.url).length - 1
  ) {
    console.warn("Already playing a song from this collection");
    queue.isPlaying = true;
    return;
  }
  play(index);
}

/**
 * Plays the song at the given index in the queue, or resumes if already playing.
 * If the index is the same as the current song, it does nothing.
 *
 * @param index - The index of the song in the queue to play.
 * @param time - Optional start time in seconds to begin playback from (default is 0).
 */
export function play(index: number, time: number = 0) {
  queue.isPlaying = true;
  if (queue.currentIndex === index) return;
  queue.currentIndex = index;
  queue.time = time;
  // console.log("playing", queue.songs[queue.currentIndex].name);
}

// Initializes the queue to a specific index and time without changing play state
export function init(index: number, time: number) {
  queue.currentIndex = index;
  queue.time = time;
}

// Pauses playback
export function pause() {
  queue.isPlaying = false;
}

// Resumes playback
export function resume() {
  queue.isPlaying = true;
}

// Skips to the next song in the queue, or loops to the start if at the end
export function skip() {
  if (needsDel) {
    queue.songs.shift()?.name;
    needsDel = false;
  } else if (queue.currentIndex < queue.songs.length - 1) {
    queue.currentIndex += 1;
  } else {
    queue.currentIndex = 0;
  }
}

/**
 * Handles the "back" control for the playback queue.
 * if clicked once, it resets the current song's time to 0.
 * if clicked twice **ON DESKTOP** within 750ms it reverse to the previous song in the queue.
 * @returns void
 */
export function reverse() {
  // on mobile, always just go back (for my grandparent's sake :3)
  if (Device.lt_md) return revPure();

  if (lastBack) {
    clearTimeout(lastBack);
    lastBack = undefined;
    revPure();
  } else {
    queue.time = 0;
  }

  lastBack = setTimeout(() => {
    lastBack = undefined;
  }, 750);
}

// Reverses to the previous song in the queue, or loops to the end if at the start
function revPure() {
  queue.currentIndex =
    (queue.currentIndex + queue.songs.length - 1) % queue.songs.length;
}

/** Goes to the previous song in the queue (wraps around). */
export function previous() {
  revPure();
}

const controller = {
  playSong,
  play,
  pause,
  resume,
  skip,
  reverse,
  previous,
  queue,
  toggleMute,
};

export type QueueController = typeof controller;
export default controller;
