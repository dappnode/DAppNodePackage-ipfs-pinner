import request from "request-promise-native";
import * as ipfs from "./ipfs";
import omit from "lodash/omit";
import pick from "lodash/pick";
import mapKeys from "lodash/mapKeys";
import mapValues from "lodash/mapValues";
import logs from "./logs";
import {
  PinStatus,
  Asset,
  AssetWithMetadata,
  ClusterPeer,
  Source,
  SourceWithMetadata,
  SourceAdd
} from "./types";

const host = process.env.IPFS_CLUSTER_HOST || "localhost";
const port = process.env.IPFS_CLUSTER_PORT || "9094";
const protocol = process.env.IPFS_CLUSTER_PROTOCOL || "http";

const clusterApiUrl = `${protocol}://${host}:${port}`;
logs.info("IPFS Cluster HTTP API", { clusterApiUrl });

interface StatusCodeError {
  name: string; // 'StatusCodeError',
  statusCode: number; // 400,
  message: string; // '400 - {"code":400,"message":"error decoding Cid: selected encoding not supported"}',
  error: {
    code: number; // 400;
    message: string; // "error decoding Cid: selected encoding not supported";
  };
}

interface RequestError {
  name: string; // "RequestError"
  options: {
    json: boolean; // true;
    uri: string; // "http://localhost:9094/id";
    method: string; // "GET";
  };
}

interface RequestErrorGeneral extends RequestError, StatusCodeError {}

interface CidObject {
  [path: string]: string; // { "/": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG" };
}

interface RawClusterPinItem {
  replication_factor_min: number; // -1;
  replication_factor_max: number; // -1;
  name: string; // "";
  shard_size: number; // 0;
  user_allocations: null; // null;
  metadata: { [key: string]: string }; // { REPO: 'admin.dnp.dappnode.eth' },
  pin_update: null; // null;
  cid: CidObject; // { "/": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG" };
  type: number; // 2;
  allocations: string[]; // [];
  max_depth: number; // -1;
  reference: null; // null;
}

export interface ClusterPinItem {
  hash: string; // "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
  name: string; // "";
  metadata: { [key: string]: string }; // { REPO: 'admin.dnp.dappnode.eth' },
}

interface RawPinsStatusItem {
  cid: CidObject; // { "/": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG" };
  peer_map: {
    // peerId: "12D3KooWPvPYEFApJEoS8s2hLZsCa8xfMpDaFcmLrM6Kzg2EwQPK"
    [peerId: string]: {
      cid: CidObject;
      peer: string; // "12D3KooWPvPYEFApJEoS8s2hLZsCa8xfMpDaFcmLrM6Kzg2EwQPK";
      peername: string; // "cluster0";
      status: PinStatus;
      timestamp: string; // "2019-09-27T13:33:17.463193207Z";
      error: string; // "";
    };
  };
}

interface PinsStatusItem {
  hash: string; // "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
  ok: boolean; // true if the status on all peers is "pinned"
  peer_map: {
    // peerId: "12D3KooWPvPYEFApJEoS8s2hLZsCa8xfMpDaFcmLrM6Kzg2EwQPK"
    [peerId: string]: {
      peername: string; // "cluster0";
      status: PinStatus;
      timestamp: string; // "2019-09-27T13:33:17.463193207Z";
      error: string; // "";
    };
  };
}

