import React, { useState } from "react";
import {
  TextField,
  Tooltip,
  Button,
  Typography,
  CircularProgress
} from "@material-ui/core";
import copy from "copy-to-clipboard";
import { makeStyles } from "@material-ui/core/styles";
import { getUrlToShare } from "./configClusterUtils";
import { ClusterStatus } from "./wampApi";

// To keep the three elements at a consistent height
const height = "40px";

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(7),
    height: theme.spacing(9.5)
  },
  appendedButton: {
    marginTop: "8px"
  },
  input: {
    marginRight: theme.spacing(2)
  },
  inputGroup: {
    display: "flex"
  }
}));

function CopyableInput({ text }: { text: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  function onCopy() {
    copy(text);
    setShowTooltip(true);
  }

  const classes = useStyles();

  return (
    <Tooltip
      open={showTooltip}
      title={"Copied to clipboard!"}
      leaveDelay={1500}
      onClose={() => setShowTooltip(false)}
    >
      <div className={classes.inputGroup}>
        <TextField
          className={classes.input}
          onClick={onCopy}
          InputProps={{
            readOnly: true,
            disabled: true
          }}
          value={text}
          fullWidth
          margin="dense"
          variant="outlined"
        />
        <Button
          className={classes.appendedButton}
          onClick={onCopy}
          variant="contained"
          style={{ height }}
        >
          Copy
        </Button>
      </div>
    </Tooltip>
  );
}

export default function ShareLinkToJoinCluster({
  yourMultiaddress,
  errorMessage,
  yourSecret,
  generatingSecret,
  loadingSecret,
  clusterStatus,
  generateSecret
}: {
  yourMultiaddress: string;
  errorMessage: string;
  yourSecret: string;
  generatingSecret: boolean;
  loadingSecret: boolean;
  clusterStatus: ClusterStatus;
  generateSecret: () => void;
}) {
  const classes = useStyles();

  const isReady = yourSecret && yourMultiaddress;
  const isLoading = loadingSecret || generatingSecret;
  const loadingMsg = loadingSecret
    ? "Loading secret and params..."
    : generatingSecret
    ? "Generating secret to start your cluster..."
    : "";
  const isReadyToGenerateSecret = yourMultiaddress && !yourSecret;
  // Parse errors
  const errorMsgs: string[] = [];
  if (errorMessage) errorMsgs.push(errorMessage);
  if (clusterStatus === "not-found")
    errorMsgs.push("Cluster DNP not found or not installed");
  if (clusterStatus === "stopped") errorMsgs.push("Cluster DNP is stopped");
  const isError = errorMsgs.length > 0;
  const errorMsg = errorMsgs.join(". ");

  return (
    <div className={classes.root}>
      {isReady ? (
        <>
          <Typography color="textSecondary">
            Share this link with a trusted peer to join your cluster
          </Typography>
          <CopyableInput text={getUrlToShare(yourSecret, yourMultiaddress)} />
        </>
      ) : isLoading ? (
        <>
          <Typography color="textSecondary">{loadingMsg}</Typography>
          <CircularProgress size={24} />
        </>
      ) : isReadyToGenerateSecret ? (
        <>
          <Typography color="textSecondary">
            To be able to invite other peers to your cluster, first generate a
            cluster secret
          </Typography>
          <Button
            onClick={generateSecret}
            disabled={generatingSecret}
            variant="contained"
            color="primary"
            style={{ whiteSpace: "nowrap", color: "white" }}
          >
            Generate secret
          </Button>
        </>
      ) : isError ? (
        <>
          <Typography color="textSecondary">{errorMsg}</Typography>
        </>
      ) : (
        <>
          <Typography color="textSecondary">Loading...</Typography>
        </>
      )}
    </div>
  );
}
