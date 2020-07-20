import { getBootstrapMultiaddress } from "../utils/configCluster";
import { readConfig, readIdentity } from "../clusterBinary";
import { getHostname } from "../utils/getGlobalEnvs";
import { CLUSTER_P2P_PORT } from "../params";
import { JoinClusterData } from "../types";

export async function getClusterData(): Promise<JoinClusterData> {
  const secret = readConfig().cluster.secret;
  if (!secret) throw Error("secret not set in cluster config");

  const peerId = readIdentity().id;
  if (!peerId) throw Error("peerId not set in cluster identity");

  const hostname = await getHostname();

  const multiaddress = getBootstrapMultiaddress({
    hostname,
    port: CLUSTER_P2P_PORT,
    peerId
  });

  return {
    secret,
    multiaddress
  };
}
