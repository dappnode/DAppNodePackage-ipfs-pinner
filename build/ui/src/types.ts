export interface ApmRegistry {
  name: string;
  address: string;
}

export interface ApmRepo {
  name: string;
  address: string;
  fromRegistry?: string;
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

export type PinStatus =
  // Ok
  | "pinned" //  pins were correctly pinned
  | "remote" //  pins that are allocated to other cluster peers (remote means not handled by this peer).
  // Processing
  | "pinning" //  pins that are currently being pinned by ipfs
  | "unpinning" //  pins that are currently being unpinned by ipfs
  | "pin_queued" //  pins that are waiting to start pinning (usually because ipfs is already pinning a bunch of other things)
  | "unpin_queued" //  pins that are waiting to start unpinning (usually because something else is being unpinned)
  | "queued" //  pins in pin_queued or unpin_queued states.
  // Error
  | "cluster_error" // pins for which we cannot obtain status information (i.e. the cluster peer is down)
  | "pin_error" // pins that failed to pin (due to an ipfs problem or a timeout)
  | "unpin_error" //  pins that failed to unpin (due to an ipfs problem or a timeout)
  | "error"; //  pins in pin_error or unpin_error

export const pinStatus: { [status: string]: PinStatus } = {
  pinned: "pinned",
  remote: "remote",
  pinning: "pinning",
  unpinning: "unpinning",
  pin_queued: "pin_queued",
  queued: "queued",
  cluster_error: "cluster_error",
  pin_error: "pin_error",
  unpin_error: "unpin_error",
  error: "error"
};

/**
 * Api returns
 */

export interface PinCluster {
  name: string;
  status: PinStatus;
  error: string; // Can be empty
  timestamp: number; // Unix timestamp
}

export interface AssetsApiItem {
  type: AssetType;
  displayName: string; // Pretty name for UI display: "Admin @ 0.2.4 manifest"
  hash: string; // Can be used as ID if necessary
  status: PinStatus; // Worst status among clusters
  latestUpdate: number; // Latest update from clusters in unix format
  clusters: PinCluster[];
}

export type AssetsApi = AssetsApiItem[];

export interface SourcesApiItem {
  type: SourceType;
  id: string;
  displayName: string; // Pretty name for UI display
  added: number; // In unix format
}
export type SourcesApi = SourcesApiItem[];

export interface SourceOption {
  value: SourceType;
  label: string;
  placeholder: string;
}

export type SourceOptionsApi = SourceOption[];

/**
 * Identifiers
 */

export type AssetType =
  /**
   * A single file from a DNP release in an APM DNP repo
   * /apm-dnp-repo-file/<repoEns>/<version>/<fileUniqueName>
   */
  | "apm-dnp-repo-file"
  /**
   * The directory of a DNP release in an APM DNP repo
   * /apm-dnp-repo-dir/<repoEns>/<version>
   */
  | "apm-dnp-repo-dir";

export const assetTypes: { [assetType: string]: AssetType } = {
  apmDnpRepoFile: "apm-dnp-repo-file",
  apmDnpRepoDir: "apm-dnp-repo-dir"
};

export type SourceType =
  /**
   * An APM registry of DNPs
   * /apm-registry/dnp.dappnode.eth
   */
  | "apm-registry"
  /**
   * An APM repo of DNPs
   */
  | "apm-dnp-repo";

export const sourceTypes: { [sourceType: string]: SourceType } = {
  apmRegistry: "apm-registry",
  apmDnpRepo: "apm-dnp-repo"
};
