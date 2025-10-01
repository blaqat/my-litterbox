import {
  parseProjectDate,
  type ProjectDateRange,
} from "@components/Projects/ProjectData";
import {
  type LinkMap,
  type MusicData,
  type Single,
  MusicStatus,
  MusicType,
  MusicInstrument,
} from "./types";

/**
 * Convert a MusicItem into a normalized string for searching.
 *
 * @param music - The MusicData to serialize for search/indexing.
 * @returns A lower-case, space-separated string containing the non-empty fields
 *          of the item suitable for text search.
 */
export function toSearchableString(music: MusicData): string {
  const parts = [
    music.name,
    music.type,
    ...(music.artist ?? []),
    music.description,
    ...(music.type === MusicType.Collection
      ? music.songs.map(toSearchableString)
      : []),
    music.instrument,
    music.status,
    music.start,
    music.end,
  ]
    .filter(Boolean)
    .map(String);

  return parts.join(" ").toLowerCase();
}

/**
 * Determines whether a MusicItem matches a given search query.
 * @param music - The MusicData to test.
 * @param query - The search query string.
 * @returns True if the item matches the query; otherwise false.
 */
export function matchesQuery(music: MusicData, query: string): boolean {
  if (query.trim() === "") {
    return true;
  }
  const searchable = toSearchableString(music);
  return searchable.includes(query.toLowerCase());
}

/**
 * Sorts an array of MusicData in-place from newest to oldest.
 *
 * @param music - Array of MusicData objects to sort.
 * @returns The same array instance sorted in descending chronological order (most recent first).
 */
export function sortByDate(music: MusicData[]): MusicData[] {
  return music.sort((a, b) => {
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

/**
 * Produces a human-readable date range for a music project.
 *
 * @param music - The MusicData object containing at least `start` and `status`, and `end` when complete.
 * @returns A ProjectDateRange string representing the start and (optionally) end date.
 */
export function getMusicDuration(music: MusicData): ProjectDateRange {
  if (music.status !== MusicStatus.Complete) {
    return `${music.start!} - `;
  } else if (!music.end) {
    throw new Error("Completed project must have an end date");
  } else {
    return `${music.start!} - ${music.end}`;
  }
}

/**
 * Checks if a music item matches/or has a song that matches the currently playing track.
 *
 * @param music - The music item to check. Expected to be a MusicData value that can be a Single or a Collection.
 * @param playing - The currently playing track (a Single). If undefined or falsy, the function returns false.
 * @returns True if the music item matches the playing track or if a Collection has a song that matches; otherwise false.
 */
export function matchesPlaying(music: MusicData, playing?: Single): boolean {
  if (!playing) return false;

  if (music.type === MusicType.Collection) {
    return music.songs.some((s) => !!s.url && s.url === playing.url);
  } else {
    return !!music.url && music.url === playing.url;
  }
}

/**
 * Checks if a music item matches the selected instrument filters.
 *
 * @param music - The MusicData item to evaluate.
 * @param selectedInstruments - Currently selected instrument filters
 * @returns True if the item should be shown based on the selected instruments; otherwise false.
 */
export function matchesInstrumentFilter(
  music: MusicData,
  selectedInstruments: MusicInstrument[]
): boolean {
  if (selectedInstruments.length === 0) {
    return true;
  }

  if (music.type === MusicType.Collection) {
    // Show collection if any of its songs match the filter
    return music.songs.some((song) =>
      selectedInstruments.includes(song.instrument as MusicInstrument)
    );
  } else {
    return selectedInstruments.includes(music.instrument as MusicInstrument);
  }
}

// Map of link types to their corresponding tw color classes
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
