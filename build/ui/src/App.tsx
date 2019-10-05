import React, { useState, useEffect } from "react";
import { Switch, Route } from "react-router-dom";
// Material UI components
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import ErrorIcon from "@material-ui/icons/ErrorOutline";
// Own components
import Header from "./Header";
import Home from "./Home";
import Assets, { assetsPath } from "./Assets";
import Sources, { sourcesPath } from "./Sources";
import Peers, { peersPath } from "./Peers";
// Api
import socket, { getPeers, isAlive } from "./socket";
import { AssetWithMetadata, SourceWithMetadata, ClusterPeer } from "./types";
import { Typography } from "@material-ui/core";

const headerOffset = 10;

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
      backgroundColor: "#0b1216",
      color: "#f8f8f8",
      textAlign: "center",
      padding: theme.spacing(3, 0, 3),
      marginBottom: theme.spacing(headerOffset)
    }
  })
);

const App: React.FC = () => {
  const [assets, setAssets] = useState([] as AssetWithMetadata[]);
  const [sources, setSources] = useState([] as SourceWithMetadata[]);
  const [peers, setPeers] = useState([] as ClusterPeer[]);
  const [connexionError, setConnexionError] = useState("");

  useEffect(() => {
    socket.on("assets", setAssets);
    socket.on("sources", setSources);
    // Successful connection or reconnection
    socket.on("connect", () => {
      setConnexionError("");
      console.log(`Connected`);
    });
    // Disconnection initiated by the server
    socket.on("disconnect", (reason: string) => {
      setConnexionError(reason);
      console.log(`Disconected: ${reason}`);
    });
    // Failed attempt of connecting
    socket.on("connect_error", (error: any) => {
      const message =
        error.message === "xhr poll error"
          ? "Can't reach pinner"
          : error.message;
      isAlive().then(({ error }) => {
        if (error) {
          console.error(`HTTP API test: ${error}`);
          setConnexionError(message);
        } else {
          setConnexionError(`Socket.io error, HTTP is alive: ${message}`);
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
    let timeout: NodeJS.Timeout;
    const fetchData = () => {
      socket.emit("refresh", null, (res: any) => {
        timeout = setTimeout(fetchData, 10 * 1000);
      });
    };
    fetchData();
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    getPeers(undefined)
      .then(setPeers)
      .catch(e => console.error(`Error getting peers: ${e.stack}`));
  }, []);

  // Alive check
  useEffect(() => {}, []);

  const classes = useStyles();

  return (
    <>
      <header className={classes.header}>
        <Container fixed>
          <Header />
        </Container>
      </header>

      {connexionError ? (
        <Typography align="center" color="textSecondary">
          <ErrorIcon style={{ fontSize: "200%" }} />
          <br />
          Error connecting to pinner: {connexionError}
        </Typography>
      ) : null}

      <Container
        fixed
        className={classes.mainContainer}
        style={{ opacity: connexionError ? 0.3 : 1 }}
      >
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
    </>
  );
};

export default App;
