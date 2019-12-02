import io from "socket.io-client";
import {
  SourceOption,
  SourceFormInputs,
  AssetWithMetadata,
  SourceWithMetadata,
  ClusterPeer,
  PollStatus
} from "./types";

export const apiUrl =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_PINNER_URL || "http://ipfs-pinner.dappnode"
    : window.location.origin;
console.log(`Connecting socket.io-client to: ${apiUrl}`);

const socket = io(apiUrl);

/**
 * Factory for socket.io "routes".
 * Each route must provide and argument and receive one return argument
 * through a mandatory acknowledgment function
 *
 * @param routePath
 */
function socketGet<T, R>(routePath: string) {
  return function(arg: T): Promise<R> {
    return new Promise((resolve, reject) => {
      socket.emit(routePath, arg, (res: { error: string; data: R }) => {
        if (res.error) reject(Error(res.error));
        else resolve(res.data);
      });
    });
  };
}

export const getOptions = socketGet<undefined, SourceOption[]>("options");
export const addSource = socketGet<SourceFormInputs, null>("addSource");
export const delSource = socketGet<string, null>("delSource");
export const pingCluster = socketGet<undefined, null>("pingCluster");
export const refresh = socketGet<undefined, null>("refresh");

export const onSources = (cb: (sources: SourceWithMetadata[]) => void) => {
  socket.on("sources", (sources: SourceWithMetadata[]) => {
    validateSources(sources);
    cb(sources);
  });
};
export const onAssets = (cb: (assets: AssetWithMetadata[]) => void) => {
  socket.on("assets", (assets: AssetWithMetadata[]) => {
    validateAssets(assets);
    cb(assets);
  });
};
export const onPeers = (cb: (peers: ClusterPeer[]) => void) => {
  socket.on("peers", (peers: ClusterPeer[]) => {
    validatePeers(peers);
    cb(peers);
  });
};
export const onPollStatus = (cb: (pollStatus: PollStatus) => void) => {
  socket.on("pollStatus", (pollStatus: PollStatus) => {
    validatePollStatus(pollStatus);
    cb(pollStatus);
  });
};

/**
 * Validators
 */

function validateSources(sources: SourceWithMetadata[]): void {
  try {
    if (!Array.isArray(sources)) throw Error(`Sources is not an array`);
  } catch (e) {
    console.error(e.message, { sources });
    throw e;
  }
}
function validateAssets(assets: AssetWithMetadata[]): void {
  try {
    if (!Array.isArray(assets)) throw Error(`Assets is not an array`);
  } catch (e) {
    console.error(e.message, { assets });
    throw e;
  }
}
function validatePeers(peers: ClusterPeer[]): void {
  try {
    if (!Array.isArray(peers)) throw Error(`Peers is not an array`);
  } catch (e) {
    console.error(e.message, { peers });
    throw e;
  }
}
function validatePollStatus(pollStatus: PollStatus): void {
  try {
    if (pollStatus && typeof pollStatus !== "object")
      throw Error(`Poll status must be an object`);
  } catch (e) {
    console.error(e.message, { pollStatus });
    throw e;
  }
}

export default socket;
