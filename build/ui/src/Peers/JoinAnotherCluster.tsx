import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, CircularProgress } from "@material-ui/core";
import {
  parseUrlToShare,
  validateBootstrapMultiaddress
} from "./configClusterUtils";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import { ClusterEnvs } from "./wampApi";
import { RequestStatus } from "./data";

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
  joinStatus,
  setJoinStatus,
  onSuccess,
  setClusterSettings
}: {
  yourPeerId: string;
  clusterEnvs: ClusterEnvs | null;
  joinStatus: RequestStatus;
  setJoinStatus: (newStatus: RequestStatus) => void;
  onSuccess: () => void;
  setClusterSettings: (secret: string, multiaddress: string) => Promise<void>;
}) {
  const { loading, success, error } = joinStatus;

  const location = useLocation();
  const history = useHistory();

  // Process of adding yourself to some else's cluster
  useEffect(() => {
    async function joinCluster() {
      const { secret, multiaddress } = parseUrlToShare(location.search);
      if (!secret || !multiaddress) return;
      if (!yourPeerId) return; // Wait for yourPeer to be able to verify it's not you
      if (!clusterEnvs) return; // Wait until ENVs are loaded to verify

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
        ) {
          console.log("Already joinned cluster link, skipping");
          return setJoinStatus({ success: true });
        }

        // Prevent double calls
        if (loading) return;
        setJoinStatus({ loading: true });

        await setClusterSettings(secret, multiaddressSafe);
        // Reset the URL to prevent using the URL again
        history.push({
          pathname: location.pathname,
          search: ""
        });

        setJoinStatus({ success: true });
        onSuccess(); // Trigger the re-fetching of ENVs
      } catch (e) {
        setJoinStatus({ error: e.message });
        console.error(`Error joining cluster: ${e.stack}`);
      }
    }
    joinCluster();
  }, [location, yourPeerId, clusterEnvs, setClusterSettings]);

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
            ? "Added external cluster credentials"
            : "Error joinning cluster"}
        </span>
      </Typography>
      <Typography component="p" color="textSecondary">
        {loading
          ? "Setting a new secret and adding an external bootstrap peer to the peerstore"
          : success
          ? "Please, monitor this table to verify that your cluster is able to connect to the provided external bootstrap"
          : error}
      </Typography>
    </div>
  );
}