interface PeerInfo {
  id: string; // "12D3KooWP4tLaHzhUDnZqpWsNANkeTWjj3kqazPcFeYUFzeFctYm",
  addresses: string[]; // ["/ip4/172.21.0.3/tcp/9096/p2p/12D3KooWP4tLaHzhUDnZqpWsNANkeTWjj3kqazPcFeYUFzeFctYm"],
  cluster_peers: string[]; // ["12D3KooWHyfM68hUWdd9H3jSLpsFBF4eazknbdSg5Huwyi4yMats", "12D3KooWJMHfFbE9PGcoaaLwHPzsEsPu9tbFKTQBGLhfhUQLBpYg"],
  cluster_peers_addresses: string[]; // ["/ip4/127.0.0.1/tcp/9096/p2p/12D3KooWJMHfFbE9PGcoaaLwHPzsEsPu9tbFKTQBGLhfhUQLBpYg", "/ip4/172.21.0.7/tcp/9096/p2p/12D3KooWJMHfFbE9PGcoaaLwHPzsEsPu9tbFKTQBGLhfhUQLBpYg", "/ip4/127.0.0.1/tcp/9096/p2p/12D3KooWHyfM68hUWdd9H3jSLpsFBF4eazknbdSg5Huwyi4yMats", "/ip4/172.21.0.6/tcp/9096/p2p/12D3KooWHyfM68hUWdd9H3jSLpsFBF4eazknbdSg5Huwyi4yMats"]
  version: string; // "0.11.0+git3abf764de8023e3ade6029724628fcb2ef6758ff",
  commit: string; // "",
  rpc_protocol_version: string; // "/ipfscluster/0.11/rpc",
  error: string; // "",
  ipfs: {
    id: string; // "QmRWCUjjyfjsUqdmzDQZxnkPTsBy5MV2YuAMUymHGiaEEE";
    addresses: string[]; // ["/ip4/127.0.0.1/tcp/4001/p2p/QmRWCUjjyfjsUqdmzDQZxnkPTsBy5MV2YuAMUymHGiaEEE", "/ip4/172.21.0.2/tcp/4001/p2p/QmRWCUjjyfjsUqdmzDQZxnkPTsBy5MV2YuAMUymHGiaEEE"];
    error: string; // "";
  };
  peername: string; // "cluster0";
}

/**
 * Request utils
 */

const defaultOptions = {
  json: true,
  timeout: 15 * 1000
};

/**
 * Prettifies request errors giving as much info as possible
 * @param e
 */
function handleErrors(e: RequestErrorGeneral): void {
  let message: string = e.message;
  let req = "";

  if (typeof e.error === "object") {
    message = `${e.error.code} ${e.error.message}`;
  }

  // Prettify original request
  if (typeof e.options === "object") {
    const { uri, method } = e.options;
    req = `${method} ${uri}`;
  }

  if (e.message.includes("ECONNREFUSED"))
    throw Error(`Can't connect to IPFS cluster at ${clusterApiUrl}`);

  throw Error([req, message].filter(e => e).join(" - "));
}

/**
 * Assuming it has only one CID
 * @param cidObj { "/": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG" }
 * @returns "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
 */
function getHashFromCid(cidObj: CidObject): string {
  return Object.values(cidObj)[0];
}

function validateHashArg(hash: string): string {
  // Remove the "/ipfs/" prefix
  if (hash.includes("ipfs/")) hash = hash.split("ipfs/")[1];
  return hash;
}

// export function pinAdd(hash: string, name?: string): Promise<void> {
//   const options: PinAddOptions = {};
//   if (name) options.name = name;
//   return cluster.pin.add(hash, options);
// }

// export async function pinLs(): Promise<PinLsReturn> {
//   const options: PinLsOptions = { filter: "all" };
//   const rawPinSet: RawPinLsReturnItem[] = await cluster.pin.ls(options);
//   return rawPinSet.map(item => ({
//     name: item.name,
//     hash: Object.values(item.cid)[0] // Assuming it has only one CID
//   }));
// }

/**
 * Gets the list of pins in the cluster.
 * Pins may not be actually pinned in the IPFS nodes, see `pinsStatus`
 *
 * GET	/allocations	List of pins and their allocations (pinset)
 */
async function getPinsetRaw(): Promise<RawClusterPinItem[]> {
  return await request
    .get(`${clusterApiUrl}/allocations`, defaultOptions)
    .catch(handleErrors);
}

/**
 * Gets the list of pins in the cluster.
 * Pins may not be actually pinned in the IPFS nodes, see `pinsStatus`
 * Foramts the return object omitting some keys, use `pinsetRaw` for a full return
 */
export async function getPinset(): Promise<ClusterPinItem[]> {
  const pinset = await getPinsetRaw();
  return pinset.map(({ cid, name, metadata }) => ({
    hash: getHashFromCid(cid),
    name,
    // If no metadata was set, metadata = null
    // Also, check for truthy because typeof null = "object"
    metadata: metadata && typeof metadata === "object" ? metadata : {}
  }));
}

