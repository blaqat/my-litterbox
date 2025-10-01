import {
  parseProjectDate,
  type ProjectDateRange,
} from "@components/Projects/ProjectData";
import {
  type LinkMap,
  type MusicItem,
  type Single,
  isCollection,
  MusicStatus,
  MusicType,
  MusicInstrument,
} from "./types";

export function toSearchableString(item: MusicItem): string {
  const parts = [
    item.name,
    item.type,
    ...(item.artist ?? []),
    item.description,
    ...(isCollection(item) ? item.songs.map(toSearchableString) : []),
    item.instrument,
    item.status,
    item.start,
    item.end,
  ]
    .filter(Boolean)
    .map(String);

  return parts.join(" ").toLowerCase();
}

export function matchesQuery(item: MusicItem, query: string): boolean {
  if (query.trim() === "") {
    return true;
  }
  const searchable = toSearchableString(item);
  return searchable.includes(query.toLowerCase());
}

export function sortByDate(items: MusicItem[]): MusicItem[] {
  return items.sort((a, b) => {
    const aDate =
      a.status === MusicStatus.WIP
        ? new Date()
        : a.status === MusicStatus.Complete
        ? parseProjectDate(a.end!)
        : parseProjectDate(a.start!);
    const bDate =
      b.status === MusicStatus.WIP
        ? new Date()
        : b.status === MusicStatus.Complete
        ? parseProjectDate(b.end!)
        : parseProjectDate(b.start!);
    return bDate.getTime() - aDate.getTime();
  });
}

export function getMusicDuration(project: MusicItem): ProjectDateRange {
  if (project.status !== MusicStatus.Complete) {
    return `${project.start!} - `;
  } else if (!project.end) {
    throw new Error("Completed project must have an end date");
  } else {
    return `${project.start!} - ${project.end}`;
  }
}

export function matchesPlaying(item: MusicItem, playing?: Single): boolean {
  if (!playing) return false;

  if (item.type === MusicType.Single) {
    return !!item.url && item.url === playing.url;
  }

  if (item.type === MusicType.Collection) {
    return item.songs.some((s) => !!s.url && s.url === playing.url);
  }

  return false;
}

export function matchesInstrumentFilter(
  item: MusicItem,
  selectedInstruments: MusicInstrument[]
): boolean {
  if (selectedInstruments.length === 0) {
    return true;
  }

  if (item.type === MusicType.Collection) {
    // Show collection if any of its songs match the filter
    return item.songs.some((song) =>
      selectedInstruments.includes(song.instrument as MusicInstrument)
    );
  } else {
    return selectedInstruments.includes(item.instrument as MusicInstrument);
  }

  return false;
}

export const linkMapColors: LinkMap = {
  spotify:
    "text-green-900 hover:border-green-400 hover:bg-green-200/40 hover:text-green-800",
  youtube:
    "text-sea-pink-900 hover:border-sea-pink-400 hover:bg-sea-pink-200/40 hover:text-sea-pink-800",
  soundcloud:
    "text-orange-900 hover:border-orange-400 hover:bg-orange-200/40 hover:text-orange-800",
  beepbox:
    "text-purple-900 hover:border-purple-400 hover:bg-purple-200/40 hover:text-purple-800",
  apple:
    "text-red-900 hover:border-red-400 hover:bg-red-200/40 hover:text-red-800",
  bandcamp:
    "text-malibu-900 hover:border-malibu-400 hover:bg-malibu-200/40 hover:text-malibu-800",
};
