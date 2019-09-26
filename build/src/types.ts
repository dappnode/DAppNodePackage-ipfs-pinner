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

export type DistributedFileSource = {
  from: "apm";
  name: string;
  version: string;
  fileId: string;
};
export interface DistributedFileBasic {
  dir: boolean;
  hash: string;
  size: number;
}
export interface DistributedFile extends DistributedFileBasic {
  source: DistributedFileSource;
}
export interface DistributedFilePin extends DistributedFileBasic {
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