/**
 * Gets the pin status from the IPFS nodes.
 * Are pins actually pinned?
 *
 * GET	/pins	Local status of all tracked CIDs
 */
async function pinsStatusRaw(): Promise<RawPinsStatusItem[]> {
  return await request
    .get(`${clusterApiUrl}/pins`, defaultOptions)
    .catch(handleErrors);
}

/**
 * Gets the pin status from the IPFS nodes.
 * Are pins actually pinned?
 * Foramts the return object omitting some keys, use `pinsStatusRaw` for a full return
 */
async function pinsStatus(): Promise<PinsStatusItem[]> {
  const status = await pinsStatusRaw();
  return status.map(({ cid, peer_map }) => {
    return {
      hash: getHashFromCid(cid),
      ok: Object.values(peer_map).every(peer => peer.status === "pinned"),
      peer_map: mapValues(peer_map, peer => omit(peer, ["cid", "peer"]))
    };
  });
}

/**
 * Adds a pin to the pinset
 *
 * @param hash IPFS CID or IPFS path
 * - "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHeWEz79ojWnPbdG"
 * - "/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHeWEz79ojWnPbdG"
 * @param options Additional pin data
 * - name: "Human readable pin name"
 * - metadata: { creator: "user-0001" }
 * @returns The added pin
 *
 * What happens if you send objects as metadata values?
 * - Object: { age: "30", car: { model: "fiat", from: { country: "Japan" } } }
 * "metadata": {
 *   "age": "30",
 *   "car[from][country]": "Japan",
 *   "car[model]": "fiat"
 * }
 * - Array: { age: "30", car: [1, 2] }
 * "metadata": {
 *   "age": "30",
 *   "car[0]": "1",
 *   "car[1]": "2",
 * }
 *
 * POST	/pins/{cid} or /pins/{ipfs\|ipns\|ipld}/<path>	Pin a CID or IPFS path
 */
export async function pinAdd(
  hash: string,
  options?: { name?: string; metadata?: { [key: string]: string } }
): Promise<ClusterPinItem> {
  // metadata keys MUST be in the format meta-{key}
  // POST /pins/<cid-or-path>?meta-key1=value1&meta-key2=value2...
  const parsedMetadata: { [key: string]: string } = mapKeys(
    (options || {}).metadata || {},
    (_0, key) => `meta-${key}`
  );

  return await request
    .post(`${clusterApiUrl}/pins/${validateHashArg(hash)}`, {
      qs: { ...pick(options, ["name"]), ...parsedMetadata },
      ...defaultOptions
    })
    .catch(handleErrors);
}

/**
 * Removes a pin from the pinset
 *
 * @param hash IPFS CID or IPFS path
 * - "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHeWEz79ojWnPbdG"
 * - "/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHeWEz79ojWnPbdG"
 * @returns The deleted pin
 *
 * DELETE /pins/{cid} or /pins/{ipfs\|ipns\|ipld}/<path>	Unpin a CID or IPFS path
 */
export async function pinRm(hash: string): Promise<ClusterPinItem> {
  return await request
    .delete(`${clusterApiUrl}/pins/${validateHashArg(hash)}`, defaultOptions)
    .catch(handleErrors);
}

/**
 * Gets the info of the cluster peer currently connected to.
 *
 * GET /id Cluster peer information
 */
async function idRaw(): Promise<PeerInfo> {
  return await request
    .get(`${clusterApiUrl}/id`, defaultOptions)
    .catch(handleErrors);
}

/**
 * Gets the info of all the cluster peer currently connected to.
 *
 * GET /peers Cluster peers
 */
async function peersRaw(): Promise<PeerInfo[]> {
  return await request
    .get(`${clusterApiUrl}/peers`, defaultOptions)
    .catch(handleErrors);
}

/**
 * Parses assets from the pinset. Pure function for testability
 */
function parseAssetsFromPinset(pinset: ClusterPinItem[]): Asset[] {
  // Declaring map callback above for erroring on undeclared types
  const parseAssetFromPinset = (pin: ClusterPinItem): Asset => ({
    hash: pin.hash,
    multiname: pin.name,
    from: pin.metadata.from
  });
  return pinset.filter(pin => !pin.metadata.isSource).map(parseAssetFromPinset);
}

