import React, { useState, useEffect } from "react";
import { Typography, CircularProgress } from "@material-ui/core";
import { CopyableInput } from "./CopyableInput";
import { makeStyles } from "@material-ui/core/styles";
import * as socket from "../socket";
import { RequestStatus } from "./data";
import { JoinClusterData } from "../types";
import { getUrlToShare } from "./configClusterUtils";

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(7),
    height: theme.spacing(9.5)
  }
}));

export default function ShareLinkToJoinCluster() {
  const [getUrlStatus, setGetUrlStatus] = useState({} as RequestStatus);
  const [clusterData, setClusterData] = useState<JoinClusterData>();

  useEffect(() => {
    async function getClusterData(): Promise<void> {
      try {
        setGetUrlStatus({ loading: "Getting url to join cluster..." });
        await socket.getClusterData(undefined).then(setClusterData);
        setGetUrlStatus({ success: true });
      } catch (e) {
        setGetUrlStatus({ error: e.message });
        console.error(`Error on getDappnodeIdentity ${e.stack}`);
      }
    }
    getClusterData();
  }, []);

  const classes = useStyles();

  return (
    <div className={classes.root}>
      {clusterData ? (
        <>
          <Typography color="textSecondary">
            Share this link with a trusted peer to join your cluster
          </Typography>
          <CopyableInput text={getUrlToShare(clusterData)} />
        </>
      ) : getUrlStatus.loading ? (
        <>
          <Typography color="textSecondary">{getUrlStatus.loading}</Typography>
          <CircularProgress size={24} />
        </>
      ) : getUrlStatus.error ? (
        <>
          <Typography color="textSecondary">{getUrlStatus.error}</Typography>
        </>
      ) : null}
    </div>
  );
}
