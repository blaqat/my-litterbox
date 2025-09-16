import type { Collection, MusicItem, Single } from "./types";

export function getMusicDuration(item: MusicItem): string {
  const start = item.start?.trim();
  const end = (item as any).end?.trim();
  const status = (item.status || "").toLowerCase();
  if (start && status === "complete" && end) return `${start} — ${end}`;
  if (start && status !== "complete") return `${start} — WIP`;
  if (start) return `${start}`;
  return "";
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function isBeepbox(item: MusicItem | Single) {
  return (item.instrument || "").toLowerCase() === "beepbox";
}

export function isPiano(item: MusicItem | Single) {
  return (item.instrument || "").toLowerCase() === "piano";
}

export function isCollection(item: MusicItem): item is Collection {
  return (item as Collection).songs !== undefined;
}
