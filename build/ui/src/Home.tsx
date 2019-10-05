import React from "react";
// Material UI components
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
// Own components
import AssetsTable from "./Assets/AssetsTable";
import SourcesTable from "./Sources/SourcesTable";
import AddSourceForm from "./Sources/AddSourceForm";
import PinStatusChart from "./PinStatusChart";
import { AssetWithMetadata, SourceWithMetadata, ClusterPeer } from "./types";
// Style
import "./App.css";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addForm: {
      margin: "0 auto",
      maxWidth: "40rem"
    },
    boxChart: {
      width: "100%",
      marginBottom: theme.spacing(6)
      // padding: theme.spacing(3, 3),
      // // Correct the chart excessive margins
      // paddingRight: "5px",
      // paddingLeft: "5px"
    },
    heroSection: {
      margin: theme.spacing(14, 0, 5)
    }
    // button: {
    //   // background: "linear-gradient(290deg, #2ad179, #4ab47c)", // Green gradient
    //   background: "linear-gradient(290deg, #1aa059, #3d9567)", // Darker Green gradient
    //   // background: "linear-gradient(290deg, #1880e0, #3873d8)", // blue gradient
    //   color: "white"
    // }
  })
);

export default function Home({
  assets,
  sources,
  peers
}: {
  assets: AssetWithMetadata[];
  sources: SourceWithMetadata[];
  peers: ClusterPeer[];
}) {
  const classes = useStyles();

  return (
    <>
      <Box className={classes.heroSection}>
        <Box>
          <Typography variant="h4" align="center">
            Pin anything.
          </Typography>
          <Typography align="center" color="textSecondary">
            Select an asset type to start
          </Typography>
        </Box>

        <Grid container spacing={2} className={classes.addForm}>
          <Grid item xs={12}>
            <AddSourceForm />
          </Grid>
        </Grid>
      </Box>

      {/* <Box style={{ padding: 0 }}>
        <Typography variant="h4" align="center" color="textSecondary">
          {percent}% Pinned
        </Typography>
        <Typography align="center" color="textSecondary">
          {pinStatusSummary}
        </Typography>
      </Box> */}

      <Box className={classes.boxChart}>
        {assets.length ? (
          <PinStatusChart assets={assets} peerCount={peers.length} />
        ) : null}
      </Box>

      <Grid container spacing={2}>
        {assets.length ? (
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <AssetsTable assets={assets} summary />
          </Grid>
        ) : null}

        {sources.length ? (
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <SourcesTable sources={sources} summary />
          </Grid>
        ) : null}
      </Grid>
    </>
  );
}
