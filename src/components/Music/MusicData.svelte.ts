import {
  type Single,
  type MusicItem,
  MusicType,
  type RefdSingle,
} from "./types";
import music from "../../data/music.json";
import { sortByDate } from "./utils";

const orderedSongList = sortByDate(music as MusicItem[])
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
  .filter((song) => !!song.url) as RefdSingle[];

let _vol_store = 1;
let _needs_del = false;

export const queue = $state({
  songs: orderedSongList,
  currentIndex: -1,
  isPlaying: false,
  time: 0,
  duration: 0,
  volume: 1,
});

export function swapQueue(items: MusicItem[] | undefined = undefined) {
  // Handle Reset to full list
  if (items === undefined) {
    let oldPlaying = queue.songs[queue.currentIndex];
    queue.songs = orderedSongList;
    let playingIndex = queue.songs.findIndex(
      (s) => s.url === oldPlaying?.url && s.name === oldPlaying?.name
    );
    if (playingIndex === -1) {
      console.warn("Current song not in full list, resetting to start");
    } else {
      queue.currentIndex = playingIndex;
    }
    return;
  }

  let oldPlaying = queue.songs[queue.currentIndex];
  const newSongs = sortByDate(items)
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
    .filter((song) => !!song.url) as RefdSingle[];

  if (newSongs.length === 0) {
    console.warn("New queue is empty, ignoring");
    return;
  }

  queue.songs = newSongs;
  let playingIndex = queue.songs.findIndex(
    (s) => s.url === oldPlaying?.url && s.name === oldPlaying?.name
  );

  // If current song is not in queue, make sure next song goes to first song
  if (playingIndex === -1) {
    queue.songs.unshift(oldPlaying);
    queue.currentIndex = 0;
    _needs_del = true;
  } else {
    // Otherwise, keep playing the same song
    queue.currentIndex = playingIndex;
  }
}

export function toggleMute() {
  if (queue.volume > 0) {
    _vol_store = queue.volume;
    queue.volume = 0;
  } else {
    queue.volume = _vol_store;
  }
}

export function playSong(item: MusicItem) {
  const isCollection = item.type === MusicType.Collection;
  let song = !isCollection ? item : item.songs[0];
  const index = queue.songs.findIndex(
    (s) => s.url === song.url && s.name === song.name
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

export function play(index: number) {
  queue.isPlaying = true;
  if (queue.currentIndex === index) return;
  queue.currentIndex = index;
  queue.time = 0;
  // console.log("playing", queue.songs[queue.currentIndex].name);
}

export function pause() {
  queue.isPlaying = false;
  // console.log("paused", queue.songs[queue.currentIndex].name);
}

export function unpause() {
  queue.isPlaying = true;
  // console.log("unpaused", queue.songs[queue.currentIndex].url);
}

export function forward() {
  if (_needs_del) {
    // console.log("removed", queue.songs.shift()?.name);
    queue.songs.shift()?.name;
    _needs_del = false;
  } else if (queue.currentIndex < queue.songs.length - 1) {
    queue.currentIndex += 1;
  } else {
    queue.currentIndex = 0;
  }
  // console.log(
  //   "forward to",
  //   queue.currentIndex,
  //   queue.songs[queue.currentIndex].name
  // );
}

export function back() {
  if (queue.currentIndex > 0) {
    queue.currentIndex -= 1;
  } else {
    queue.currentIndex = queue.songs.length - 1;
  }
  // console.log(
  //   "back to",
  //   queue.currentIndex,
  //   queue.songs[queue.currentIndex].name
  // );
}

const controller = {
  playSong,
  play,
  pause,
  unpause,
  forward,
  back,
  queue,
  toggleMute,
};

export type QueueController = typeof controller;
export default controller;
