export interface ApmRegistry {
  name: string;
  address: string;
}

export interface ApmRepo {
  id: string;
  name: string;
  shortName: string;
  address: string;
  blockNumber: number;
}

export interface ApmVersion {
  name: string;
  version: string;
  contentUri: string;
}

export interface DistributedFile {
  dir: boolean;
  hash: string;
  id: string;
}

export interface DistributedFilePin extends DistributedFile {
  pinned: boolean;
  added: number;
}

export interface ManifestWithImage {
  name: string;
  version: string;
  avatar: string;
  image: {
    hash: string;
    size: number;
  };
}

export type PinType = "direct" | "indirect" | "recursive";
export interface PinList {
  [hash: string]: PinType;
}
