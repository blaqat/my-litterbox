import type { ProjectDate } from "@components/Projects/ProjectData";

export type LinkLocation =
  | "spotify"
  | "youtube"
  | "bandcamp"
  | "apple"
  | "soundcloud"
  | "beepbox";

export type LinkMap = Record<LinkLocation, string>;

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
  start?: ProjectDate;
  end?: ProjectDate;
  status: MusicStatus;
  instrument: MusicInstrument;
  artist?: string[];
  description?: string;
  links?: LinkMap;
}

export interface Single extends BaseMusicItem {
  type: MusicType.Single;
  url: string;
}

export type RefdSingle = Single & {
  parentRefData?: { name: string; index: number; total: number };
};

export interface Collection extends BaseMusicItem {
  type: MusicType.Collection;
  songs: Single[];
}

export type MusicItem = Single | Collection;

export function isCollection(item: MusicItem): item is Collection {
  return (item as Collection).songs !== undefined;
}
