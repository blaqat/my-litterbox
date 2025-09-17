export type LinkMap = Record<string, string>;

export enum MusicStatus {
  WIP = "wip",
  Complete = "complete",
  Dropped = "dropped",
  Planned = "planned",
}

export enum MusicInstrument {
  Beepbox = "beepbox",
  Piano = "piano",
  DAW = "daw",
  Misc = "misc",
}

export enum MusicType {
  Single = "single",
  Collection = "collection",
}

export interface BaseMusicItem {
  name: string;
  start?: string;
  end?: string;
  status?: MusicStatus;
  instrument?: MusicInstrument;
  artist?: string[];
  description?: string;
  links?: LinkMap;
}

export interface Single extends BaseMusicItem {
  type?: MusicType.Single;
  url: string;
}

export interface Collection extends BaseMusicItem {
  type: MusicType.Collection;
  songs: Single[];
}

export type MusicItem = Single | Collection;

export interface QueueTrack {
  name: string;
  url: string;
  description?: string;
  links?: LinkMap;
  artist?: string[];
  instrument?: MusicInstrument;
  parentCollection?: string;
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
