import React, { useState, useEffect } from "react";
import { Switch, Route } from "react-router-dom";
// Material UI components
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
// Own components
import Header from "./Header";
import Home from "./Home";
import Assets, { assetsPath } from "./Assets";
import Sources, { sourcesPath } from "./Sources";
import Peers, { peersPath } from "./Peers";
// Api
import socket, { getPeers } from "./socket";
import { AssetWithMetadata, SourceWithMetadata, ClusterPeer } from "./types";
// Style
import "./App.css";

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

  useEffect(() => {
    socket.on("assets", setAssets);
    socket.on("sources", setSources);
  }, []);

  // For debugging
  // @ts-ignore
  window["getState"] = () => ({ assets, sources });

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

  const classes = useStyles();

  return (
    <>
      <header className={classes.header}>
        <Container fixed>
          <Header />
        </Container>
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
            <Home assets={assets} sources={sources} />
          </Route>
        </Switch>
      </Container>
    </>
  );
};

export default App;
