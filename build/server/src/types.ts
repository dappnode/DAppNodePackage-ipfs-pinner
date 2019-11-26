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
  unpin_queued: "unpin_queued",
  queued: "queued",
  cluster_error: "cluster_error",
  pin_error: "pin_error",
  unpin_error: "unpin_error",
  error: "error"
};

/**
 * Poll function
 */

export interface CacheState {
  [multiname: string]: string;
}
export interface SourceOwnAdd {
  multiname: string;
}
export interface SourceAdd extends SourceOwnAdd {
  from: string;
}
export interface SourceOwn extends SourceOwnAdd {
  hash: string;
}
export interface Source extends SourceAdd {
  hash: string;
}
export interface AssetOwn extends SourceOwn {
  hash: string;
}
export interface Asset extends Source {
  hash: string;
}

export interface State {
  sources: Source[];
  assets: Asset[];
  cache: CacheState;
}

export interface StateChange {
  sourcesToAdd: SourceAdd[];
  sourcesToRemove: Source[];
  assetsToAdd: Asset[];
  assetsToRemove: Asset[];
  cacheChange: CacheState;
}

export interface PollSourceFunctionArg {
  source: SourceOwn;
  currentOwnSources: SourceOwn[];
  currentOwnAssets: AssetOwn[];
  internalState: string;
}

export interface PollSourceFunctionReturn {
  sourcesToAdd?: SourceOwnAdd[];
  sourcesToRemove?: SourceOwn[];
  assetsToAdd?: AssetOwn[];
  assetsToRemove?: AssetOwn[];
  internalState?: string;
}

export interface PollSourceFunction {
  (arg: PollSourceFunctionArg): Promise<PollSourceFunctionReturn>;
}

export interface VerifySourceFunction {
  (arg: SourceAdd): Promise<void>;
}

export interface PollStatusObj {
  [multiname: string]: {
    message: string;
    done: boolean;
  };
}
export type PollStatus = PollStatusObj | undefined;

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
  hash: string;
  // displayName: string; // Should be handled in the UI
}

export interface SourceField {
  id: string;
  required: boolean;
  label: string;
}

export interface SourceOption {
  type: string;
  label: string;
  fields: SourceField[];
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

export interface SourceFormInputs {
  [fieldId: string]: string | number;
}

export interface SourceTypeAndInputs extends SourceFormInputs {
  type: string;
}
