import { writable } from "svelte/store";
import type { MusicItem } from "./types";

export const activeMusic = writable<MusicItem | null>(null);

export function openMusic(item: MusicItem) {
  activeMusic.set(item);
  if (typeof window !== "undefined") {
    window.history.pushState({ music: item.name }, "", `/music`);
  }
}

export function closeMusic(opts: { fromPopState?: boolean } = {}) {
  activeMusic.set(null);
  if (typeof window !== "undefined" && !opts.fromPopState) {
    window.history.pushState({}, "", `/music`);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    closeMusic({ fromPopState: true });
  });
}

export default { activeMusic, openMusic, closeMusic };
