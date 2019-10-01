import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import RoomIcon from "@material-ui/icons/RoomOutlined";
import Typography from "@material-ui/core/Typography";
import { NavLink } from "react-router-dom";
import { assetsPath } from "./Assets";
import { sourcesPath } from "./Sources";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    },
    links: {
      display: "flex",
      "& > a:not(:last-child)": {
        marginRight: theme.spacing(3)
      }
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    logoText: {
      display: "inline",
      fontSize: "1.1rem",
      fontWeight: 500
    },
    icon: {
      color: theme.palette.primary.main
    }
  })
);

export default function Header() {
  const classes = useStyles();
  return (
    <Grid container spacing={4}>
      <Grid item xs={4} className={classes.links}>
        <NavLink to={assetsPath}>
          <Typography>Assets</Typography>
        </NavLink>
        <NavLink to={sourcesPath}>
          <Typography>Sources</Typography>
        </NavLink>
      </Grid>

      <Grid item xs={4} className={classes.logoContainer}>
        <RoomIcon className={classes.icon} />
        <NavLink to="/">
          <Typography className={classes.logoText}>IPFS Pinner</Typography>
        </NavLink>
      </Grid>

      <Grid item xs={4}></Grid>
    </Grid>

    // <div className={classes.container}>
    //   <div className={classes.links}>
    //     <NavLink to="/pins">
    //       <Typography>Pins</Typography>
    //     </NavLink>
    //     <NavLink to="/assets">
    //       <Typography>Assets</Typography>
    //     </NavLink>
    //   </div>

    //   <div className={classes.logoContainer}>
    //     <RoomIcon />
    //     <Typography className={classes.logoText}>IPFS Pinner</Typography>
    //   </div>

    //   <div></div>
    // </div>
  );
}