/**
 * Parses sources from the pinset. Pure function for testability
 */
function parseSourcesWithMetadataFromPinset(
  pinset: ClusterPinItem[]
): SourceWithMetadata[] {
  // Declaring map callback above for erroring on undeclared types
  const parseSourceFromPinset = (pin: ClusterPinItem): SourceWithMetadata => ({
    multiname: pin.name,
    from: pin.metadata.from,
    hash: pin.hash,
    added: parseInt(pin.metadata.added) || 0
  });
  return pinset.filter(pin => pin.metadata.isSource).map(parseSourceFromPinset);
}

/**
 * Parses sources from the pinset. Pure function for testability
 */
function parseSourcesFromPinset(pinset: ClusterPinItem[]): Source[] {
  // Declaring map callback above for erroring on undeclared types
  const parseSourceFromPinset = (pin: ClusterPinItem): Source => ({
    multiname: pin.name,
    from: pin.metadata.from,
    hash: pin.hash
    // added: parseInt(pin.metadata.added) || 0
  });
  return pinset.filter(pin => pin.metadata.isSource).map(parseSourceFromPinset);
}

/**
 * High level methods
 */

export async function getPeerId(): Promise<string> {
  const { id } = await idRaw();
  return id;
}

export async function ping(): Promise<void> {
  await idRaw();
}

export async function addAsset(asset: Asset): Promise<ClusterPinItem> {
  return await pinAdd(asset.hash, {
    name: asset.multiname,
    metadata: {
      from: asset.from
    }
  });
}

export async function removeAsset(asset: Asset): Promise<ClusterPinItem> {
  return await pinRm(asset.hash);
}

export async function getAssets(): Promise<Asset[]> {
  const pinset = await getPinset();
  return parseAssetsFromPinset(pinset);
}

export async function getAssetsWithStatus(): Promise<AssetWithMetadata[]> {
  const assets = await getAssets();
  const statuses = await pinsStatus();
  // For faster lookup
  const statusObj = mapKeys(statuses, pin => pin.hash);
  return assets.map(asset => ({
    ...asset,
    peerMap: statusObj[asset.hash] ? statusObj[asset.hash].peer_map : {}
  }));
}

/**
 * Add a record of a user source to the pinset
 */
export async function addSource(source: SourceAdd): Promise<ClusterPinItem> {
  if (!source.multiname) throw Error(`Source has no multiname`);
  const hash = await ipfs.add(source.multiname);
  return await pinAdd(hash, {
    name: source.multiname,
    metadata: {
      from: source.from,
      added: String(Date.now()),
      isSource: "true"
    }
  });
}

/**
 * Remove a record of a user source from the pinset
 */
export async function removeSource(source: Source): Promise<ClusterPinItem> {
  if (!source.hash) throw Error(`Source has no hash`);
  return await pinRm(source.hash);
}

export async function getSourcesWithMetadata(): Promise<SourceWithMetadata[]> {
  const pinset = await getPinset();
  return parseSourcesWithMetadataFromPinset(pinset);
}

export async function getAssetsAndSources(): Promise<{
  assets: Asset[];
  sources: Source[];
  sourcesWithMetadata: SourceWithMetadata[];
}> {
  const pinset = await getPinset();
  return {
    assets: parseAssetsFromPinset(pinset),
    sources: parseSourcesFromPinset(pinset),
    sourcesWithMetadata: parseSourcesWithMetadataFromPinset(pinset)
  };
}

export async function getPeers(): Promise<ClusterPeer[]> {
  const thisPeer = await idRaw();
  const thisPeerId = thisPeer.id;
  const peers = await peersRaw();

  return peers.map(peer => ({
    you: peer.id === thisPeerId,
    id: peer.id,
    peername: peer.peername,
    clusterError: peer.error,
    clusterAddresses: peer.addresses,
    ipfsError: (peer.ipfs || {}).error || "",
    ipfsAddresses: (peer.ipfs || {}).addresses || []
  }));
}
