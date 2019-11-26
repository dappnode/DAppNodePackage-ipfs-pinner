import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, LinearProgress } from "@material-ui/core";
import { PollStatusObj } from "../types";
import { parseTypeAndDisplayName } from "../utils/multiname";

const useStyles = makeStyles(theme => ({
  root: {
    margin: "0 auto",
    "& > *:not(:last-child)": {
      marginBottom: theme.spacing(1)
    }
  }
}));

export default function PollStatusView({
  pollStatus
}: {
  pollStatus: PollStatusObj;
}) {
  const classes = useStyles();

  const statuses = Object.values(pollStatus);
  const totalSources = statuses.length;
  const doneSources = statuses.filter(status => status.done).length;
  const completed = Math.round((100 * doneSources) / totalSources);

  const lastSource =
    totalSources - doneSources === 1
      ? Object.entries(pollStatus).find(([_0, status]) => !status.done)
      : undefined;
  const lastSourceName = lastSource
    ? parseTypeAndDisplayName(lastSource[0]).displayName
    : undefined;

  return (
    <div className={classes.root}>
      <Typography
        className="atention-grab"
        align="center"
        color="textSecondary"
      >
        Polling {lastSourceName || "sources"}... ({doneSources} / {totalSources}
        )
      </Typography>
      <LinearProgress variant="determinate" value={completed} />
    </div>
  );
}
