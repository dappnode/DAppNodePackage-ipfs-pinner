import request from "request-promise-native";
import { pick, omit, mapKeys, mapValues } from "lodash";

const {
  IPFS_CLUSTER_HOST,
  IPFS_CLUSTER_PORT,
  IPFS_CLUSTER_PROTOCOL
} = process.env;

const host = IPFS_CLUSTER_HOST || "localhost";
const port = IPFS_CLUSTER_PORT || "9094";
const protocol = IPFS_CLUSTER_PROTOCOL || "http";

const clusterApiUrl = `${protocol}://${host}:${port}`;

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

type PinStatus =
  | "cluster_error" // pins for which we cannot obtain status information (i.e. the cluster peer is down)
  | "pin_error" // pins that failed to pin (due to an ipfs problem or a timeout)
  | "unpin_error" //  pins that failed to unpin (due to an ipfs problem or a timeout)
  | "error" //  pins in pin_error or unpin_error
  | "pinned" //  pins were correctly pinned
  | "pinning" //  pins that are currently being pinned by ipfs
  | "unpinning" //  pins that are currently being unpinned by ipfs
  | "remote" //  pins that are allocated to other cluster peers (remote means not handled by this peer).
  | "pin_queued" //  pins that are waiting to start pinning (usually because ipfs is already pinning a bunch of other things)
  | "unpin_queued" //  pins that are waiting to start unpinning (usually because something else is being unpinned)
  | "queued"; //  pins in pin_queued or unpin_queued states.

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

interface PinLsStatus extends PinsStatusItem, ClusterPinItem {}

interface RequestError {
  name: string; // 'StatusCodeError',
  statusCode: number; // 400,
  message: string; // '400 - {"code":400,"message":"error decoding Cid: selected encoding not supported"}',
  error: {
    code: number; // 400;
    message: string; // "error decoding Cid: selected encoding not supported";
  };
}

/**
 * Request utils
 */

const jsonOptions = { json: true };

function handleErrors(e: Error | RequestError) {
  console.log(e);
  if (typeof (e as RequestError).error === "object") {
    const parsedError: RequestError = e as RequestError;
    throw Error(`${parsedError.error.code}: ${parsedError.error.message}`);
  }
  throw e;
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
function allocationsRaw(): Promise<RawClusterPinItem[]> {
  return request
    .get(`${clusterApiUrl}/allocations`, jsonOptions)
    .catch(handleErrors);
}

/**
 * Gets the list of pins in the cluster.
 * Pins may not be actually pinned in the IPFS nodes, see `pinsStatus`
 * Foramts the return object omitting some keys, use `allocationsRaw` for a full return
 */
export async function allocations(): Promise<ClusterPinItem[]> {
  const pinset = await allocationsRaw();
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
function pinsStatusRaw(): Promise<RawPinsStatusItem[]> {
  return request.get(`${clusterApiUrl}/pins`, jsonOptions).catch(handleErrors);
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

export async function pinLsStatus(): Promise<PinLsStatus[]> {
  const status = await pinsStatus();
  const pinset = await allocations();
  type PinStatusObj = { [hash: string]: PinsStatusItem };
  const statusObj = status.reduce((obj: PinStatusObj, pin) => {
    return { ...obj, [pin.hash]: pin };
  }, {});

  // Use a for loop and push to make sure there is a status available
  const pinsetWithStatus: PinLsStatus[] = [];
  for (const pin of pinset)
    if (statusObj[pin.hash])
      pinsetWithStatus.push({
        ...pin,
        ...statusObj[pin.hash]
      });
  return pinsetWithStatus;
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
export function pinAdd(
  hash: string,
  options?: { name?: string; metadata?: { [key: string]: string } }
): Promise<ClusterPinItem> {
  // metadata keys MUST be in the format meta-{key}
  // POST /pins/<cid-or-path>?meta-key1=value1&meta-key2=value2...
  const parsedMetadata: { [key: string]: string } = mapKeys(
    (options || {}).metadata || {},
    (_0, key) => `meta-${key}`
  );

  return request
    .post(`${clusterApiUrl}/pins/${validateHashArg(hash)}`, {
      qs: { ...pick(options, ["name"]), ...parsedMetadata },
      ...jsonOptions
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
export function pinRm(hash: string): Promise<ClusterPinItem> {
  return request
    .delete(`${clusterApiUrl}/pins/${validateHashArg(hash)}`, jsonOptions)
    .catch(handleErrors);
}
