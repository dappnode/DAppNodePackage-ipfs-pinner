import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import SourcesTable from "./SourcesTable";
import AddSourceForm from "./AddSourceForm";
import PollStatusView from "./PollStatusView";
import { Box, Fade } from "@material-ui/core";
import { SourceWithMetadata, PollStatus } from "../types";

export const sourcesPath = "/sources";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    boxPollStatus: {
      height: theme.spacing(6),
      marginBottom: theme.spacing(2)
    }
  })
);

export default function Sources({
  sources,
  pollStatus
}: {
  sources: SourceWithMetadata[];
  pollStatus: PollStatus;
}) {
  const classes = useStyles();

  return (
    <>
      <AddSourceForm />

      <Box className={classes.boxPollStatus}>
        <Fade in={!!pollStatus}>
          {pollStatus ? <PollStatusView {...{ pollStatus }} /> : <span />}
        </Fade>
      </Box>

      <SourcesTable sources={sources} />
    </>
  );
}
