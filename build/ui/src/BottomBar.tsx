import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { Typography, Fade } from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/ErrorOutline";

const useStyles = makeStyles(theme => ({
  appBar: {
    top: "auto",
    bottom: 0,
    backgroundColor: "#eb5258"
  },
  toolbar: {
    display: "flex"
  },
  icon: {
    fontSize: "2rem",
    marginRight: "0.5rem"
  },
  text: {
    display: "flex",
    alignItems: "center"
  }
}));

export default function BottomAppBar({
  connexionError
}: {
  connexionError: string;
}) {
  const classes = useStyles();

  return (
    <Fade in={connexionError ? true : false}>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography className={classes.text}>
            <ErrorIcon className={classes.icon} />
            <span> {connexionError}</span>
          </Typography>
        </Toolbar>
      </AppBar>
    </Fade>
  );
}
