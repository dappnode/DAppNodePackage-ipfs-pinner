import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress
} from "@material-ui/core";
import { parseUrlToShare } from "./configClusterUtils";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import { setClusterSettings } from "./wampApi";

// To keep the three elements at a consistent height
const height = "40px";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  selectAndButton: {
    display: "flex"
  },
  selectContainer: {
    width: "100%",
    marginRight: theme.spacing(2)
  },
  textInput: {
    backgroundColor: "white",
    marginBottom: 0,
    "& label": { fontSize: theme.typography.fontSize },
    "& input": { fontSize: theme.typography.fontSize }
  },
  statusText: {
    margin: theme.spacing(1),
    height: theme.spacing(4)
  },
  margin: {
    margin: theme.spacing(1)
  },
  appendedButton: {
    marginTop: "8px"
  },
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

interface JoiningStatus {
  loading?: boolean;
  success?: boolean;
  error?: string;
}

export default function JoinAnotherCluster({
  yourPeerId
}: {
  yourPeerId: string;
}) {
  const [status, setStatus] = useState({} as JoiningStatus);

  const location = useLocation();

  // Process of adding yourself to some else's cluster
  useEffect(() => {
    async function joinCluster() {
      const { secret, multiaddress } = parseUrlToShare(location.search);
      if (!secret || !multiaddress) return;
      if (!yourPeerId) return; // Wait for yourPeer to be able to verify it's not you

      try {
        // Validate URL params
        if (!/[0-9A-Fa-f]{32}/g.test(secret))
          throw Error(`secret must be a 32 bytes hex string: ${secret}`);
        if (multiaddress.includes(yourPeerId))
          throw Error("You can't add yourself");

        setStatus({ loading: true });
        await setClusterSettings({ secret, multiaddress });
        setStatus({ success: true });
      } catch (e) {
        setStatus({ error: e.message });
        console.error(`Error joining cluster: ${e.stack}`);
      }
    }

    joinCluster();

    // Display success
  }, [location, yourPeerId]);

  const classes = useStyles();

  const { loading, success, error } = status;
  const show = loading || success || error;

  if (!show) return null;

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
