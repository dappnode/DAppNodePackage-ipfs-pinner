import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, CircularProgress, Link } from "@material-ui/core";
import { parseUrlToShare } from "./configClusterUtils";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import * as socket from "../socket";
import { RequestStatus, ipfsPinnerLogs } from "./data";

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

export default function JoinAnotherCluster() {
  const [joinStatus, setJoinStatus] = useState({} as RequestStatus);
  const { loading, success, error } = joinStatus;
  const location = useLocation();
  const history = useHistory();

  /**
   * `Handle joining`
   * Every time the URL changes and contains valid secret and multiaddress
   * this useEffect will try to connect to it. Once it has set the ENVs
   * to the provided values it removes the search from the URL to prevent
   * subsequent re-connections.
   */
  useEffect(() => {
    async function joinCluster(): Promise<void> {
      const { secret, multiaddress } = parseUrlToShare(location.search);
      if (!secret || !multiaddress) return;
      if (loading || success || error) return; // Only join if no state

      try {
        setJoinStatus({ loading: "Joining cluster..." });
        await socket.joinCluster({ secret, multiaddress });
        // Reset the URL to prevent using the URL again
        history.push({
          pathname: location.pathname,
          search: ""
        });
        setJoinStatus({ success: true });
      } catch (e) {
        setJoinStatus({ error: e.message });
        console.error(`Error joining cluster: ${e.stack}`);
      }
    }
    joinCluster();
  }, [
    // Variables to track
    location,
    // Variables to include for hook consistency
    loading,
    success,
    error,
    history,
    // Callbacks that should not change
    setJoinStatus
  ]);

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
            : "Error joining cluster"}
        </span>
      </Typography>
      <Typography component="p" color="textSecondary">
        {loading ? (
          `${loading || "loading"}...`
        ) : success ? (
          "Check the peers table to verify that your cluster was able to connect to the cluster bootstrap"
        ) : error ? (
          error.includes("longer than expected") ||
          error.includes("timeout") ? (
            <Typography component="p" color="textSecondary">
              {error}. check the{" "}
              <Link
                href={ipfsPinnerLogs}
                rel="noopener noreferrer"
                target="_blank"
              >
                IPFS pinner logs
              </Link>{" "}
              to know if there was a connection problem.
            </Typography>
          ) : (
            error
          )
        ) : null}
      </Typography>
    </div>
  );
}
