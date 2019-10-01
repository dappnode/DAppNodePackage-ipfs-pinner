import * as ipfsCluster from "../ipfsCluster";
import { pinStatus, PinStatus, PinCluster, AssetsApi } from "../types";
import { parseAssetTypeAndName } from "../utils/assetMultiname";

const statusOrderMap: { [status: string]: number } = {
  // Ok
  [pinStatus.pinned]: 0,
  [pinStatus.remote]: 1,
  // Processing
  [pinStatus.pinning]: 2,
  [pinStatus.unpinning]: 3,
  [pinStatus.pin_queued]: 4,
  [pinStatus.unpin_queued]: 5,
  [pinStatus.queued]: 6,
  // Error
  [pinStatus.cluster_error]: 7,
  [pinStatus.pin_error]: 8,
  [pinStatus.unpin_error]: 9,
  [pinStatus.error]: 10
};

function getWorstStatus(clusters: PinCluster[]): PinStatus {
  let worstStatus = pinStatus.pinned;
  for (const { status } of clusters)
    if (
      statusOrderMap[status] &&
      statusOrderMap[status] > statusOrderMap[worstStatus]
    )
      worstStatus = status;
  return worstStatus;
}

function getLatestUpdate(clusters: PinCluster[]): number {
  let latestUpdate = 0;
  for (const { timestamp } of clusters)
    if (timestamp > latestUpdate) latestUpdate = timestamp;
  return latestUpdate;
}

export async function getAssets(): Promise<AssetsApi> {
  const pinLsStatus = await ipfsCluster.pinLsStatus();

  const assets: AssetsApi = [];
  for (const pin of pinLsStatus) {
    try {
      const clusters = Object.values(pin.peer_map).map(peer => ({
        name: peer.peername,
        status: peer.status,
        error: peer.error,
        timestamp: new Date(peer.timestamp).getTime()
      }));
      const { type, displayName } = parseAssetTypeAndName(pin.name);
      assets.push({
        type,
        displayName,
        hash: pin.hash,
        status: getWorstStatus(clusters),
        latestUpdate: getLatestUpdate(clusters),
        clusters
      });
    } catch (e) {
      console.error(`Error parsing pin ${pin.hash}: ${e.stack}`);
      console.error(pin);
    }
  }
  return assets;
}
