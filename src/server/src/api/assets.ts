import * as ipfsCluster from "../ipfsCluster";
import { AssetWithMetadata } from "../types";

// const statusOrderMap: { [status: string]: number } = {
//   // Ok
//   [pinStatus.pinned]: 0,
//   [pinStatus.remote]: 1,
//   // Processing
//   [pinStatus.pinning]: 2,
//   [pinStatus.unpinning]: 3,
//   [pinStatus.pin_queued]: 4,
//   [pinStatus.unpin_queued]: 5,
//   [pinStatus.queued]: 6,
//   // Error
//   [pinStatus.cluster_error]: 7,
//   [pinStatus.pin_error]: 8,
//   [pinStatus.unpin_error]: 9,
//   [pinStatus.error]: 10
// };

// function getWorstStatus(clusters: PinCluster[]): PinStatus {
//   let worstStatus = pinStatus.pinned;
//   for (const { status } of clusters)
//     if (
//       statusOrderMap[status] &&
//       statusOrderMap[status] > statusOrderMap[worstStatus]
//     )
//       worstStatus = status;
//   return worstStatus;
// }

// function getLatestUpdate(clusters: PinCluster[]): number {
//   let latestUpdate = 0;
//   for (const { timestamp } of clusters)
//     if (timestamp > latestUpdate) latestUpdate = timestamp;
//   return latestUpdate;
// }

export async function getAssets(): Promise<AssetWithMetadata[]> {
  const assetsWithStatus = await ipfsCluster.getAssetsWithStatus();
  return assetsWithStatus;
}
