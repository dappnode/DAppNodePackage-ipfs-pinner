import autobahn from "autobahn";
import { validateBootstrapMultiaddress } from "./configClusterUtils";

const url = "ws://my.wamp.dnp.dappnode.eth:8080/ws";
const realm = "dappnode_admin";

const ipfsClusterName = "ipfs-cluster.dnp.dappnode.eth";

export type ClusterStatus = "" | "not-found" | "stopped" | "running";

export interface ClusterEnvs {
  BOOTSTRAP_MULTIADDRESS?: string; // "/ip4/172.19.0.2/tcp/9096/p2p/12D3KooWK3tVkERcMXqqikhaZhSNoXdSs4M5w6bMEtJomav3VFHX"
  CLUSTER_PEERNAME?: string; // "cluster0";
  CLUSTER_SECRET?: string; // "";
}

let sessionCache: autobahn.Session;
let settingEnvs = false;

const connection = new autobahn.Connection({ url, realm });

connection.onopen = session => {
  sessionCache = session;
  console.log("CONNECTED to \nurl: " + url + " \nrealm: " + realm);
};

// connection closed, lost or unable to connect
connection.onclose = (reason, details) => {
  console.error("CONNECTION_CLOSE", { reason, details });
  return false;
};

connection.open();

async function getSession(): Promise<autobahn.Session> {
  while (!sessionCache) {
    await new Promise(r => setTimeout(r, 500));
  }
  return sessionCache;
}

interface ClusterDnp {
  name: string;
  envs: ClusterEnvs;
  ports: { host: number; container: number; protocol: "TCP" | "UDP" }[];
  running: boolean;
}

export interface DappnodeParams {
  domain: string;
  staticIp: string;
  name: string;
}

export async function getCurrentIdentity(): Promise<DappnodeParams> {
  return await wrapCall({
    event: "getParams.dappmanager.dnp.dappnode.eth",
    kwargs: {}
  });
}

export async function getCurrentClusterSettings(): Promise<
  ClusterDnp | undefined
> {
  getCurrentIdentity();
  const dnps: ClusterDnp[] = await wrapCall({
    event: "listPackages.dappmanager.dnp.dappnode.eth",
    kwargs: {}
  });
  return dnps.find(dnp => dnp.name === ipfsClusterName);
}

export async function setClusterEnvs(envs: ClusterEnvs): Promise<void> {
  // Validate params
  if (envs.CLUSTER_SECRET && !/[0-9A-Fa-f]{32}/g.test(envs.CLUSTER_SECRET))
    throw Error(`secret must be a 32 bytes hex string: ${envs.CLUSTER_SECRET}`);

  // STRICTLY validate an IPFS cluster multiaddress
  if (envs.BOOTSTRAP_MULTIADDRESS)
    validateBootstrapMultiaddress(envs.BOOTSTRAP_MULTIADDRESS);

  // Prevent calling `updatePackageEnv` more than once
  if (settingEnvs) throw Error(`Already setting cluster ENVs`);
  try {
    settingEnvs = true;
    await wrapCall({
      event: "updatePackageEnv.dappmanager.dnp.dappnode.eth",
      kwargs: { id: ipfsClusterName, envs, restart: true }
    });
    settingEnvs = false;
  } catch (e) {
    settingEnvs = false;
    throw e;
  }
}

/**
 * Wrapper for WAMP RPC calls
 *
 * @param {object}
 * - event: logPackage.dappmanager.dnp.dappnode.eth
 * - args: Array of arguments
 * - kwargs: Object of arguments
 * - options:
 *   - toastMessage: {string} Triggers a pending toast
 *   - toastOnError: {bool} Triggers a toast on error only
 */
async function wrapCall({
  event,
  args = [],
  kwargs = {}
}: {
  event: string;
  args?: any[];
  kwargs: any;
}) {
  // Get session
  const session = await getSession();
  // If session is not available, fail gently
  if (!session) throw Error("Session object is not defined");
  if (!session.isOpen) throw Error("Connection is not open");

  const res: any = await session
    .call(event, args, kwargs)
    // @ts-ignore
    .then(JSON.parse)
    .catch((e: any) => {
      // crossbar return errors in a specific format
      throw Error(e.message || (e.args && e.args[0] ? e.args[0] : e.error));
    });

  // Return the result
  if (res.success) return res.result;
  else throw Error(res.message);
}
