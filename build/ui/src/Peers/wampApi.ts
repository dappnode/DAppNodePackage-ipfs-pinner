import autobahn from "autobahn";

const url = "ws://my.wamp.dnp.dappnode.eth:8080/ws";
const realm = "dappnode_admin";

const ipfsClusterName = "ipfs-cluster.dnp.dappnode.eth";
const peerstorePath = "/data/ipfs-cluster/peerstore";

export interface ClusterEnvs {
  CLUSTER_PEERNAME?: string; // "cluster0";
  CLUSTER_SECRET?: string; // "";
}

let sessionCache: autobahn.Session;

const connection = new autobahn.Connection({ url, realm });

connection.onopen = session => {
  sessionCache = session;
  console.log("CONNECTED to \nurl: " + url + " \nrealm: " + realm);
  getCurrentClusterSettings();
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

export async function getCurrentClusterSettings() {
  const dnps: {
    name: string;
    envs: ClusterEnvs;
  }[] = await wrapCall({
    event: "listPackages.dappmanager.dnp.dappnode.eth",
    kwargs: {}
  });
  const ipfsClusterDnp = dnps.find(dnp => dnp.name === ipfsClusterName);
  if (!ipfsClusterDnp) throw Error("No IPFS cluster DNP found");
  return ipfsClusterDnp.envs;
}

export async function setClusterSettings({
  secret,
  multiaddress
}: {
  secret: string;
  multiaddress: string;
}) {
  await setClusterPeerstore(multiaddress);
  await setClusterEnvs({ CLUSTER_SECRET: secret });
}

export async function setClusterSecret(secret: string) {
  await setClusterEnvs({ CLUSTER_SECRET: secret });
}

async function setClusterEnvs(envs: ClusterEnvs) {
  await wrapCall({
    event: "updatePackageEnv.dappmanager.dnp.dappnode.eth",
    kwargs: { id: ipfsClusterName, envs, restart: true }
  });
}

async function setClusterPeerstore(multiaddress: string) {
  await wrapCall({
    event: "copyFileTo.dappmanager.dnp.dappnode.eth",
    kwargs: {
      id: ipfsClusterName,
      dataUri: `data:text/plain;base64,${btoa(multiaddress)}`,
      filename: "peerstore",
      toPath: peerstorePath
    }
  });
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
