import * as ipfsCluster from "../ipfsCluster";
import { ClusterPeer } from "../types";

export async function getPeers(): Promise<ClusterPeer[]> {
  const peers = await ipfsCluster.getPeers();
  return peers;
}
