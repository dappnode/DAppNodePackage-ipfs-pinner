import io from "socket.io-client";
import {
  SourceOption,
  SourceFormInputs,
  Asset,
  AssetWithMetadata,
  SourceWithMetadata,
  ClusterPeer
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

/**
 * Validators
 */

function validateSources(sources: SourceWithMetadata[]) {
  if (!Array.isArray(sources)) {
    console.log({ sources });
    throw Error(`Sources is not an array`);
  }
}
function validateAssets(assets: AssetWithMetadata[]) {
  if (!Array.isArray(assets)) {
    console.log({ assets });
    throw Error(`Assets is not an array`);
  }
}
function validatePeers(peers: ClusterPeer[]) {
  if (!Array.isArray(peers)) {
    console.log({ peers });
    throw Error(`Peers is not an array`);
  }
}

export default socket;
