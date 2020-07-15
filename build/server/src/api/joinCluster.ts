import { logs } from "../logs";
import { getPeers } from "../ipfsCluster";
import {
  clusterBinary,
  readConfig,
  setNewClusterSettings
} from "../clusterBinary";
import { validateBootstrapMultiaddress } from "../utils/configCluster";

const takingToLongError =
  "Taking longer than expected, check the IPFS cluster logs to know if there was a connection problem.";

export async function joinCluser({
  secret,
  multiaddress
}: {
  secret: string;
  multiaddress: string;
}) {
  if (!secret) throw Error(`Empty secret`);
  if (!multiaddress) throw Error(`Empty multiaddress`);

  const multiaddressSafe = validateBootstrapMultiaddress(multiaddress);

  // Validate URL params
  if (multiaddressSafe.includes(yourPeerId))
    throw Error("You can't add yourself");

  // Compare the multiaddress after validation in case some character is different at the end
  const config = readConfig();
  if (config.cluster.secret === secret)
    throw Error("Already joinned this cluster");

  setNewClusterSettings({
    secret,
    bootstrapPeers: [multiaddressSafe]
  });

  /**
   * Function to clean timeouts and intervals after fullfilling the Promise
   */
  let onDone: () => void = () => {};
  try {
    await new Promise((resolve, reject) => {
      // Guess success
      // Figure out if the peer has actually connected or not
      // Every time the `peers` array changes it checks if the toAddPeer
      // is there, if so it sets the status to success
      const checkPeersInterval = setInterval(() => {
        getPeers()
          .then(peers => {
            if (peers.some(peer => peer.id === multiaddressSafe)) resolve();
          })
          .catch(e => {
            logs.error("Error fetching peers", e);
          });
      }, 1000);

      // Guess failure
      // TRY to GUESS if the peer connection failed, reporting that
      // to user improving UX by giving feedback.
      // Every 2 seconds it checks the logs for line that includes "ERROR"
      // and the peerId to add, for example:
      //
      // 20:55:59.519 ERROR    service: bootstrap to /ip4/163.45.110.162/tcp/9096/p2p/12D3KooWSvhkEdbMZN6kLaGbNw7gd53fEw1Mjuds8e7UpfmPY2tR failed: failed to dial : all dials failed
      //
      // If a line like that is found, it sets the state to error. If it's
      // not possible to find the logs or the parsing fails, after 21 seconds
      // a text will alert that it's taking too long to connect.
      function onClusterLogs(data: string) {
        const errors = data
          .split(/\r?\n/)
          .filter(l => l.includes("ERROR") && l.includes(multiaddressSafe))
          .map(l => l.split(multiaddressSafe)[1] || l.split("ERROR")[1] || l)
          .join(", ");
        if (errors) reject(`Error connecting to bootstrap: ${errors}`);
      }
      clusterBinary.subscribeToLogs(onClusterLogs);

      // Timeout if guess success and guess failure fail
      const timeout = setTimeout(() => {
        reject(Error(takingToLongError));
      }, 20 * 1000);

      onDone = () => {
        clearInterval(checkPeersInterval);
        clusterBinary.unsubscribe(onClusterLogs);
        clearTimeout(timeout);
      };
    });

    onDone();
  } catch (e) {
    onDone();
    throw e;
  }
}
