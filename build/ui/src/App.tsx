import React, { useState, useEffect } from "react";
import { Switch, Route } from "react-router-dom";
// Material UI components
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { Container } from "@material-ui/core";
// Own components
import Header from "./Header";
import BottomBar from "./BottomBar";
import Home from "./Home";
import Assets, { assetsPath } from "./Assets";
import Sources, { sourcesPath } from "./Sources";
import Peers, { peersPath } from "./Peers";
// Api
import socket, {
  refresh,
  pingCluster,
  onSources,
  onAssets,
  onPeers
} from "./socket";
import { AssetWithMetadata, SourceWithMetadata, ClusterPeer } from "./types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      "& > div:not(:last-child)": {
        paddingBottom: theme.spacing(3)
      },
      paddingBottom: theme.spacing(9)
    },
    header: {
      padding: theme.spacing(3, 0, 3),
      marginBottom: theme.spacing(9)
    },
    errorMsg: {
      marginBottom: theme.spacing(6)
    }
  })
);

const App: React.FC = () => {
  const [assets, setAssets] = useState([] as AssetWithMetadata[]);
  const [sources, setSources] = useState([] as SourceWithMetadata[]);
  const [peers, setPeers] = useState([] as ClusterPeer[]);
  const [pinnerError, setPinnerError] = useState("");
  const [clusterError, setClusterError] = useState("");

  useEffect(() => {
    onSources(setSources);
    onAssets(setAssets);
    onPeers(setPeers);
    // Successful connection or reconnection
    socket.on("connect", () => setPinnerError(""));
    // Disconnection initiated by the server
    socket.on("disconnect", (reason: string) => setPinnerError(reason));
    // Failed attempt of connecting
    socket.on("connect_error", (e: Error) =>
      setPinnerError(
        e.message === "xhr poll error" ? "Can't reach pinner" : e.message
      )
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!pinnerError) refresh(undefined).catch(console.error);
    }, 10 * 1000);
    return () => {
      clearTimeout(interval);
    };
  }, []);

  // Use the peers call to check if the cluster is OK
  useEffect(() => {
    async function triggerPingCluster() {
      try {
        await pingCluster(undefined);
        setClusterError("");
      } catch (e) {
        const message = e.message.includes("ECONNREFUSED")
          ? "Can't reach cluster HTTP API"
          : e.message;
        setClusterError(message);
        console.error(`Error pinging cluster: ${e.stack}`);
        setTimeout(triggerPingCluster, 10 * 1000);
      }
    }
    triggerPingCluster();
  }, []);

  const classes = useStyles();

  const connexionError = pinnerError
    ? `Error connecting to pinner: ${pinnerError}`
    : clusterError
    ? `Error connecting to cluster: ${clusterError}`
    : "";

  return (
    <>
      <header className={classes.header}>
        <Header />
      </header>

      <Container fixed className={classes.mainContainer}>
        <Switch>
          <Route path={sourcesPath}>
            <Sources sources={sources} />
          </Route>
          <Route path={assetsPath}>
            <Assets assets={assets} />
          </Route>
          <Route path={peersPath}>
            <Peers peers={peers} />
          </Route>
          <Route path="/">
            <Home assets={assets} sources={sources} peers={peers} />
          </Route>
        </Switch>
      </Container>

      <BottomBar connexionError={connexionError} />
    </>
  );
};

export default App;
