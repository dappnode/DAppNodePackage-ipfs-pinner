import React from "react";
import { useTheme } from "@material-ui/styles";
import { makeStyles } from "@material-ui/core/styles";
import { PinStatus } from "../types";
import statusColorMap from "../components/statusColorMap";
import LensIcon from "@material-ui/icons/Lens";

const useStyles = makeStyles(theme => ({
  statusCell: {
    display: "flex",
    alignItems: "center"
  }
}));

export default function PinStatusDot({ status }: { status: PinStatus }) {
  // Load theme for colors
  const theme: any = useTheme();
  const classes = useStyles();

  return (
    <span className={classes.statusCell}>
      <LensIcon
        style={{ color: statusColorMap(status, theme), fontSize: "1rem" }}
      />
      <span style={{ marginLeft: "0.5rem" }}>{status}</span>
    </span>
  );
}
