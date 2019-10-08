import React from "react";
// Material UI components
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
// Own components
import AssetsTable from "./Assets/AssetsTable";
import SourcesTable from "./Sources/SourcesTable";
import AddSourceForm from "./Sources/AddSourceForm";
import AssetsStatusChart from "./AssetsStatusChart";
import { AssetWithMetadata, SourceWithMetadata, ClusterPeer } from "./types";
import { Box, Fade, Grid, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addForm: {
      margin: "0 auto",
      maxWidth: "40rem"
    },
    boxChart: {
      width: "100%",
      marginBottom: theme.spacing(6)
    },
    heroSection: {
      margin: theme.spacing(14, 0, 3)
    },
    summary: {
      marginBottom: theme.spacing(6)
    }
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

  const showTables = assets.length > 0 || sources.length > 0;

  return (
    <>
      <Box className={classes.heroSection}>
        <Box>
          <Typography variant="h4" align="center" style={{ color: "#141e27" }}>
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

      <Box className={classes.boxChart}>
        <Fade in={assets.length > 0}>
          {assets.length ? (
            <AssetsStatusChart assets={assets} peerCount={peers.length} />
          ) : (
            <span />
          )}
        </Fade>
      </Box>

      {showTables ? (
        <Fade in={showTables}>
          <Grid container spacing={3}>
            {[
              <AssetsTable assets={assets} summary />,
              <SourcesTable sources={sources} summary />
            ].map((SummaryTable, i) => (
              <Grid
                key={i}
                item
                xs={12}
                sm={12}
                md={12}
                lg={6}
                className={classes.summary}
              >
                {SummaryTable}
              </Grid>
            ))}
          </Grid>
        </Fade>
      ) : null}
    </>
  );
}
