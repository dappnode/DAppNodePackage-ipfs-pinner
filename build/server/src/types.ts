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
 * Identifiers
 */

export type AssetType =
  // Single file from a DNP release in an APM DNP repo
  // apm-dnp-repo-file/<repoEns>/<version>/<fileUniqueName>
  | "apm-dnp-repo-file"
  // The directory of a DNP release in an APM DNP repo
  // apm-dnp-repo-dir/<repoEns>/<version>
  | "apm-dnp-repo-dir";

export const assetTypes = {
  apmDnpRepoFile: "apm-dnp-repo-file" as AssetType,
  apmDnpRepoDir: "apm-dnp-repo-dir" as AssetType
};

export type SourceType =
  // An APM registry of DNPs
  // apm-registry/dnp.dappnode.eth
  | "apm-registry"
  // An APM repo of DNPs
  | "apm-dnp-repo";

export const sourceTypes = {
  apmRegistry: "apm-registry" as SourceType,
  apmDnpRepo: "apm-dnp-repo" as SourceType
};

/**
 * Poll function
 */

export interface SourceOwn {
  multiname: string;
}

export interface Source extends SourceOwn {
  from: string;
}

export interface AssetOwn extends SourceOwn {
  hash: string;
}

export interface Asset extends Source {
  hash: string;
}

export interface PollSourceFunctionArg {
  source: SourceOwn;
  currentOwnAssets: AssetOwn[];
  currentOwnSources: SourceOwn[];
  internalState: string;
}

export interface PollSourceFunctionReturn {
  assetsToAdd?: AssetOwn[];
  assetsToRemove?: AssetOwn[];
  sourcesToAdd?: SourceOwn[];
  sourcesToRemove?: SourceOwn[];
  internalState?: string;
}

export interface PollSourceFunction {
  (arg: PollSourceFunctionArg): Promise<PollSourceFunctionReturn>;
}

export interface SourcesAndAssetsToEdit {
  sourcesToAdd: Source[];
  sourcesToRemove: Source[];
  assetsToAdd: Asset[];
  assetsToRemove: Asset[];
}

/**
 * API
 */

export interface AssetWithMetadata extends Asset {
  peerMap: {
    // peerId: "12D3KooWPvPYEFApJEoS8s2hLZsCa8xfMpDaFcmLrM6Kzg2EwQPK"
    [peerId: string]: {
      peername: string; // "cluster0";
      status: PinStatus;
      timestamp: string; // "2019-09-27T13:33:17.463193207Z";
      error: string; // "";
    };
  };
  // displayName: string; // Should be handled in the UI
}

export interface SourceWithMetadata extends Source {
  added: number;
  // displayName: string; // Should be handled in the UI
}

export interface SourceOption {
  value: SourceType;
  label: string;
  placeholder: string;
}

export interface ClusterPeer {
  you: boolean;
  id: string;
  peername: string;
  clusterError: string;
  clusterAddresses: string[];
  ipfsError: string;
  ipfsAddresses: string[];
}
