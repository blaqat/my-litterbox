export type LinkMap = Record<string, string>;

export type MusicStatus = "wip" | "complete" | "dropped" | "planned" | string;
export type MusicType = "single" | "collection" | string;

export interface BaseMusicItem {
  name: string;
  start?: string;
  end?: string;
  status?: MusicStatus;
  instrument?: string;
  artist?: string[];
  description?: string;
  links?: LinkMap;
}

export interface Single extends BaseMusicItem {
  type?: "single"; // optional in some data rows
  url: string;
}

export interface Collection extends BaseMusicItem {
  type: "collection";
  songs: Single[];
}

export type MusicItem = Single | Collection;

export interface QueueTrack {
  name: string;
  url: string;
  description?: string;
  links?: LinkMap;
  artist?: string[];
  instrument?: string;
  parentCollection?: string; // for display
}

export function isCollection(item: MusicItem): item is Collection {
  return (item as Collection).songs !== undefined;
}

export function toQueueTrack(
  item: Single,
  parentCollection?: string
): QueueTrack {
  return {
    name: item.name,
    url: item.url,
    description: item.description,
    links: item.links,
    artist: item.artist,
    instrument: item.instrument,
    parentCollection,
  };
}
