import type { MusicItem, Single, RefdSingle } from "./types";
import { MusicType } from "./types";
import { swapQueue } from "./MusicData.svelte";

export interface MusicQueryParams {
  q?: string; // Search query
  p?: string; // Playlist of song URLs
  c?: string; // Continue song at time (song_url,time_seconds)
}

/**
 * Parse URL query parameters for music functionality
 */
export function parseMusicQueries(): MusicQueryParams {
  if (typeof window === "undefined") return {};

  const urlParams = new URLSearchParams(window.location.search);
  return {
    q: urlParams.get("q") || undefined,
    p: urlParams.get("p") || undefined,
    c: urlParams.get("c") || undefined,
  };
}

/**
 * Convert a song URL to the expected format: piano_whatever for piano/whatever.mp3
 */
export function urlToSongId(url: string): string {
  // Remove the base domain and file extension
  const path = url.replace(/^.*\//, "").replace(/\.[^/.]+$/, "");

  // Get the parent directory and filename
  const parts = url.split("/");
  if (parts.length >= 2) {
    const directory = parts[parts.length - 2];
    const filename = parts[parts.length - 1].replace(/\.[^/.]+$/, "");
    return `${directory}_${filename}`;
  }

  return path;
}

/**
 * Convert a song ID back to potential URL matches
 */
export function songIdToUrlPattern(songId: string): string {
  const [directory, filename] = songId.split("_");
  return `${directory}/${filename}`;
}

/**
 * Find songs matching the given song IDs
 */
export function findSongsByIds(
  songIds: string[],
  allSongs: RefdSingle[]
): RefdSingle[] {
  return songIds
    .map((id) => {
      const pattern = songIdToUrlPattern(id);
      return allSongs.find((song) => song.url && song.url.includes(pattern));
    })
    .filter(Boolean) as RefdSingle[];
}

/**
 * Generate a playlist URL with the given song IDs
 */
export function generatePlaylistUrl(songIds: string[]): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  params.set("p", songIds.join(","));
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a continue URL for a specific song and time
 */
export function generateContinueUrl(
  songId: string,
  timeSeconds: number
): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  params.set("c", `${songId},${timeSeconds}`);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a search URL with the given query
 */
export function generateSearchUrl(query: string): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  params.set("q", query);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Get song IDs from a MusicItem (handles both singles and collections)
 */
export function getSongIds(item: MusicItem): string[] {
  if (item.type === MusicType.Single) {
    return item.url ? [urlToSongId(item.url)] : [];
  } else if (item.type === MusicType.Collection) {
    return item.songs
      .filter((song) => song.url)
      .map((song) => urlToSongId(song.url!));
  }
  return [];
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand("copy");
      textArea.remove();
      return result;
    }
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
}
