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
import socket, { getPeers, isAlive, refresh } from "./socket";
import { AssetWithMetadata, SourceWithMetadata, ClusterPeer } from "./types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      "& > div:not(:last-child)": {
        paddingBottom: theme.spacing(3)
      },
      "& > div": {
        "& > div": {
          paddingTop: "0 !important"
        }
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
    socket.on("assets", setAssets);
    socket.on("sources", setSources);
    // Successful connection or reconnection
    socket.on("connect", () => {
      if (connexionError) setPinnerError("");
      console.log(`Connected`);
    });
    // Disconnection initiated by the server
    socket.on("disconnect", (reason: string) => {
      setPinnerError(reason);
      console.log(`Disconected: ${reason}`);
    });
    // Failed attempt of connecting
    socket.on("connect_error", (e: Error) => {
      const message =
        e.message === "xhr poll error" ? "Can't reach pinner" : e.message;
      isAlive().then(({ error }) => {
        if (error) {
          console.error(`HTTP API test: ${error}`);
          setPinnerError(message);
        } else {
          setPinnerError(`Socket.io error, HTTP is alive: ${message}`);
        }
      });
    });
  }, []);

  // For debugging
  // @ts-ignore
  window["getState"] = () => ({ assets, sources });
  // @ts-ignore
  window["socket"] = () => socket;

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
    async function getPeersAsync() {
      try {
        const _peers = await getPeers(undefined);
        setClusterError("");
        setPeers(_peers);
      } catch (e) {
        const message = e.message.includes("ECONNREFUSED")
          ? "Can't reach cluster HTTP API"
          : e.message;
        setClusterError(message);
        console.error(`Error getting peers: ${e.stack}`);
        setTimeout(getPeersAsync, 10 * 1000);
      }
    }
    getPeersAsync();
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
