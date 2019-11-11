import * as ipfsCluster from "../ipfsCluster";

export async function pingCluster(): Promise<void> {
  await ipfsCluster.ping();
}
