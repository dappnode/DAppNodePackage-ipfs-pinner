import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, CircularProgress, Link } from "@material-ui/core";
import {
  parseUrlToShare,
  validateBootstrapMultiaddress,
  parsePeerIdFromMultiaddress
} from "./configClusterUtils";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import { ClusterEnvs, getClusterLogs } from "./wampApi";
import { RequestStatus, ipfsClusterLogs } from "./data";
import { ClusterPeer } from "../types";

const useStyles = makeStyles(theme => ({
  title: {
    display: "flex",
    alignItems: "center"
  },
  titleText: {
    marginLeft: theme.spacing(1)
  },
  success: {
    color: theme.palette.primary.main
  },
  error: {
    color: "#c53f48"
  }
}));

export default function JoinAnotherCluster({
  yourPeerId,
  clusterEnvs,
  peers,
  joinStatus,
  setJoinStatus,
  onSuccess,
  setClusterSettings
}: {
  yourPeerId: string;
  clusterEnvs: ClusterEnvs | null;
  peers: ClusterPeer[];
  joinStatus: RequestStatus;
  setJoinStatus: (newStatus: RequestStatus) => void;
  onSuccess: () => void;
  setClusterSettings: (secret: string, multiaddress: string) => Promise<void>;
}) {
  const [toAddMultiaddress, setToAddMultiaddress] = useState("");
  const [takingToLong, setTakingToLong] = useState(false);
  const { loading, success, error } = joinStatus;

  const location = useLocation();
  const history = useHistory();

  /**
   * `Handle joinning`
   * Every time the URL changes and contains valid secret and multiaddress
   * this useEffect will try to connect to it. Once it has set the ENVs
   * to the provided values it removes the search from the URL to prevent
   * subsequent re-connections.
   */
  useEffect(() => {
    async function joinCluster() {
      const { secret, multiaddress } = parseUrlToShare(location.search);
      if (!secret || !multiaddress) return;
      if (!yourPeerId) return; // Wait for yourPeer to be able to verify it's not you
      if (!clusterEnvs) return; // Wait until ENVs are loaded to verify
      if (loading || success || error) return; // Only join if no state

      try {
        // Make sure the multiaddress is valid and safe
        // Compare the multiaddress after validation in case some character is different at the end
        const multiaddressSafe = validateBootstrapMultiaddress(multiaddress);

        // Validate URL params
        if (multiaddressSafe.includes(yourPeerId))
          throw Error("You can't add yourself");

        // Compare the multiaddress after validation in case some character is different at the end
        if (
          clusterEnvs.CLUSTER_SECRET === secret &&
          clusterEnvs.BOOTSTRAP_MULTIADDRESS === multiaddressSafe
        )
          throw Error("Already joinned this cluster");

        if (loading) return; // Prevent double calls
        setJoinStatus({ loading: "Setting new cluster secret and bootstrap" });

        await setClusterSettings(secret, multiaddressSafe);
        // Reset the URL to prevent using the URL again
        history.push({
          pathname: location.pathname,
          search: ""
        });

        onSuccess(); // Trigger the re-fetching of ENVs
        setJoinStatus({ loading: "Connecting to cluster bootstrap" });
        setToAddMultiaddress(multiaddressSafe);
      } catch (e) {
        setJoinStatus({ error: e.message });
        console.error(`Error joining cluster: ${e.stack}`);
      }
    }
    joinCluster();
  }, [
    // Variables to track
    location,
    yourPeerId,
    clusterEnvs,
    // Variables to include for hook consistency
    loading,
    success,
    error,
    history,
    // Callbacks that should not change
    setClusterSettings,
    setToAddMultiaddress,
    setJoinStatus,
    onSuccess
  ]);

  /**
   * `Guess success`
   * The job of this useEffect is to TRY to GUESS when the peer will
   * be successfully connected, improving UX.
   * Every time the `peers` array changes it checks if the toAddPeer
   * is there, if so it sets the status to success
   */
  useEffect(() => {
    if (!toAddMultiaddress) return;
    if (!loading) return;
    const toAddPeerId = parsePeerIdFromMultiaddress(toAddMultiaddress);
    // Check if the to add peer is already in the peers list
    const toAddPeer = peers.find(peer => peer.id === toAddPeerId);
    if (toAddPeer) setJoinStatus({ success: true });
  }, [toAddMultiaddress, peers, loading, setJoinStatus]);

  /**
   * `Guess failure`
   * The job of this useEffect is to TRY to GUESS if the peer connection
   * failed, reporting that to user improving UX by giving feedback.
   * Every 2 seconds it checks the logs for line that includes "ERROR"
   * and the peerId to add, for example:
   *
   * 20:55:59.519 ERROR    service: bootstrap to /ip4/163.45.110.162/tcp/9096/p2p/12D3KooWSvhkEdbMZN6kLaGbNw7gd53fEw1Mjuds8e7UpfmPY2tR failed: failed to dial : all dials failed
   *
   * If a line like that is found, it sets the state to error. If it's
   * not possible to find the logs or the parsing fails, after 21 seconds
   * a text will alert that it's taking too long to connect.
   */
  useEffect(() => {
    async function guessIfBoostrapConnectionFailed(toAddPeerId: string) {
      try {
        const logsString = await getClusterLogs();
        const logsWithPossibleError = logsString
          .split(/\r?\n/)
          .filter(l => l.includes("ERROR") && l.includes(toAddPeerId));
        if (logsWithPossibleError.length) {
          const errorsFromLogs = logsWithPossibleError
            .map(l => l.split(toAddPeerId)[1] || l.split("ERROR")[1] || l)
            .join(", ");
          setJoinStatus({
            error: `Error connecting to bootstrap: ${errorsFromLogs}`
          });
        }
      } catch (e) {
        console.log(`Error getting cluster logs: ${e.stack}`);
      }
    }

    if (!toAddMultiaddress) return;
    if (!loading) return;
    const toAddPeerId = parsePeerIdFromMultiaddress(toAddMultiaddress);
    const timeout = setTimeout(() => {
      setTakingToLong(true);
    }, 21 * 1000); // Two 10 second cycle checks +1 second of room
    const interval = setInterval(() => {
      guessIfBoostrapConnectionFailed(toAddPeerId);
    }, 2 * 1000); // Every 2 seconds, as the UI logs refreshes
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [toAddMultiaddress, loading, setJoinStatus]);

  const classes = useStyles();

  if (!loading && !success && !error) return null;

  return (
    <div>
      <Typography variant="h5" component="h3" className={classes.title}>
        {loading ? (
          <CircularProgress size={24} />
        ) : success ? (
          <CheckCircleIcon className={classes.success} />
        ) : (
          <ErrorIcon className={classes.error} />
        )}
        <span className={classes.titleText}>
          {loading
            ? "Joinning external cluster..."
            : success
            ? "Joinned external cluster"
            : "Error joinning cluster"}
        </span>
      </Typography>
      <Typography component="p" color="textSecondary">
        {loading
          ? `${loading || "loading"}...`
          : success
          ? "Check the peers table to verify that your cluster was able to connect to the cluster bootstrap"
          : error}
      </Typography>

      {loading && takingToLong && (
        <Typography component="p" color="textSecondary">
          Taking longer than expected, check the{" "}
          <Link
            href={ipfsClusterLogs}
            rel="noopener noreferrer"
            target="_blank"
          >
            IPFS cluster logs
          </Link>{" "}
          to know if there was a connection problem.
        </Typography>
      )}
    </div>
  );
}
