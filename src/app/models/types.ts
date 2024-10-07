export type InnerData = [string, string, string, string];

export interface UrlsObject {
  yt: InnerData[];
  spot: InnerData[];
}

export interface playlistSaveData {
  [key: string]: InnerData[];
}
export type QueueTuple = [number, string, string, string, string, string];
export type SearchTuple = [number, string, string, string, string];
