import { getBootstrapMultiaddress } from "../utils/configCluster";
import { readConfig, readIdentity } from "../clusterBinary";

export async function getJoinUrl(): Promise<{
  secret: string;
  multiaddress: string;
}> {
  const secret = readConfig().cluster.secret;
  if (!secret) throw Error("secret not set in cluster config");

  const peerId = readIdentity().id;
  if (!peerId) throw Error("peerId not set in cluster identity");

  const { staticIp, domain } = getDappnodeConfig();

  const multiaddress = getBootstrapMultiaddress({
    staticIp,
    domain,
    port,
    peerId
  });

  return {
    secret,
    multiaddress
  };
}
