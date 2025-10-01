import type { MusicData, CollectionSingle } from "./types";
import { MusicType } from "./types";

/**
 * Query parameters used by the music features to control search, playlist, and playback behavior.
 *
 * - q: Search query string
 * - s: Comma-separated list of song URLs for playlist playback
 * - c: Continue playback of a specific song at a given time (format: song_url,time_seconds)
 * - o: Open modal for a specific song URL ID
 */
export interface MusicQueryParams {
  q?: string;
  s?: string;
  c?: string;
  o?: string;
}

/**
 * Parse URL query parameters for music functionality
 *
 * @returns An object containing the parsed query parameters or undefined if not present.
 */
export function parseMusicQueries(): MusicQueryParams {
  if (typeof window === "undefined") return {};

  const urlParams = new URLSearchParams(window.location.search);
  return {
    q: urlParams.get("q") || undefined,
    s: urlParams.get("s") || undefined,
    c: urlParams.get("c") || undefined,
    o: urlParams.get("o") || undefined,
  };
}

/**
 * Convert a song URL to the expected format:
 * @example  "songs/track1.mp3" becomes "songs_track1"
 * @returns The song ID derived from the URL
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
 * Convert a song ID back to potential URL matches:
 * @example "songs_track1" becomes "songs/track1"
 * @returns The URL pattern derived from the song ID
 */
export function songIdToUrlPattern(songId: string): string {
  const [directory, filename] = songId.split("_");
  return `${directory}/${filename}`;
}

/**
 * Find songs matching the given song IDs
 * @param songIds - Array of song IDs to find
 * @param allSongs - Array of all available songs to search within
 * @returns Array of matching RefdSingle songs
 */
export function findSongsByIds(
  songIds: string[],
  allSongs: CollectionSingle[]
): CollectionSingle[] {
  return songIds
    .map((id) => {
      const pattern = songIdToUrlPattern(id);
      return allSongs
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .find((song) => song.url && song.url.includes(pattern));
    })
    .filter(Boolean) as CollectionSingle[];
}

/**
 * Find a single song by its URL ID from the music list
 * @param songId - The song ID to find
 * @param musicList - The full list of MusicData to search within
 * @returns The matching MusicData item or null if not found
 */
export function findSongById(
  songId: string,
  musicList: MusicData[]
): MusicData | null {
  // First, create a flat list of all singles from the music collection
  const allSongs = musicList
    .flatMap((item) => (item.type === MusicType.Single ? [item] : item.songs))
    .filter((song) => song.url);

  const foundSongs = findSongsByIds([songId], allSongs);
  if (foundSongs.length > 0) {
    // Return the original song from the music list (could be the song itself or the parent collection)
    const foundSong = foundSongs[0];

    // Check if this song is part of a collection
    for (const item of musicList) {
      if (item.type === MusicType.Collection) {
        const songInCollection = item.songs.find(
          (s) => s.url === foundSong.url && s.name === foundSong.name
        );
        if (songInCollection) {
          return songInCollection; // Return the song from the collection
        }
      } else if (item.url === foundSong.url && item.name === foundSong.name) {
        return item; // Return the standalone song
      }
    }
  }

  return null;
}

/**
 * Generate a playlist URL with the given song IDs
 * @example "http://example.com/music?s=song1,song2,song3"
 * @returns The full URL with the playlist query parameter
 */
export function generatePlaylistUrl(songIds: string[]): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  params.set("s", songIds.join(","));
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a continue URL for a specific song and time
 * @example "http://example.com/music?c=song1,90" to continue song1 at 90 seconds
 * @returns The full URL with the continue query parameter
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
 * @example "http://example.com/music?q=search+term"
 * @returns The full URL with the search query parameter
 */
export function generateSearchUrl(query: string): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  params.set("q", query);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Get song IDs from a MusicItem (handles both singles and collections)
 * @returns An array of song IDs for the given MusicData item
 */
export function getSongIds(item: MusicData): string[] {
  if (item.type === MusicType.Collection) {
    return item.songs
      .filter((song) => song.url)
      .map((song) => urlToSongId(song.url!));
  }
  return item.url ? [urlToSongId(item.url)] : [];
}

/**
 * Copy text to clipboard
 * @param text - The text to copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers (AI generated)
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
